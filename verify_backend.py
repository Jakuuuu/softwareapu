import sys
import os

# Add src to path
sys.path.append(os.path.abspath("backend/src"))

from decimal import Decimal
from logic.apu import calculate_apu_item
from schemas import APUCalculationRequest, ProjectConfig, FCASConfig, APUPartida, APUDetalle


# Test Data
config = ProjectConfig(
    monedaPrincipal="USD",
    tasaCambio=50.0,
    fechaTasa="2024-02-07",
    fuenteTasa="BCV_OFICIAL",
    iva=16.0,
    utilidad=10.0,
    administracion=10.0,
    fcas=FCASConfig(
        factorTotal=72.0,
        diasFeriados=12,
        diasUtilidades=60,
        diasVacaciones=15,
        imputacionPensiones="COSTO_DIRECTO"
    )
)

material = APUDetalle(
    recursoId="mat-1",
    nombre="Cemento",
    unidad="saco",
    cantidad=1.0,
    desperdicio=5.0, # 5%
    precioBaseBs=500.0, # $10
    precioBaseUsd=10.0,
    tasaCambioAplicada=50.0
)

# Test Calculation
try:
    # Scenario: 1 Item
    partida = APUPartida(
        id="p1",
        codigo="01",
        titulo="Concreto",
        descripcion="",
        unidadMedida="M3",
        cantidad=10.0,
        rendimiento=20.0, # 20 m3/day
        capitulo="Estructura",
        materiales=[material],
        manoObra=[],
        equipos=[],
        
        # Init 0
        costoMaterialesBs=0, costoMaterialesUsd=0,
        costoManoObraBs=0, costoManoObraUsd=0,
        costoEquiposBs=0, costoEquiposUsd=0,
        costoDirectoBs=0, costoDirectoUsd=0,
        precioUnitarioBs=0, precioUnitarioUsd=0,
        precioTotalBs=0, precioTotalUsd=0
    )

    req = APUCalculationRequest(partida=partida, config=config)
    
    # Run logic
    result = calculate_apu_item(req.partida, req.config)
    
    print("--- APU CALCULATION TEST ---")
    print(f"Material Base USD: {material.precioBaseUsd}")
    print(f"Material Qty: {material.cantidad}")
    print(f"Waste: {material.desperdicio}%")
    
    # Expected Material Subtotal USD: 10 * 1 * 1.05 = 10.5
    mat_subtotal_usd = result.materiales[0].subtotalUsd
    print(f"Calculated Material Subtotal USD: {mat_subtotal_usd}")
    
    if abs(mat_subtotal_usd - 10.5) < 0.01:
        print("[OK] Material Cost Correct")
    else:
        print(f"[FAIL] Material Cost Incorrect. Expected 10.5, got {mat_subtotal_usd}")
        
    print("\n--- SUMMARY ---")
    print(f"Unit Price USD: {result.precioUnitarioUsd}")
    print(f"Total Price USD: {result.precioTotalUsd}")
    
except Exception as e:
    print(f"[ERROR] Error running calculation: {e}")
