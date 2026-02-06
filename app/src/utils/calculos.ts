import type { MaterialPartida, ManoObraPartida, EquipoPartida, Partida, Proyecto } from '../types';

/**
 * Utility class for robust currency arithmetic.
 * Operations are performed on "cents" (integers) to avoid floating point errors.
 * Example: $10.50 -> 1050 cents.
 */
export class Currency {
    private static PRECISION = 100; // 2 decimal places

    /**
     * float -> int (cents)
     */
    static toInt(value: number): number {
        return Math.round(value * this.PRECISION);
    }

    /**
     * int -> float (dollars)
     */
    static toFloat(value: number): number {
        return value / this.PRECISION;
    }

    /**
     * Multiplies two float numbers with currency precision.
     * (a * b)
     */
    static mul(a: number, b: number): number {
        // We do floating point multiplication then immediate rounding to avoid drift
        return Math.round((a * b) * this.PRECISION) / this.PRECISION;
    }

    /**
     * Adds two float numbers
     */
    static add(a: number, b: number): number {
        return (this.toInt(a) + this.toInt(b)) / this.PRECISION;
    }

    /**
     * Subtracts b from a
     */
    static sub(a: number, b: number): number {
        return (this.toInt(a) - this.toInt(b)) / this.PRECISION;
    }

    /**
     * Divides a by b with precision
     */
    static div(a: number, b: number): number {
        if (b === 0) return 0;
        return Math.round((a / b) * this.PRECISION) / this.PRECISION;
    }
}

export class CalculadoraAPU {

    // 1. COSTO DE MATERIALES
    static calcularCostoMateriales(materiales: MaterialPartida[]): number {
        return materiales.reduce((total, mat) => {
            // (Precio * Cantidad) * (1 + Desperdicio/100)
            const base = Currency.mul(mat.precioUnitario, mat.cantidad);
            const factorDesperdicio = 1 + (mat.desperdicio / 100);
            const subtotal = Currency.mul(base, factorDesperdicio);
            return Currency.add(total, subtotal);
        }, 0);
    }

    // 2. COSTO DE MANO DE OBRA
    static calcularCostoManoObra(
        manoObra: ManoObraPartida[],
        rendimiento: number,
        fcas: number
    ): number {
        if (rendimiento === 0) return 0;

        const totalJornal = manoObra.reduce((total, mo) => {
            const subtotal = Currency.mul(mo.jornal, mo.cantidad);
            return Currency.add(total, subtotal);
        }, 0);

        const factorFcas = 1 + (fcas / 100);
        const totalConFcas = Currency.mul(totalJornal, factorFcas);

        return Currency.div(totalConFcas, rendimiento);
    }

    // 3. COSTO DE EQUIPOS
    static calcularCostoEquipos(
        equipos: EquipoPartida[],
        rendimiento: number,
        costoManoObra: number,
        porcentajeHerramientas: number = 5
    ): number {
        if (rendimiento === 0) return 0;

        // Equipos pesados (Daily cost / Yield)
        // Cost = (PricePerHour * Hours * Qty) / Yield
        const costoEquiposPesados = equipos
            .filter(eq => eq.tipoEquipo !== 'HERRAMIENTA_MENOR')
            .reduce((total, eq) => {
                const costoDia = Currency.mul(Currency.mul(eq.costoHora, eq.horasPorDia), eq.cantidad);
                return Currency.add(total, costoDia);
            }, 0);

        const unitarioEquipos = Currency.div(costoEquiposPesados, rendimiento);

        // Herramientas menores (% de mano de obra)
        const herramientasMenores = Currency.mul(costoManoObra, (porcentajeHerramientas / 100));

        return Currency.add(unitarioEquipos, herramientasMenores);
    }

    // 5. PRECIO UNITARIO (FÓRMULA MAESTRA)
    static calcularPrecioUnitario(
        costoDirecto: number,
        iva: number,
        utilidad: number,
        administracion: number
    ): number {
        const adminAmount = Currency.mul(costoDirecto, administracion / 100);
        const utilidadAmount = Currency.mul(costoDirecto, utilidad / 100);

        const subtotal = Currency.add(Currency.add(costoDirecto, adminAmount), utilidadAmount);

        const ivaAmount = Currency.mul(subtotal, iva / 100);
        return Currency.add(subtotal, ivaAmount);
    }

    // 6. PRECIO TOTAL PARTIDA
    static calcularPrecioTotal(precioUnitario: number, cantidad: number): number {
        return Currency.mul(precioUnitario, cantidad);
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

        const costoDirecto = Currency.add(Currency.add(costoMateriales, costoManoObra), costoEquipos);

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
