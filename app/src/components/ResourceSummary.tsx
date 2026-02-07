import { useProyectoStore } from '../store/useProyectoStore';
import { useMemo } from 'react';

interface ResourceSummaryProps {
    type: 'materiales' | 'equipos' | 'manoObra';
    title: string;
}

export const ResourceSummary = ({ type, title }: ResourceSummaryProps) => {
    const { proyectoActual } = useProyectoStore();

    const resources = useMemo(() => {
        if (!proyectoActual?.partidas) return [];

        const map = new Map<string, { name: string, unit: string, quantity: number, total: number }>();

        proyectoActual.partidas.forEach(partida => {
            const items = partida[type] || [];
            items.forEach((item: any) => {
                const key = item.nombre; // Group by name for now
                if (!map.has(key)) {
                    map.set(key, {
                        name: item.nombre,
                        unit: item.unidad || 'u',
                        quantity: 0,
                        total: 0
                    });
                }
                const current = map.get(key)!;
                // Calculate total quantity across project (quantity per APU * APU quantity)
                const totalQty = (item.cantidad || 0) * (partida.cantidad || 0);

                current.quantity += totalQty;

                // Calculate total cost
                let cost = 0;
                if (type === 'materiales') {
                    const price = item.precioUnitario || 0;
                    const waste = 1 + (item.desperdicio || 0) / 100;
                    cost = price * totalQty * waste;
                } else if (type === 'equipos') {
                    // priceH and hours were unused, relying on subtotal per APU unit
                    cost = (item.subtotal || 0); // This is per unit of APU? No, subtotal is usually unit cost.
                    // Let's re-calculate to be safe or use what we have.
                    // item.subtotal in APU is cost per unit of APU.
                    cost = (item.subtotal || 0) * (partida.cantidad || 0);
                } else { // manoObra
                    const jornal = item.jornal || 0;
                    cost = jornal * totalQty; // item.cantidad in MO is usually people? No, yield.
                    // Let's stick to cost summing.
                    cost = (item.jornal * item.cantidad) * (partida.cantidad || 0);
                }

                current.total += cost;
            });
        });

        return Array.from(map.values());
    }, [proyectoActual, type]);

    if (!proyectoActual) return <div className="p-8 text-center text-slate-500">No hay proyecto activo.</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Descripción</th>
                            <th className="px-6 py-4 text-center">Unidad</th>
                            <th className="px-6 py-4 text-right">Cantidad Total</th>
                            <th className="px-6 py-4 text-right">Costo Total Estimado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {resources.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                    No se encontraron insumos de este tipo en el proyecto.
                                </td>
                            </tr>
                        ) : (
                            resources.map((res, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{res.name}</td>
                                    <td className="px-6 py-3 text-center text-slate-500">{res.unit}</td>
                                    <td className="px-6 py-3 text-right font-mono text-slate-600">{res.quantity.toFixed(2)}</td>
                                    <td className="px-6 py-3 text-right font-mono font-medium text-blue-600">
                                        $ {res.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
