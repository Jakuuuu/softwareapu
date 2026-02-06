import { useProyectoStore } from '../store/useProyectoStore';
import type { EquipoPartida } from '../types';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface TabEquiposProps {
    partidaId: string;
    equipos: EquipoPartida[];
}

export const TabEquipos = ({ partidaId, equipos }: TabEquiposProps) => {
    const { actualizarPartida } = useProyectoStore();

    const handleUpdate = (index: number, field: keyof EquipoPartida, value: number | string) => {
        const updated = [...equipos];
        updated[index] = { ...updated[index], [field]: value };
        // Subtotal = CostoHora * HorasDia * Cantidad
        updated[index].subtotal = updated[index].costoHora * updated[index].horasPorDia * updated[index].cantidad;
        actualizarPartida(partidaId, { equipos: updated });
    };

    const agregarEquipo = () => {
        const nuevo: EquipoPartida = {
            recursoId: crypto.randomUUID(),
            nombre: 'Nuevo Equipo',
            tipoEquipo: 'MAQUINARIA_PESADA',
            costoHora: 0,
            horasPorDia: 8,
            cantidad: 1,
            subtotal: 0
        };
        actualizarPartida(partidaId, { equipos: [...equipos, nuevo] });
    };

    const eliminarEquipo = (index: number) => {
        const updated = equipos.filter((_, i) => i !== index);
        actualizarPartida(partidaId, { equipos: updated });
    };

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 text-gray-700 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">Equipo</th>
                            <th className="px-2 py-3 text-left w-32 font-semibold text-xs uppercase tracking-wider text-slate-500">Tipo</th>
                            <th className="px-2 py-3 text-right w-24 font-semibold text-xs uppercase tracking-wider text-slate-500">$/Hora</th>
                            <th className="px-2 py-3 text-right w-24 font-semibold text-xs uppercase tracking-wider text-slate-500">Hrs/Día</th>
                            <th className="px-2 py-3 text-right w-20 font-semibold text-xs uppercase tracking-wider text-slate-500">Cant.</th>
                            <th className="px-4 py-3 text-right w-32 font-semibold text-xs uppercase tracking-wider text-slate-500">Subtotal</th>
                            <th className="px-2 py-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {equipos.map((eq, idx) => (
                            <tr key={eq.recursoId} className="group hover:bg-blue-50/30 transition-colors">
                                <td className="px-4 py-2">
                                    <input
                                        className="w-full bg-transparent font-medium text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-2 py-1.5 transition-all"
                                        value={eq.nombre}
                                        onChange={(e) => handleUpdate(idx, 'nombre', e.target.value)}
                                        placeholder="Nombre del equipo"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <Select
                                        options={[
                                            { label: 'Maquinaria', value: 'MAQUINARIA_PESADA' },
                                            { label: 'Equipo Menor', value: 'EQUIPO_MENOR' },
                                        ]}
                                        value={eq.tipoEquipo}
                                        onChange={(e) => handleUpdate(idx, 'tipoEquipo', e.target.value)}
                                        className="h-9 py-1 text-xs bg-white border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-sm"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full text-right bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md pl-4 pr-1 py-1.5 font-mono text-slate-700 text-xs"
                                            value={eq.costoHora}
                                            onChange={(e) => handleUpdate(idx, 'costoHora', Number(e.target.value))}
                                        />
                                    </div>
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="w-full text-right bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-1 py-1.5 font-mono text-slate-700 text-xs"
                                        value={eq.horasPorDia}
                                        onChange={(e) => handleUpdate(idx, 'horasPorDia', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        step="1"
                                        className="w-full text-right bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-1 py-1.5 font-mono text-slate-700 text-xs"
                                        value={eq.cantidad}
                                        onChange={(e) => handleUpdate(idx, 'cantidad', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-4 py-2 text-right font-bold text-slate-900 font-mono">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(eq.subtotal)}
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <button
                                        onClick={() => eliminarEquipo(idx)}
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
            <Button onClick={agregarEquipo} variant="secondary" className="w-full border-dashed border-2">
                + Agregar Equipo
            </Button>

            {/* Note regarding herramientas menores */}
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                ℹ️ <b>Nota:</b> Las Herramientas Menores se calcularán automáticamente como un porcentaje global (5%) del costo de mano de obra en el resumen final.
            </div>
        </div>
    );
};
