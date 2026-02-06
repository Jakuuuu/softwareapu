# Venezuela Compliance Rules (Business Logic)

> [!IMPORTANT]
> These rules are INVIOLABLE to ensure the application allows construction companies to survive in the Venezuelan economic context.

## 1. Principio de Dualidad Monetaria (Currency Duality)
Every entity storing a monetary value (Material, Equipment, Labor, APU Item) MUST strictly adhere to the following schema structure. NO EXCEPTIONS.

- **`costo_bs`** (DECIMAL 18,4): Cost in Bolivars.
- **`costo_usd`** (DECIMAL 18,4): Cost in USD.
- **`tasa_cambio`** (DECIMAL 10,4): The exchange rate used at the moment of the transaction/snapshot.
- **`fecha_referencia`** (TIMESTAMP): When this price was captured.

**Logic:**
- The system must provide a global function to recalculate the entire project based on a new Base Exchange Rate.
- Conversions must always happen at the point of display or calculation if the reference date is different, but the raw values must be preserved.

## 2. Integridad del APU (Unit Price Analysis Integrity)
The Unit Price (Precio Unitario) calculation must strictly follow this formula:

```
Precio Unitario = (Cost_Material + Cost_Equipment + (Cost_Labor * FCAS)) / Rendimiento
```

- **Rendimiento (Yield)**: A dynamic variable. If `Rendimiento` approaches 0, the cost approaches infinity.
- **Real-time Updates**: Any change in `Rendimiento` must trigger an immediate recalculation of the APU price.

## 3. Ley de Pensiones 2025 (Pension Law Compliance)
The system must support the "Ley de Protección de las Pensiones de Seguridad Social".

- **Configuration**: A customizable percentage parameter (Default: **9%**).
- **Flexibility**: The user must be able to choose how to apply this cost:
    1.  **Inside FCAS**: Added to the Labor burden factor.
    2.  **Separate Indirect Cost**: Charged at the footer of the budget.

## 4. Snapshotting (Project Isolation)
**"The LuloWin Principle"**: Historical budgets must NEVER change when global prices change.

- **Rule**: When adding a resource (Material/Labor/Equipment) to a Project, it must be **CLONED** from the Master Database to a Project-Local Database (`project_materials`, etc.).
- **Reference**: The local copy may keep a reference ID to the master for optional future updates, but it is NOT a foreign key relation for price retrieval.
- **Immutability**: Once a budget is "Approved" or "Frozen", its costs must remain static regardless of market volatility.
