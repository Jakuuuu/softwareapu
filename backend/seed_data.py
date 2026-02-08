import asyncio
import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import engine, SessionLocal, Base
from src import models

async def seed_data():
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        # 1. Seed COVENIN Codes
        # Check if empty
        result = await db.execute(models.select(models.CoveninPartida).limit(1))
        if not result.scalars().first():
            print("Seeding COVENIN data...")
            covenin_data = [
                {"codigo": "E-311.110.000", "descripcion": "CONCRETO DE f'c 200 kgf/cm2 A LOS 28 DIAS, ACABADO CORRIENTE, PARA LA CONSTRUCCION DE BASES DE PAVIMENTOS.", "unidad": "m3", "rendimiento_base": 20},
                {"codigo": "E-313.110.000", "descripcion": "CONCRETO DE f'c 250 kgf/cm2 A LOS 28 DIAS, ACABADO CORRIENTE, PARA LA CONSTRUCCION DE VIGAS DE RIOSTRA.", "unidad": "m3", "rendimiento_base": 15},
                {"codigo": "E-323.000.000", "descripcion": "ENCOFRADO DE MADERA, TIPO RECTO, ACABADO CORRIENTE, EN VIGAS DE RIOSTRA.", "unidad": "m2", "rendimiento_base": 10},
                {"codigo": "E-351.100.000", "descripcion": "SUMINISTRO, TRANSPORTE, PREPARACION Y COLOCACION DE ACERO DE REFUERZO FY 4200 KGF/CM2, UTILIZANDO CABILLAS DE DIAMETRO IGUAL O MENOR AL No 3", "unidad": "kgf", "rendimiento_base": 300},
                {"codigo": "E-411.010.000", "descripcion": "PAREDES DE BLOQUES HUECOS DE CONCRETO, DE 10 CM DE ESPESOR, ACABADO CORRIENTE.", "unidad": "m2", "rendimiento_base": 18}
            ]
            
            for item in covenin_data:
                db_item = models.CoveninPartida(
                    id=uuid.uuid4(),
                    codigo=item["codigo"],
                    descripcion=item["descripcion"],
                    unidad=item["unidad"],
                    rendimiento_base=item["rendimiento_base"]
                )
                db.add(db_item)
        
        # 2. Seed Basic Materials (Library)
        result = await db.execute(models.select(models.Insumo).limit(1))
        if not result.scalars().first():
            print("Seeding Materials library...")
            materials = [
                {"descripcion": "CEMENTO GRIS PORTLAND TIPO I (SACO 42.5KG)", "unidad": "saco", "precio": 8.50, "tipo": "MATERIAL"},
                {"descripcion": "ARENA LAVADA", "unidad": "m3", "precio": 35.00, "tipo": "MATERIAL"},
                {"descripcion": "PIEDRA PICADA", "unidad": "m3", "precio": 40.00, "tipo": "MATERIAL"},
                {"descripcion": "BLOQUE DE CONCRETO 10cm", "unidad": "und", "precio": 0.85, "tipo": "MATERIAL"},
                {"descripcion": "CABILLA 3/8 (No 3)", "unidad": "kg", "precio": 1.20, "tipo": "MATERIAL"},
                {"descripcion": "ALBAÑIL (MAESTRO)", "unidad": "dia", "precio": 25.00, "tipo": "MANO_OBRA"},
                {"descripcion": "OBRERO (AYUDANTE)", "unidad": "dia", "precio": 15.00, "tipo": "MANO_OBRA"}
            ]
            
            for item in materials:
                db_item = models.Insumo(
                    id=uuid.uuid4(),
                    descripcion=item["descripcion"],
                    unidad=item["unidad"],
                    precio_base=item["precio"],
                    tipo=models.TipoInsumo(item["tipo"])
                )
                db.add(db_item)

        await db.commit()
        print("Database seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
