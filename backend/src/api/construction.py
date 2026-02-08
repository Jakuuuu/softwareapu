from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import List
from src.database import get_db
from src import models, schemas
import uuid
from datetime import datetime

router = APIRouter()

# --- VALUACIONES (Billing/Progress) ---

@router.post("/valuaciones", response_model=schemas.ValuacionResponse)
async def create_valuacion(valuacion: schemas.ValuacionCreate, db: Session = Depends(get_db)):
    # Verify Partida exists
    result = await db.execute(select(models.APUPartida).where(models.APUPartida.id == valuacion.partida_id))
    partida = result.scalar_one_or_none()
    
    if not partida:
        raise HTTPException(status_code=404, detail="Partida not found")
        
    # Check business rule: Do not overwrite? (Constraint handled by creating NEW record)
    # Validate quanitity? (Optional: Check if total executed > scope)
    
    db_valuacion = models.Valuacion(
        id=uuid.uuid4(),
        partida_id=valuacion.partida_id,
        fecha=valuacion.fecha,
        cantidad_periodo=valuacion.cantidad_periodo
    )
    db.add(db_valuacion)
    await db.commit()
    await db.refresh(db_valuacion)
    return db_valuacion

@router.get("/valuaciones/{partida_id}", response_model=List[schemas.ValuacionResponse])
async def get_valuaciones(partida_id: str, db: Session = Depends(get_db)):
    result = await db.execute(select(models.Valuacion).where(models.Valuacion.partida_id == partida_id).order_by(models.Valuacion.fecha))
    valuaciones = result.scalars().all()
    return valuaciones

# --- DEPENDENCIAS (Schedule) ---

@router.post("/dependencias", response_model=schemas.DependenciaResponse)
async def create_dependencia(dep: schemas.DependenciaCreate, db: Session = Depends(get_db)):
    # Verify both exist
    res_pred = await db.execute(select(models.APUPartida).where(models.APUPartida.id == dep.predecesora_id))
    pred = res_pred.scalar_one_or_none()
    
    res_suc = await db.execute(select(models.APUPartida).where(models.APUPartida.id == dep.sucesora_id))
    suc = res_suc.scalar_one_or_none()
    
    if not pred or not suc:
        raise HTTPException(status_code=404, detail="Predecessor or Successor Partida not found")
        
    # Prevent logic loops? (Advanced check, skipped for MVP)
    
    db_dep = models.Dependencia(
        id=uuid.uuid4(),
        project_id=dep.project_id,
        predecesora_id=dep.predecesora_id,
        sucesora_id=dep.sucesora_id
    )
    db.add(db_dep)
    await db.commit()
    await db.refresh(db_dep)
    return db_dep

@router.get("/dependencias/{project_id}", response_model=List[schemas.DependenciaResponse])
async def get_dependencias(project_id: str, db: Session = Depends(get_db)):
    result = await db.execute(select(models.Dependencia).where(models.Dependencia.project_id == project_id))
    deps = result.scalars().all()
    return deps
