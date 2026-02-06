🎯 ARQUITECTURA DE LA APLICACIÓN
MODELO DE DATOS PRINCIPAL
PROYECTO {
  id: string
  nombre: string
  ubicacion: string
  propietario: string
  tipoObra: enum["EDIFICACION", "VIALIDAD", "HOSPITAL", "SIERRA"]
  factoresGlobales: {
    iva: number (%) // Default: 16%
    utilidad: number (%) // Default: 10-15%
    administracion: number (%) // Default: 10-15%
    fcas: number (%) // Factor Prestaciones Sociales: 60-85%
  }
  fechaCreacion: timestamp
}

PARTIDA {
  id: string
  proyectoId: string
  codigo: string // Ej: "02.01.03"
  titulo: string
  subtitulo: string | null
  descripcion: string
  unidadMedida: enum["M2", "M3", "ML", "PZA", "PTO", "GLB", "KG", "TON"]
  cantidad: number (metrado)
  rendimiento: number // CRÍTICO: unidades producidas por día
  materiales: Material[]
  manoObra: ManoObra[]
  equipos: Equipo[]
  // CAMPOS CALCULADOS (NO EDITAR DIRECTAMENTE)
  costoMateriales: number (calculado)
  costoManoObra: number (calculado)
  costoEquipos: number (calculado)
  costoDirecto: number (calculado)
  precioUnitario: number (calculado)
  precioTotal: number (calculado)
}

MATERIAL {
  recursoId: string // FK a RECURSO
  nombre: string
  unidad: string
  precioUnitario: number
  cantidad: number // Por unidad de partida
  desperdicio: number (%) // Default: 5-10%
  subtotal: number (calculado)
}

MANO_OBRA {
  recursoId: string
  categoria: enum["MAESTRO", "OFICIAL", "AYUDANTE", "PEON"]
  cantidad: number // Número de trabajadores en cuadrilla
  jornal: number // Pago por día (8 horas)
  subtotal: number (calculado)
}

EQUIPO {
  recursoId: string
  nombre: string
  tipoEquipo: enum["MAQUINARIA_PESADA", "HERRAMIENTA_MENOR", "EQUIPO_MENOR"]
  costoHora: number
  horasPorDia: number
  cantidad: number
  subtotal: number (calculado)
}

RECURSO {
  id: string
  tipo: enum["MATERIAL", "MANO_OBRA", "EQUIPO"]
  nombre: string
  unidad: string
  precioBase: number
  ultimaActualizacion: timestamp
  // Campos específicos según tipo
  categoria?: string (para mano de obra)
  desperdicioPorDefecto?: number (para materiales)
}

📱 FLUJO DE PANTALLAS Y FUNCIONALIDADES
PANTALLA 1: CONFIGURACIÓN DEL PROYECTO
Objetivo: Establecer parámetros globales que afectan TODOS los cálculos
Elementos de UI:
Sección 1: Identificación

Campo: Nombre del Proyecto (text, required, max 100 chars)
Campo: Ubicación (text, required)
Campo: Propietario/Cliente (text, required)

Sección 2: Tipo de Obra (CRÍTICO: determina recursos sugeridos)

Radio Button Group:

☐ Edificación / Vivienda
☐ Vialidad / Carreteras
☐ Obras Especiales (Hospital/Clínica)
☐ Obra en Sierra (Altitud >2500 msnm)



Sección 3: Factores Económicos (destacar visualmente)
┌─────────────────────────────────────┐
│ ⚙️ FACTORES GLOBALES               │
│                                     │
│ IVA:              [16] %           │
│ Utilidad:         [12] %           │
│ Administración:   [12] %           │
│ FCAS (Prest. Soc): [72] %          │
│                                     │
│ ℹ️ Estos % afectan TODAS las      │
│    partidas del proyecto           │
└─────────────────────────────────────┘
Validaciones:

IVA: 0-25%
Utilidad: 5-30%
Administración: 5-30%
FCAS: 50-100% (varía según legislación laboral)

Acción: Botón Continuar al Presupuesto →

PANTALLA 2: PRESUPUESTO (LISTA DE PARTIDAS)
Objetivo: Gestionar estructura jerárquica de actividades constructivas
Layout:
┌─────────────────────────────────────────────────────────┐
│ PROYECTO: Casa Habitación Los Robles                    │
│ [+ Nueva Partida] [Importar Excel] [Ver Reporte] [⚙️]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📁 01 PRELIMINARES                    P.U.    PARCIAL   │
│   └─ 01.01 Limpieza de terreno   45m² $8.50   $382.50  │
│   └─ 01.02 Trazado y nivelación  45m² $12.30  $553.50  │
│                                                          │
│ 📁 02 MOVIMIENTO DE TIERRAS              CU $15,847.00  │
│   └─ 02.01 Excavación manual     12m³ $45.80  $549.60  │
│   └─ 02.02 Relleno compactado    8m³  $38.20  $305.60  │
│                                                          │
│ 📁 03 ESTRUCTURA                         CU $89,234.00  │
│   📂 03.01 Cimientos                                     │
│     └─ 03.01.01 Concreto f'c=210  5m³ $320.50 $1,602.50│
│   📂 03.02 Columnas                                      │
│     └─ 03.02.01 Columna 25x25cm  18ml $125.80 $2,264.40│
│                                                          │
│ ─────────────────────────────────────────────────────── │
│                      COSTO DIRECTO:        $125,847.00  │
│                      IVA (16%):            $20,135.52   │
│                      UTILIDAD (12%):       $15,101.64   │
│                      ADMIN (12%):          $15,101.64   │
│                      ════════════════════════════════   │
│                      TOTAL PROYECTO:       $176,185.80  │
└─────────────────────────────────────────────────────────┘
Funcionalidades:
1. Crear Nueva Partida:

Modal con campos:

Código (auto-generado o manual: "03.02.01")
Título/Capítulo (dropdown de existentes + "Nuevo")
Descripción (text, 200 chars)
Unidad (dropdown: m², m³, ml, pza, pto, glb, kg, ton)
Cantidad (Metrado) (number, decimales permitidos)



2. Jerarquía Visual:

Títulos en negrita (sin P.U. individual)
Subtítulos con sangría
Partidas con código completo + iconos de acción (✏️ Editar | 🗑️ Eliminar | 📋 Duplicar)

3. Filtros y Búsqueda:

Buscador: "Buscar partida..."
Filtro por tipo: [Todas] [Materiales] [M.Obra] [Equipos]

Regla de Negocio:

Si Rendimiento = 0 en una partida → mostrar ⚠️ "Completar APU"
Click en partida → abre PANTALLA 3 (Editor APU)


PANTALLA 3: EDITOR DE APU (EL CORAZÓN)
Objetivo: Calcular precio unitario descomponiendo en recursos
Header:
┌──────────────────────────────────────────────────────┐
│ ← Volver | 03.02.01 - COLUMNA DE CONCRETO 25x25 cm  │
│ Unidad: ML (Metro Lineal) | Cantidad en Obra: 18 ml │
└──────────────────────────────────────────────────────┘
Sección CRÍTICA: RENDIMIENTO
┌────────────────────────────────────────────────┐
│  🎯 RENDIMIENTO DIARIO (FACTOR CLAVE)         │
│                                                │
│  ¿Cuántos ML produce la cuadrilla por día?   │
│  [      8.50      ] ML/día                    │
│                                                │
│  ℹ️ Menor rendimiento = Mayor costo unitario │
└────────────────────────────────────────────────┘
Tab 1: MATERIALES
Tabla Editable:
RecursoUnidadP.U.CantidadDesp.(%)Subtotal[Buscar recurso...]-----Cemento tipo Isaco$8.500.355%$3.12Arena lavadam³$25.000.1210%$3.30Piedra picadam³$28.000.1810%$5.54Cabilla 1/2"kg$1.204.508%$5.83Alambre #18kg$2.800.155%$0.44[+ Agregar Material]TOTAL$18.23
Fórmula de cada fila:
Subtotal = P.U. × Cantidad × (1 + Desperdicio/100)
Búsqueda Inteligente:

Autocomplete desde Base de Datos de Recursos
Sugerencias según Tipo de Obra:

Edificación → Cemento, Arena, Cabilla, Bloques
Vialidad → Asfalto, Base granular, Emulsión




Tab 2: MANO DE OBRA
Tabla Cuadrilla:
CategoríaCant.Jornal/díaSubtotal[Seleccionar...]---Maestro Albañil1.00$45.00$45.00Oficial2.00$35.00$70.00Ayudante2.00$25.00$50.00[+ Agregar Trabajador]TOTAL JORNAL$165.00
Cálculo Automático (en grande):
┌─────────────────────────────────────────────┐
│  COSTO MANO DE OBRA POR UNIDAD:            │
│                                             │
│  (Σ Jornales × (1 + FCAS%)) / Rendimiento │
│                                             │
│  ($165.00 × 1.72) / 8.50 ML/día            │
│                                             │
│  = $33.39 por ML                           │
└─────────────────────────────────────────────┘
Nota visible: "FCAS (72%) incluye prestaciones sociales, vacaciones, bono alimentación"

Tab 3: EQUIPOS
Subtab 3.1: Maquinaria Pesada
EquipoCosto/HoraHoras/díaCant.SubtotalMezcladora 1 saco$8.5081$68.00Vibrador concreto$5.0041$20.00[+ Agregar Equipo]SUBTOTAL$88.00
Cálculo:
Costo Equipo por Unidad = (Σ Subtotales) / Rendimiento
                        = $88.00 / 8.50 ML/día
                        = $10.35 por ML
Subtab 3.2: Herramientas Menores (automático)
☑️ Calcular como % de Mano de Obra: [5]%

Herramientas Menores = $33.39 × 0.05 = $1.67 por ML
Checkbox: "Incluir en presupuesto" (default: ON)

PANEL RESUMEN (Sidebar fijo):
╔═══════════════════════════════════════╗
║  📊 RESUMEN PRECIO UNITARIO          ║
╠═══════════════════════════════════════╣
║  Materiales:            $18.23       ║
║  Mano de Obra:          $33.39       ║
║  Equipos:               $10.35       ║
║  Herram. Menores:       $1.67        ║
║  ─────────────────────────────────   ║
║  COSTO DIRECTO:         $63.64       ║
║                                       ║
║  Administración (12%):  $7.64        ║
║  Utilidad (12%):        $7.64        ║
║  ─────────────────────────────────   ║
║  SUBTOTAL:              $78.92       ║
║  IVA (16%):             $12.63       ║
║  ═════════════════════════════════   ║
║  PRECIO UNITARIO:       $91.55 /ML   ║
║                                       ║
║  × Cantidad (18 ML) = $1,647.90     ║
╚═══════════════════════════════════════╝

[💾 Guardar Partida]
Fórmulas Completas:
javascript// 1. MATERIALES
costoMateriales = Σ(precioUnitario × cantidad × (1 + desperdicio/100))

// 2. MANO DE OBRA
costoManoObra = (Σ(jornal × cantidad) × (1 + FCAS/100)) / rendimiento

// 3. EQUIPOS
costoEquiposPesados = Σ(costoHora × horasDia × cantidad) / rendimiento
herramientasMenores = costoManoObra × (porcentajeHerramientas/100)
costoEquipos = costoEquiposPesados + herramientasMenores

// 4. COSTO DIRECTO
costoDirecto = costoMateriales + costoManoObra + costoEquipos

// 5. PRECIO UNITARIO
precioUnitario = costoDirecto × (1 + admin/100) × (1 + utilidad/100) × (1 + iva/100)

// 6. PRECIO TOTAL PARTIDA
precioTotal = precioUnitario × cantidad
```

---

### **PANTALLA 4: BASE DE DATOS DE RECURSOS**

#### **Objetivo:** Catálogo reutilizable de insumos con precios actualizables

#### **Layout Tipo Tabs:**

**Tab 1: 🧱 MATERIALES**

| Código | Nombre | Unidad | Precio Base | Última Act. | Acciones |
|--------|--------|--------|-------------|-------------|----------|
| MAT-001 | Cemento Portland Tipo I | saco | $8.50 | 15/01/2025 | ✏️ 🗑️ |
| MAT-002 | Arena lavada gruesa | m³ | $25.00 | 15/01/2025 | ✏️ 🗑️ |
| MAT-003 | Cabilla corrugada 1/2" | kg | $1.20 | 10/01/2025 | ✏️ 🗑️ |
| MAT-004 | Bloque de cemento 20x20x40 | pza | $1.80 | 15/01/2025 | ✏️ 🗑️ |

**Botones:**
- `[+ Nuevo Material]`
- `[Actualizar Precios Masivamente]` → Modal con opción de % de incremento global

**Tab 2: 👷 MANO DE OBRA**

| Código | Categoría | Jornal/día (8h) | FCAS Sugerido | Acciones |
|--------|-----------|-----------------|---------------|----------|
| MO-001 | Maestro Albañil | $45.00 | 72% | ✏️ 🗑️ |
| MO-002 | Oficial Construcción | $35.00 | 72% | ✏️ 🗑️ |
| MO-003 | Ayudante | $25.00 | 72% | ✏️ 🗑️ |
| MO-004 | Operador Maquinaria | $55.00 | 72% | ✏️ 🗑️ |

**Tab 3: ⚙️ EQUIPOS**

| Código | Nombre | Tipo | Costo/Hora | Acciones |
|--------|--------|------|------------|----------|
| EQ-001 | Retroexcavadora CAT 416 | Maq. Pesada | $85.00 | ✏️ 🗑️ |
| EQ-002 | Mezcladora 1 saco | Eq. Menor | $8.50 | ✏️ 🗑️ |
| EQ-003 | Vibrador para concreto | Eq. Menor | $5.00 | ✏️ 🗑️ |
| EQ-004 | Cortadora de piso | Herr. Menor | $12.00 | ✏️ 🗑️ |

#### **Funcionalidad Clave:**
- Cuando se edita un precio aquí → `⚠️ "Esto afectará X partidas. ¿Desea recalcular?"``
- Opción: `☑️ Mantener precios fijos en partidas antiguas` (histórico)

---

### **PANTALLA 5: REPORTE FINAL**

#### **Objetivo:** Documento exportable profesional

#### **Formato:**
```
════════════════════════════════════════════════════════
           PRESUPUESTO DE OBRA
════════════════════════════════════════════════════════

PROYECTO:     Casa Habitación Los Robles
UBICACIÓN:    Urbanización El Bosque, Valencia
PROPIETARIO:  Arq. María González
TIPO DE OBRA: Edificación
FECHA:        04 de febrero de 2026

────────────────────────────────────────────────────────
FACTORES APLICADOS:
────────────────────────────────────────────────────────
IVA:                16.00%
Utilidad:           12.00%
Administración:     12.00%
FCAS:               72.00%

════════════════════════════════════════════════════════
                DESCOMPOSICIÓN DE COSTOS
════════════════════════════════════════════════════════

01 PRELIMINARES                              $936.00
   01.01 Limpieza terreno    45.00 m²  $8.50   $382.50
   01.02 Trazado y nivel.    45.00 m²  $12.30  $553.50

02 MOVIMIENTO DE TIERRAS                     $15,847.00
   02.01 Excavación manual   12.00 m³  $45.80  $549.60
   02.02 Relleno compactado  8.00 m³   $38.20  $305.60
   ...

03 ESTRUCTURA                                $89,234.00
   03.01 Cimientos
      03.01.01 Concreto...   5.00 m³   $320.50 $1,602.50
   03.02 Columnas
      03.02.01 Columna 25x   18.00 ml  $125.80 $2,264.40
   ...

────────────────────────────────────────────────────────
RESUMEN ECONÓMICO:
────────────────────────────────────────────────────────
Materiales:                   $45,230.00    (35.8%)
Mano de Obra:                 $52,180.00    (41.3%)
Equipos:                      $28,437.00    (22.9%)
                              ──────────
COSTO DIRECTO:               $125,847.00

Administración (12%):         $15,101.64
Utilidad (12%):               $15,101.64
                              ──────────
SUBTOTAL:                    $156,050.28

IVA (16%):                    $24,968.04
                              ══════════
TOTAL PROYECTO:              $181,018.32

════════════════════════════════════════════════════════
```

#### **Botones de Exportación:**
- `[📄 Exportar PDF]` → Formato profesional con logos
- `[📊 Exportar Excel]` → Con fórmulas editables
- `[📋 Copiar al Portapapeles]`

#### **Alertas Inteligentes (según tipo de obra):**

Si `tipoObra == "SIERRA"`:
```
⚠️ ALERTA: Obra en Zona de Sierra
   □ ¿Incluyó aditivos acelerantes en concretos?
   □ ¿Verificó rendimientos por clima frío?
   □ ¿Consideró transporte especial de materiales?
```

Si `tipoObra == "HOSPITAL"`:
```
⚠️ ALERTA: Obra Hospitalaria
   □ ¿Partidas de instalaciones de gases medicinales?
   □ ¿Pisos especiales asépticos incluidos?
   □ ¿Planta de emergencia considerada?
```

---

## 🔧 REGLAS DE VALIDACIÓN

### Globales:
1. `Rendimiento > 0` (obligatorio para calcular)
2. `Cantidad >= 0` en materiales/equipos
3. `Jornal >= salario_mínimo_legal` (definir según país)
4. `IVA <= 25%` (límite razonable)
5. No permitir eliminar recursos usados en partidas activas

### Cálculos:
6. Si `costoDirecto == 0` → ⚠️ "Partida incompleta"
7. Si `rendimiento < 1` → ℹ️ "Rendimiento bajo, verificar"
8. Si `desperdicio > 30%` → ⚠️ "Desperdicio muy alto"

### UX:
9. Guardar automáticamente cada 30 segundos (draft)
10. Confirmación antes de eliminar partidas con metrados > 0
11. Tooltip en cada campo explicando su función

---

## 🎨 ESPECIFICACIONES DE DISEÑO

### Paleta de Colores:
- **Primario:** `#2563EB` (Azul ingeniería)
- **Secundario:** `#10B981` (Verde aprobado)
- **Peligro:** `#EF4444` (Rojo alerta)
- **Neutral:** `#64748B` (Gris textos)

### Tipografía:
- **Headers:** Inter Bold, 18-24px
- **Cuerpo:** Inter Regular, 14-16px
- **Números:** Mono (para alineación de decimales)

### Componentes Clave:
- **Campos numéricos:** Alineados a la derecha, formato con comas `$1,234.56`
- **Botón primario:** 48px altura mínima (táctil)
- **Tablas:** Zebra striping, hover effect
- **Modales:** Centrados, overlay oscuro 50%

---

## 📊 CASOS DE USO DETALLADOS

### Caso 1: Crear Presupuesto desde Cero
1. Usuario ingresa → `Configuración del Proyecto`
2. Selecciona "Edificación", IVA 16%, Utilidad 12%, Admin 12%, FCAS 72%
3. Click `Continuar` → `Pantalla Presupuesto`
4. Click `+ Nueva Partida` → Modal:
   - Código: "01.01"
   - Título: "Preliminares"
   - Descripción: "Limpieza de terreno"
   - Unidad: m²
   - Cantidad: 45
5. Click partida → `Editor APU`
6. Ingresa Rendimiento: 20 m²/día
7. Agrega materiales (ninguno en este caso)
8. Agrega cuadrilla: 2 Peones ($25 c/u)
9. Sistema calcula automáticamente:
```
   M.Obra = (2×$25 × 1.72) / 20 = $4.30/m²
   P.U. = $4.30 × 1.12 × 1.12 × 1.16 = $6.04/m²
   Total = $6.04 × 45 = $271.80

Click Guardar → Vuelve a Presupuesto con partida creada

Caso 2: Actualización Masiva de Precios

Usuario en Base de Datos → Tab Materiales
Click Actualizar Precios Masivamente
Modal: "Incrementar todos los materiales en: [10]%"
Sistema muestra: "Esto afectará 47 partidas. ¿Continuar?"
Usuario confirma → Precios actualizados
Sistema recalcula automáticamente todos los P.U.
Notificación: "✓ Presupuesto actualizado exitosamente"

Caso 3: Exportar a PDF

Usuario en Presupuesto → Click Ver Reporte
Sistema genera vista previa
Usuario verifica números
Click Exportar PDF
Sistema genera documento con:

Logo (si se cargó)
Datos del proyecto
Tabla completa de partidas
Resumen económico
Firma digital (opcional)


Descarga automática: Presupuesto_CasaRobles_04Feb2026.pdf


⚡ OPTIMIZACIONES TÉCNICAS
Performance:

Lazy loading de partidas (paginación: 50 por página)
Debounce en búsquedas (300ms)
Cálculos en Web Workers para proyectos >500 partidas
Cache de recursos frecuentes (LocalStorage)

Accesibilidad:

Contraste mínimo WCAG AA
Navegación completa por teclado (Tab, Enter, Esc)
Labels en todos los inputs
Aria-labels en iconos

Responsividad:

Mobile: Tabs verticales en Editor APU
Tablet: Sidebar colapsa en hamburger menu
Desktop: Sidebar fijo + tabla expandida


🚀 PRIORIZACIÓN MVP (Versión 1.0)
MUST HAVE (Esencial):
✅ Configuración de proyecto con factores globales
✅ CRUD de partidas con jerarquía
✅ Editor APU con Materiales + M.Obra + Equipos
✅ Cálculo automático de precios unitarios
✅ Base de datos de recursos
✅ Exportación a PDF básico
SHOULD HAVE (Importante):
🔲 Importar partidas desde Excel
🔲 Duplicar partidas existentes
🔲 Historial de cambios de precios
🔲 Alertas por tipo de obra
COULD HAVE (Deseable):
🔲 Comparación de presupuestos (v1 vs v2)
🔲 Plantillas predefinidas por tipo de obra
🔲 Gráficos de torta (distribución de costos)
🔲 Integración con contabilidad

🔐 CONSIDERACIONES DE SEGURIDAD

Validación de Inputs: Sanitizar todos los campos numéricos para evitar inyecciones
Autenticación: Sistema de login para multi-usuario (futuro)
Backup Automático: Guardar proyectos en la nube cada 5 minutos
Versionado: Permitir recuperar presupuestos anteriores (histórico)


📝 NOTAS FINALES PARA EL DESARROLLADOR

Separación de Lógica: Mantener cálculos en funciones puras reutilizables
Testing: Priorizar tests en fórmulas de cálculo (son críticas)
Documentación: Incluir tooltips con fórmulas visibles para el usuario
Feedback Visual: Loading spinners en cálculos pesados (>100 partidas)
