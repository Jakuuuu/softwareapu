import { useState, useMemo } from 'react';
import { useProyectoStore } from '../store/useProyectoStore';
import type { Partida } from '../types';
import { APUDataGrid } from './APUDataGrid';
import { CoveninSelector } from './CoveninSelector';

// --- Sub-components (Inline for valid single-file export) ---

const ActionButton = ({ icon, label, active, onClick }: { icon: string, label: string, active?: boolean, onClick?: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${active ? 'bg-primary/10 text-primary group-active:bg-primary group-active:text-white' : 'bg-slate-100 text-slate-700 group-active:scale-95'}`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <span className="text-xs font-medium text-slate-700">{label}</span>
    </button>
);

const FolderHeader = ({ title, totalBs, totalUsd, expanded, onToggle }: { title: string, totalBs: string, totalUsd: string, expanded: boolean, onToggle: () => void }) => (
    <div onClick={onToggle} className={`sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-y border-gray-200 shadow-sm cursor-pointer transition-colors ${expanded ? 'bg-indigo-50' : 'bg-white'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
            <span className={`material-symbols-outlined ${expanded ? 'text-primary fill-1' : 'text-slate-400'}`}>
                {expanded ? 'folder_open' : 'folder'}
            </span>
            <h2 className="text-sm font-bold text-slate-800 truncate">{title}</h2>
        </div>
        <div className="flex flex-col items-end shrink-0">
            <span className={`text-xs font-bold ${expanded ? 'text-slate-800' : 'text-slate-600'}`}>{totalUsd}</span>
            <span className="text-[10px] text-slate-500">{totalBs}</span>
        </div>
    </div>
);

const BudgetItem = ({ code, title, costBs, costUsd, details, onClick, onDelete }: { code: string, title: string, costBs: string, costUsd: string, details: string, onClick?: () => void, onDelete?: () => void }) => (
    <div onClick={onClick} className="group relative px-4 py-3.5 flex items-start gap-3 active:bg-blue-50 transition-colors cursor-pointer odd:bg-transparent even:bg-slate-50/50 hover:bg-gray-50">
        <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 shrink-0 font-mono text-xs font-bold group-hover:bg-white group-hover:shadow-sm transition-all">
            {code.split('.')[0]}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-1 gap-2">
                <h3 className="text-sm font-semibold text-slate-800 truncate pr-2 group-hover:text-primary transition-colors">{code} {title}</h3>
                <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 font-mono">{costUsd}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{costBs}</div>
                </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{details}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar Partida"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <button className="text-primary hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const SummaryRow = ({ label, valueBs, valueUsd, highlight }: { label: string, valueBs: string, valueUsd: string, highlight?: boolean }) => (
    <div className={`flex justify-between items-center text-xs ${highlight ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
        <span>{label}</span>
        <div className="text-right">
            <div className="font-medium tabular-nums">{valueUsd}</div>
            {!highlight && <div className="text-[10px] tabular-nums text-slate-400">{valueBs}</div>}
        </div>
    </div>
);

// --- Main Component ---

export const ListaPartidas = ({ onImport, onReport }: { onImport?: () => void, onReport?: () => void }) => {
    const { proyectoActual, agregarPartida, setPartidaEditando, eliminarPartida } = useProyectoStore();
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // New state
    const [showCovenin, setShowCovenin] = useState(false);

    // Formatting Helpers
    const fmtBs = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format;
    const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;

    // Grouping Logic
    const groupedPartidas = useMemo(() => {
        if (!proyectoActual) return {};
        const groups: Record<string, Partida[]> = {};

        proyectoActual.partidas.forEach(p => {
            const folderName = p.capitulo || 'General';
            if (!groups[folderName]) groups[folderName] = [];
            groups[folderName].push(p);
        });
        return groups;
    }, [proyectoActual]);

    const folderTotals = useMemo(() => {
        const totals: Record<string, { bs: number, usd: number }> = {};
        Object.keys(groupedPartidas).forEach(key => {
            const sum = groupedPartidas[key].reduce((acc, p) => ({
                bs: acc.bs + (p.precioTotalBs || 0),
                usd: acc.usd + (p.precioTotalUsd || 0)
            }), { bs: 0, usd: 0 });
            totals[key] = sum;
        });
        return totals;
    }, [groupedPartidas]);

    if (!proyectoActual) return null;

    const toggleFolder = (key: string) => {
        setExpandedFolders(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleNuevaPartida = () => {
        const nuevaPartida: Partida = {
            id: crypto.randomUUID(),
            codigo: '01.01',
            titulo: 'Nueva Partida',
            descripcion: '',
            unidadMedida: 'M2',
            cantidad: 1,
            rendimiento: 1,
            capitulo: 'General',

            materiales: [],
            manoObra: [],
            equipos: [],

            costoMaterialesBs: 0, costoMaterialesUsd: 0,
            costoManoObraBs: 0, costoManoObraUsd: 0,
            costoEquiposBs: 0, costoEquiposUsd: 0,
            costoDirectoBs: 0, costoDirectoUsd: 0,
            precioUnitarioBs: 0, precioUnitarioUsd: 0,
            precioTotalBs: 0, precioTotalUsd: 0
        };
        agregarPartida(nuevaPartida);
        setPartidaEditando(nuevaPartida.id);
    };

    const handleCoveninSelect = (item: import('../data/covenin').CoveninEntry) => {
        const nuevaPartida: Partida = {
            id: crypto.randomUUID(),
            codigo: item.codigo,
            titulo: item.descripcion.length > 50 ? item.descripcion.substring(0, 50) + '...' : item.descripcion,
            descripcion: item.descripcion,
            unidadMedida: item.unidad as import('../types').UnidadMedida,
            cantidad: 1,
            rendimiento: item.rendimientoDia || 1,
            capitulo: 'General', // Could infer from code?

            materiales: [],
            manoObra: [],
            equipos: [],

            costoMaterialesBs: 0, costoMaterialesUsd: 0,
            costoManoObraBs: 0, costoManoObraUsd: 0,
            costoEquiposBs: 0, costoEquiposUsd: 0,
            costoDirectoBs: 0, costoDirectoUsd: 0,
            precioUnitarioBs: 0, precioUnitarioUsd: 0,
            precioTotalBs: 0, precioTotalUsd: 0
        };
        agregarPartida(nuevaPartida);
        setPartidaEditando(nuevaPartida.id);
        setShowCovenin(false);
    };

    // Calculations (Totals)
    const totalDirectoBs = proyectoActual.partidas.reduce((sum, p) => sum + (p.costoDirectoBs * p.cantidad), 0);
    const totalDirectoUsd = proyectoActual.partidas.reduce((sum, p) => sum + (p.costoDirectoUsd * p.cantidad), 0);

    const config = proyectoActual.config;

    // Percentages are handled in CalculadoraAPU per item, but here we summarize for footer.
    // Note: The total project cost is sum of item * qty. 
    // We shouldn't recalculate global percentages here if items already have them included in Unit Price.
    // However, for the footer summary, we want to show the breakdown.
    // The previous implementation calculated admin/util/iva on the TOTAL Direct Cost.
    // Our new Item calculation does it per item. Mathematically it should match if % are constant.

    // The itemsTotal variables were unused, removed to fix build error.

    // To show the breakdown, we can reverse calc or sum the components if available.
    // Since we don't store "TotalAdmin" on the item, we can estimate it for display.
    const adminBs = totalDirectoBs * (config.administracion / 100);
    const adminUsd = totalDirectoUsd * (config.administracion / 100);

    const utilBasisBs = totalDirectoBs + adminBs; // Assuming cascade
    const utilBasisUsd = totalDirectoUsd + adminUsd;

    const utilBs = utilBasisBs * (config.utilidad / 100);
    const utilUsd = utilBasisUsd * (config.utilidad / 100);

    const subTotalBs = utilBasisBs + utilBs;
    const subTotalUsd = utilBasisUsd + utilUsd;

    const ivaBs = subTotalBs * (config.iva / 100);
    const ivaUsd = subTotalUsd * (config.iva / 100);

    const totalBs = subTotalBs + ivaBs;
    const totalUsd = subTotalUsd + ivaUsd;

    // Warning: There might be a slight rounding diff between "Sum of Items" and "Global Calc".
    // "itemsTotal" is the truth (sum of what's in the grid).
    // Usually construction software calculates line by line and sums at the end.

    return (
        <div className="flex flex-col h-full bg-background-light">
            {/* Header */}
            <header className="flex-none bg-white z-20 shadow-nav pb-2">
                <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-primary text-xs font-semibold tracking-wide uppercase mb-0.5">Proyecto</p>
                        <h1 className="text-slate-900 text-xl font-bold leading-tight truncate">{proyectoActual.nombre}</h1>
                        <p className="text-xs text-slate-500 mt-1">Tasa: {config.tasaCambio} Bs/$ • FCAS: {config.fcas.factorTotal}%</p>
                    </div>
                </div>
                <div className="flex items-center justify-between px-4 py-2 gap-2">
                    {/* View Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Tabla
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <ActionButton icon="add" label="Crear" active onClick={handleNuevaPartida} />
                        <ActionButton icon="menu_book" label="Catálogo" onClick={() => setShowCovenin(true)} />
                        <ActionButton icon="download" label="Importar" onClick={onImport} />
                        <ActionButton icon="description" label="Reporte" onClick={onReport} />
                    </div>
                </div>
            </header>

            {/* Content Switcher */}
            <main className="flex-1 overflow-hidden bg-background-light pb-4">
                {viewMode === 'list' ? (
                    <div className="h-full overflow-y-auto no-scrollbar">
                        {Object.keys(groupedPartidas).sort().map(folderKey => (
                            <div key={folderKey} className="mt-4 first:mt-2">
                                <FolderHeader
                                    title={`${folderKey}`}
                                    totalBs={fmtBs(folderTotals[folderKey].bs)}
                                    totalUsd={fmtUsd(folderTotals[folderKey].usd)}
                                    expanded={!!expandedFolders[folderKey]}
                                    onToggle={() => toggleFolder(folderKey)}
                                />
                                {expandedFolders[folderKey] && (
                                    <div className="bg-white divide-y divide-gray-100 border-b border-gray-200">
                                        {groupedPartidas[folderKey].map(partida => (
                                            <BudgetItem
                                                key={partida.id}
                                                code={partida.codigo}
                                                title={partida.titulo}
                                                costBs={fmtBs(partida.precioTotalBs || 0)}
                                                costUsd={fmtUsd(partida.precioTotalUsd || 0)}
                                                details={`${partida.cantidad} ${partida.unidadMedida} × ${fmtUsd(partida.precioUnitarioUsd || 0)}`}
                                                onClick={() => setPartidaEditando(partida.id)}
                                                onDelete={() => {
                                                    if (confirm('¿Estás seguro de eliminar esta partida?')) {
                                                        eliminarPartida(partida.id);
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full p-4">
                        <APUDataGrid />
                    </div>
                )}
            </main>

            {/* Footer Summary */}
            <footer className="bg-white border-t border-gray-200 shadow-footer z-30 pb-safe-bottom rounded-b-2xl">
                <div className="px-5 py-4">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-3">
                        <SummaryRow label="Costo Directo" valueBs={fmtBs(totalDirectoBs)} valueUsd={fmtUsd(totalDirectoUsd)} />
                        <SummaryRow label={`Utilidad (${config.utilidad}%)`} valueBs={fmtBs(utilBs)} valueUsd={fmtUsd(utilUsd)} />
                        <SummaryRow highlight label={`IVA (${config.iva}%)`} valueBs={fmtBs(ivaBs)} valueUsd={fmtUsd(ivaUsd)} />
                    </div>
                    <div className="border-t border-gray-100 my-2"></div>
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Proyecto</span>
                            <span className="text-xs text-slate-400">USD + VES</span>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary tracking-tight tabular-nums">{fmtUsd(totalUsd)}</div>
                            <div className="text-sm font-medium text-slate-500 tabular-nums">{fmtBs(totalBs)}</div>
                        </div>
                    </div>
                </div>
            </footer>

            {showCovenin && (
                <CoveninSelector
                    onSelect={handleCoveninSelect}
                    onClose={() => setShowCovenin(false)}
                />
            )}
        </div>
    );
};
