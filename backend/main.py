import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from src.utils.rate_limiter import rate_limit
from src.utils.cache import get_cache_key, check_cache, upload_audio_to_storage, track_generation
from src.tts.kokoro_client import KokoroClient
from src.utils.supabase_client import supabase

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join("data", "models", "kokoro-v1.0.onnx")
VOICES_PATH = os.path.join("data", "models", "voices.json")
CONFIG_PATH = os.path.join("config", "voice_config.yaml")
OUTPUT_DIR = os.path.join("data", "outputs")

# ---------------------------------------------------------------------------
# Global client reference (populated at startup)
# ---------------------------------------------------------------------------
client: KokoroClient | None = None


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    logger.info("Initializing Kokoro TTS engine ...")
    client = KokoroClient(MODEL_PATH, VOICES_PATH)
    if client.is_ready():
        logger.info("Kokoro TTS engine is ready.")
    else:
        logger.warning(
            "Kokoro TTS engine could not load. "
            "Check that model files exist in data/models/."
        )
    yield
    logger.info("Shutting down Mzansi-Speak API.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="Mzansi-Speak API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------
class TTSRequest(BaseModel):
    text: str
    voice_id: str
    lang: str = "en-us"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _fetch_voices_from_db() -> list:
    """Fetch voices from Supabase PostgreSQL table."""
    try:
        response = supabase.table("voices").select("*").execute()
        return response.data if response.data else []
    except Exception as e:
        logger.error("Failed to fetch voices from Supabase: %s", str(e))
        return []

def _get_voice_metadata(voice_id: str) -> dict | None:
    """Fetch specific voice metadata from Supabase."""
    try:
        response = supabase.table("voices").select("*").eq("id", voice_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error("Failed to fetch voice metadata: %s", str(e))
        return None

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {"message": "Welcome to Mzansi-Speak API", "status": "online"}


@app.get("/voices")
async def list_voices():
    """Return the list of available voices from Supabase table."""
    voices = _fetch_voices_from_db()
    
    default_voice = "am_adam"
    if voices:
        default_voice = voices[0].get("id", "am_adam")
        
    return {
        "voices": voices,
        "default_voice": default_voice,
    }


@app.post("/generate", dependencies=[Depends(rate_limit)])
def generate_speech(request: TTSRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if client is None or not client.is_ready():
        raise HTTPException(
            status_code=503,
            detail="TTS engine is not available. Model files may be missing.",
        )

    # Fetch voice metadata to check for premium/blending
    voice_meta = _get_voice_metadata(request.voice_id)
    if not voice_meta:
        raise HTTPException(status_code=404, detail=f"Voice {request.voice_id} not found")

    cache_key = get_cache_key(request.text, request.voice_id)

    # Check cache first
    cached = check_cache(cache_key)
    if cached:
        logger.info("Cache hit for key %s", cache_key)
        return {
            "status": "success",
            "cache_key": cache_key,
            "audio_url": f"/api/audio/{cache_key}.wav",
        }

    # Cache miss: generate audio
    output_path = os.path.join(OUTPUT_DIR, f"{cache_key}.wav")
    
    # Use blending if premium and base_voices present
    if voice_meta.get("is_premium") and voice_meta.get("base_voices"):
        success = client.generate_blended(
            request.text, 
            voice_meta["base_voices"], 
            output_path, 
            lang=request.lang
        )
    else:
        # Use model_id if available, else fallback to voice_id
        engine_voice_id = voice_meta.get("model_id") or request.voice_id
        success = client.generate(request.text, engine_voice_id, output_path, lang=request.lang)

    if not success:
        raise HTTPException(
            status_code=500,
            detail="Audio generation failed. Check server logs for details.",
        )
        
    # Sync generated file to cloud and database
    upload_audio_to_storage(cache_key)
    track_generation(cache_key, request.text, request.voice_id, len(request.text))

    return {
        "status": "success",
        "cache_key": cache_key,
        "audio_url": f"/api/audio/{cache_key}.wav",
    }


@app.get("/api/audio/{filename}")
async def get_audio(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    
    # If the exact file exists (e.g., .wav or .mp3 already generated)
    if os.path.exists(file_path):
        media_type = "audio/mpeg" if filename.endswith(".mp3") else "audio/wav"
        return FileResponse(file_path, media_type=media_type)
        
    # If MP3 was requested but only WAV exists, convert it dynamically
    if filename.endswith(".mp3"):
        wav_filename = filename[:-4] + ".wav"
        wav_path = os.path.join(OUTPUT_DIR, wav_filename)
        if os.path.exists(wav_path):
            try:
                from pydub import AudioSegment
                logger.info(f"Converting {wav_filename} to {filename}...")
                audio = AudioSegment.from_wav(wav_path)
                audio.export(file_path, format="mp3", bitrate="192k")
                return FileResponse(file_path, media_type="audio/mpeg")
            except Exception as e:
                logger.error(f"Failed to convert WAV to MP3: {e}")
                raise HTTPException(status_code=500, detail="Conversion to MP3 failed.")

    raise HTTPException(status_code=404, detail="Audio file not found")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
