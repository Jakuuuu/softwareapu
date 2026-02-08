from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete
from typing import List, Dict, Any
from uuid import UUID
import uuid

from src.database import get_db
from src import models, schemas

router = APIRouter()

async def upsert_insumos(db: AsyncSession, recursos: List[schemas.InsumoCreate]):
    """
    Upsert resources (insumos) to ensure foreign keys exist.
    """
    for rec in recursos:
        # Check if exists by ID
        if rec.id:
            try:
                rec_uuid = UUID(rec.id)
                existing = await db.get(models.Insumo, rec_uuid)
                if existing:
                    # Update basic fields if needed (optional)
                    existing.precio_base = rec.precio_base
                    existing.descripcion = rec.descripcion
                    continue
            except ValueError:
                pass # Invalid UUID, ignore or handle
        
        # If not exists or no ID, create
        # Note: In a real app we might check by code/name to avoid dupes if ID is missing
        new_insumo = models.Insumo(
            id=UUID(rec.id) if rec.id else uuid.uuid4(),
            descripcion=rec.descripcion,
            unidad=rec.unidad,
            precio_base=rec.precio_base,
            tipo=rec.tipo
        )
        db.add(new_insumo)
    
    await db.flush() # Ensure IDs are ready

@router.post("/", response_model=schemas.ProjectResponse)
async def create_project(project: schemas.ProjectCreate, db: AsyncSession = Depends(get_db)):
    # 1. Upsert Resources first
    if project.recursos:
        await upsert_insumos(db, project.recursos)
        
    # 2. Create Project Header
    project_id = UUID(project.id) if project.id else uuid.uuid4()
    
    db_project = models.Project(
        id=project_id,
        name=project.nombre,
        location=project.ubicacion,
        client=project.propietario,
        status="ACTIVE",
        config=project.config.dict()
    )
    db.add(db_project)
    
    # 3. Create Partidas & Detalles
    for p_data in project.partidas:
        partida_id = UUID(p_data.id) if p_data.id else uuid.uuid4()
        
        db_partida = models.APUPartida(
            id=partida_id,
            project_id=project_id,
            codigo=p_data.codigo,
            descripcion=p_data.descripcion,
            unidad=p_data.unidad,
            cantidad_total=p_data.cantidad_total,
            rendimiento=p_data.rendimiento,
            capitulo=p_data.capitulo,
            
            # Costs (Snapshot)
            costo_materiales_usd=p_data.costoMaterialesUsd,
            costo_mano_obra_usd=p_data.costoManoObraUsd,
            costo_equipos_usd=p_data.costoEquiposUsd,
            precio_total_usd=p_data.precioTotalUsd
        )
        db.add(db_partida)
        
        # Helper to simplify detail creation
        async def create_detalles(items: List[Any]):
            for item in items:
                # Ensure recursoId matches Insumo ID format
                try:
                    insumo_uuid = UUID(item.recursoId)
                except ValueError:
                    continue # Skip invalid ID, should verify logic
                
                detail = models.APUDetalle(
                    partida_id=partida_id,
                    insumo_id=insumo_uuid,
                    cantidad=item.cantidad,
                    desperdicio=item.desperdicio if hasattr(item, 'desperdicio') else 0
                )
                db.add(detail)

        await create_detalles(p_data.materiales)
        await create_detalles(p_data.manoObra)
        await create_detalles(p_data.equipos)
    
    await db.commit()
    return await get_project(project_id, db)

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
async def get_project(project_id: UUID, db: AsyncSession = Depends(get_db)):
    # Load Project -> Partidas -> Detalles -> Insumo (to know type)
    result = await db.execute(
        select(models.Project)
        .options(
            selectinload(models.Project.partidas)
            .selectinload(models.APUPartida.detalles)
            .selectinload(models.APUDetalle.insumo)
        )
        .where(models.Project.id == project_id)
    )
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Map to Response Schema (Re-grouping attributes)
    partidas_response = []
    
    for p in project.partidas:
        materiales, mano_obra, equipos = [], [], []
        
        for d in p.detalles:
            if not d.insumo: continue
            
            item = {
                "recursoId": str(d.insumo_id),
                "nombre": d.insumo.descripcion,
                "unidad": d.insumo.unidad,
                "cantidad": float(d.cantidad),
                "desperdicio": float(d.desperdicio),
                "precioBaseUsd": float(d.insumo.precio_base), # Current price
                # Map concrete types if needed
                "tipoEquipo": "EQUIPO_MENOR", # Placeholder/Default
                "jornalBaseUsd": float(d.insumo.precio_base),
                "costoDiaUsd": float(d.insumo.precio_base)
            }
            
            if d.insumo.tipo == models.TipoInsumo.MATERIAL:
                materiales.append(schemas.MaterialPartidaResponse(**item))
            elif d.insumo.tipo == models.TipoInsumo.MANO_OBRA:
                # ManoObra specific fields mapping
                mano_obra.append(schemas.ManoObraPartidaResponse(**item))
            elif d.insumo.tipo == models.TipoInsumo.EQUIPO:
                equipos.append(schemas.EquipoPartidaResponse(**item))
        
        partidas_response.append(schemas.APUPartidaResponse(
            id=str(p.id),
            project_id=str(p.project_id),
            codigo=p.codigo,
            descripcion=p.descripcion,
            unidad=p.unidad,
            cantidad_total=float(p.cantidad_total),
            rendimiento=float(p.rendimiento),
            capitulo=p.capitulo,
            costo_materiales_usd=p.costo_materiales_usd,
            costo_mano_obra_usd=p.costo_mano_obra_usd,
            costo_equipos_usd=p.costo_equipos_usd,
            precio_total_usd=p.precio_total_usd,
            
            materiales=materiales,
            manoObra=mano_obra,
            equipos=equipos
        ))

    return schemas.ProjectResponse(
        id=str(project.id),
        name=project.name,
        ubicacion=project.location,
        client=project.client,
        config=project.config,
        created_at=project.created_at,
        partidas=partidas_response
    )

@router.put("/{project_id}")
async def update_project(project_id: UUID, project: schemas.ProjectCreate, db: AsyncSession = Depends(get_db)):
    # Simple Replace Strategy:
    # 1. Update Project Header
    # 2. Delete all Partidas (and cascade deletes details)
    # 3. Re-create Partidas and Details
    
    db_project = await db.get(models.Project, project_id)
    if not db_project:
         raise HTTPException(status_code=404, detail="Project not found")
    
    # Update Header
    db_project.name = project.nombre
    db_project.location = project.ubicacion
    db_project.client = project.propietario
    db_project.config = project.config.dict()
    
    # Delete old partidas (Cascade should handle details)
    # Note: If we want to keep history/IDs stable, we would do a diff, but Replace is acceptable for now.
    stmt = delete(models.APUPartida).where(models.APUPartida.project_id == project_id)
    await db.execute(stmt)
    
    # Upsert Resources (New ones might have been added)
    if project.recursos:
        await upsert_insumos(db, project.recursos)

    # Re-create Partidas
    for p_data in project.partidas:
        partida_id = UUID(p_data.id) if p_data.id else uuid.uuid4()
        
        # Check logic: if p_data.id was sent, we try to preserve it (good for frontend key tracking)
        
        db_partida = models.APUPartida(
            id=partida_id,
            project_id=project_id,
            codigo=p_data.codigo,
            descripcion=p_data.descripcion,
            unidad=p_data.unidad,
            cantidad_total=p_data.cantidad_total,
            rendimiento=p_data.rendimiento,
            capitulo=p_data.capitulo,
            
            costo_materiales_usd=p_data.costoMaterialesUsd,
            costo_mano_obra_usd=p_data.costoManoObraUsd,
            costo_equipos_usd=p_data.costoEquiposUsd,
            precio_total_usd=p_data.precioTotalUsd
        )
        db.add(db_partida)
        
        async def create_detalles(items: List[Any]):
             for item in items:
                try:
                    insumo_uuid = UUID(item.recursoId)
                except ValueError:
                    continue
                
                detail = models.APUDetalle(
                    partida_id=partida_id,
                    insumo_id=insumo_uuid,
                    cantidad=item.cantidad,
                    desperdicio=item.desperdicio if hasattr(item, 'desperdicio') else 0
                )
                db.add(detail)

        await create_detalles(p_data.materiales)
        await create_detalles(p_data.manoObra)
        await create_detalles(p_data.equipos)
        
    await db.commit()
    return await get_project(project_id, db)
