import { useState } from 'react';
import { useProyectoStore } from '../store/useProyectoStore';
import type { TipoRecurso, MaterialPartida, ManoObraPartida, EquipoPartida } from '../types';

// --- UI Components from Stitch ---

const ResourceRow = ({ title, unit, unitPrice, qty, waste, total, onDelete }: { title: string, unit: string, unitPrice: number, qty: number, waste: number, total: number, onDelete: () => void }) => (
    <div className="group relative grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-2 px-5 py-4 border-b border-gray-100 items-start hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex flex-col min-w-0 pr-1">
            <span className="text-sm font-medium text-slate-900 truncate">{title}</span>
            <span className="text-xs text-slate-500">Unit: {unit} • ${unitPrice.toFixed(2)}</span>
        </div>
        <div className="text-right font-mono text-sm text-slate-700 pt-0.5 bg-gray-50 rounded px-1 self-start border border-transparent group-hover:border-gray-200">
            {qty.toFixed(4)}
        </div>
        <div className="text-right font-mono text-sm text-slate-500 pt-0.5">{waste}%</div>
        <div className="text-right font-mono text-sm font-medium text-slate-900 pt-0.5">${total.toFixed(2)}</div>

        <button onClick={onDelete} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-2">
            <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
    </div>
);

// --- Main Editor Component ---

export const EditorAPU = () => {
    const { proyectoActual, partidaEditando, setPartidaEditando, actualizarPartida } = useProyectoStore();
    const [activeTab, setActiveTab] = useState<'Materiales' | 'Manook' | 'Equipos'>('Materiales');

    // Derived state
    const partida = proyectoActual?.partidas.find(p => p.id === partidaEditando);

    if (!partida) return null;

    const handleClose = () => setPartidaEditando(null);

    const handleRendimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        actualizarPartida(partida.id, { rendimiento: val }); // Recalculates automatically in store
    };

    const handleAddResource = () => {
        const tempId = crypto.randomUUID();
        if (activeTab === 'Materiales') {
            const newItem: MaterialPartida = {
                recursoId: tempId,
                nombre: 'Nuevo Material',
                unidad: 'UN',
                precioUnitario: 100,
                cantidad: 1,
                desperdicio: 5,
                subtotal: 0
            };
            const updated = [...partida.materiales, newItem];
            actualizarPartida(partida.id, { materiales: updated });
        } else if (activeTab === 'Manook') {
            const newItem: ManoObraPartida = {
                recursoId: tempId,
                nombre: 'Oficial',
                categoria: 'OFICIAL',
                cantidad: 1,
                jornal: 500,
                subtotal: 0
            };
            const updated = [...partida.manoObra, newItem];
            actualizarPartida(partida.id, { manoObra: updated });
        } else { // Equipos
            const newItem: EquipoPartida = {
                recursoId: tempId,
                nombre: 'Equipo Nuevo',
                tipoEquipo: 'HERRAMIENTA_MENOR',
                costoHora: 200,
                horasPorDia: 8,
                cantidad: 1,
                subtotal: 0
            };
            const updated = [...partida.equipos, newItem];
            actualizarPartida(partida.id, { equipos: updated });
        }
    };

    const handleDeleteResource = (type: TipoRecurso, id: string) => {
        if (type === 'MATERIAL') {
            actualizarPartida(partida.id, { materiales: partida.materiales.filter(m => m.recursoId !== id) });
        } else if (type === 'MANO_OBRA') {
            actualizarPartida(partida.id, { manoObra: partida.manoObra.filter(m => m.recursoId !== id) });
        } else {
            actualizarPartida(partida.id, { equipos: partida.equipos.filter(m => m.recursoId !== id) });
        }
    };

    const currentSubtotal = activeTab === 'Materiales' ? partida.costoMateriales
        : activeTab === 'Manook' ? partida.costoManoObra
            : partida.costoEquipos;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
            {/* Header */}
            <header className="flex-none bg-white z-20 border-b border-gray-100">
                <div className="flex items-center justify-between p-4 pb-2">
                    <button onClick={handleClose} className="flex items-center justify-center size-10 rounded-full hover:bg-gray-50 text-slate-900 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-500">Análisis de Precio</h2>
                    </div>
                    <div className="w-10"></div>
                </div>
                <div className="px-5 pb-4 pt-1 max-w-3xl mx-auto w-full">
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">{partida.titulo}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">Código: {partida.codigo}</span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-sm text-slate-500">Unidad: <strong>{partida.unidadMedida}</strong></span>
                    </div>
                </div>
            </header>

            {/* Main Scrollable */}
            <main className="flex-1 overflow-y-auto pb-48 no-scrollbar bg-slate-50">
                <div className="max-w-3xl mx-auto w-full">
                    {/* Performance Card */}
                    <div className="p-5 bg-white mb-2 border-b border-gray-100">
                        <label className="block mb-2 text-sm font-medium text-slate-700">Rendimiento Diario</label>
                        <div className="relative flex items-center">
                            <input
                                className="block w-full rounded-lg border-0 py-3 pl-4 pr-20 text-slate-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary font-mono text-lg bg-white"
                                type="number"
                                value={partida.rendimiento || ''}
                                onChange={handleRendimientoChange}
                                placeholder="0.00"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <span className="text-slate-500 text-sm font-medium">{partida.unidadMedida}/día</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm px-5 py-3 border-b border-gray-200">
                        <div className="flex p-1 space-x-1 bg-gray-200 rounded-xl">
                            {([
                                { id: 'Materiales', label: 'Materiales' },
                                { id: 'Manook', label: 'Mano Obra' },
                                { id: 'Equipos', label: 'Equipos' }
                            ] as const).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg focus:outline-none transition-colors ${activeTab === tab.id
                                            ? 'text-primary bg-white shadow ring-1 ring-black/5'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-2 px-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recursos</span>
                            <span className="text-xs font-mono font-medium text-slate-500">Subtotal: ${currentSubtotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Resource List */}
                    <div className="bg-white min-h-[300px]">
                        <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-2 px-5 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <div className="truncate">Descripción</div>
                            <div className="text-right">Cant.</div>
                            <div className="text-right">Desp.</div>
                            <div className="text-right">Total</div>
                        </div>

                        {activeTab === 'Materiales' && partida.materiales.map(m => (
                            <ResourceRow
                                key={m.recursoId}
                                title={m.nombre}
                                unit={m.unidad}
                                unitPrice={m.precioUnitario}
                                qty={m.cantidad}
                                waste={m.desperdicio}
                                total={m.subtotal}
                                onDelete={() => handleDeleteResource('MATERIAL', m.recursoId)}
                            />
                        ))}

                        {activeTab === 'Manook' && partida.manoObra.map(m => (
                            <ResourceRow
                                key={m.recursoId}
                                title={`${m.categoria} ($${m.jornal}/jornal)`}
                                unit="JOR"
                                unitPrice={m.jornal}
                                qty={m.cantidad}
                                waste={0}
                                total={m.subtotal}
                                onDelete={() => handleDeleteResource('MANO_OBRA', m.recursoId)}
                            />
                        ))}

                        {activeTab === 'Equipos' && partida.equipos.map(m => (
                            <ResourceRow
                                key={m.recursoId}
                                title={m.nombre}
                                unit="HR"
                                unitPrice={m.costoHora}
                                qty={m.cantidad}
                                waste={0}
                                total={m.subtotal}
                                onDelete={() => handleDeleteResource('EQUIPO', m.recursoId)}
                            />
                        ))}

                        <div className="p-4 flex justify-center pb-8 border-t border-gray-100 mt-2">
                            <button onClick={handleAddResource} className="inline-flex items-center gap-x-2 rounded-full bg-blue-50 px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-blue-100 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                Agregar Recurso
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Summary Panel */}
            <div className="absolute bottom-0 inset-x-0 z-30">
                <div className="h-12 w-full bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                <div className="bg-white border-t border-gray-200 px-5 pt-4 pb-8 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] max-w-3xl mx-auto">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Precio Unitario Total</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">${partida.precioUnitario.toFixed(2)}</span>
                                    <span className="text-sm font-medium text-slate-500">/ {partida.unidadMedida}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 mb-1">
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-primary"></span>
                                    Mat: ${partida.costoMateriales.toFixed(2)}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-slate-300"></span>
                                    MO/Eq: ${(partida.costoManoObra + partida.costoEquipos).toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleClose} className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">check</span>
                            Guardar y Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
