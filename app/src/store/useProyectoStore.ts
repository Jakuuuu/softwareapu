import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Proyecto, Recurso, Partida } from '../types';
import { CalculadoraAPU } from '../utils/calculos';

interface ProyectoStore {
    // Estado
    proyectoActual: Proyecto | null;
    recursos: Recurso[];
    partidaEditando: string | null;

    // Acciones
    setProyecto: (proyecto: Proyecto) => void;
    agregarPartida: (partida: Partida) => void;
    actualizarPartida: (id: string, cambios: Partial<Partida>) => void;
    eliminarPartida: (id: string) => void;
    setPartidaEditando: (id: string | null) => void;
    resetProyecto: () => void;

    // Recursos (Placeholder por ahora)
    agregarRecurso: (recurso: Recurso) => void;
}

export const useProyectoStore = create<ProyectoStore>()(
    persist(
        (set) => ({
            proyectoActual: null,
            recursos: [],
            partidaEditando: null,

            setProyecto: (proyecto) => set({ proyectoActual: proyecto }),
            setPartidaEditando: (id) => set({ partidaEditando: id }),

            agregarPartida: (partida) => set((state) => {
                if (!state.proyectoActual) return state;
                return {
                    proyectoActual: {
                        ...state.proyectoActual,
                        partidas: [...state.proyectoActual.partidas, partida]
                    }
                };
            }),

            actualizarPartida: (id, cambios) => set((state) => {
                if (!state.proyectoActual) return state;

                const partidasActualizadas = state.proyectoActual.partidas.map((p) => {
                    if (p.id !== id) return p;

                    // Unir cambios preliminares
                    const partidaConCambios = { ...p, ...cambios };

                    // Recalcular costos automáticamente
                    return CalculadoraAPU.actualizarCalculosPartida(
                        partidaConCambios,
                        state.proyectoActual!.factoresGlobales
                    );
                });

                return {
                    proyectoActual: {
                        ...state.proyectoActual,
                        partidas: partidasActualizadas
                    }
                };
            }),

            eliminarPartida: (id) => set((state) => {
                if (!state.proyectoActual) return state;
                return {
                    proyectoActual: {
                        ...state.proyectoActual,
                        partidas: state.proyectoActual.partidas.filter(p => p.id !== id)
                    }
                };
            }),

            agregarRecurso: (recurso) => set((state) => ({
                recursos: [...state.recursos, recurso]
            })),

            resetProyecto: () => set({ proyectoActual: null, partidaEditando: null }),
        }),
        {
            name: 'apu-storage',
            partialize: (state) => ({ proyectoActual: state.proyectoActual, recursos: state.recursos }),
            version: 2, // Bump version to invalidate old incompatible state
            migrate: (persistedState, version) => {
                if (version === 0) {
                    // if there's no version (old state), discard it
                    return { proyectoActual: null, recursos: [] };
                }
                return persistedState as any;
            },
        }
    )
);
