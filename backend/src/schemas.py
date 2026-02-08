from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from decimal import Decimal
from enum import Enum

# --- Enums (mirrors Typescript & SQLAlchemy) ---
UnidadMedida = Literal['M2', 'M3', 'ML', 'PZA', 'PTO', 'GLB', 'KG', 'TON', 'UND', 'DIA', 'HORA'] # Extended
TipoObra = Literal['EDIFICACION', 'VIALIDAD', 'HOSPITAL', 'SIERRA', 'OTRO']

class TipoInsumo(str, Enum):
    MATERIAL = "MATERIAL"
    MANO_OBRA = "MANO_OBRA"
    EQUIPO = "EQUIPO"

class FuenteTasa(str, Enum):
    BCV_OFICIAL = "BCV_OFICIAL"
    PARALELO = "PARALELO"
    MANUAL = "MANUAL"

# --- Shared Models ---

class FCASConfig(BaseModel):
    factorTotal: float = 72.0
    diasFeriados: int = 12
    diasUtilidades: int = 60
    diasVacaciones: int = 15
    porcentajeInces: float = 2.0
    porcentajeIvss: float = 11.0
    porcentajeFaov: float = 2.0
    porcentajePensiones: float = 9.0
    imputacionPensiones: Literal['COSTO_DIRECTO', 'GASTO_ADMINISTRATIVO'] = 'COSTO_DIRECTO'

class ProjectConfig(BaseModel):
    monedaPrincipal: Literal['BS', 'USD'] = 'USD'
    tasaCambio: float
    fechaTasa: str
    fuenteTasa: FuenteTasa
    iva: float = 16.0
    utilidad: float = 10.0
    administracion: float = 10.0
    fcas: FCASConfig

# --- Insumo Models ---

class InsumoBase(BaseModel):
    descripcion: str
    unidad: str
    precio_base: float
    tipo: TipoInsumo

class InsumoCreate(InsumoBase):
    pass

class InsumoResponse(InsumoBase):
    id: str
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# --- Detalle Models (Receta) ---

class APUDetalleBase(BaseModel):
    insumo_id: str
    cantidad: float
    desperdicio: float = 0.0 # 0.10 for 10%

class APUDetalleCreate(APUDetalleBase):
    pass

class APUDetalleResponse(APUDetalleBase):
    id: str
    # We might want to include nested Insumo data for the frontend
    # But for now let's keep it simple or use a separate schema with current price
    
    class Config:
        from_attributes = True

# --- Partida Models ---

class APUPartidaBase(BaseModel):
    codigo: str
    descripcion: str
    unidad: str
    cantidad_total: float = 0
    rendimiento: float = 1
    capitulo: Optional[str] = "General"

class APUPartidaCreate(APUPartidaBase):
    project_id: str

class APUPartidaResponse(APUPartidaBase):
    id: str
    project_id: str
    
    # Calculated fields
    duracion_dias: float = 0
    precio_unitario_usd: float = 0
    precio_total_usd: float = 0
    
    detalles: List[APUDetalleResponse] = []
    
    class Config:
        from_attributes = True

# --- Valuacion Models ---

class ValuacionCreate(BaseModel):
    partida_id: str
    fecha: datetime
    cantidad_periodo: float

class ValuacionResponse(ValuacionCreate):
    id: str
    
    class Config:
        from_attributes = True

# --- Dependencia Models ---

class DependenciaCreate(BaseModel):
    project_id: str
    predecesora_id: str
    sucesora_id: str

class DependenciaResponse(DependenciaCreate):
    id: str
    
    class Config:
        from_attributes = True

# --- Project Models ---

class ProjectCreate(BaseModel):
    name: str # Enforce english naming in DB/Backend consistency (frontend sends nombre -> name mapping if needed, or we adapt)
    # Actually, let's keep 'nombre' in frontend -> 'name' in backend mapping or just use 'nombre' here if we want to change DB col.
    # The Model has 'name', let's use 'name' here.
    location: Optional[str] = None
    client: Optional[str] = None
    config: ProjectConfig
    
class ProjectResponse(ProjectCreate):
    id: str
    created_at: datetime
    partidas: List[APUPartidaResponse] = []
    
    class Config:
        from_attributes = True

