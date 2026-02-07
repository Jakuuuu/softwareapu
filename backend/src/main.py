from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import calculations, projects

# ... existing code ...

# Include Routes
app.include_router(calculations.router, prefix="/api/v1/calculations", tags=["Calculations"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
