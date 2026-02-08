import { useState } from 'react';
import { useProyectoStore } from '../store/useProyectoStore';
import { useLibraryStore } from '../store/useLibraryStore';
import type { MaterialPartida } from '../types';
import { Button } from './ui/Button';
import { LibrarySelector } from './LibrarySelector';

interface TabMaterialesProps {
    partidaId: string;
    materiales: MaterialPartida[];
}

export const TabMateriales = ({ partidaId, materiales }: TabMaterialesProps) => {
    const { actualizarPartida, proyectoActual } = useProyectoStore();
    const library = useLibraryStore();
    const config = proyectoActual?.config;
    const [showLibrary, setShowLibrary] = useState(false);

    // Helper for currency formatting
    const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;
    const fmtBs = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format;

    const handleUpdate = (index: number, field: keyof MaterialPartida, value: number | string) => {
        const updatedMateriales = [...materiales];
        updatedMateriales[index] = { ...updatedMateriales[index], [field]: value };

        if (field === 'precioBaseUsd' && config) {
            const val = Number(value);
            updatedMateriales[index].precioBaseBs = val * config.tasaCambio;
        }

        actualizarPartida(partidaId, { materiales: updatedMateriales });
    };

    const agregarMaterial = () => {
        const nuevo: MaterialPartida = {
            recursoId: crypto.randomUUID(),
            nombre: 'Nuevo Material',
            unidad: 'UND',
            cantidad: 1,
            desperdicio: 5,
            precioBaseBs: 0,
            precioBaseUsd: 0,
            tasaCambioAplicada: config?.tasaCambio || 0,
            subtotalBs: 0,
            subtotalUsd: 0
        };
        actualizarPartida(partidaId, { materiales: [...materiales, nuevo] });
    };

    const agregarDesdeLibreria = (item: import('../store/useLibraryStore').LibraryItem) => {
        const nuevo: MaterialPartida = {
            recursoId: crypto.randomUUID(),
            nombre: item.nombre,
            unidad: item.unidad,
            cantidad: 1,
            desperdicio: 5,
            precioBaseBs: item.precioBaseUsd * (config?.tasaCambio || 0),
            precioBaseUsd: item.precioBaseUsd,
            tasaCambioAplicada: config?.tasaCambio || 0,
            subtotalBs: 0,
            subtotalUsd: 0
        };
        actualizarPartida(partidaId, { materiales: [...materiales, nuevo] });
        setShowLibrary(false);
    };

    const guardarEnLibreria = (mat: MaterialPartida) => {
        library.addItem({
            nombre: mat.nombre,
            unidad: mat.unidad,
            precioBaseUsd: mat.precioBaseUsd,
            tipo: 'MATERIAL',
            tags: []
        });
        alert('Material guardado en la biblioteca.');
    };

    const eliminarMaterial = (index: number) => {
        const updated = materiales.filter((_, i) => i !== index);
        actualizarPartida(partidaId, { materiales: updated });
    };

    return (
        <div className="space-y-4">

            {/* Explanatory Note */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-500 mt-0.5 text-lg">lightbulb</span>
                <div className="text-xs text-amber-800 leading-relaxed">
                    <strong>¿Cómo se calcula el Costo Unitario?</strong>
                    <br />
                    El costo que ves totalizado aquí es por una unidad de la Partida actual.
                    <br />
                    <span className="font-mono bg-white/50 px-1 rounded text-amber-900 mt-1 inline-block border border-amber-200">
                        Costo = Precio Material × Cantidad × (1 + % Desperdicio)
                    </span>
                    <br className="mt-1" />
                    La <em>Cantidad</em> aquí es cuánto material gastas para hacer **1 unidad** de la Partida.
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 text-gray-700 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">Recurso</th>
                            <th className="px-2 py-3 text-center w-20 font-semibold text-xs uppercase tracking-wider text-slate-500">Und</th>
                            <th className="px-2 py-3 text-right w-32 font-semibold text-xs uppercase tracking-wider text-slate-500">Precio USD</th>
                            <th className="px-2 py-3 text-right w-24 font-semibold text-xs uppercase tracking-wider text-slate-500">Cant.</th>
                            <th className="px-2 py-3 text-right w-24 font-semibold text-xs uppercase tracking-wider text-slate-500">Desp %</th>
                            <th className="px-4 py-3 text-right w-32 font-semibold text-xs uppercase tracking-wider text-slate-500">Total</th>
                            <th className="px-2 py-3 w-20 text-center font-semibold text-xs uppercase tracking-wider text-slate-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {materiales.map((mat, idx) => (
                            <tr key={mat.recursoId} className="group hover:bg-blue-50/30 transition-colors">
                                <td className="px-4 py-2">
                                    <input
                                        className="w-full bg-transparent font-medium text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-2 py-1.5 transition-all"
                                        value={mat.nombre}
                                        onChange={(e) => handleUpdate(idx, 'nombre', e.target.value)}
                                        placeholder="Nombre del material"
                                    />
                                    <div className="px-2 text-[10px] text-slate-400">
                                        {fmtBs(mat.precioBaseBs)}
                                    </div>
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        className="w-full bg-transparent text-center text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md py-1.5 uppercase font-medium text-xs"
                                        value={mat.unidad}
                                        onChange={(e) => handleUpdate(idx, 'unidad', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full text-right bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md pl-4 pr-2 py-1.5 font-mono text-slate-700"
                                            value={mat.precioBaseUsd}
                                            onChange={(e) => handleUpdate(idx, 'precioBaseUsd', Number(e.target.value))}
                                        />
                                    </div>
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full text-right bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-2 py-1.5 font-mono text-slate-700"
                                        value={mat.cantidad}
                                        onChange={(e) => handleUpdate(idx, 'cantidad', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full text-right bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md pr-5 pl-1 py-1.5 font-mono text-slate-500 text-xs"
                                            value={mat.desperdicio}
                                            onChange={(e) => handleUpdate(idx, 'desperdicio', Number(e.target.value))}
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-right font-bold text-slate-900 font-mono">
                                    {fmtUsd(mat.subtotalUsd)}
                                    <div className="text-[10px] text-slate-400 font-normal">
                                        {fmtBs(mat.subtotalBs)}
                                    </div>
                                </td>
                                <td className="px-2 py-2 text-center flex items-center justify-center gap-1">
                                    <button
                                        onClick={() => guardarEnLibreria(mat)}
                                        className="size-8 flex items-center justify-center rounded-full text-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-110"
                                        title="Guardar en Biblioteca"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                                    </button>
                                    <button
                                        onClick={() => eliminarMaterial(idx)}
                                        className="size-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all transform hover:scale-110"
                                        title="Eliminar recurso"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex gap-3">
                <Button onClick={agregarMaterial} variant="secondary" className="flex-1 border-dashed border-2 justify-center">
                    + Nuevo Material Vacio
                </Button>
                <Button onClick={() => setShowLibrary(true)} variant="primary" className="flex-1 justify-center gap-2">
                    <span className="material-symbols-outlined">auto_stories</span>
                    Importar de Biblioteca
                </Button>
            </div>

            {showLibrary && (
                <LibrarySelector
                    tipo="MATERIAL"
                    onSelect={agregarDesdeLibreria}
                    onClose={() => setShowLibrary(false)}
                />
            )}
        </div>
    );
};
