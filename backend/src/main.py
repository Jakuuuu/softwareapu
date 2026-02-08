from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import calculations, projects, resources, construction

app = FastAPI(title="Calculadora APU Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(calculations.router, prefix="/api/v1/calculations", tags=["Calculations"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(resources.router, prefix="/api/v1/insumos", tags=["Insumos (Resources)"])
app.include_router(construction.router, prefix="/api/v1/construction", tags=["Construction (Billing & Schedule)"])

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
