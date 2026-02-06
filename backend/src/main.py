from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import calculations

app = FastAPI(
    title="Boostear API",
    description="Backend for Venezuela-Proof Construction Budgeting",
    version="0.1.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite Default
    "http://localhost:3000",
    "tauri://localhost",
    "https://tauri.localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(calculations.router, prefix="/api/v1/calculations", tags=["Calculations"])

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
