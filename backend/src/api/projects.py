from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from src.database import get_db
from src importmodels, schemas

router = APIRouter()

@router.post("/", response_model=schemas.ProjectResponse)
async def create_project(project: schemas.ProjectCreate, db: AsyncSession = Depends(get_db)):
    # 1. Create Project
    db_project = models.Project(
        id=project.id,
        name=project.nombre,
        location=project.ubicacion,
        client=project.propietario,
        status="ACTIVE",
        config=project.config.dict() # Store as JSONB
    )
    db.add(db_project)
    
    # 2. Create Partidas & Detalles
    # Note: For simplicity in this iteration, we might just store the basic project structure
    # and require a separate update for full tree, or iterate here.
    # Let's iterate here to save the full snapshot.
    
    for p_data in project.partidas:
        db_partida = models.APUPartida(
            id=p_data.id,
            project_id=project.id,
            codigo=p_data.codigo,
            descripcion=p_data.titulo,
            unidad=p_data.unidadMedida,
            cantidad=p_data.cantidad,
            rendimiento=p_data.rendimiento,
            capitulo=p_data.capitulo,
            
            costo_materiales_bs=p_data.costoMaterialesBs,
            costo_materiales_usd=p_data.costoMaterialesUsd,
            costo_mano_obra_bs=p_data.costoManoObraBs,
            costo_mano_obra_usd=p_data.costoManoObraUsd,
            costo_equipos_bs=p_data.costoEquiposBs,
            costo_equipos_usd=p_data.costoEquiposUsd,
            costo_directo_bs=p_data.costoDirectoBs,
            costo_directo_usd=p_data.costoDirectoUsd,
            precio_unitario_bs=p_data.precioUnitarioBs,
            precio_unitario_usd=p_data.precioUnitarioUsd,
            precio_total_bs=p_data.precioTotalBs,
            precio_total_usd=p_data.precioTotalUsd
        )
        db.add(db_partida)
        
        # We would also save 'detalles' here if we parsed them fully.
        # For now, let's focus on saving the Project + Partida Header structure properly.
    
    await db.commit()
    await db.refresh(db_project)
    return project # Return input as confirmation for now

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
async def get_project(project_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Project)
        .options(selectinload(models.Project.partidas))
        .where(models.Project.id == project_id)
    )
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Mapping back to schema is complex due to property name mismatch (snake vs camel).
    # Ideally should use an AutoMapper or consistent naming.
    # For this MVP, we might construct the response manually if needed, 
    # but Pydantic's from_attributes usually requires matching names or aliases.
    # Given the constraint, returning the raw object might fail validation if names don't match.
    
    # Quick fix: Construct response manually
    return schemas.ProjectResponse(
        id=project.id,
        nombre=project.name,
        ubicacion=project.location,
        propietario=project.client,
        tipoObra="EDIFICACION", # Placeholder or add to model
        fechaCreacion=str(project.created_at),
        config=project.config,
        partidas=[
            schemas.PartidaBase(
                id=p.id,
                codigo=p.codigo,
                titulo=p.descripcion,
                unidadMedida=p.unidad,
                cantidad=p.cantidad,
                rendimiento=p.rendimiento,
                capitulo=p.capitulo,
                costoMaterialesBs=p.costo_materiales_bs,
                costoMaterialesUsd=p.costo_materiales_usd,
                costoManoObraBs=p.costo_mano_obra_bs,
                costoManoObraUsd=p.costo_mano_obra_usd,
                costo_equipos_bs=p.costo_equipos_bs,
                costoEquiposUsd=p.costo_equipos_usd,
                precioTotalBs=p.precio_total_bs,
                precioTotalUsd=p.precio_total_usd
                # ... map other fields
            ) for p in project.partidas
        ]
    )

@router.put("/{project_id}")
async def update_project(project_id: UUID, project: schemas.ProjectCreate, db: AsyncSession = Depends(get_db)):
    # Full overwrite implementation for simplicity ("Save" button behavior)
    # 1. Delete existing? Or Update?
    # Delete all partidas and recreate is easiest for snapshots, though not efficient for massive projects.
    # Given this is a local-first app syncing to backend, replace logic is acceptable for MVP.
    
    db_project = await db.get(models.Project, project_id)
    if not db_project:
         raise HTTPException(status_code=404, detail="Project not found")
    
    db_project.name = project.nombre
    db_project.location = project.ubicacion
    db_project.client = project.propietario
    db_project.config = project.config.dict()
    
    # Delete old partidas
    # await db.execute(delete(models.APUPartida).where(models.APUPartida.project_id == project_id))
    # ... Re-add
    
    await db.commit()
    return {"status": "updated"}
