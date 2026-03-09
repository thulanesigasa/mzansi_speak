from fastapi import Request, HTTPException
import time
from collections import defaultdict

# Simple in-memory rate limiter
RATE_LIMIT = 5  # requests
WINDOW_SIZE = 60  # seconds

client_requests = defaultdict(list)

async def rate_limit(request: Request):
    client_ip = request.client.host
    now = time.time()
    
    # Filter out timestamps outside the window
    client_requests[client_ip] = [t for t in client_requests[client_ip] if now - t < WINDOW_SIZE]
    
    if len(client_requests[client_ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    
    client_requests[client_ip].append(now)
