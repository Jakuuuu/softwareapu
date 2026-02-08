import { useState } from 'react';
import { useProyectoStore } from '../store/useProyectoStore';
import type { Proyecto } from '../types';

export const DashboardProyectos = () => {
    const { savedProjects, crearProyecto, cargarProyecto, eliminarProyecto } = useProyectoStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        crearProyecto(newName.trim());
        setIsCreating(false);
    };

    const confirmDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
            eliminarProyecto(id);
        }
    };

    // Card Component for a Project
    const ProjectCard = ({ proy }: { proy: Proyecto }) => {
        const totalItems = proy.partidas?.length || 0;
        const totalAmount = proy.partidas?.reduce((sum, p) => sum + p.precioTotalUsd, 0) || 0;
        const lastModified = proy.fechaCreacion ? new Date(proy.fechaCreacion).toLocaleDateString() : 'N/A';
        const engineerName = proy.ingeniero?.nombre || 'Ing. No asignado';

        return (
            <div
                onClick={() => cargarProyecto(proy.id)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-full relative"
            >
                {/* Delete Button */}
                <button
                    onClick={(e) => confirmDelete(e, proy.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar Proyecto"
                >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                        <span className="material-symbols-outlined">folder_open</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-base leading-tight line-clamp-1" title={proy.nombre}>
                            {proy.nombre}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                            {proy.ubicacion || 'Sin ubicación'}
                        </p>
                    </div>
                </div>

                <div className="space-y-3 flex-1 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">engineering</span>
                            {engineerName}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">list</span>
                            {totalItems} Partidas
                        </span>
                        <span className="text-slate-400 text-xs">Mod: {lastModified}</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                    <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Monto Total</span>
                        <span className="text-xl font-black text-slate-800 tracking-tight">
                            ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mis Proyectos</h1>
                        <p className="text-slate-500 mt-1 text-lg">Gestiona tu historial de obras y presupuestos.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Nuevo Proyecto
                    </button>
                </div>

                {/* Create Modal Overlay */}
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <form
                            onSubmit={handleCreate}
                            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in duration-200"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Crear Nuevo Proyecto</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Proyecto</label>
                                    <input
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-800"
                                        placeholder="Ej. Remodelación Cocina"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-colors"
                                    >
                                        Crear
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Projects Grid */}
                {savedProjects.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-slate-300">folder_off</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes proyectos guardados</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mb-8">
                            Empieza creando tu primer proyecto para calcular los costos y tiempos de tu obra.
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Crear mi primer proyecto
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {savedProjects.map(p => (
                            <ProjectCard key={p.id} proy={p} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};
