import hashlib

def get_cache_key(text: str, voice_id: str) -> str:
    """
    Generate an MD5 hash for the given text and voice_id to avoid redundant generation.
    """
    content = f"{voice_id}:{text}"
    return hashlib.md5(content.encode()).hexdigest()
