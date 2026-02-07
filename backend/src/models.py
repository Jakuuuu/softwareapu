from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), nullable=True) # Optional in draft
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    client = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    duration_months = Column(Integer, nullable=True)
    status = Column(String(20), default="DRAFT")
    
    # Store the exact frontend config state
    config = Column(JSONB, default=dict)
    
    costo_total_bs = Column(DECIMAL(18, 4), default=0)
    costo_total_usd = Column(DECIMAL(18, 4), default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    partidas = relationship("APUPartida", back_populates="project", cascade="all, delete-orphan")

class APUPartida(Base):
    __tablename__ = "apu_partidas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    
    codigo = Column(String(50), nullable=False)
    descripcion = Column(Text, nullable=False)
    unidad = Column(String(20), nullable=False)
    cantidad = Column(DECIMAL(18, 4), default=0)
    rendimiento = Column(DECIMAL(18, 4), default=1)
    capitulo = Column(String(100), nullable=True)

    # Costs
    costo_materiales_bs = Column(DECIMAL(18, 4), default=0)
    costo_materiales_usd = Column(DECIMAL(18, 4), default=0)
    
    costo_mano_obra_bs = Column(DECIMAL(18, 4), default=0)
    costo_mano_obra_usd = Column(DECIMAL(18, 4), default=0)
    
    costo_equipos_bs = Column(DECIMAL(18, 4), default=0)
    costo_equipos_usd = Column(DECIMAL(18, 4), default=0)
    
    costo_directo_bs = Column(DECIMAL(18, 4), default=0)
    costo_directo_usd = Column(DECIMAL(18, 4), default=0)
    
    precio_unitario_bs = Column(DECIMAL(18, 4), default=0)
    precio_unitario_usd = Column(DECIMAL(18, 4), default=0)
    
    precio_total_bs = Column(DECIMAL(18, 4), default=0)
    precio_total_usd = Column(DECIMAL(18, 4), default=0)

    last_calculated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project = relationship("Project", back_populates="partidas")
    detalles = relationship("APUDetalle", back_populates="partida", cascade="all, delete-orphan")

class APUDetalle(Base):
    __tablename__ = "apu_detalles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partida_id = Column(UUID(as_uuid=True), ForeignKey("apu_partidas.id"), nullable=False)
    
    resource_type = Column(String(20), nullable=False) # 'MATERIAL', 'LABOR', 'EQUIPMENT'
    resource_name = Column(String(255), nullable=True)
    
    cantidad = Column(DECIMAL(18, 6), nullable=False)
    desperdicio_pct = Column(DECIMAL(5, 2), default=0)
    
    precio_unitario_bs = Column(DECIMAL(18, 4), default=0)
    precio_unitario_usd = Column(DECIMAL(18, 4), default=0)
    
    subtotal_bs = Column(DECIMAL(18, 4), default=0)
    subtotal_usd = Column(DECIMAL(18, 4), default=0)

    partida = relationship("APUPartida", back_populates="detalles")
