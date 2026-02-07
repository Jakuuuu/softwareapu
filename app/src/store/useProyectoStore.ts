import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Proyecto, Recurso, Partida, ProjectConfig } from '../types';
import { CalculadoraAPU } from '../utils/calculos';

interface ProyectoStore {
    // Estado
    proyectoActual: Proyecto | null;
    recursos: Recurso[];
    partidaEditando: string | null;
    currentView: string;

    // Acciones
    setProyecto: (proyecto: Proyecto) => void;
    crearProyecto: (nombre: string) => void;
    agregarPartida: (partida: Partida) => void;
    actualizarPartida: (id: string, cambios: Partial<Partida>) => void;
    eliminarPartida: (id: string) => void;
    setPartidaEditando: (id: string | null) => void;
    setCurrentView: (view: string) => void;
    resetProyecto: () => void;

    // Configuración
    actualizarConfiguracion: (config: Partial<ProjectConfig>) => void;
    actualizarProyecto: (cambios: Partial<Proyecto>) => void;
    recalcularProyecto: () => void;

    // Recursos
    agregarRecurso: (recurso: Recurso) => void;
}

const defaultConfig: ProjectConfig = {
    monedaPrincipal: 'USD',
    tasaCambio: 36.5, // Ref provisional
    fechaTasa: new Date().toISOString(),
    fuenteTasa: 'BCV_OFICIAL',
    iva: 16,
    utilidad: 10,
    administracion: 10,
    fcas: {
        factorTotal: 72.0, // Default ven
        diasFeriados: 12,
        diasUtilidades: 60,
        diasVacaciones: 15,
        porcentajeInces: 2,
        porcentajeIvss: 11,
        porcentajeFaov: 2,
        porcentajePensiones: 9,
        imputacionPensiones: 'COSTO_DIRECTO'
    }
};

export const useProyectoStore = create<ProyectoStore>()(
    persist(
        (set, get) => ({
            proyectoActual: null,
            recursos: [],
            partidaEditando: null,
            currentView: 'presupuesto',

            setProyecto: (proyecto) => set({ proyectoActual: proyecto }),

            crearProyecto: (nombre) => {
                const nuevoProyecto: Proyecto = {
                    id: crypto.randomUUID(),
                    nombre,
                    ubicacion: '',
                    propietario: '',
                    tipoObra: 'EDIFICACION',
                    config: { ...defaultConfig },
                    fechaCreacion: new Date().toISOString(),
                    partidas: []
                };
                set({ proyectoActual: nuevoProyecto });
            },

            setPartidaEditando: (id) => set({ partidaEditando: id }),
            setCurrentView: (view) => set({ currentView: view }),

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
                    // IMPORTANTE: Pasamos la config completa del proyecto
                    return CalculadoraAPU.actualizarPartida(
                        partidaConCambios,
                        state.proyectoActual!.config
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

            actualizarConfiguracion: (cambiosConfig) => {
                const state = get();
                if (!state.proyectoActual) return;

                const nuevaConfig = { ...state.proyectoActual.config, ...cambiosConfig };

                // Al actualizar config, debemos recalcular TODAS las partidas
                const partidasRecalculadas = state.proyectoActual.partidas.map(p =>
                    CalculadoraAPU.actualizarPartida(p, nuevaConfig)
                );

                set({
                    proyectoActual: {
                        ...state.proyectoActual,
                        config: nuevaConfig,
                        partidas: partidasRecalculadas
                    }
                });
            },

            actualizarProyecto: (cambios) => set((state) => {
                if (!state.proyectoActual) return state;
                return {
                    proyectoActual: { ...state.proyectoActual, ...cambios }
                };
            }),

            recalcularProyecto: () => {
                const state = get();
                if (!state.proyectoActual) return;

                const partidasRecalculadas = state.proyectoActual.partidas.map(p =>
                    CalculadoraAPU.actualizarPartida(p, state.proyectoActual!.config)
                );

                set({
                    proyectoActual: {
                        ...state.proyectoActual,
                        partidas: partidasRecalculadas
                    }
                });
            },

            agregarRecurso: (recurso) => set((state) => ({
                recursos: [...state.recursos, recurso]
            })),

            resetProyecto: () => set({ proyectoActual: null, partidaEditando: null }),
        }),
        {
            name: 'apu-storage',
            partialize: (state) => ({
                proyectoActual: state.proyectoActual,
                recursos: state.recursos,
                currentView: state.currentView
            }),
            version: 3,
            migrate: (persistedState: any, version) => {
                if (version < 3) {
                    return { proyectoActual: null, recursos: [] };
                }
                return persistedState;
            },
        }
    )
);
