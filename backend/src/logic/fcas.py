# backend/src/logic/fcas.py
from decimal import Decimal
from typing import Dict, Any

def calculate_total_paid_days(config: Dict[str, Any]) -> Decimal:
    """
    Calculates the total days paid by the employer per year (Días Pagados).
    Includes: 365 days + vacation + holidays + bonus days (utilidades).
    """
    days_year = Decimal(365)
    vacation_days = Decimal(config.get('vacation_days_base', 15))
    holidays = Decimal(config.get('holidays_count', 12))
    profit_sharing_days = Decimal(config.get('bonus_days_base', 45)) # Utilidades
    
    # In Venezuela, "Utilidades" are paid days, not just worked days.
    # Often treated as additional paid days in the numerator for FCAS.
    
    total_paid = days_year + vacation_days + holidays + profit_sharing_days
    return total_paid

def calculate_effective_worked_days(config: Dict[str, Any]) -> Decimal:
    """
    Calculates the total days actually worked (Días Realmente Laborados).
    Subtracts non-working days from 365 (DOES NOT subtract paid rest days like weekends
    if they are not worked? Usually: 365 - weekends - holidays - vacation - permits).
    
    Standard Venezuelan Construction Schema:
    Total Days: 365
    - Weekends (52 weeks * 2): 104
    - Holidays: 12
    - Vacation: 15
    - Sickness/Permits: 3
    - Rain/Union Permits: ~4 (Variable)
    """
    days_year = Decimal(365)
    weekends = Decimal(52) * 2
    holidays = Decimal(config.get('holidays_count', 12))
    vacation = Decimal(config.get('vacation_days_base', 15))
    sickness = Decimal(config.get('avg_sickness_days', 3))
    
    # "Días No Laborados"
    non_working = weekends + holidays + vacation + sickness
    
    effective_worked = days_year - non_working
    return effective_worked

def calculate_fcas(project_config: Dict[str, Any]) -> Decimal:
    """
    Main algorithm to calculate FCAS (Factor de Costos de Asociación Social).
    Returns the multiplier factor (e.g., 1.85 for 85% overload).
    
    Formula General Logic:
    FCAS = (Total Cost Labor / Base Salary Cost) - 1  (To get the %)
    Or: Factor Multiplier = Total Cost / Base Cost
    
    Simplification for Construction (The "Cascada" Method):
    1. Days Paid vs Days Worked Ratio.
    2. Add Social Security (IVSS, SPF, FAOV, INCES).
    3. Add Social Benefits (Prestaciones Sociales LOTTT).
    4. Add Pension Law 2025.
    """
    
    # 1. Geographic / Basic Ratio (Labor downtime)
    total_days_paid = calculate_total_paid_days(project_config)
    effective_days = calculate_effective_worked_days(project_config)
    
    if effective_days == 0:
        return Decimal(0)
        
    # Factor 1: Relation Paid/Worked
    factor_dias = total_days_paid / effective_days
    
    # 2. Statutory Contributions (Aportes Patronales) - % of Base Salary
    # These usually apply to the "Salario Normal" or "Integral" depending on the law.
    # For simplified estimation, we sum the pct.
    
    ivss = Decimal(project_config.get('ivss_pct', 11)) / 100
    faov = Decimal(project_config.get('faov_pct', 2)) / 100
    inces = Decimal(project_config.get('inces_pct', 2)) / 100
    
    contributions_pct = ivss + faov + inces
    
    # 3. Prestaciones Sociales (LOTTT)
    # 5 days per month + interest (Fideicomiso)
    # This is a complex calculation often estimated as a % of annual burden.
    # A standard conservative estimate is used if not simulated detailedly.
    # Let's assume a simplified burden for the "Antigüedad" + Interest.
    prestaciones_pct = Decimal('0.18') # Approx 18-20% usually
    
    # 4. Pension Law 2025
    pension_pct = Decimal(0)
    if project_config.get('pension_apply_to_fcas', True):
        pension_law_val = Decimal(project_config.get('pension_law_pct', 9))
        pension_pct = pension_law_val / 100
        
    # Total FCAS Percentage Calculation
    # Note: nuances apply on whether contributions apply to base or integral.
    # Real formula: (FactorDias * (1 + Contributions)) + Prestaciones - 1 ??
    # We will use an aggregative model suitable for estimates.
    
    # Base Factor purely from time not worked vs paid
    base_factor = factor_dias 
    
    # Add burdens that are direct cash out (Patronales)
    # These are usually on top of the Paid Salary.
    
    total_factor = base_factor + contributions_pct + prestaciones_pct + pension_pct
    
    return total_factor.quantize(Decimal("1.0000"))
