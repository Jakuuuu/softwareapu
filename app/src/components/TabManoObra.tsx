import { useProyectoStore } from '../store/useProyectoStore';
import type { ManoObraPartida } from '../types';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface TabManoObraProps {
    partidaId: string;
    manoObra: ManoObraPartida[];
}

export const TabManoObra = ({ partidaId, manoObra }: TabManoObraProps) => {
    const { actualizarPartida, proyectoActual } = useProyectoStore();
    const config = proyectoActual?.config;

    // Helper for currency formatting
    const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;
    const fmtBs = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format;

    const handleUpdate = (index: number, field: keyof ManoObraPartida, value: number | string) => {
        const updated = [...manoObra];
        updated[index] = { ...updated[index], [field]: value };

        // Auto-update BS if USD changes
        if (field === 'jornalBaseUsd' && config) {
            const val = Number(value);
            updated[index].jornalBaseBs = val * config.tasaCambio;
        }

        actualizarPartida(partidaId, { manoObra: updated });
    };

    const agregarObrero = () => {
        const nuevo: ManoObraPartida = {
            recursoId: crypto.randomUUID(),
            nombre: 'Nuevo Obrero',
            categoria: 'PEON',
            cantidad: 1,

            jornalBaseBs: 0,
            jornalBaseUsd: 20, // Default prompt

            subtotalBs: 0,
            subtotalUsd: 0
        };
        // Auto-calc initial Bs
        if (config) nuevo.jornalBaseBs = nuevo.jornalBaseUsd * config.tasaCambio;

        actualizarPartida(partidaId, { manoObra: [...manoObra, nuevo] });
    };

    const eliminarObrero = (index: number) => {
        const updated = manoObra.filter((_, i) => i !== index);
        actualizarPartida(partidaId, { manoObra: updated });
    };

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 text-gray-700 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">Categoría</th>
                            <th className="px-2 py-3 text-right w-24 font-semibold text-xs uppercase tracking-wider text-slate-500">Cant.</th>
                            <th className="px-2 py-3 text-right w-32 font-semibold text-xs uppercase tracking-wider text-slate-500">Jornal (USD)</th>
                            <th className="px-4 py-3 text-right w-32 font-semibold text-xs uppercase tracking-wider text-slate-500">Total</th>
                            <th className="px-2 py-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {manoObra.map((mo, idx) => (
                            <tr key={mo.recursoId} className="group hover:bg-blue-50/30 transition-colors">
                                <td className="px-4 py-2">
                                    <Select
                                        options={[
                                            { label: 'Maestro', value: 'MAESTRO' },
                                            { label: 'Oficial', value: 'OFICIAL' },
                                            { label: 'Ayudante', value: 'AYUDANTE' },
                                            { label: 'Peón', value: 'PEON' },
                                        ]}
                                        value={mo.categoria}
                                        onChange={(e) => handleUpdate(idx, 'categoria', e.target.value)}
                                        className="h-9 py-1 text-sm bg-white border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-sm"
                                    />
                                    <div className="mt-1">
                                        <input
                                            className="w-full bg-transparent text-xs text-slate-500 focus:outline-none border-b border-transparent focus:border-gray-200"
                                            value={mo.nombre}
                                            onChange={(e) => handleUpdate(idx, 'nombre', e.target.value)}
                                            placeholder="Descripción opcional"
                                        />
                                    </div>
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="w-full text-right bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-2 py-1.5 font-mono text-slate-700"
                                        value={mo.cantidad}
                                        onChange={(e) => handleUpdate(idx, 'cantidad', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full text-right bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md pl-4 pr-2 py-1.5 font-mono text-slate-700"
                                            value={mo.jornalBaseUsd}
                                            onChange={(e) => handleUpdate(idx, 'jornalBaseUsd', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="text-right px-2 text-[10px] text-slate-400">
                                        {fmtBs(mo.jornalBaseBs)}
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-right font-bold text-slate-900 font-mono">
                                    {fmtUsd(mo.subtotalUsd)}
                                    <div className="text-[10px] text-slate-400 font-normal">
                                        {fmtBs(mo.subtotalBs)}
                                    </div>
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <button
                                        onClick={() => eliminarObrero(idx)}
                                        className="size-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Button onClick={agregarObrero} variant="secondary" className="w-full border-dashed border-2">
                + Agregar Trabajador
            </Button>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>El cálculo incluye FCAS ({config?.fcas.factorTotal}%) sobre el Salario Base.</span>
            </div>
        </div>
    );
};
