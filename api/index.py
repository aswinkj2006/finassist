from fastapi import FastAPI
from backend.app.main import app as fastapi_app

# Vercel sends requests with path /api/... but FastAPI routes are
# registered without the /api prefix.  Mount the real app under /api
# so paths match on Vercel, while local dev (uvicorn backend.app.main:app)
# continues to work at the root.
app = FastAPI()
app.mount("/api", fastapi_app)
