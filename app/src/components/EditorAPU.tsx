import { useState } from 'react';
import { useProyectoStore } from '../store/useProyectoStore';
import { TabMateriales } from './TabMateriales';
import { TabManoObra } from './TabManoObra';
import { TabEquipos } from './TabEquipos';

export const EditorAPU = () => {
    const { proyectoActual, partidaEditando, setPartidaEditando, actualizarPartida } = useProyectoStore();
    const [activeTab, setActiveTab] = useState<'Materiales' | 'ManoObra' | 'Equipos'>('Materiales');

    const partida = proyectoActual?.partidas.find(p => p.id === partidaEditando);

    if (!partida) return null;

    const handleClose = () => setPartidaEditando(null);

    const handleRendimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        actualizarPartida(partida.id, { rendimiento: val });
    };

    // Helper for formatting
    const fmtBs = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format;
    const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;

    const getSubtotal = () => {
        if (activeTab === 'Materiales') return { bs: partida.costoMaterialesBs, usd: partida.costoMaterialesUsd };
        if (activeTab === 'ManoObra') return { bs: partida.costoManoObraBs, usd: partida.costoManoObraUsd };
        return { bs: partida.costoEquiposBs, usd: partida.costoEquiposUsd }; // Equipos
    };

    const currentSub = getSubtotal();

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
            {/* Header */}
            <header className="flex-none bg-white z-20 border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between p-4 pb-2">
                    <button onClick={handleClose} className="flex items-center justify-center size-10 rounded-xl hover:bg-gray-100 text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-400">Análisis de Precio Unitario</h2>
                    </div>
                    <div className="w-10"></div>
                </div>
                <div className="px-6 pb-4 pt-1 max-w-4xl mx-auto w-full">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 font-mono">{partida.codigo}</span>
                                <span className="text-slate-300 text-xs">|</span>
                                <span className="text-sm font-medium text-slate-500">Unidad: <strong className="text-slate-700">{partida.unidadMedida}</strong></span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{partida.titulo}</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Scrollable */}
            <main className="flex-1 overflow-y-auto pb-56 no-scrollbar bg-slate-50/50">
                <div className="max-w-4xl mx-auto w-full p-4 sm:p-6">
                    {/* Performance & Quantity Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
                            <label className="block mb-1.5 text-xs font-bold uppercase text-slate-400 tracking-wider group-focus-within:text-primary transition-colors">Capítulo</label>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-300">folder</span>
                                <input
                                    className="block w-full border-0 p-0 text-slate-900 placeholder:text-gray-300 focus:ring-0 text-base font-medium"
                                    type="text"
                                    value={partida.capitulo || ''}
                                    onChange={(e) => actualizarPartida(partida.id, { capitulo: e.target.value })}
                                    placeholder="Ej. Estructuras"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
                            <label className="block mb-1.5 text-xs font-bold uppercase text-slate-400 tracking-wider group-focus-within:text-primary transition-colors">Cantidad Total</label>
                            <div className="relative flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-300">straighten</span>
                                <input
                                    className="block w-full border-0 p-0 text-slate-900 placeholder:text-gray-300 focus:ring-0 text-xl font-bold font-mono"
                                    type="number"
                                    value={partida.cantidad || ''}
                                    onChange={(e) => actualizarPartida(partida.id, { cantidad: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                                <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md">{partida.unidadMedida}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
                            <label className="block mb-1.5 text-xs font-bold uppercase text-slate-400 tracking-wider group-focus-within:text-primary transition-colors">Rendimiento</label>
                            <div className="relative flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-300">timer</span>
                                <input
                                    className="block w-full border-0 p-0 text-slate-900 placeholder:text-gray-300 focus:ring-0 text-xl font-bold font-mono"
                                    type="number"
                                    value={partida.rendimiento || ''}
                                    onChange={handleRendimientoChange}
                                    placeholder="0.00"
                                />
                                <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md">/día</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm pt-2 pb-4 -mx-2 px-2">
                        <div className="flex p-1.5 space-x-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                            {([
                                { id: 'Materiales', label: 'Materiales', icon: 'category' },
                                { id: 'ManoObra', label: 'Mano de Obra', icon: 'engineering' },
                                { id: 'Equipos', label: 'Equipos', icon: 'construction' }
                            ] as const).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full py-2.5 text-sm font-bold leading-5 rounded-lg focus:outline-none transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === tab.id
                                        ? 'text-primary bg-blue-50 shadow-sm ring-1 ring-blue-100'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-3 px-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Listado de Recursos</span>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-mono font-medium text-slate-500 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                    Subtotal: <strong className="text-slate-900">{fmtUsd(currentSub.usd)}</strong>
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5 px-2">{fmtBs(currentSub.bs)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Resource List (Now using dedicated Components) */}
                    <div className="bg-white min-h-[400px] p-1 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {activeTab === 'Materiales' && (
                            <TabMateriales
                                partidaId={partida.id}
                                materiales={partida.materiales}
                            />
                        )}

                        {activeTab === 'ManoObra' && (
                            <TabManoObra
                                partidaId={partida.id}
                                manoObra={partida.manoObra}
                            />
                        )}

                        {activeTab === 'Equipos' && (
                            <TabEquipos
                                partidaId={partida.id}
                                equipos={partida.equipos}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Summary Panel */}
            <div className="absolute bottom-0 inset-x-0 z-30">
                <div className="h-16 w-full bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none"></div>
                <div className="bg-white border-t border-gray-200 px-6 pt-5 pb-8 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] max-w-4xl mx-auto ring-1 ring-black/5">
                    <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-end">
                            {/* Unit Price */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Precio Unitario</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">{fmtUsd(partida.precioUnitarioUsd)}</span>
                                    <span className="text-sm font-bold text-slate-400">/ {partida.unidadMedida}</span>
                                </div>
                                <span className="text-xs font-medium text-slate-500">{fmtBs(partida.precioUnitarioBs)}</span>
                            </div>

                            {/* Total Price (New) */}
                            <div className="flex flex-col gap-1 items-end border-l pl-6 border-gray-100">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">Precio Total ({partida.cantidad} {partida.unidadMedida})</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black font-mono text-primary tracking-tight">{fmtUsd(partida.precioTotalUsd)}</span>
                                </div>
                                <span className="text-sm font-medium text-slate-500">{fmtBs(partida.precioTotalBs)}</span>
                            </div>
                        </div>
                        <button onClick={handleClose} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                            <span className="material-symbols-outlined text-[24px]">check_circle</span>
                            Confirmar y Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


