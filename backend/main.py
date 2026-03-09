from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.utils.rate_limiter import rate_limit
from src.utils.cache import get_cache_key
from src.tts.kokoro_client import KokoroClient
import os

app = FastAPI(title="Mzansi-Speak API")

# Security: CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str
    voice_id: str

# Initialize client
# Note: voices.bin is typically required by kokoro-onnx
MODEL_PATH = "data/models/kokoro-v1.0.onnx"
VOICES_PATH = "data/models/voices.bin"
client = KokoroClient(MODEL_PATH, VOICES_PATH)

@app.get("/")
async def root():
    return {"message": "Welcome to Mzansi-Speak API", "status": "online"}

@app.post("/generate", dependencies=[Depends(rate_limit)])
async def generate_speech(request: TTSRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    cache_key = get_cache_key(request.text, request.voice_id)
    output_path = os.path.join("data/outputs", f"{cache_key}.wav")
    
    # Check cache first
    if os.path.exists(output_path):
        return {
            "status": "success",
            "cache_key": cache_key,
            "audio_url": f"/api/audio/{cache_key}.wav"
        }
    
    # Generate speech
    success = client.generate(request.text, request.voice_id, output_path)
    
    if not success:
        return {"status": "error", "message": "TTS Engine fail or model missing"}
        
    return {
        "status": "success",
        "cache_key": cache_key,
        "audio_url": f"/api/audio/{cache_key}.wav"
    }

from fastapi.responses import FileResponse

@app.get("/api/audio/{filename}")
async def get_audio(filename: str):
    file_path = os.path.join("data/outputs", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/wav")
    raise HTTPException(status_code=404, detail="Audio file not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
