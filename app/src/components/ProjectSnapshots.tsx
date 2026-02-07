import { useState, useEffect } from 'react';
import { useProyectoStore } from '../store/useProyectoStore';

interface Snapshot {
    id: string; // timestamp key
    name: string;
    date: string;
    totalUsd: number;
}

export const ProjectSnapshots = () => {
    const { proyectoActual, setProyecto } = useProyectoStore();
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [snapshotName, setSnapshotName] = useState('');

    useEffect(() => {
        loadSnapshots();
    }, []);

    const loadSnapshots = () => {
        const stored = localStorage.getItem('project_snapshots');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Map to summary list
                const summary = parsed.map((p: any) => ({
                    id: p.savedAt,
                    name: p.snapshotName || `Versión ${new Date(p.savedAt).toLocaleTimeString()}`,
                    date: new Date(p.savedAt).toLocaleString(),
                    totalUsd: p.partidas.reduce((a: number, b: any) => a + (b.precioTotalUsd || 0), 0)
                }));
                // Sort by date desc
                setSnapshots(summary.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (e) {
                console.error("Error loading snapshots", e);
            }
        }
    };

    const handleSaveSnapshot = () => {
        if (!proyectoActual) return;

        const existing = localStorage.getItem('project_snapshots');
        const list = existing ? JSON.parse(existing) : [];

        const newSnapshot = {
            ...proyectoActual,
            savedAt: new Date().toISOString(),
            snapshotName: snapshotName.trim() || `Versión ${list.length + 1}`
        };

        const updatedList = [newSnapshot, ...list];
        localStorage.setItem('project_snapshots', JSON.stringify(updatedList));

        setSnapshotName('');
        loadSnapshots();
        alert('Versión guardada correctamente.');
    };

    const handleLoadSnapshot = (id: string) => {
        if (!confirm('¿Cargar esta versión? Los cambios no guardados se perderán.')) return;

        const existing = localStorage.getItem('project_snapshots');
        if (existing) {
            const list = JSON.parse(existing);
            const found = list.find((p: any) => p.savedAt === id);
            if (found) {
                setProyecto(found); // Hydrate store
            }
        }
    };

    const handleDeleteSnapshot = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('¿Eliminar esta versión?')) return;

        const existing = localStorage.getItem('project_snapshots');
        if (existing) {
            let list = JSON.parse(existing);
            list = list.filter((p: any) => p.savedAt !== id);
            localStorage.setItem('project_snapshots', JSON.stringify(list));
            loadSnapshots();
        }
    }

    // Formatting
    const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Historial de Versiones
            </h2>

            {/* Create New */}
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    placeholder="Nombre de la versión (Opcional)"
                    className="flex-1 rounded-lg border-gray-300 text-sm focus:border-primary focus:ring-primary h-10 px-3"
                />
                <button
                    onClick={handleSaveSnapshot}
                    className="bg-primary hover:bg-primary-dark text-white px-4 h-10 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Guardar
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {snapshots.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                        No hay versiones guardadas.
                    </div>
                ) : (
                    snapshots.map((snap) => (
                        <div
                            key={snap.id}
                            onClick={() => handleLoadSnapshot(snap.id)}
                            className="group p-3 rounded-lg border border-gray-100 hover:border-primary/50 hover:bg-blue-50/50 cursor-pointer transition-all relative"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-800 text-sm">{snap.name}</h3>
                                <span className="text-xs font-mono font-bold text-primary">{fmtUsd(snap.totalUsd)}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">schedule</span>
                                {snap.date}
                            </div>

                            <button
                                onClick={(e) => handleDeleteSnapshot(snap.id, e)}
                                className="absolute right-2 bottom-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Eliminar versión"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
