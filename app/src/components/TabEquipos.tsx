import { useProyectoStore } from '../store/useProyectoStore';
import type { EquipoPartida } from '../types';
import { Input } from './ui/Input';
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
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left">Equipo</th>
                            <th className="px-4 py-2 text-left w-32">Tipo</th>
                            <th className="px-4 py-2 text-right w-24">$/Hora</th>
                            <th className="px-4 py-2 text-right w-24">Hrs/Día</th>
                            <th className="px-4 py-2 text-right w-20">Cant.</th>
                            <th className="px-4 py-2 text-right w-32">Subtotal</th>
                            <th className="px-4 py-2 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {equipos.map((eq, idx) => (
                            <tr key={eq.recursoId} className="group hover:bg-gray-50">
                                <td className="px-4 py-2">
                                    <input
                                        className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                        value={eq.nombre}
                                        onChange={(e) => handleUpdate(idx, 'nombre', e.target.value)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Select
                                        options={[
                                            { label: 'Maquinaria Pesada', value: 'MAQUINARIA_PESADA' },
                                            { label: 'Equipo Menor', value: 'EQUIPO_MENOR' },
                                        ]}
                                        value={eq.tipoEquipo}
                                        onChange={(e) => handleUpdate(idx, 'tipoEquipo', e.target.value)}
                                        className="h-8 py-1"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="text-right h-8"
                                        value={eq.costoHora}
                                        onChange={(e) => handleUpdate(idx, 'costoHora', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        step="0.5"
                                        className="text-right h-8"
                                        value={eq.horasPorDia}
                                        onChange={(e) => handleUpdate(idx, 'horasPorDia', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        step="1"
                                        className="text-right h-8"
                                        value={eq.cantidad}
                                        onChange={(e) => handleUpdate(idx, 'cantidad', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-4 py-2 text-right font-medium">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(eq.subtotal)}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => eliminarEquipo(idx)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        🗑️
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
