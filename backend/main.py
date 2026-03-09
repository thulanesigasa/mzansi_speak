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

# Initialize client (stub)
MODEL_PATH = "data/models/kokoro-v0.8-za.onnx"
client = KokoroClient(MODEL_PATH)

@app.get("/")
async def root():
    return {"message": "Welcome to Mzansi-Speak API", "status": "online"}

@app.post("/api/tts", dependencies=[Depends(rate_limit)])
async def generate_speech(request: TTSRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    # Check cache (logic stub)
    cache_key = get_cache_key(request.text, request.voice_id)
    
    # Generate speech
    audio = client.generate(request.text, request.voice_id)
    
    if not audio:
        return {"status": "error", "message": "TTS Engine not ready or model missing"}
        
    return {
        "status": "success",
        "cache_key": cache_key,
        "audio_url": f"/api/audio/{cache_key}.wav"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
