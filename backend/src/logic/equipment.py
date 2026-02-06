# backend/src/logic/equipment.py
from decimal import Decimal
from typing import Dict, Any

def calculate_equipment_cop(equip_data: Dict[str, Any]) -> Dict[str, Decimal]:
    """
    Calculates the Daily Cost of Ownership and Operation (COP) for a piece of equipment.
    Returns a dictionary with 'costo_dia_bs' and 'costo_dia_usd'.
    """
    
    # Parse inputs (assume USD for base calculation usually, or BS if that's the input)
    # We will calculate in the currency of the input values (usually USD for machinery)
    
    va = Decimal(equip_data.get('valor_adquisicion', 0)) # Valor Adquisición
    vr_pct = Decimal(equip_data.get('valor_rescate_pct', 20)) / 100
    vr = va * vr_pct # Valor Rescate
    
    ve_hours = Decimal(equip_data.get('vida_util_horas', 10000)) # Vida Económica en Horas
    hours_per_year = Decimal(2000) # Standard heuristic
    years_life = ve_hours / hours_per_year
    
    hours_per_day = Decimal(8) # Standard shift
    
    # 1. Costo de Posesión (Ownership)
    # Depreciación Lineal: (Va - Vr) / Ve
    if ve_hours > 0:
        depreciation_hourly = (va - vr) / ve_hours
    else:
        depreciation_hourly = Decimal(0)
        
    # Inversión / Interés (Opportunity Cost)
    # Formula: (Va + Vr) * Interest / (2 * HoursYear)
    annual_interest = Decimal('0.12') # 12% standard or config
    investment_hourly = ((va + vr) * annual_interest) / (2 * hours_per_year)
    
    # Seguros y Almacenaje
    insurance_hourly = ((va + vr) * Decimal('0.05')) / (2 * hours_per_year) # 5% combined
    
    total_ownership_hourly = depreciation_hourly + investment_hourly + insurance_hourly
    
    # 2. Costo de Operación (Operation)
    # Mantenimiento (K * Depreciación)
    k_factor = Decimal(equip_data.get('factor_mantenimiento', 0.80))
    maintenance_hourly = k_factor * depreciation_hourly
    
    # Consumo Combustible
    fuel_consumption = Decimal(equip_data.get('consumo_combustible_hora', 0))
    fuel_price = Decimal(equip_data.get('fuel_price_ref', 0.50)) # External ref needed
    fuel_hourly = fuel_consumption * fuel_price
    
    # Lubricantes
    lube_factor = Decimal(equip_data.get('costo_lubricante_factor', 0.10))
    lube_hourly = fuel_hourly * lube_factor
    
    # Neumáticos / Piezas Desgaste (Simplified if standard Eq)
    tires_hourly = Decimal(0) 
    
    total_operation_hourly = maintenance_hourly + fuel_hourly + lube_hourly + tires_hourly
    
    # 3. Total
    total_hourly = total_ownership_hourly + total_operation_hourly
    total_daily = total_hourly * hours_per_day
    
    return {
        "costo_hora": total_hourly.quantize(Decimal("1.0000")),
        "costo_dia": total_daily.quantize(Decimal("1.0000")),
        "currency": "USD" # Assuming inputs were validated as strong currency basis
    }
