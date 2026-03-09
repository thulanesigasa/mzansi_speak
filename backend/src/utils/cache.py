import hashlib
import os

OUTPUT_DIR = "data/outputs"

def get_cache_key(text: str, voice_id: str) -> str:
    """
    Generate an MD5 hash for the given text and voice_id.
    """
    content = f"{voice_id}:{text}"
    return hashlib.md5(content.encode()).hexdigest()

def check_cache(cache_key: str) -> str:
    """
    Check if a wav file for the given cache_key exists.
    Returns the path if it exists, otherwise None.
    """
    file_path = os.path.join(OUTPUT_DIR, f"{cache_key}.wav")
    if os.path.exists(file_path):
        return file_path
    return None

