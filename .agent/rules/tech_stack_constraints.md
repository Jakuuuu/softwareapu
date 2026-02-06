# Tech Stack Constraints & Standards

## 1. Frontend Architecture
- **Framework**: React 19+ with TypeScript.
- **Styling**: Tailwind CSS. Focus on high-contrast, professional engineering aesthetics ("Data Density" over "Whitespace").
- **Data Grid**: MUST use a high-performance virtualized grid (AG Grid Community or TanStack Table) capable of rendering 10,000+ rows without lag.
    - *Requirement*: Excel-like keyboard navigation (Arrow keys, Enter to edit).
- **State Management**: Zustand or TanStack Query.

## 2. Backend & API
- **Language**: Python (FastAPI) PREFERRED for complex mathematical modeling (Polynomial Formulas), OR Node.js (NestJS) if strictly necessary for team coherence.
    - *Current Decision*: **Python (FastAPI)**.
- **Precision**: ALL monetary calculations must use libraries that support arbitrary precision (e.g., Python `decimal` module), never floating-point math for money.

## 3. Database & Storage
- **Primary Database**: PostgreSQL.
- **Offline Storage (Local)**: RxDB or SQLite (WASM).
    - *Constraint*: The app must be fully functional offline (Create Projects, Edit APUs, Calculate Budgets).
    - *Sync*: Implement a robust sync mechanism that handles conflicts gracefully ("Last Write Wins" or user prompt).

## 4. Security & Performance
- **Data Types**: In SQL, always use `DECIMAL(18,4)` for currency. Never `FLOAT` or `DOUBLE`.
- **Indexing**: `codigo_covenin` in materials must be indexed and unique within the context (Master or Project).

## 5. Environment
- **Containerization**: Docker support for easy deployment.
- **Packaging**: Electron for Desktop builds (Windows/macOS/Linux) and standard PWA for Web.
