import { useProyectoStore } from '../store/useProyectoStore';
import type { ManoObraPartida } from '../types';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface TabManoObraProps {
    partidaId: string;
    manoObra: ManoObraPartida[];
}

export const TabManoObra = ({ partidaId, manoObra }: TabManoObraProps) => {
    const { actualizarPartida } = useProyectoStore();

    const handleUpdate = (index: number, field: keyof ManoObraPartida, value: number | string) => {
        const updated = [...manoObra];
        updated[index] = { ...updated[index], [field]: value };
        // Subtotal is jornal * cantidad (FCAS is applied later in total calc)
        updated[index].subtotal = updated[index].jornal * updated[index].cantidad;
        actualizarPartida(partidaId, { manoObra: updated });
    };

    const agregarObrero = () => {
        const nuevo: ManoObraPartida = {
            recursoId: crypto.randomUUID(),
            nombre: 'Nuevo Obrero',
            categoria: 'PEON',
            cantidad: 1,
            jornal: 20, // Min wage ref
            subtotal: 20
        };
        actualizarPartida(partidaId, { manoObra: [...manoObra, nuevo] });
    };

    const eliminarObrero = (index: number) => {
        const updated = manoObra.filter((_, i) => i !== index);
        actualizarPartida(partidaId, { manoObra: updated });
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left">Categoría</th>
                            <th className="px-4 py-2 text-right w-24">Cant.</th>
                            <th className="px-4 py-2 text-right w-32">Jornal ($)</th>
                            <th className="px-4 py-2 text-right w-32">Total Jornal</th>
                            <th className="px-4 py-2 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {manoObra.map((mo, idx) => (
                            <tr key={mo.recursoId} className="group hover:bg-gray-50">
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
                                        className="h-8 py-1"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        step="0.5"
                                        className="text-right h-8"
                                        value={mo.cantidad}
                                        onChange={(e) => handleUpdate(idx, 'cantidad', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="text-right h-8"
                                        value={mo.jornal}
                                        onChange={(e) => handleUpdate(idx, 'jornal', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-4 py-2 text-right font-medium">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mo.subtotal)}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => eliminarObrero(idx)}
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
            <Button onClick={agregarObrero} variant="secondary" className="w-full border-dashed border-2">
                + Agregar Trabajador
            </Button>
        </div>
    );
};
