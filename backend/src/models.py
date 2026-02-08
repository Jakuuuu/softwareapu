from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text, DECIMAL, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base
import enum

class TipoInsumo(str, enum.Enum):
    MATERIAL = "MATERIAL"
    MANO_OBRA = "MANO_OBRA"
    EQUIPO = "EQUIPO"
    
class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    client = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    duration_months = Column(Integer, nullable=True)
    status = Column(String(20), default="DRAFT")
    
    config = Column(JSONB, default=dict)
    
    costo_total_bs = Column(DECIMAL(18, 4), default=0)
    costo_total_usd = Column(DECIMAL(18, 4), default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    partidas = relationship("APUPartida", back_populates="project", cascade="all, delete-orphan")
    dependencias = relationship("Dependencia", back_populates="project", cascade="all, delete-orphan")

class Insumo(Base):
    __tablename__ = "insumos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    descripcion = Column(String(255), nullable=False)
    unidad = Column(String(20), nullable=False)
    precio_base = Column(DECIMAL(18, 4), nullable=False, default=0)
    tipo = Column(Enum(TipoInsumo), nullable=False)
    
    # Metadata
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    detalles = relationship("APUDetalle", back_populates="insumo")

class APUPartida(Base):
    __tablename__ = "apu_partidas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    
    codigo = Column(String(50), nullable=False) # E.g., E-311.110.000
    descripcion = Column(Text, nullable=False)
    unidad = Column(String(20), nullable=False)
    capitulo = Column(String(100), nullable=True)

    # Alcance y Rendimiento
    cantidad_total = Column(DECIMAL(18, 4), default=0) # Alcance total de la obra
    rendimiento = Column(DECIMAL(18, 4), default=1) # Unidades / dia
    
    # Costos Unitarios
    costo_directo_unitario_bs = Column(DECIMAL(18, 4), default=0)
    costo_directo_unitario_usd = Column(DECIMAL(18, 4), default=0)
    
    precio_unitario_bs = Column(DECIMAL(18, 4), default=0)
    precio_unitario_usd = Column(DECIMAL(18, 4), default=0)
    
    # Totals (Computed: PU * Cantidad)
    precio_total_bs = Column(DECIMAL(18, 4), default=0)
    precio_total_usd = Column(DECIMAL(18, 4), default=0)

    last_calculated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="partidas")
    detalles = relationship("APUDetalle", back_populates="partida", cascade="all, delete-orphan")
    valuaciones = relationship("Valuacion", back_populates="partida", cascade="all, delete-orphan")
    
    # Schedule Relationships
    predecesoras = relationship("Dependencia", foreign_keys="[Dependencia.sucesora_id]", back_populates="sucesora")
    sucesoras = relationship("Dependencia", foreign_keys="[Dependencia.predecesora_id]", back_populates="predecesora")

    @property
    def duracion_dias(self):
        if self.rendimiento and self.rendimiento > 0:
            return float(self.cantidad_total) / float(self.rendimiento)
        return 0

class APUDetalle(Base):
    """
    La 'Receta'. Vincula Partida con Insumo.
    Costo = (Insumo.Precio * Cantidad * (1 + Desperdicio))
    """
    __tablename__ = "apu_detalles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partida_id = Column(UUID(as_uuid=True), ForeignKey("apu_partidas.id"), nullable=False)
    insumo_id = Column(UUID(as_uuid=True), ForeignKey("insumos.id"), nullable=False)
    
    cantidad = Column(DECIMAL(18, 6), nullable=False) # Coeficiente
    desperdicio = Column(DECIMAL(5, 4), default=0) # Porcentaje (0.10 = 10%), stores strictly for Material
    
    # Snapshot of costs for historical integrity? 
    # The requirement asks for calculating from Insumo ("Formula..."), so we might rely on Insumo.precio 
    # BUT for a real system we usually snapshot. Let's start dynamic as requested but keep columns if needed.
    
    partida = relationship("APUPartida", back_populates="detalles")
    insumo = relationship("Insumo", back_populates="detalles")

class Valuacion(Base):
    """
    El Cobro. Historial de ejecucion.
    """
    __tablename__ = "valuaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partida_id = Column(UUID(as_uuid=True), ForeignKey("apu_partidas.id"), nullable=False)
    
    fecha = Column(DateTime(timezone=True), nullable=False) # Corte date
    cantidad_periodo = Column(DECIMAL(18, 4), nullable=False) # Executed this period
    
    partida = relationship("APUPartida", back_populates="valuaciones")
    
class Dependencia(Base):
    """
    El Cronograma Simplificado (Fin-Inicio).
    """
    __tablename__ = "dependencias"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    
    predecesora_id = Column(UUID(as_uuid=True), ForeignKey("apu_partidas.id"), nullable=False)
    sucesora_id = Column(UUID(as_uuid=True), ForeignKey("apu_partidas.id"), nullable=False)

    project = relationship("Project", back_populates="dependencias")
    predecesora = relationship("APUPartida", foreign_keys=[predecesora_id], back_populates="sucesoras")
    sucesora = relationship("APUPartida", foreign_keys=[sucesora_id], back_populates="predecesoras")
