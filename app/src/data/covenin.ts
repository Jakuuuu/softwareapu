export interface CoveninEntry {
    codigo: string;
    descripcion: string;
    unidad: string;
    rendimientoDia: number; // Default yield (qty/day) for this activity
    tipo: 'SIV' | 'CARRETERAS' | 'EDIFICACIONES' | 'OTRO';
}

export const COVENIN_DATA: CoveninEntry[] = [
    // Obras Preliminares
    { codigo: 'E-111.100.000', descripcion: 'REPLANTEO GENERAL DE LA OBRA', unidad: 'M2', rendimientoDia: 500, tipo: 'EDIFICACIONES' },
    { codigo: 'E-121.000.000', descripcion: 'DEMOLICIÓN DE PAREDES DE BLOQUE DE ARCILLA E=15CM', unidad: 'M2', rendimientoDia: 25, tipo: 'EDIFICACIONES' },
    { codigo: 'E-122.000.000', descripcion: 'DEMOLICION DE FRISO EN PAREDES', unidad: 'M2', rendimientoDia: 40, tipo: 'EDIFICACIONES' },

    // Movimiento de Tierras
    { codigo: 'E-211.000.000', descripcion: 'EXCAVACION A MANO PARA ZANJAS', unidad: 'M3', rendimientoDia: 3.5, tipo: 'EDIFICACIONES' },
    { codigo: 'E-212.000.000', descripcion: 'CARGA A MANO DE MATERIAL PROVENIENTE DE EXC.', unidad: 'M3', rendimientoDia: 8, tipo: 'EDIFICACIONES' },

    // Estructuras - Concreto
    { codigo: 'E-323.000.000', descripcion: 'CONCRETO DE FC=210 KGF/CM2 A LOS 28 DIAS', unidad: 'M3', rendimientoDia: 15, tipo: 'EDIFICACIONES' },
    { codigo: 'E-331.000.000', descripcion: 'ENCOFRADO DE MADERA EN COLUMNAS', unidad: 'M2', rendimientoDia: 12, tipo: 'EDIFICACIONES' },
    { codigo: 'E-341.000.000', descripcion: 'ACERO DE REFUERZO FY=4200 KGF/CM2', unidad: 'KGF', rendimientoDia: 250, tipo: 'EDIFICACIONES' },

    // Arquitectura - Albañileria
    { codigo: 'E-411.000.000', descripcion: 'PARED DE BLOQUE DE ARCILLA 15CM ACABADO CORRIENTE', unidad: 'M2', rendimientoDia: 18, tipo: 'EDIFICACIONES' },
    { codigo: 'E-412.000.000', descripcion: 'FRISO LISO EN PAREDES', unidad: 'M2', rendimientoDia: 22, tipo: 'EDIFICACIONES' },
    { codigo: 'E-431.000.000', descripcion: 'REVESTIMIENTO CON BALDOSAS DE CERAMICA', unidad: 'M2', rendimientoDia: 12, tipo: 'EDIFICACIONES' },

    // Pintura
    { codigo: 'E-511.000.000', descripcion: 'PINTURA DE CAUCHO EN PAREDES INTERIORES (2 MANOS)', unidad: 'M2', rendimientoDia: 45, tipo: 'EDIFICACIONES' },

    // Instalaciones Electricas
    { codigo: 'E-611.000.000', descripcion: 'PUNTO DE ELECTRICIDAD TOMACORRIENTE 120V', unidad: 'PTO', rendimientoDia: 8, tipo: 'EDIFICACIONES' },
    { codigo: 'E-612.000.000', descripcion: 'PUNTO DE ALUMBRADO TECHO', unidad: 'PTO', rendimientoDia: 6, tipo: 'EDIFICACIONES' },

    // Instalaciones Sanitarias
    { codigo: 'E-711.000.000', descripcion: 'PUNTO DE AGUAS CLARAS 1/2"', unidad: 'PTO', rendimientoDia: 5, tipo: 'EDIFICACIONES' },
    { codigo: 'E-712.000.000', descripcion: 'PUNTO DE AGUAS SERVIDAS 4"', unidad: 'PTO', rendimientoDia: 4, tipo: 'EDIFICACIONES' }
];

export const searchCovenin = (query: string): CoveninEntry[] => {
    const q = query.toLowerCase();
    return COVENIN_DATA.filter(item =>
        item.codigo.toLowerCase().includes(q) ||
        item.descripcion.toLowerCase().includes(q)
    );
};
