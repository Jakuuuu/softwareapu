import { useState, useMemo } from "react";
import { useProyectoStore } from "../store/useProyectoStore";
import { calcularCronograma, GanttTask } from "../utils/schedule";

export const CronogramaView = () => {
    const { proyectoActual } = useProyectoStore();
    const [scale, setScale] = useState(20); // Pixels per day

    const tasks = useMemo(() => {
        return proyectoActual ? calcularCronograma(proyectoActual.partidas) : [];
    }, [proyectoActual]);

    const totalDays = useMemo(() => {
        return tasks.length > 0 ? Math.ceil(tasks[tasks.length - 1].fin) : 0;
    }, [tasks]);

    if (!proyectoActual || tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">calendar_month</span>
                <p>No hay partidas para generar el cronograma.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header / Controls */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">calendar_month</span>
                        Cronograma de Obra
                    </h2>
                    <p className="text-xs text-slate-500">
                        Duración Estimada Total: <strong className="text-slate-700">{totalDays.toFixed(1)} Días</strong>
                        <span className="mx-2">•</span>
                        Basado en Rendimientos (Secuencial)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setScale(s => Math.max(5, s - 5))}
                        className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-500 transition-all"
                        title="Reducir Zoom"
                    >
                        <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="text-xs font-medium text-slate-600 w-16 text-center">Zoom</span>
                    <button
                        onClick={() => setScale(s => Math.min(100, s + 5))}
                        className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-500 transition-all"
                        title="Aumentar Zoom"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1 overflow-auto relative">
                <div className="min-w-fit relative">

                    {/* Time Axis (Days) */}
                    <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 flex h-8" style={{ width: `${Math.max(100, totalDays * scale + 300)}px` }}>
                        <div className="w-[300px] shrink-0 border-r border-slate-200 px-4 flex items-center bg-slate-50 font-bold text-xs text-slate-500">
                            PARTIDA / ACTIVIDAD
                        </div>
                        <div className="flex-1 relative">
                            {Array.from({ length: Math.ceil(totalDays / 5) + 2 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 bottom-0 border-l border-slate-200/50 flex items-center pl-1 text-[10px] text-slate-400 font-medium"
                                    style={{ left: `${(i * 5) * scale}px` }}
                                >
                                    Día {i * 5}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tasks Rows */}
                    <div className="divide-y divide-slate-100">
                        {tasks.map((task, index) => (
                            <div
                                key={task.id}
                                className="flex h-10 hover:bg-blue-50/30 transition-colors group"
                                style={{ width: `${Math.max(100, totalDays * scale + 300)}px` }}
                            >
                                {/* Activity Name Column */}
                                <div className="w-[300px] shrink-0 border-r border-slate-100 px-4 flex items-center text-xs text-slate-700 truncate relative z-20 bg-white group-hover:bg-blue-50/30 transition-colors">
                                    <span className="truncate" title={task.nombre}>{index + 1}. {task.nombre}</span>
                                </div>

                                {/* Gantt Bar Area */}
                                <div className="flex-1 relative py-2">
                                    {/* Grid Lines for this row */}
                                    {Array.from({ length: Math.ceil(totalDays / 5) + 2 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute top-0 bottom-0 border-l border-slate-100"
                                            style={{ left: `${(i * 5) * scale}px` }}
                                        />
                                    ))}

                                    {/* The Bar */}
                                    <div
                                        className="absolute h-6 rounded bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm border border-blue-600/20 flex items-center px-2 text-[10px] text-white font-medium whitespace-nowrap overflow-hidden hover:scale-y-110 transition-transform origin-left z-10"
                                        style={{
                                            left: `${task.inicio * scale}px`,
                                            width: `${Math.max(2, task.duracion * scale)}px`
                                        }}
                                        title={`Duración: ${task.duracion.toFixed(1)} días`}
                                    >
                                        {task.duracion > 1 && <span>{task.duracion.toFixed(1)}d</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
