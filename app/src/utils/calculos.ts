import type { MaterialPartida, ManoObraPartida, EquipoPartida, Partida, Proyecto } from '../types';

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
