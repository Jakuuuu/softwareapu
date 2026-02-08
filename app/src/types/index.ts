export type UnidadMedida = 'M2' | 'M3' | 'ML' | 'PZA' | 'PTO' | 'GLB' | 'KG' | 'TON' | 'KGF' | 'UND';
export type TipoObra = 'EDIFICACION' | 'VIALIDAD' | 'HOSPITAL' | 'SIERRA' | 'OTRO';
export type CategoriaObrero = 'MAESTRO' | 'OFICIAL' | 'AYUDANTE' | 'PEON';
export type TipoEquipo = 'MAQUINARIA_PESADA' | 'HERRAMIENTA_MENOR' | 'EQUIPO_MENOR';
export type TipoRecurso = 'MATERIAL' | 'MANO_OBRA' | 'EQUIPO';
export type FuenteTasa = 'BCV_OFICIAL' | 'PARALELO' | 'MANUAL';

export interface ProjectConfig {
    // Moneda y Tasa de Cambio
    monedaPrincipal: 'BS' | 'USD';
    tasaCambio: number;
    fechaTasa: string;
    fuenteTasa: FuenteTasa;

    // Factores Globales (Porcentajes 0-100)
    iva: number;           // Default: 16
    utilidad: number;      // Default: 10-15
    administracion: number; // Default: 10-15

    // Configuración FCAS (Venezuela Compliance)
    fcas: {
        factorTotal: number; // El valor calculado final (ej: 72.5)
        diasFeriados: number;
        diasUtilidades: number; // Ley: 30-120 días
        diasVacaciones: number; // Ley: 15+ días
        porcentajeInces: number; // Default: 2.0
        porcentajeIvss: number; // Default: 9-11
        porcentajeFaov: number; // Default: 2.0
        porcentajePensiones: number; // Ley 2025: 9.0
        imputacionPensiones: 'COSTO_DIRECTO' | 'GASTO_ADMINISTRATIVO';
    };
}

export interface Ingeniero {
    nombre: string;
    civ: string; // Colegio de Ingenieros de Venezuela ID
    cargo?: string; // e.g. "Ingeniero Residente"
}

export interface Valuacion {
    id: string;
    partidaId: string;
    fecha: string; // ISO Date
    cantidad: number; // Cantidad ejecutada en este periodo
    nota?: string;
}

export interface Dependencia {
    id: string;
    predecesoraId: string;
    sucesoraId: string;
    tipo: 'FIN_INICIO'; // Por ahora solo soportamos Fin-Inicio
}

export interface Proyecto {
    id: string;
    nombre: string;
    ubicacion: string;
    propietario: string;
    ingeniero?: Ingeniero;
    tipoObra: TipoObra;
    tipoObraOtro?: string;

    config: ProjectConfig;

    fechaCreacion: string;
    partidas: Partida[];

    // New fields for extended functionality (Offline/Tablet support)
    valuaciones: Valuacion[];
    dependencias: Dependencia[];

    resultados?: {
        costoDirectoBs: number;
        costoDirectoUsd: number;
        totalBs: number;
        totalUsd: number;
    }
}

export interface Partida {
    id: string;
    codigo: string;          // Ej: "01.01"
    capitulo: string;        // Ej: "Estructuras"
    titulo: string;
    subtitulo?: string;
    descripcion: string;
    unidadMedida: UnidadMedida;

    cantidad: number;        // Metrado
    rendimiento: number;     // Unidades por día (8h)

    // Recursos desglosados
    materiales: MaterialPartida[];
    manoObra: ManoObraPartida[];
    equipos: EquipoPartida[];

    // --- CAMPOS CALCULADOS (PRECIOS UNITARIOS) ---
    // Todos los valores son Unitarios (por m2, m3, etc)

    // Costos en Bolívares (VES)
    costoMaterialesBs: number;
    costoManoObraBs: number;
    costoEquiposBs: number;
    costoDirectoBs: number;
    precioUnitarioBs: number;

    // Costos en Dólares (USD)
    costoMaterialesUsd: number;
    costoManoObraUsd: number;
    costoEquiposUsd: number;
    costoDirectoUsd: number;
    precioUnitarioUsd: number;

    precioTotalBs: number;  // (PU_Bs * Cantidad)
    precioTotalUsd: number; // (PU_Usd * Cantidad)
}

export interface MaterialPartida {
    recursoId: string; // ID del insumo en base de datos o snapshot
    nombre: string;
    unidad: string;
    cantidad: number;        // Coeficiente por unidad de partida
    desperdicio: number;     // Porcentaje (0-100)

    // Precios Base (del recurso)
    precioBaseBs: number;
    precioBaseUsd: number;
    tasaCambioAplicada: number; // Para trazabilidad histórica

    // Subtotales Unitarios (incluye desperdicio)
    subtotalBs: number;
    subtotalUsd: number;
}

export interface ManoObraPartida {
    recursoId: string;
    nombre: string;
    categoria: CategoriaObrero;
    cantidad: number;        // Cantidad de personas (cuadrilla)

    // Jornales Base (Salario Diario Integral)
    jornalBaseBs: number;
    jornalBaseUsd: number;

    // Subtotales Unitarios (Considerando Rendimiento y FCAS)
    // NOTA: El cálculo es: (Σ(Jornal * Cantidad * FCAS)) / Rendimiento
    subtotalBs: number;
    subtotalUsd: number;
}

export interface EquipoPartida {
    recursoId: string;
    nombre: string;
    tipoEquipo: TipoEquipo;
    cantidad: number;

    // Costo de Operación y Posesión (COP)
    costoDiaBs: number;
    costoDiaUsd: number;

    horasPorDia: number; // Normalmente 8

    // Subtotales Unitarios (Considerando Rendimiento)
    // Cálculo: (CostoDia * Cantidad) / Rendimiento
    subtotalBs: number;
    subtotalUsd: number;
}

export interface Recurso {
    id: string;
    tipo: TipoRecurso;
    nombre: string;
    unidad: string;
    codigo?: string; // COVENIN

    // Precios Maestros
    costoBs: number;
    costoUsd: number;
    fechaPrecio: string;

    // Metadatos
    ultimaActualizacion: string;
    categoria?: CategoriaObrero;
    desperdicioPorDefecto?: number;
}
