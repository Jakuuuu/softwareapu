from decimal import Decimal
from typing import Dict, Any, List, Union

def calculate_apu_item(partida: Any, config: Any) -> Any:
    """
    Recalculates an APU item (Partida) based on its resources and project configuration.
    Accepts Pydantic models or dicts.
    """
    
    # Helper to safe get attribute or dict key
    def get_val(obj, key, default):
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    tasa_cambio = Decimal(str(get_val(config, 'tasaCambio', 1)))
    fcas_config = get_val(config, 'fcas', None)
    factor_fcas = Decimal(str(get_val(fcas_config, 'factorTotal', 0))) / 100 if fcas_config else Decimal(0)
    
    # Administrative & Overhead percentages
    pct_admin = Decimal(str(get_val(config, 'administracion', 0))) / 100
    pct_util = Decimal(str(get_val(config, 'utilidad', 0))) / 100
    pct_iva = Decimal(str(get_val(config, 'iva', 0))) / 100

    def to_decimal(val):
        return Decimal(str(val)) if val is not None else Decimal(0)

    # 1. Calculate Materials
    total_mat_bs = Decimal(0)
    total_mat_usd = Decimal(0)
    
    materiales = get_val(partida, 'materiales', [])
    mano_obra = get_val(partida, 'manoObra', [])
    equipos = get_val(partida, 'equipos', [])

    for mat in materiales:
        qty = to_decimal(get_val(mat, 'cantidad', 0))
        waste = to_decimal(get_val(mat, 'desperdicio', 0))
        base_bs = to_decimal(get_val(mat, 'precioBaseBs', 0))
        base_usd = to_decimal(get_val(mat, 'precioBaseUsd', 0))
        
        if base_usd > 0:
            price_usd = base_usd
            price_bs = base_usd * tasa_cambio
        else:
            price_bs = base_bs
            price_usd = base_bs / tasa_cambio if tasa_cambio else 0
            
        real_qty = qty * (1 + (waste / 100))
        
        sub_bs = price_bs * real_qty
        sub_usd = price_usd * real_qty
        
        if isinstance(mat, dict):
            mat['subtotalBs'] = float(sub_bs)
            mat['subtotalUsd'] = float(sub_usd)
        else:
            mat.subtotalBs = float(sub_bs)
            mat.subtotalUsd = float(sub_usd)
            
        total_mat_bs += sub_bs
        total_mat_usd += sub_usd

    # 2. Calculate Labor (Mano de Obra)
    total_mo_bs = Decimal(0)
    total_mo_usd = Decimal(0)
    
    for mo in mano_obra:
        qty = to_decimal(get_val(mo, 'cantidad', 0))
        jornal_bs = to_decimal(get_val(mo, 'jornalBaseBs', 0))
        jornal_usd = to_decimal(get_val(mo, 'jornalBaseUsd', 0))
        
        if jornal_usd > 0:
            cost_usd = jornal_usd
            cost_bs = jornal_usd * tasa_cambio
        else:
            cost_bs = jornal_bs
            cost_usd = jornal_bs / tasa_cambio if tasa_cambio else 0
        
        # Calculate daily cost including FCAS
        daily_bs = cost_bs * qty * (1 + factor_fcas)
        daily_usd = cost_usd * qty * (1 + factor_fcas)
        
        if isinstance(mo, dict):
            mo['subtotalBs'] = float(daily_bs)
            mo['subtotalUsd'] = float(daily_usd)
        else:
            mo.subtotalBs = float(daily_bs)
            mo.subtotalUsd = float(daily_usd)
            
        total_mo_bs += daily_bs
        total_mo_usd += daily_usd

    # 3. Calculate Equipment
    total_eq_bs = Decimal(0)
    total_eq_usd = Decimal(0)
    
    for eq in equipos:
        qty = to_decimal(get_val(eq, 'cantidad', 0))
        cop_bs = to_decimal(get_val(eq, 'costoDiaBs', 0))
        cop_usd = to_decimal(get_val(eq, 'costoDiaUsd', 0))
        
        if cop_usd > 0:
            c_usd = cop_usd
            c_bs = cop_usd * tasa_cambio
        else:
            c_bs = cop_bs
            c_usd = c_bs / tasa_cambio if tasa_cambio else 0
            
        daily_bs = c_bs * qty
        daily_usd = c_usd * qty
        
        if isinstance(eq, dict):
            eq['subtotalBs'] = float(daily_bs)
            eq['subtotalUsd'] = float(daily_usd)
        else:
            eq.subtotalBs = float(daily_bs)
            eq.subtotalUsd = float(daily_usd)
            
        total_eq_bs += daily_bs
        total_eq_usd += daily_usd

    # --- Total Direct Cost (Unitary) ---
    rendimiento = to_decimal(get_val(partida, 'rendimiento', 1))
    if rendimiento == 0: rendimiento = Decimal(1)

    unit_mo_bs = total_mo_bs / rendimiento
    unit_mo_usd = total_mo_usd / rendimiento
    
    unit_eq_bs = total_eq_bs / rendimiento
    unit_eq_usd = total_eq_usd / rendimiento
    
    unit_mat_bs = total_mat_bs
    unit_mat_usd = total_mat_usd
    
    c_directo_bs = unit_mat_bs + unit_mo_bs + unit_eq_bs
    c_directo_usd = unit_mat_usd + unit_mo_usd + unit_eq_usd
    
    # --- Indirect Costs ---
    curr_bs = c_directo_bs
    curr_usd = c_directo_usd
    
    # 1. Administration
    admin_bs = curr_bs * pct_admin
    admin_usd = curr_usd * pct_admin
    curr_bs += admin_bs
    curr_usd += admin_usd
    
    # 2. Utility (calculated on top of Cost+Admin)
    util_bs = curr_bs * pct_util
    util_usd = curr_usd * pct_util
    curr_bs += util_bs
    curr_usd += util_usd
    
    # Unit Price
    p_unitario_bs = curr_bs
    p_unitario_usd = curr_usd
    
    # Total Price
    qty_partida = to_decimal(get_val(partida, 'cantidad', 0))
    p_total_bs = p_unitario_bs * qty_partida
    p_total_usd = p_unitario_usd * qty_partida

    # Update Partida Object
    if isinstance(partida, dict):
        partida['costoMaterialesBs'] = float(unit_mat_bs)
        partida['costoMaterialesUsd'] = float(unit_mat_usd)
        partida['costoManoObraBs'] = float(unit_mo_bs)
        partida['costoManoObraUsd'] = float(unit_mo_usd)
        partida['costoEquiposBs'] = float(unit_eq_bs)
        partida['costoEquiposUsd'] = float(unit_eq_usd)
        partida['costoDirectoBs'] = float(c_directo_bs)
        partida['costoDirectoUsd'] = float(c_directo_usd)
        partida['precioUnitarioBs'] = float(p_unitario_bs)
        partida['precioUnitarioUsd'] = float(p_unitario_usd)
        partida['precioTotalBs'] = float(p_total_bs)
        partida['precioTotalUsd'] = float(p_total_usd)
    else:
        partida.costoMaterialesBs = float(unit_mat_bs)
        partida.costoMaterialesUsd = float(unit_mat_usd)
        partida.costoManoObraBs = float(unit_mo_bs)
        partida.costoManoObraUsd = float(unit_mo_usd)
        partida.costoEquiposBs = float(unit_eq_bs)
        partida.costoEquiposUsd = float(unit_eq_usd)
        partida.costoDirectoBs = float(c_directo_bs)
        partida.costoDirectoUsd = float(c_directo_usd)
        partida.precioUnitarioBs = float(p_unitario_bs)
        partida.precioUnitarioUsd = float(p_unitario_usd)
        partida.precioTotalBs = float(p_total_bs)
        partida.precioTotalUsd = float(p_total_usd)

    return partida
