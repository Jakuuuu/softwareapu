import Decimal from 'decimal.js';
import type { Partida, ProjectConfig, MaterialPartida, ManoObraPartida, EquipoPartida } from '../types';

export class CalculadoraAPU {

    // Helper for currency rounding (2 decimals)
    static roundMoney(val: Decimal): number {
        return val.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    }

    // Helper for internal high-precision values
    static toDecimal(val: number | undefined): Decimal {
        return new Decimal(val || 0);
    }

    /**
     * Calculates costs for Materials
     */
    static calcularMateriales(materiales: MaterialPartida[]): { totalBs: number, totalUsd: number } {
        let totalBs = new Decimal(0);
        let totalUsd = new Decimal(0);

        // We iterate and mutate the subtotals for display purposes
        // Ideally we should return a new array, but for performance/state reasons in this app we often mutate 
        // before saving to store. We will assume we can mutate 'subtotal' fields.

        for (const mat of materiales) {
            const cantidad = this.toDecimal(mat.cantidad);
            const desperdicioFactor = this.toDecimal(mat.desperdicio).div(100).plus(1);

            // Subtotal = Precio * Cantidad * (1 + Desperdicio%)
            const subBs = this.toDecimal(mat.precioBaseBs).times(cantidad).times(desperdicioFactor);
            const subUsd = this.toDecimal(mat.precioBaseUsd).times(cantidad).times(desperdicioFactor);

            // Update item subtotals
            mat.subtotalBs = this.roundMoney(subBs);
            mat.subtotalUsd = this.roundMoney(subUsd);

            totalBs = totalBs.plus(subBs);
            totalUsd = totalUsd.plus(subUsd);
        }

        return {
            totalBs: this.roundMoney(totalBs),
            totalUsd: this.roundMoney(totalUsd)
        };
    }

    /**
     * Calculates costs for Labor (Mano de Obra)
     * Formula: (Σ(Jornal * Cantidad) * (1 + FCAS/100)) / Rendimiento
     */
    static calcularManoObra(
        manoObra: ManoObraPartida[],
        rendimiento: number,
        fcasPorcentaje: number
    ): { totalBs: number, totalUsd: number } {
        const rend = this.toDecimal(rendimiento);
        if (rend.isZero() || rend.isNegative()) return { totalBs: 0, totalUsd: 0 };

        let totalJornalBs = new Decimal(0);
        let totalJornalUsd = new Decimal(0);

        for (const mo of manoObra) {
            const cantidad = this.toDecimal(mo.cantidad);
            const subBs = this.toDecimal(mo.jornalBaseBs).times(cantidad);
            const subUsd = this.toDecimal(mo.jornalBaseUsd).times(cantidad);

            // Note: Individual line items usually don't have FCAS applied in display, 
            // but for total calculation we need it. 
            // We'll store the direct cost (Jornal * Cantidad) as subtotal for now.
            // Or should we store the 'loaded' cost? Typically 'loaded'.

            // Let's store direct cost in subtotal for the grid (Jornal * Cantidad)
            // The API description says subtotal should consider yield? 
            // "Subtotales Unitarios (Considerando Rendimiento y FCAS)" -> Yes.

            // Wait, if we display unit cost per item:
            // Item Cost = (Jornal * Cantidad * FCAS_Multiplier) / Rendimiento

            const fcasMult = this.toDecimal(fcasPorcentaje).div(100).plus(1);

            const itemCostBs = subBs.times(fcasMult).div(rend);
            const itemCostUsd = subUsd.times(fcasMult).div(rend);

            mo.subtotalBs = this.roundMoney(itemCostBs);
            mo.subtotalUsd = this.roundMoney(itemCostUsd);

            totalJornalBs = totalJornalBs.plus(subBs);
            totalJornalUsd = totalJornalUsd.plus(subUsd);
        }

        const fcasMultiplier = this.toDecimal(fcasPorcentaje).div(100).plus(1);

        const totalBs = totalJornalBs.times(fcasMultiplier).div(rend);
        const totalUsd = totalJornalUsd.times(fcasMultiplier).div(rend);

        return {
            totalBs: this.roundMoney(totalBs),
            totalUsd: this.roundMoney(totalUsd)
        };
    }

    /**
     * Calculates costs for Equipment
     * Formula: 
     *  - Maquinaria: (CostoDia * Cantidad) / Rendimiento
     *  - Herramientas Menores: % del Costo Mano Obra (Total)
     */
    static calcularEquipos(
        equipos: EquipoPartida[],
        rendimiento: number,
        costoManoObraBs: number,
        costoManoObraUsd: number,
        porcentajeHerramientas: number = 5 // Standard default
    ): { totalBs: number, totalUsd: number } {
        const rend = this.toDecimal(rendimiento);
        if (rend.isZero()) return { totalBs: 0, totalUsd: 0 };

        let totalMaqBs = new Decimal(0);
        let totalMaqUsd = new Decimal(0);

        for (const eq of equipos) {
            // Check if tool
            if (eq.tipoEquipo === 'HERRAMIENTA_MENOR') {
                // Tools are calculated as % of Labor, usually not listed with specific costs in this loop 
                // unless they are specific expensive tools. 
                // If it's the generic "Herramientas Menores" item, it might be calculated separately.
                // For now, if it has a price, we treat it as equipment.
            }

            const cantidad = this.toDecimal(eq.cantidad);
            const costoDiaBs = this.toDecimal(eq.costoDiaBs);
            const costoDiaUsd = this.toDecimal(eq.costoDiaUsd);

            // Cost per unit = (DailyCost * Qty) / Yield
            const itemCostBs = costoDiaBs.times(cantidad).div(rend);
            const itemCostUsd = costoDiaUsd.times(cantidad).div(rend);

            eq.subtotalBs = this.roundMoney(itemCostBs);
            eq.subtotalUsd = this.roundMoney(itemCostUsd);

            totalMaqBs = totalMaqBs.plus(itemCostBs);
            totalMaqUsd = totalMaqUsd.plus(itemCostUsd);
        }

        // Add Herramientas Menores (Indirect based on Labor)
        // Usually added as a separate line item or just added to the total.
        // We will calculate it and add it to the total. 
        // Ideally effectively we should add a virtual row for Herramientas Menores if it doesn't exist.
        // For this function, we just return the total.

        const toolsFactor = this.toDecimal(porcentajeHerramientas).div(100);
        const toolsBs = this.toDecimal(costoManoObraBs).times(toolsFactor);
        const toolsUsd = this.toDecimal(costoManoObraUsd).times(toolsFactor);

        return {
            totalBs: this.roundMoney(totalMaqBs.plus(toolsBs)),
            totalUsd: this.roundMoney(totalMaqUsd.plus(toolsUsd))
        };
    }

    /**
     * MASTER CALCULATION FUNCTION
     * Updates all derived fields in a Partida
     */
    static actualizarPartida(partida: Partida, config: ProjectConfig): Partida {
        // 1. Calculate Materials
        const mats = this.calcularMateriales(partida.materiales);

        // 2. Calculate Labor (needs FCAS)
        const mo = this.calcularManoObra(
            partida.manoObra,
            partida.rendimiento,
            config.fcas.factorTotal
        );

        // 3. Calculate Equipment (needs Labor Cost for tools %)
        // Standard is 5% for tools, could be in config.
        const eq = this.calcularEquipos(
            partida.equipos,
            partida.rendimiento,
            mo.totalBs,
            mo.totalUsd
        );

        // 4. Direct Cost
        const costoDirectoBs = new Decimal(mats.totalBs).plus(mo.totalBs).plus(eq.totalBs);
        const costoDirectoUsd = new Decimal(mats.totalUsd).plus(mo.totalUsd).plus(eq.totalUsd);

        // 5. Unit Price (Price = DirectCost * (1+Admin) * (1+Util) * (1+IVA))
        // Sequence: 
        //  Subtotal = Direct + Admin + Utility
        //  Total = Subtotal + IVA
        // Percentages are of the Direct Cost usually? 
        // No, Admin/Utility are usually % of CostoDirecto? 
        // Standard LuloWin: 
        //  Admin is % of DirectCost
        //  Utility is % of (DirectCost + Admin) OR % of DirectCost (depends on contract).
        //  Let's assume standard cascade: All % of Direct Cost for simplicity, or 
        //  Admin on DC, Utility on (DC+Admin).
        //  The API description in types says "Default 10-15".

        // Let's use the cascade form which is safer for contractors:
        // C.D.
        // + Admin (% of C.D.)
        // + Util (% of C.D. + Admin)  <-- This is aggressive
        // Let's stick to % of C.D. for both unless specified.
        // Actually best practice: 
        // Admin = % * CD
        // Util = % * (CD + Admin) (Utility over costs)

        const adminPct = this.toDecimal(config.administracion).div(100);
        const utilPct = this.toDecimal(config.utilidad).div(100);
        const ivaPct = this.toDecimal(config.iva).div(100);

        const adminBs = costoDirectoBs.times(adminPct);
        const adminUsd = costoDirectoUsd.times(adminPct);

        // Utility often calculated on Subtotal 1 (CD + Admin)
        const sub1Bs = costoDirectoBs.plus(adminBs);
        const sub1Usd = costoDirectoUsd.plus(adminUsd);

        const utilBs = sub1Bs.times(utilPct);
        const utilUsd = sub1Usd.times(utilPct);

        const subTotalBs = sub1Bs.plus(utilBs);
        const subTotalUsd = sub1Usd.plus(utilUsd);

        const ivaBs = subTotalBs.times(ivaPct);
        const ivaUsd = subTotalUsd.times(ivaPct);

        const precioUnitarioBs = subTotalBs.plus(ivaBs);
        const precioUnitarioUsd = subTotalUsd.plus(ivaUsd);

        // 6. Total Price
        const cantidad = this.toDecimal(partida.cantidad);
        const precioTotalBs = precioUnitarioBs.times(cantidad);
        const precioTotalUsd = precioUnitarioUsd.times(cantidad);

        return {
            ...partida,
            // Update Costs
            costoMaterialesBs: mats.totalBs,
            costoMaterialesUsd: mats.totalUsd,
            costoManoObraBs: mo.totalBs,
            costoManoObraUsd: mo.totalUsd,
            costoEquiposBs: eq.totalBs,
            costoEquiposUsd: eq.totalUsd,

            costoDirectoBs: this.roundMoney(costoDirectoBs),
            costoDirectoUsd: this.roundMoney(costoDirectoUsd),

            precioUnitarioBs: this.roundMoney(precioUnitarioBs),
            precioUnitarioUsd: this.roundMoney(precioUnitarioUsd),

            precioTotalBs: this.roundMoney(precioTotalBs),
            precioTotalUsd: this.roundMoney(precioTotalUsd)
        };
    }
}
