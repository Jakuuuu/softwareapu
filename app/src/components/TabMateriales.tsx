import { useProyectoStore } from '../store/useProyectoStore';
import type { MaterialPartida } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface TabMaterialesProps {
    partidaId: string;
    materiales: MaterialPartida[];
}

export const TabMateriales = ({ partidaId, materiales }: TabMaterialesProps) => {
    const { actualizarPartida } = useProyectoStore();

    const handleUpdate = (index: number, field: keyof MaterialPartida, value: number | string) => {
        const updatedMateriales = [...materiales];
        updatedMateriales[index] = { ...updatedMateriales[index], [field]: value };
        // Recalculate subtotal for row
        const mat = updatedMateriales[index];
        mat.subtotal = mat.cantidad * mat.precioUnitario * (1 + mat.desperdicio / 100);

        actualizarPartida(partidaId, { materiales: updatedMateriales });
    };

    const agregarMaterial = () => {
        const nuevo: MaterialPartida = {
            recursoId: crypto.randomUUID(),
            nombre: 'Nuevo Material',
            unidad: 'UND',
            cantidad: 1,
            precioUnitario: 0,
            desperdicio: 5,
            subtotal: 0
        };
        actualizarPartida(partidaId, { materiales: [...materiales, nuevo] });
    };

    const eliminarMaterial = (index: number) => {
        const updated = materiales.filter((_, i) => i !== index);
        actualizarPartida(partidaId, { materiales: updated });
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left">Recurso</th>
                            <th className="px-4 py-2 text-left w-20">Unidad</th>
                            <th className="px-4 py-2 text-right w-32">P.U.</th>
                            <th className="px-4 py-2 text-right w-24">Cant.</th>
                            <th className="px-4 py-2 text-right w-24">Desp %</th>
                            <th className="px-4 py-2 text-right w-32">Subtotal</th>
                            <th className="px-4 py-2 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {materiales.map((mat, idx) => (
                            <tr key={mat.recursoId} className="group hover:bg-gray-50">
                                <td className="px-4 py-2">
                                    <input
                                        className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                        value={mat.nombre}
                                        onChange={(e) => handleUpdate(idx, 'nombre', e.target.value)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        className="w-full bg-transparent text-center focus:outline-none"
                                        value={mat.unidad}
                                        onChange={(e) => handleUpdate(idx, 'unidad', e.target.value)}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="text-right h-8"
                                        value={mat.precioUnitario}
                                        onChange={(e) => handleUpdate(idx, 'precioUnitario', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="text-right h-8"
                                        value={mat.cantidad}
                                        onChange={(e) => handleUpdate(idx, 'cantidad', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        className="text-right h-8"
                                        value={mat.desperdicio}
                                        onChange={(e) => handleUpdate(idx, 'desperdicio', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-4 py-2 text-right font-medium">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mat.subtotal)}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => eliminarMaterial(idx)}
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
            <Button onClick={agregarMaterial} variant="secondary" className="w-full border-dashed border-2">
                + Agregar Material
            </Button>
        </div>
    );
};
