# backend/src/logic/polynomial.py
from decimal import Decimal
from typing import List, Dict, Any

def generate_polynomial_formula(project_apus: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates the Polynomial Formula for price escalation.
    Iterates through all APUs, sums up costs by Family (Cement, Steel, Labor, Mach),
    and calculates the incidence coefficient (Coeff) for each family.
    """
    
    total_project_cost = Decimal(0)
    family_costs: Dict[str, Decimal] = {}
    
    # 1. Aggregate Costs
    for apu in project_apus:
        # apu structure expected: {'items': [{'family': 'ACERO', 'total_cost': 100}, ...]}
        quantity = Decimal(apu.get('cantidad_obra', 1))
        
        for item in apu.get('items', []):
            family = item.get('familia', 'SIN_CLASIFICAR')
            cost = Decimal(item.get('costo_total_renglon', 0))
            
            # Total cost of this resource in the PARTIDA
            resource_total_in_apu = cost * quantity 
            
            # Add to global family accumulator
            current_family_total = family_costs.get(family, Decimal(0))
            family_costs[family] = current_family_total + resource_total_in_apu
            
            total_project_cost += resource_total_in_apu
            
    if total_project_cost == 0:
        return {"error": "Total project cost is zero"}
        
    # 2. Calculate Coefficients
    coefficients = []
    accumulated_coeff = Decimal(0)
    
    # Sort for deterministic output
    sorted_families = sorted(family_costs.items(), key=lambda x: x[1], reverse=True)
    
    for family, cost in sorted_families:
        coeff = cost / total_project_cost
        
        # Format: "K0 * (IndiceCurrent / IndiceBase)"
        coefficients.append({
            "family": family,
            "cost_total": cost,
            "coefficient": coeff.quantize(Decimal("1.0000")),
            "percent": (coeff * 100).quantize(Decimal("1.00"))
        })
        accumulated_coeff += coeff
        
    # 3. Validation
    # The sum of coefficients should be 1.00 (or close due to rounding)
    
    return {
        "total_cost": total_project_cost,
        "polynomial_factors": coefficients,
        "checksum": accumulated_coeff
    }
