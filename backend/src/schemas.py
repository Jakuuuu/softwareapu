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


# --- Insumo Models ---

class InsumoBase(BaseModel):
    descripcion: str
    unidad: str
    precio_base: float
    tipo: TipoInsumo

class InsumoCreate(InsumoBase):
    id: Optional[str] = None # Allow frontend to provide ID

class InsumoResponse(InsumoBase):
    id: str
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# --- Detalle Models (Receta) ---
# Used for internal mapping, but frontend sends specific shapes

class APUDetalleBase(BaseModel):
    insumo_id: str
    cantidad: float
    desperdicio: float = 0.0

class APUDetalleCreate(APUDetalleBase):
    pass

class APUDetalleResponse(APUDetalleBase):
    id: str
    class Config:
        from_attributes = True

# --- Partida Complex Input Models (Matching Frontend) ---

class MaterialPartidaInput(BaseModel):
    recursoId: str
    nombre: str
    unidad: str
    cantidad: float
    desperdicio: float
    precioBaseUsd: float
    # We can ignore calculated fields like subtotalBs for input, backend re-calcs or stores as is

class ManoObraPartidaInput(BaseModel):
    recursoId: str
    nombre: str
    cantidad: float # Cantidad de personas
    jornalBaseUsd: float
    # categoria: ... if needed

class EquipoPartidaInput(BaseModel):
    recursoId: str
    nombre: str
    tipoEquipo: str
    cantidad: float
    costoDiaUsd: float
    
class APUPartidaCreate(APUPartidaBase):
    # Overwrite/Extend base to include nested lists
    project_id: Optional[str] = None
    
    materiales: List[MaterialPartidaInput] = []
    manoObra: List[ManoObraPartidaInput] = []
    equipos: List[EquipoPartidaInput] = []

    # Receive calculated totals from frontend to ensure exact match?
    # Or let backend recalc? For persistence, trusting frontend snapshot is safer for "Save/Load" fidelity.
    costoMaterialesUsd: float = 0
    costoManoObraUsd: float = 0
    costoEquiposUsd: float = 0
    precioTotalUsd: float = 0
    # ... add Bs fields if needed, but USD is main
    

class MaterialPartidaResponse(MaterialPartidaInput):
    # Include calculated fields if needed, or just base fields
    pass

class ManoObraPartidaResponse(ManoObraPartidaInput):
    pass

class EquipoPartidaResponse(EquipoPartidaInput):
    pass

class APUPartidaResponse(APUPartidaBase):
    id: str
    project_id: str
    
    costo_materiales_usd: float = 0
    costo_mano_obra_usd: float = 0
    costo_equipos_usd: float = 0
    precio_total_usd: float = 0
    
    # Nested response matching frontend
    materiales: List[MaterialPartidaResponse] = []
    manoObra: List[ManoObraPartidaResponse] = []
    equipos: List[EquipoPartidaResponse] = []
    
    class Config:
        from_attributes = True

# --- Project Models ---

class ProjectCreate(BaseModel):
    id: Optional[str] = None
    nombre: str 
    ubicacion: Optional[str] = None
    propietario: Optional[str] = None
    config: ProjectConfig
    
    # Nested Data
    partidas: List[APUPartidaCreate] = []
    
    # If we want to upsert resources:
    recursos: List[InsumoCreate] = []

class ProjectResponse(BaseModel):
    id: str
    name: str # Mapped from nombre
    location: Optional[str]
    client: Optional[str]
    config: ProjectConfig
    created_at: Optional[datetime] = None
    
    partidas: List[APUPartidaResponse] = []
    
    class Config:
        from_attributes = True



