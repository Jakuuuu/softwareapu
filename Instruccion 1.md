# INSTRUCCIONES GENERALES

Eres un desarrollador senior especializado en aplicaciones web para ingeniería. 
Vas a construir una aplicación React + TypeScript llamada "CALCULADORA APU" 
(Análisis de Precios Unitarios) para ingenieros civiles.

OBJETIVO: Sistema completo para calcular costos de construcción desglosando 
materiales, mano de obra y equipos.

STACK TECNOLÓGICO OBLIGATORIO:
- React 18+ con TypeScript
- Tailwind CSS para estilos
- Zustand o Context API para estado global
- React Hook Form para formularios
- Recharts para gráficos (opcional)
- jsPDF para exportación PDF
- IndexedDB o LocalStorage para persistencia

---

## ARQUITECTURA DE DATOS

### MODELO TypeScript:
```typescript
// types.ts

export type UnidadMedida = 'M2' | 'M3' | 'ML' | 'PZA' | 'PTO' | 'GLB' | 'KG' | 'TON';
export type TipoObra = 'EDIFICACION' | 'VIALIDAD' | 'HOSPITAL' | 'SIERRA';
export type CategoriaObrero = 'MAESTRO' | 'OFICIAL' | 'AYUDANTE' | 'PEON';
export type TipoEquipo = 'MAQUINARIA_PESADA' | 'HERRAMIENTA_MENOR' | 'EQUIPO_MENOR';
export type TipoRecurso = 'MATERIAL' | 'MANO_OBRA' | 'EQUIPO';

export interface Proyecto {
  id: string;
  nombre: string;
  ubicacion: string;
  propietario: string;
  tipoObra: TipoObra;
  factoresGlobales: {
    iva: number;           // Porcentaje: 16
    utilidad: number;      // Porcentaje: 12
    administracion: number; // Porcentaje: 12
    fcas: number;          // Porcentaje: 72
  };
  fechaCreacion: string;
  partidas: Partida[];
}

export interface Partida {
  id: string;
  codigo: string;          // Ej: "03.02.01"
  titulo: string;
  subtitulo?: string;
  descripcion: string;
  unidadMedida: UnidadMedida;
  cantidad: number;        // Metrado
  rendimiento: number;     // CRÍTICO: unidades por día
  
  // Recursos
  materiales: MaterialPartida[];
  manoObra: ManoObraPartida[];
  equipos: EquipoPartida[];
  
  // Calculados automáticamente
  costoMateriales: number;
  costoManoObra: number;
  costoEquipos: number;
  costoDirecto: number;
  precioUnitario: number;
  precioTotal: number;
}

export interface MaterialPartida {
  recursoId: string;
  nombre: string;
  unidad: string;
  precioUnitario: number;
  cantidad: number;        // Por unidad de partida
  desperdicio: number;     // Porcentaje
  subtotal: number;        // Calculado
}

export interface ManoObraPartida {
  recursoId: string;
  nombre: string;
  categoria: CategoriaObrero;
  cantidad: number;        // Número en cuadrilla
  jornal: number;          // Pago por día (8h)
  subtotal: number;        // Calculado
}

export interface EquipoPartida {
  recursoId: string;
  nombre: string;
  tipoEquipo: TipoEquipo;
  costoHora: number;
  horasPorDia: number;
  cantidad: number;
  subtotal: number;        // Calculado
}

export interface Recurso {
  id: string;
  tipo: TipoRecurso;
  nombre: string;
  unidad: string;
  precioBase: number;
  ultimaActualizacion: string;
  // Campos opcionales según tipo
  categoria?: CategoriaObrero;
  desperdicioPorDefecto?: number;
}
```

---

## FÓRMULAS DE CÁLCULO (IMPLEMENTAR EXACTAMENTE ASÍ)
```typescript
// utils/calculos.ts

export class CalculadoraAPU {
  
  // 1. COSTO DE MATERIALES
  static calcularCostoMateriales(materiales: MaterialPartida[]): number {
    return materiales.reduce((total, mat) => {
      const subtotal = mat.precioUnitario * mat.cantidad * (1 + mat.desperdicio / 100);
      return total + subtotal;
    }, 0);
  }
  
  // 2. COSTO DE MANO DE OBRA (CRÍTICO)
  static calcularCostoManoObra(
    manoObra: ManoObraPartida[], 
    rendimiento: number, 
    fcas: number
  ): number {
    if (rendimiento === 0) return 0;
    
    const totalJornal = manoObra.reduce((total, mo) => {
      return total + (mo.jornal * mo.cantidad);
    }, 0);
    
    return (totalJornal * (1 + fcas / 100)) / rendimiento;
  }
  
  // 3. COSTO DE EQUIPOS
  static calcularCostoEquipos(
    equipos: EquipoPartida[], 
    rendimiento: number,
    costoManoObra: number,
    porcentajeHerramientas: number = 5
  ): number {
    if (rendimiento === 0) return 0;
    
    // Equipos pesados
    const costoEquiposPesados = equipos
      .filter(eq => eq.tipoEquipo !== 'HERRAMIENTA_MENOR')
      .reduce((total, eq) => {
        const subtotal = eq.costoHora * eq.horasPorDia * eq.cantidad;
        return total + subtotal;
      }, 0) / rendimiento;
    
    // Herramientas menores (% de mano de obra)
    const herramientasMenores = costoManoObra * (porcentajeHerramientas / 100);
    
    return costoEquiposPesados + herramientasMenores;
  }
  
  // 4. COSTO DIRECTO
  static calcularCostoDirecto(partida: Partida, fcas: number): number {
    const materiales = this.calcularCostoMateriales(partida.materiales);
    const manoObra = this.calcularCostoManoObra(
      partida.manoObra, 
      partida.rendimiento, 
      fcas
    );
    const equipos = this.calcularCostoEquipos(
      partida.equipos, 
      partida.rendimiento,
      manoObra
    );
    
    return materiales + manoObra + equipos;
  }
  
  // 5. PRECIO UNITARIO (FÓRMULA MAESTRA)
  static calcularPrecioUnitario(
    costoDirecto: number,
    iva: number,
    utilidad: number,
    administracion: number
  ): number {
    return costoDirecto * 
           (1 + administracion / 100) * 
           (1 + utilidad / 100) * 
           (1 + iva / 100);
  }
  
  // 6. PRECIO TOTAL PARTIDA
  static calcularPrecioTotal(precioUnitario: number, cantidad: number): number {
    return precioUnitario * cantidad;
  }
  
  // FUNCIÓN COMPLETA PARA ACTUALIZAR PARTIDA
  static actualizarCalculosPartida(
    partida: Partida, 
    factoresGlobales: Proyecto['factoresGlobales']
  ): Partida {
    const costoMateriales = this.calcularCostoMateriales(partida.materiales);
    const costoManoObra = this.calcularCostoManoObra(
      partida.manoObra, 
      partida.rendimiento, 
      factoresGlobales.fcas
    );
    const costoEquipos = this.calcularCostoEquipos(
      partida.equipos, 
      partida.rendimiento,
      costoManoObra
    );
    const costoDirecto = costoMateriales + costoManoObra + costoEquipos;
    const precioUnitario = this.calcularPrecioUnitario(
      costoDirecto,
      factoresGlobales.iva,
      factoresGlobales.utilidad,
      factoresGlobales.administracion
    );
    const precioTotal = this.calcularPrecioTotal(precioUnitario, partida.cantidad);
    
    return {
      ...partida,
      costoMateriales,
      costoManoObra,
      costoEquipos,
      costoDirecto,
      precioUnitario,
      precioTotal
    };
  }
}
```

---

## COMPONENTES A CONSTRUIR

### 1. CONFIGURACIÓN DEL PROYECTO
```typescript
// components/ConfiguracionProyecto.tsx

CREAR COMPONENTE CON:

CAMPOS DEL FORMULARIO:
- Input: nombre (texto, requerido, max 100 chars)
- Input: ubicacion (texto, requerido)
- Input: propietario (texto, requerido)
- Select: tipoObra (opciones: EDIFICACION, VIALIDAD, HOSPITAL, SIERRA)

SECCIÓN DESTACADA "Factores Globales":
- Input numérico: IVA (%, default 16, min 0, max 25, step 0.1)
- Input numérico: Utilidad (%, default 12, min 5, max 30, step 0.1)
- Input numérico: Administración (%, default 12, min 5, max 30, step 0.1)
- Input numérico: FCAS (%, default 72, min 50, max 100, step 0.1)

TOOLTIP VISIBLE:
"Estos porcentajes afectan TODAS las partidas del proyecto"

BOTÓN PRIMARIO:
"Continuar al Presupuesto →"

ESTILOS:
- Card con sombra
- Inputs con border azul al focus
- Sección de factores con background gris claro
- Botón azul grande (h-12) con hover effect

VALIDACIÓN:
- Todos los campos son requeridos
- Porcentajes deben estar en los rangos especificados
```

---

### 2. LISTA DE PARTIDAS (PRESUPUESTO)
```typescript
// components/ListaPartidas.tsx

CREAR COMPONENTE CON:

HEADER:
- Título del proyecto (grande, bold)
- Botones: [+ Nueva Partida] [Ver Reporte] [⚙️ Configuración]
- Buscador: input con icono de lupa

TABLA/LISTA:
- Estructura jerárquica con indentación visual
- Títulos en negrita sin precio unitario
- Subtítulos con sangría de 20px
- Partidas con:
  * Código (ej: 03.02.01)
  * Descripción
  * Cantidad + Unidad
  * P.U. (alineado derecha, formato $X,XXX.XX)
  * Parcial (alineado derecha)
  * Acciones: [✏️ Editar] [🗑️ Eliminar] [📋 Duplicar]

FOOTER CON RESUMEN:
- Subtotal por capítulo
- COSTO DIRECTO (bold)
- IVA, Utilidad, Administración (con %)
- TOTAL PROYECTO (muy grande, color verde)

ESTADOS:
- Partida con rendimiento = 0 → Badge rojo "Incompleta"
- Hover en fila → background gris suave
- Click en partida → abrir Editor APU

FUNCIONALIDADES:
- Filtrar por texto
- Ordenar por código
- Expandir/colapsar capítulos
- Drag & drop para reordenar (opcional)
```

---

### 3. EDITOR DE APU (COMPONENTE PRINCIPAL)
```typescript
// components/EditorAPU.tsx

ESTRUCTURA GENERAL:

HEADER FIJO:
- Botón "← Volver"
- Código y descripción de partida (grande)
- Unidad de medida y cantidad

SECCIÓN DESTACADA (Card amarillo suave):
┌─────────────────────────────────────────┐
│ 🎯 RENDIMIENTO DIARIO                   │
│                                         │
│ ¿Cuántas [UNIDAD] produce por día?     │
│ [    INPUT GRANDE    ] unidades/día    │
│                                         │
│ ℹ️ Este es el factor más importante    │
└─────────────────────────────────────────┘

TABS HORIZONTALES:
- Tab 1: 🧱 Materiales
- Tab 2: 👷 Mano de Obra
- Tab 3: ⚙️ Equipos

SIDEBAR FIJO (derecha):
Card con resumen en tiempo real:
- Costo Materiales: $XXX.XX
- Costo M. Obra: $XXX.XX
- Costo Equipos: $XXX.XX
- ────────────────────
- COSTO DIRECTO: $XXX.XX
- Admin (X%): $XXX.XX
- Utilidad (X%): $XXX.XX
- ────────────────────
- SUBTOTAL: $XXX.XX
- IVA (X%): $XXX.XX
- ════════════════════
- P.U.: $XXX.XX (muy grande)
- × Cantidad = $XXX.XX
[Botón: 💾 Guardar Partida]

ACTUALIZACIÓN:
- Recalcular en cada cambio (debounce 300ms)
- Mostrar spinner mientras calcula
```

---

### 3A. TAB MATERIALES
```typescript
// components/TabMateriales.tsx

TABLA EDITABLE:

COLUMNAS:
1. Recurso (Autocomplete desde BD)
2. Unidad (readonly, viene del recurso)
3. P.U. (editable, formato dinero)
4. Cantidad (editable, decimal permitido)
5. Desperdicio % (editable, default 5%)
6. Subtotal (calculado, readonly, resaltado)
7. Acciones [🗑️]

FILA NUEVA:
[+ Agregar Material]
Al click → Nueva fila con autocomplete enfocado

AUTOCOMPLETE:
- Buscar en recursos tipo MATERIAL
- Mostrar: nombre + unidad + precio
- Al seleccionar → autopopular unidad y P.U.
- Si no existe → botón "Crear nuevo material"

FOOTER:
TOTAL MATERIALES: $XXX.XX (grande, bold)

VALIDACIÓN:
- Cantidad > 0
- Desperdicio entre 0-50%
- P.U. > 0
```

---

### 3B. TAB MANO DE OBRA
```typescript
// components/TabManoObra.tsx

TABLA CUADRILLA:

COLUMNAS:
1. Categoría (Select: MAESTRO, OFICIAL, AYUDANTE, PEON)
2. Cantidad (número, default 1)
3. Jornal/día (editable, formato dinero)
4. Subtotal Jornal (calculado)
5. Acciones [🗑️]

FILA NUEVA:
[+ Agregar Trabajador]

CARD INFORMATIVO (debajo de tabla):
┌──────────────────────────────────────────┐
│ CÁLCULO MANO DE OBRA:                    │
│                                          │
│ Total Jornal Cuadrilla: $XXX.XX         │
│ × FCAS (72%): $XXX.XX                   │
│ ÷ Rendimiento (X und/día): $XXX.XX      │
│                                          │
│ = Costo M.O. por Unidad: $XXX.XX/und    │
└──────────────────────────────────────────┘

VALIDACIÓN:
- Al menos 1 trabajador si hay M.O.
- Jornal >= 20 (salario mínimo referencial)
- Cantidad entre 0.5 y 10
```

---

### 3C. TAB EQUIPOS
```typescript
// components/TabEquipos.tsx

SUB-TABS:
- Maquinaria Pesada
- Herramientas Menores (auto)

SUB-TAB 1: MAQUINARIA PESADA
TABLA:
1. Equipo (Autocomplete)
2. Costo/Hora (editable)
3. Horas/día (editable, default 8)
4. Cantidad (editable, default 1)
5. Subtotal (calculado)
6. Acciones [🗑️]

[+ Agregar Equipo]

SUB-TAB 2: HERRAMIENTAS MENORES
CHECKBOX:
☑️ Calcular automáticamente como % de Mano de Obra

INPUT:
Porcentaje: [5]% (editable)

CARD CÁLCULO:
Herr. Menores = Costo M.O. × 5%
              = $XXX.XX × 0.05
              = $XXX.XX

FOOTER:
TOTAL EQUIPOS: $XXX.XX
(incluye herramientas menores)
```

---

### 4. BASE DE DATOS DE RECURSOS
```typescript
// components/BaseRecursos.tsx

TABS:
- 🧱 Materiales
- 👷 Mano de Obra
- ⚙️ Equipos

CADA TAB ES UNA TABLA CON:

HEADER:
[+ Nuevo Recurso] [Actualizar Precios] [Exportar]

TABLA:
Código | Nombre | Unidad | Precio | Última Act. | Acciones

ACCIONES POR FILA:
✏️ Editar → Modal con formulario
🗑️ Eliminar → Confirmación si está en uso
📊 Ver Uso → Lista de partidas que lo usan

MODAL "Actualizar Precios Masivamente":
- Input: Porcentaje de incremento [10]%
- Checkbox: Aplicar solo a materiales seleccionados
- Warning: "Esto afectará X partidas. ¿Continuar?"
- Botones: [Cancelar] [Aplicar Incremento]

BUSCADOR:
Input con filtro en tiempo real

PAGINACIÓN:
Mostrar 20 recursos por página
[◀️ Anterior] Página 1 de 5 [Siguiente ▶️]
```

---

### 5. REPORTE FINAL
```typescript
// components/ReporteFinal.tsx

LAYOUT:

ENCABEZADO:
════════════════════════════════════════
        PRESUPUESTO DE OBRA
════════════════════════════════════════

Proyecto: [nombre]
Ubicación: [ubicacion]
Propietario: [propietario]
Tipo de Obra: [tipoObra]
Fecha: [fecha actual formateada]

FACTORES APLICADOS:
- IVA: X%
- Utilidad: X%
- Administración: X%
- FCAS: X%

TABLA DE PARTIDAS:
Código | Descripción | Cantidad | Unidad | P.U. | Parcial

Con jerarquía visual:
01 TÍTULO (sin P.U.)
   01.01 Partida 1    X und  $XX.XX  $XXX.XX
   01.02 Partida 2    X und  $XX.XX  $XXX.XX
                         SUBTOTAL:  $X,XXX.XX

RESUMEN ECONÓMICO:
Materiales:        $XXX.XX  (XX%)
Mano de Obra:      $XXX.XX  (XX%)
Equipos:           $XXX.XX  (XX%)
─────────────────────────────
COSTO DIRECTO:     $XXX.XX

Administración:    $XXX.XX
Utilidad:          $XXX.XX
─────────────────────────────
SUBTOTAL:          $XXX.XX

IVA:               $XXX.XX
═════════════════════════════
TOTAL PROYECTO:    $XXX.XX

ALERTAS CONTEXTUALES:
Si tipoObra === 'SIERRA':
⚠️ Verificar:
□ Aditivos en concretos
□ Rendimientos ajustados
□ Transporte especial

BOTONES:
[📄 Exportar PDF] [📊 Exportar Excel] [📋 Copiar]
```

---

## EXPORTACIÓN A PDF
```typescript
// utils/exportPDF.ts

import jsPDF from 'jspdf';
import 'jspdf-autotable';

FUNCIÓN:
export function generarPDF(proyecto: Proyecto) {
  const doc = new jsPDF();
  
  // CONFIGURACIÓN
  - Márgenes: 15mm
  - Fuente: Helvetica
  - Tamaño: A4
  
  // HEADER
  - Logo (si existe)
  - Título centrado: "PRESUPUESTO DE OBRA"
  - Línea separadora
  
  // DATOS PROYECTO
  - Tabla 2x4 con info del proyecto
  
  // FACTORES
  - Lista de porcentajes aplicados
  
  // TABLA PARTIDAS
  - autoTable con columnas:
    * Código (15mm)
    * Descripción (80mm)
    * Cantidad (20mm)
    * Unidad (15mm)
    * P.U. (25mm)
    * Parcial (30mm)
  - Formato dinero: Intl.NumberFormat
  - Totales al pie con líneas separadoras
  
  // RESUMEN
  - Tabla de distribución de costos
  - Gráfico de torta (opcional)
  
  // FOOTER
  - Número de página
  - Fecha y hora de generación
  - Firma digital (espacio)
  
  // GUARDAR
  doc.save(`Presupuesto_${proyecto.nombre}_${fecha}.pdf`);
}
```

---

## PERSISTENCIA DE DATOS
```typescript
// utils/storage.ts

USAR IndexedDB con biblioteca 'idb' o 'dexie':

BASE DE DATOS: "calculadora-apu-db"

STORES:
1. proyectos → Proyecto[]
2. recursos → Recurso[]
3. configuracion → Config

FUNCIONES CLAVE:
- guardarProyecto(proyecto: Proyecto): Promise
- cargarProyecto(id: string): Promise
- listarProyectos(): Promise
- eliminarProyecto(id: string): Promise
- exportarDatos(): JSON completo
- importarDatos(json: string): void

AUTO-GUARDADO:
- Debounce de 2 segundos al editar
- Indicador visual: "Guardando..." / "✓ Guardado"
```

---

## ESTADO GLOBAL
```typescript
// store/useProyectoStore.ts

USAR Zustand:

interface ProyectoStore {
  // Estado
  proyectoActual: Proyecto | null;
  recursos: Recurso[];
  partidaEditando: string | null;
  
  // Acciones
  setProyecto: (proyecto: Proyecto) => void;
  actualizarFactoresGlobales: (factores: Partial) => void;
  agregarPartida: (partida: Partida) => void;
  actualizarPartida: (id: string, cambios: Partial) => void;
  eliminarPartida: (id: string) => void;
  
  // Recursos
  agregarRecurso: (recurso: Recurso) => void;
  actualizarPrecioRecurso: (id: string, nuevoPrecio: number) => void;
  
  // Cálculos
  recalcularTodasPartidas: () => void;
  obtenerTotalProyecto: () => number;
}

IMPLEMENTACIÓN:
const useProyectoStore = create((set, get) => ({
  // ... implementar todas las acciones
  // Importante: al actualizar factores globales o precios,
  // recalcular TODAS las partidas afectadas
}));
```

---

## VALIDACIONES Y REGLAS DE NEGOCIO
```typescript
// utils/validaciones.ts

IMPLEMENTAR:

1. validarRendimiento(rendimiento: number): ValidationResult
   - Debe ser > 0
   - Warning si < 1
   - Error si === 0

2. validarDesperdicio(porcentaje: number): ValidationResult
   - Entre 0-50%
   - Warning si > 30%

3. validarJornal(jornal: number): ValidationResult
   - Mínimo $20 (salario base)
   - Warning si > $200 (verificar)

4. validarPartidaCompleta(partida: Partida): ValidationResult[]
   - Rendimiento > 0
   - Al menos 1 recurso
   - Cantidad > 0

5. validarFactoresGlobales(factores): ValidationResult
   - IVA: 0-25%
   - Utilidad: 5-30%
   - Admin: 5-30%
   - FCAS: 50-100%

TIPO:
interface ValidationResult {
  valid: boolean;
  type: 'error' | 'warning' | 'info';
  message: string;
}
```

---

## DISEÑO Y ESTILOS
```typescript
// tailwind.config.js

CONFIGURACIÓN:

theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#2563EB',
        700: '#1d4ed8',
      },
      success: '#10B981',
      danger: '#EF4444',
      warning: '#F59E0B',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace'],
    },
  },
}

COMPONENTES REUTILIZABLES:

1. Button:
   - Variantes: primary, secondary, danger
   - Tamaños: sm, md, lg
   - Loading state con spinner

2. Input:
   - Con label flotante
   - Error state con mensaje
   - Formato numérico para dinero

3. Card:
   - Sombra suave
   - Padding consistente (p-6)
   - Hover effect sutil

4. Table:
   - Zebra striping
   - Sticky header
   - Hover en filas

5. Modal:
   - Overlay oscuro 50%
   - Centrado responsive
   - Animación de entrada

RESPONSIVE:
- Mobile: 1 columna, tabs verticales
- Tablet: 2 columnas
- Desktop: Sidebar fijo, tabla expandida
```

---

## PRIORIZACIÓN MVP

### FASE 1 (ESENCIAL - HACER PRIMERO):
✅ 1. Modelo de datos completo
✅ 2. Funciones de cálculo (CalculadoraAPU)
✅ 3. ConfiguracionProyecto component
✅ 4. ListaPartidas component (básico)
✅ 5. EditorAPU con 3 tabs
✅ 6. Persistencia en LocalStorage
✅ 7. Exportación PDF básica

### FASE 2 (IMPORTANTE):
🔲 8. BaseRecursos component
🔲 9. Búsqueda y filtros
🔲 10. Duplicar partidas
🔲 11. Alertas por tipo de obra
🔲 12. Auto-guardado

### FASE 3 (MEJORAS):
🔲 13. Importar desde Excel
🔲 14. Gráficos de distribución
🔲 15. Plantillas predefinidas
🔲 16. Historial de cambios

---

## INSTRUCCIONES FINALES

CONSTRUYE LA APLICACIÓN EN ESTE ORDEN:

1️⃣ PRIMERO: Crear estructura de carpetas
```
src/
├── components/
│   ├── ConfiguracionProyecto.tsx
│   ├── ListaPartidas.tsx
│   ├── EditorAPU.tsx
│   ├── TabMateriales.tsx
│   ├── TabManoObra.tsx
│   ├── TabEquipos.tsx
│   ├── BaseRecursos.tsx
│   ├── ReporteFinal.tsx
│   └── ui/ (botones, inputs, cards)
├── types/
│   └── index.ts
├── utils/
│   ├── calculos.ts
│   ├── validaciones.ts
│   ├── storage.ts
│   └── exportPDF.ts
├── store/
│   └── useProyectoStore.ts
└── App.tsx
```

2️⃣ SEGUNDO: Implementar tipos y cálculos
- Empezar por types/index.ts
- Luego utils/calculos.ts con tests

3️⃣ TERCERO: Componentes básicos UI
- Button, Input, Card, Modal
- Sin lógica, solo presentación

4️⃣ CUARTO: Componentes de negocio
- ConfiguracionProyecto
- ListaPartidas
- EditorAPU (paso a paso)

5️⃣ QUINTO: Estado y persistencia
- Store con Zustand
- LocalStorage/IndexedDB

6️⃣ SEXTO: Exportación PDF
- Integrar jsPDF
- Formato profesional

7️⃣ SÉPTIMO: Pulir y validar
- Validaciones en todos los formularios
- Mensajes de error claros
- Loading states

---

## CASOS DE PRUEBA

IMPLEMENTAR ESTOS ESCENARIOS:

TEST 1: Partida Simple
- Limpieza de terreno
- 45 m²
- Rendimiento: 20 m²/día
- 2 Peones × $25
- Sin materiales, sin equipos
- Resultado esperado: ~$6/m²

TEST 2: Partida Compleja
- Columna de concreto
- 18 ml
- Rendimiento: 8.5 ml/día
- Materiales: cemento, arena, piedra, cabilla
- Cuadrilla: 1 Maestro, 2 Oficiales, 2 Ayudantes
- Equipos: mezcladora, vibrador
- Resultado esperado: ~$90-120/ml

TEST 3: Actualización de Precios
- Cambiar precio cemento: +10%
- Verificar que TODAS las partidas con cemento se recalculen
- Verificar que el total del proyecto cambie

---

## CONSIDERACIONES IMPORTANTES

❗ RENDIMIENTO ES CRÍTICO:
- Es el denominador en M.O. y Equipos
- Si es 0 → División por 0 → Error
- Destacar visualmente SIEMPRE

❗ RECÁLCULO AUTOMÁTICO:
- Cualquier cambio debe recalcular toda la cadena
- Material → Costo Materiales → Costo Directo → P.U. → Total
- Usar useEffect con dependencias correctas

❗ FORMATO DE NÚMEROS:
- Siempre 2 decimales en dinero
- Separador de miles: coma
- Símbolo de moneda: $
- Usar: Intl.NumberFormat('es-VE', {style:'currency'})

❗ VALIDACIÓN TEMPRANA:
- No permitir guardar sin rendimiento
- Advertir si desperdicio > 30%
- Confirmar antes de eliminar partidas con metrados

❗ FEEDBACK VISUAL:
- Loading spinners en cálculos
- Animaciones suaves en modales
- Toasts para confirmaciones
- Colores semánticos (verde=ok, rojo=error)

---

AHORA CONSTRUYE LA APLICACIÓN COMPLETA SIGUIENDO ESTA ESPECIFICACIÓN.
EMPIEZA POR LA FASE 1 (MVP) Y HAZLO FUNCIONAL ANTES DE AGREGAR MEJORAS.
USA TYPESCRIPT ESTRICTO Y COMENTA EL CÓDIGO DONDE SEA NECESARIO.

¡ÉXITO! 🚀
