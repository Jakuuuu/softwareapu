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
