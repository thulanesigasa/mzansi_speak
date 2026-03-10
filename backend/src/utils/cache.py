import hashlib
import os
import logging
from .supabase_client import supabase

logger = logging.getLogger(__name__)

OUTPUT_DIR = "data/outputs"
BUCKET_NAME = "mzansi-audio"

def get_cache_key(text: str, voice_id: str) -> str:
    """
    Generate an MD5 hash for the given text and voice_id.
    """
    content = f"{voice_id}:{text}"
    return hashlib.md5(content.encode()).hexdigest()

def check_cache(cache_key: str) -> str | None:
    """
    Check if a wav file for the given cache_key exists locally.
    If not, attempt to download it from the Supabase mzansi-audio bucket.
    """
    file_path = os.path.join(OUTPUT_DIR, f"{cache_key}.wav")
    
    # 1. Check local output directory
    if os.path.exists(file_path):
        return file_path
        
    # 2. If missing locally, try pulling from Supabase Storage
    try:
        response = supabase.storage.from_(BUCKET_NAME).download(f"{cache_key}.wav")
        if response:
            with open(file_path, "wb") as f:
                f.write(response)
            logger.info("Successfully downloaded %s.wav from Supabase storage.", cache_key)
            return file_path
    except Exception as e:
        logger.debug("Failed to pull %s.wav from Supabase (may not exist yet): %s", cache_key, str(e))
        
    return None

def upload_audio_to_storage(cache_key: str):
    """
    Upload the local wav file to the Supabase storage bucket.
    """
    file_path = os.path.join(OUTPUT_DIR, f"{cache_key}.wav")
    if os.path.exists(file_path):
        try:
            with open(file_path, "rb") as f:
                supabase.storage.from_(BUCKET_NAME).upload(
                    f"{cache_key}.wav", 
                    f, 
                    file_options={"content-type": "audio/wav"}
                )
            logger.info("Successfully uploaded %s.wav to Supabase storage.", cache_key)
        except Exception as e:
            logger.error("Failed to upload %s.wav to Supabase: %s", cache_key, str(e))

def track_generation(cache_key: str, text: str, voice_id: str, char_count: int):
    """
    Track the audio generation in the Supabase PostgreSQL database to prevent 
    redundant processing and keep an audit log of characters used.
    """
    try:
        data = {
            "cache_key": cache_key,
            "text_snippet": text[:100],
            "voice_id": voice_id,
            "char_count": char_count
        }
        supabase.table("generations").upsert(data).execute()
        logger.info("Tracked generation metadata for key %s in Supabase.", cache_key)
    except Exception as e:
        logger.error("Failed to track generation for key %s: %s", cache_key, str(e))

