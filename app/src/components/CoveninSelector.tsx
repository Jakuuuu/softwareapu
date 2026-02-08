import { useState } from 'react';
import { COVENIN_DATA, searchCovenin, type CoveninEntry } from '../data/covenin';

interface CoveninSelectorProps {
    onSelect: (item: CoveninEntry) => void;
    onClose: () => void;
}

export const CoveninSelector = ({ onSelect, onClose }: CoveninSelectorProps) => {
    const [search, setSearch] = useState('');

    // Use search helper or show all if empty (limit to 20 for perf)
    const filtered = search
        ? searchCovenin(search)
        : COVENIN_DATA.slice(0, 20);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">menu_book</span>
                        Catálogo COVENIN
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm font-medium"
                            placeholder="Buscar por código (E-...) o descripción..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filtered.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                            <p>No se encontraron partidas.</p>
                        </div>
                    ) : (
                        filtered.map(item => (
                            <button
                                key={item.codigo}
                                onClick={() => onSelect(item)}
                                className="w-full text-left p-3 hover:bg-blue-50 rounded-xl flex items-start gap-3 group transition-colors"
                            >
                                <div className="mt-0.5 font-mono text-xs font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded group-hover:bg-white transition-colors">
                                    {item.codigo}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-slate-700 text-sm">{item.descripcion}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[10px]">straighten</span>
                                            {item.unidad}
                                        </span>
                                        <span className="flex items-center gap-1" title="Rendimiento estimado" >
                                            <span className="material-symbols-outlined text-[10px]">speed</span>
                                            {item.rendimientoDia} / día
                                        </span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity self-center">add_circle</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
