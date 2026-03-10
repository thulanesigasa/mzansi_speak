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

def check_cache(cache_key: str) -> bool:
    """
    Check if a wav file for the given cache_key exists in Supabase.
    """
    try:
        res = supabase.table("generations").select("cache_key").eq("cache_key", cache_key).execute()
        return len(res.data) > 0
    except Exception as e:
        logger.error("Failed to check cache in Supabase: %s", str(e))
        return False


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
            # Cleanup local file to save space
            os.remove(file_path)
            logger.info("Deleted local file %s.wav to save disk space.", cache_key)
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

