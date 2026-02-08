import { useState } from 'react';
import { useProyectoStore } from '../../store/useProyectoStore';
import { ResourceForm } from './ResourceForm';
import type { TipoRecurso, Recurso } from '../../types';

export const LibraryManager = () => {
    const { setCurrentView, recursos } = useProyectoStore();
    const [filterType, setFilterType] = useState<TipoRecurso | 'TODOS'>('TODOS');
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Recurso | null>(null);

    const filteredResources = recursos.filter(r => {
        const matchesType = filterType === 'TODOS' || r.tipo === filterType;
        const matchesSearch = r.nombre.toLowerCase().includes(search.toLowerCase()) ||
            r.codigo?.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    const handleEdit = (recurso: Recurso) => {
        setEditingResource(recurso);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingResource(null);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Biblioteca de Insumos</h1>
                        <p className="text-sm text-slate-500">Administra tus materiales, equipos y mano de obra</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nuevo
                </button>
            </header>

            {/* Filters */}
            <div className="px-6 py-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar insumo..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border-gray-200 focus:ring-primary focus:border-primary transition-shadow"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                        {(['TODOS', 'MATERIAL', 'MANO_OBRA', 'EQUIPO'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === type
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                                    }`}
                            >
                                {type === 'TODOS' ? 'Todos' : type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 pb-20">
                {filteredResources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">inventory_2</span>
                        <p className="font-medium">No hay insumos registrados</p>
                        <p className="text-sm">Agrega nuevos materiales o impórtalos</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResources.map(recurso => (
                            <div
                                key={recurso.id}
                                onClick={() => handleEdit(recurso)}
                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 cursor-pointer transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${recurso.tipo === 'MATERIAL' ? 'bg-orange-50 text-orange-600' :
                                            recurso.tipo === 'MANO_OBRA' ? 'bg-blue-50 text-blue-600' :
                                                'bg-purple-50 text-purple-600'
                                        }`}>
                                        {recurso.tipo.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">{recurso.codigo}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">{recurso.nombre}</h3>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-xl font-bold text-slate-900">${recurso.costoUsd}</span>
                                    <span className="text-xs text-slate-500">/ {recurso.unidad}</span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    Actualizado: {new Date(recurso.fechaPrecio).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isFormOpen && (
                <ResourceForm
                    recursoEditando={editingResource}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
};
