import { useState } from 'react';
import { useLibraryStore, type LibraryItem } from '../store/useLibraryStore';

interface LibrarySelectorProps {
    tipo: LibraryItem['tipo'];
    onSelect: (item: LibraryItem) => void;
    onClose: () => void;
}

export const LibrarySelector = ({ tipo, onSelect, onClose }: LibrarySelectorProps) => {
    const store = useLibraryStore();
    const items = tipo === 'MATERIAL' ? store.materiales :
        tipo === 'MANO_OBRA' ? store.manoObra : store.equipos;

    const [search, setSearch] = useState('');

    const filtered = items.filter(i =>
        i.nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">inventory_2</span>
                        Biblioteca de {tipo === 'MATERIAL' ? 'Materiales' : tipo === 'MANO_OBRA' ? 'Mano de Obra' : 'Equipos'}
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
                            placeholder="Buscar recurso..."
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
                            <p>No se encontraron recursos.</p>
                            <p className="text-xs mt-1">Guarda recursos desde la tabla para verlos aquí.</p>
                        </div>
                    ) : (
                        filtered.map(item => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item)}
                                className="w-full text-left p-3 hover:bg-blue-50 rounded-xl flex items-center justify-between group transition-colors"
                            >
                                <div>
                                    <div className="font-semibold text-slate-700">{item.nombre}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{item.unidad}</span>
                                        <span>${item.precioBaseUsd.toFixed(2)}</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
