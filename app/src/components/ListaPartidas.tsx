import { useState, useMemo } from 'react';
import { useProyectoStore } from '../store/useProyectoStore';
import type { Partida } from '../types';
import { generarPDFPresupuesto } from '../utils/exportPDF';

// --- Sub-components (Inline for valid single-file export) ---

const ActionButton = ({ icon, label, active, onClick }: { icon: string, label: string, active?: boolean, onClick?: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${active ? 'bg-primary/10 text-primary group-active:bg-primary group-active:text-white' : 'bg-slate-100 text-slate-700 group-active:scale-95'}`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <span className="text-xs font-medium text-slate-700">{label}</span>
    </button>
);

const FolderHeader = ({ title, total, expanded, onToggle }: { title: string, total: string, expanded: boolean, onToggle: () => void }) => (
    <div onClick={onToggle} className={`sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-y border-gray-200 shadow-sm cursor-pointer transition-colors ${expanded ? 'bg-indigo-50' : 'bg-white'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
            <span className={`material-symbols-outlined ${expanded ? 'text-primary fill-1' : 'text-slate-400'}`}>
                {expanded ? 'folder_open' : 'folder'}
            </span>
            <h2 className="text-sm font-bold text-slate-800 truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <span className={`text-sm font-bold ${expanded ? 'text-slate-800' : 'text-slate-600'}`}>{total}</span>
            <span className="material-symbols-outlined text-slate-400 text-lg transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
        </div>
    </div>
);

const BudgetItem = ({ code, title, cost, details, onClick }: { code: string, title: string, cost: string, details: string, onClick?: () => void }) => (
    <div onClick={onClick} className="group relative px-4 py-3.5 flex items-start gap-3 active:bg-blue-50 transition-colors cursor-pointer odd:bg-transparent even:bg-slate-50/50">
        <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 shrink-0">
            <span className="text-[10px] font-bold">{code.split('.')[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-semibold text-slate-800 truncate pr-2">{code} {title}</h3>
                <span className="text-sm font-bold text-slate-900">{cost}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{details}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button className="text-primary hover:text-blue-700"><span className="material-symbols-outlined text-base">edit</span></button>
                </div>
            </div>
        </div>
    </div>
);

const SummaryRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-medium text-slate-700 tabular-nums">{value}</span>
    </div>
);

// --- Main Component ---

export const ListaPartidas = () => {
    const { proyectoActual, agregarPartida, setPartidaEditando } = useProyectoStore();
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

    // Grouping Logic
    const groupedPartidas = useMemo(() => {
        if (!proyectoActual) return {};
        const groups: Record<string, Partida[]> = {};

        proyectoActual.partidas.forEach(p => {
            const folderCode = p.codigo.split('.')[0] || 'Unknown';
            if (!groups[folderCode]) groups[folderCode] = [];
            groups[folderCode].push(p);
        });
        return groups;
    }, [proyectoActual?.partidas]);

    const folderTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        Object.keys(groupedPartidas).forEach(key => {
            totals[key] = groupedPartidas[key].reduce((sum, p) => sum + p.precioTotal, 0);
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
            rendimiento: 0,
            materiales: [],
            manoObra: [],
            equipos: [],
            costoMateriales: 0,
            costoManoObra: 0,
            costoEquipos: 0,
            costoDirecto: 0,
            precioUnitario: 0,
            precioTotal: 0,
        };
        agregarPartida(nuevaPartida);
        setPartidaEditando(nuevaPartida.id); // Open immediately
    };

    // Calculations
    const totalDirecto = proyectoActual.partidas.reduce((sum, p) => sum + (p.costoDirecto * p.cantidad), 0);
    const admin = totalDirecto * (proyectoActual.factoresGlobales.administracion / 100);
    const utilidad = totalDirecto * (proyectoActual.factoresGlobales.utilidad / 100);
    const subtotal = totalDirecto + admin + utilidad;
    const iva = subtotal * (proyectoActual.factoresGlobales.iva / 100);
    const totalProyecto = subtotal + iva;

    const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format;

    return (
        <div className="flex flex-col h-full bg-background-light">
            {/* Header */}
            <header className="flex-none bg-white z-20 shadow-nav pb-2">
                <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-primary text-xs font-semibold tracking-wide uppercase mb-0.5">Project</p>
                        <h1 className="text-slate-900 text-xl font-bold leading-tight truncate">{proyectoActual.nombre}</h1>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 px-4 py-2">
                    <ActionButton icon="add" label="New Item" active onClick={handleNuevaPartida} />
                    <ActionButton icon="download" label="Import" />
                    <ActionButton icon="description" label="Report" onClick={() => generarPDFPresupuesto(proyectoActual)} />
                </div>
            </header>

            {/* List */}
            <main className="flex-1 overflow-y-auto bg-background-light no-scrollbar pb-4">
                {Object.keys(groupedPartidas).sort().map(folderKey => (
                    <div key={folderKey} className="mt-4">
                        <FolderHeader
                            title={`${folderKey} PARTIDAS`}
                            total={fmt(folderTotals[folderKey])}
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
                                        cost={fmt(partida.precioTotal)}
                                        details={`${partida.cantidad} ${partida.unidadMedida} × ${fmt(partida.precioUnitario)}`}
                                        onClick={() => setPartidaEditando(partida.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {Object.keys(groupedPartidas).length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        No hay partidas. Pulsa "New Item".
                    </div>
                )}

                <div className="h-6"></div>
            </main>

            {/* Footer Summary */}
            <footer className="bg-white border-t border-gray-200 shadow-footer z-30 pb-safe-bottom rounded-b-2xl">
                <div className="px-5 py-4">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-3">
                        <SummaryRow label="Costo Directo" value={fmt(totalDirecto)} />
                        <SummaryRow label={`Utilidad (${proyectoActual.factoresGlobales.utilidad}%)`} value={fmt(utilidad)} />
                        <SummaryRow label={`IVA (${proyectoActual.factoresGlobales.iva}%)`} value={fmt(iva)} />
                    </div>
                    <div className="border-t border-gray-100 my-2"></div>
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
                            <span className="text-xs text-slate-400">MXN Currency</span>
                        </div>
                        <span className="text-2xl font-bold text-primary tracking-tight tabular-nums">{fmt(totalProyecto)}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
