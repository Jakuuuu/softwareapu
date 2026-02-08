from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import List
from src.database import get_db
from src import models, schemas
import uuid

router = APIRouter()

@router.get("/", response_model=List[schemas.InsumoResponse])
async def read_insumos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    result = await db.execute(select(models.Insumo).offset(skip).limit(limit))
    insumos = result.scalars().all()
    return insumos

@router.post("/", response_model=schemas.InsumoResponse)
async def create_insumo(insumo: schemas.InsumoCreate, db: Session = Depends(get_db)):
    db_insumo = models.Insumo(**insumo.dict())
    db.add(db_insumo)
    await db.commit()
    await db.refresh(db_insumo)
    return db_insumo

@router.put("/{insumo_id}", response_model=schemas.InsumoResponse)
async def update_insumo(insumo_id: str, insumo: schemas.InsumoCreate, db: Session = Depends(get_db)):
    result = await db.execute(select(models.Insumo).where(models.Insumo.id == insumo_id))
    db_insumo = result.scalar_one_or_none()
    
    if db_insumo is None:
        raise HTTPException(status_code=404, detail="Insumo not found")
    
    for key, value in insumo.dict().items():
        setattr(db_insumo, key, value)
    
    await db.commit()
    await db.refresh(db_insumo)
    return db_insumo

@router.delete("/{insumo_id}")
async def delete_insumo(insumo_id: str, db: Session = Depends(get_db)):
    result = await db.execute(select(models.Insumo).where(models.Insumo.id == insumo_id))
    db_insumo = result.scalar_one_or_none()
    
    if db_insumo is None:
        raise HTTPException(status_code=404, detail="Insumo not found")
    
    await db.delete(db_insumo)
    await db.commit()
    return {"ok": True}
