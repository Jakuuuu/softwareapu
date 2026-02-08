import sys
import os

# Add the current directory to path so we can import src
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from src.database import Base, engine
    from src import models
    from sqlalchemy.schema import CreateTable
    from sqlalchemy.dialects import postgresql
    
    print("SUCCESS: Imported models and database configuration.")
    
    # Print SQL DDL for verification
    print("\n--- SQL DDL for Insumo ---")
    print(CreateTable(models.Insumo.__table__).compile(dialect=postgresql.dialect()))
    
    print("\n--- SQL DDL for APUDetalle ---")
    print(CreateTable(models.APUDetalle.__table__).compile(dialect=postgresql.dialect()))
    
    print("\n--- SQL DDL for Valuacion ---")
    print(CreateTable(models.Valuacion.__table__).compile(dialect=postgresql.dialect()))
    
    print("\nSUCCESS: Schema definitions are valid SQLAlchemy models.")

except ImportError as e:
    print(f"ERROR: Import failed. {e}")
except Exception as e:
    print(f"ERROR: {e}")
