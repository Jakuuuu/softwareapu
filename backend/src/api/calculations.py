from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from decimal import Decimal

from src.logic.fcas import calculate_fcas
from src.logic.equipment import calculate_equipment_cop

router = APIRouter()

# --- Models ---

class ProjectConfig(BaseModel):
    vacation_days_base: int = 15
    holidays_count: int = 12
    bonus_days_base: int = 45
    avg_sickness_days: int = 3
    ivss_pct: Decimal = 11.0
    faov_pct: Decimal = 2.0
    inces_pct: Decimal = 2.0
    pension_apply_to_fcas: bool = True
    pension_law_pct: Decimal = 9.0

class EquipmentInput(BaseModel):
    valor_adquisicion: Decimal
    vida_util_horas: int = 10000
    valor_rescate_pct: Decimal = 20.0
    factor_mantenimiento: Decimal = 0.80
    consumo_combustible_hora: Decimal
    fuel_price_ref: Decimal = 0.50
    costo_lubricante_factor: Decimal = 0.10

# --- Routes ---

@router.post("/fcas")
def get_fcas(config: ProjectConfig):
    """
    Calculates the FCAS factor based on project configuration.
    """
    try:
        # Convert Pydantic model to dict
        config_dict = config.model_dump()
        factor = calculate_fcas(config_dict)
        return {
            "fcas_factor": factor,
            "fcas_percent": (factor - 1) * 100
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/equipment-cop")
def get_equipment_cop(data: EquipmentInput):
    """
    Calculates the daily cost (COP) for a piece of equipment.
    """
    try:
        data_dict = data.model_dump()
        result = calculate_equipment_cop(data_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
