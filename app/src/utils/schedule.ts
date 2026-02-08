import type { Partida } from '../types';

export interface GanttTask {
    id: string;
    nombre: string;
    inicio: number; // Day number (0-indexed)
    duracion: number; // Days
    fin: number; // Day number
}

/**
 * Calculates a simple sequential schedule based on quantity/yield.
 * Yield (Rendimiento) is units/day.
 * Duration = Quantity / Yield.
 *
 * For now, we assume a sequential dependency: Task N starts when Task N-1 ends.
 */
export const calcularCronograma = (partidas: Partida[]): GanttTask[] => {
    let currentDay = 0;
    const tasks: GanttTask[] = [];

    partidas.forEach((p) => {
        // Avoid division by zero
        const rendimiento = p.rendimiento > 0 ? p.rendimiento : 1;
        const cantidad = p.cantidad > 0 ? p.cantidad : 0;

        // Calculate days, roundup to nearest integer (or keep decimal? let's keep decimal for visualization, but maybe ceil for planning)
        // Let's use 1 decimal place
        let duration = cantidad / rendimiento;
        if (duration < 0.1) duration = 0.1; // Minimum duration

        tasks.push({
            id: p.id,
            nombre: p.titulo,
            inicio: currentDay,
            duracion: duration,
            fin: currentDay + duration
        });

        // Update start for next task
        currentDay += duration;
    });

    return tasks;
};

export const getTotalProjectDuration = (tasks: GanttTask[]) => {
    if (tasks.length === 0) return 0;
    return tasks[tasks.length - 1].fin;
};
