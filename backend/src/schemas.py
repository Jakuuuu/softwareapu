from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from decimal import Decimal

# --- Enums (mirrors Typescript) ---
UnidadMedida = Literal['M2', 'M3', 'ML', 'PZA', 'PTO', 'GLB', 'KG', 'TON']
TipoObra = Literal['EDIFICACION', 'VIALIDAD', 'HOSPITAL', 'SIERRA', 'OTRO']
CategoriaObrero = Literal['MAESTRO', 'OFICIAL', 'AYUDANTE', 'PEON']
TipoEquipo = Literal['MAQUINARIA_PESADA', 'HERRAMIENTA_MENOR', 'EQUIPO_MENOR']
FuenteTasa = Literal['BCV_OFICIAL', 'PARALELO', 'MANUAL']

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

# --- Resource Models (Items inside APU) ---

class APUDetalle(BaseModel):
    recursoId: str
    nombre: str
    unidad: Optional[str] = None
    cantidad: float
    desperdicio: float = 0.0
    
    # Base Prices
    precioBaseBs: float = 0
    precioBaseUsd: float = 0
    tasaCambioAplicada: float = 0
    
    # Calculated (Optional in request, creating logic will fill)
    subtotalBs: float = 0
    subtotalUsd: float = 0

class APUManoObra(BaseModel):
    recursoId: str
    nombre: str
    categoria: CategoriaObrero
    cantidad: float
    
    jornalBaseBs: float = 0
    jornalBaseUsd: float = 0
    
    subtotalBs: float = 0
    subtotalUsd: float = 0

class APUEquipo(BaseModel):
    recursoId: str
    nombre: str
    tipoEquipo: TipoEquipo
    cantidad: float
    
    costoDiaBs: float = 0
    costoDiaUsd: float = 0
    horasPorDia: float = 8.0
    
    subtotalBs: float = 0
    subtotalUsd: float = 0

# --- APU Partida ---

class APUPartida(BaseModel):
    id: str
    codigo: str
    titulo: str
    descripcion: str = ""
    unidadMedida: UnidadMedida
    cantidad: float
    rendimiento: float
    capitulo: str = "General"
    
    materiales: List[APUDetalle] = []
    manoObra: List[APUManoObra] = []
    equipos: List[APUEquipo] = []
    
    # Totals
    costoMaterialesBs: float = 0
    costoMaterialesUsd: float = 0
    costoManoObraBs: float = 0
    costoManoObraUsd: float = 0
    costoEquiposBs: float = 0
    costoEquiposUsd: float = 0
    
    costoDirectoBs: float = 0
    costoDirectoUsd: float = 0
    
    precioUnitarioBs: float = 0
    precioUnitarioUsd: float = 0
    
    precioTotalBs: float = 0
    precioTotalUsd: float = 0

# --- Project ---

class ProjectCreate(BaseModel):
    nombre: str
    ubicacion: str
    propietario: str
    tipoObra: TipoObra
    tipoObraOtro: Optional[str] = None
    config: ProjectConfig

class ProjectUpdate(ProjectCreate):
    pass

class ProjectResponse(ProjectCreate):
    id: str
    fechaCreacion: str
    partidas: List[APUPartida] = []

    class Config:
        from_attributes = True

# --- Calculation Requests ---

class FCASRequest(BaseModel):
    config: FCASConfig
    salary_scheme: str = "normal" # placeholder

class APUCalculationRequest(BaseModel):
    partida: APUPartida
    config: ProjectConfig
