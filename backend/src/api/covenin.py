from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from src.database import get_db
from src import models
from pydantic import BaseModel

router = APIRouter()

class CoveninResponse(BaseModel):
    id: str
    codigo: str
    descripcion: str
    unidad: str
    rendimiento: float
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[CoveninResponse])
async def search_covenin(q: str = None, limit: int = 50, db: AsyncSession = Depends(get_db)):
    """
    Search COVENIN catalog by code or description.
    """
    query = select(models.CoveninPartida)
    
    if q:
        # Search match in Code OR Description
        # Using simple ilike for MVP. Postgres Full Text Search is better for prod.
        # Note: In SQLAlchemy async, we might need 'or_'
        from sqlalchemy import or_
        query = query.where(
            or_(
                models.CoveninPartida.codigo.ilike(f"%{q}%"),
                models.CoveninPartida.descripcion.ilike(f"%{q}%")
            )
        )
    
    query = query.limit(limit)
    
    result = await db.execute(query)
    items = result.scalars().all()
    
    return [
        CoveninResponse(
            id=str(i.id),
            codigo=i.codigo,
            descripcion=i.descripcion,
            unidad=i.unidad,
            rendimiento=float(i.rendimiento_base or 1)
        ) for i in items
    ]
