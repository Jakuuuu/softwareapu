import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Proyecto, Recurso, Partida, ProjectConfig, Valuacion, Dependencia } from '../types';
import { CalculadoraAPU } from '../utils/calculos';

interface ProyectoStore {
    // Estado
    savedProjects: Proyecto[];
    proyectoActual: Proyecto | null;
    recursos: Recurso[];
    partidaEditando: string | null;
    currentView: string;

    // Acciones
    setProyecto: (proyecto: Proyecto) => void;
    crearProyecto: (nombre: string) => void;
    guardarProyecto: () => void;
    cargarProyecto: (id: string) => void;
    eliminarProyecto: (id: string) => void;
    cerrarProyecto: () => void;

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

    // Offline Features (Tablet)
    agregarValuacion: (valuacion: Valuacion) => void;
    eliminarValuacion: (id: string) => void;
    agregarDependencia: (dep: Dependencia) => void;
    eliminarDependencia: (id: string) => void;
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
            savedProjects: [],
            proyectoActual: null,
            recursos: [],
            partidaEditando: null,
            currentView: 'dashboard', // Default start view

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
                    partidas: [],
                    valuaciones: [],
                    dependencias: []
                };
                set({ proyectoActual: nuevoProyecto, currentView: 'configuracion' });
            },

            guardarProyecto: () => set((state) => {
                if (!state.proyectoActual) return state;
                const updated = state.proyectoActual;

                // Check if exists
                const index = state.savedProjects.findIndex(p => p.id === updated.id);
                let newSaved = [...state.savedProjects];

                if (index >= 0) {
                    newSaved[index] = updated;
                } else {
                    newSaved.push(updated);
                }

                return { savedProjects: newSaved, proyectoActual: updated };
            }),

            cargarProyecto: (id) => set((state) => {
                const found = state.savedProjects.find(p => p.id === id);
                if (found) {
                    return { proyectoActual: found, currentView: 'presupuesto' };
                }
                return state;
            }),

            eliminarProyecto: (id) => set((state) => ({
                savedProjects: state.savedProjects.filter(p => p.id !== id),
                proyectoActual: state.proyectoActual?.id === id ? null : state.proyectoActual
            })),

            cerrarProyecto: () => set({ proyectoActual: null, currentView: 'dashboard' }),

            setPartidaEditando: (id) => set({ partidaEditando: id }),
            setCurrentView: (view) => set({ currentView: view }),

            agregarPartida: (partida) => set((state) => {
                if (!state.proyectoActual) return state;
                const newProject = {
                    ...state.proyectoActual,
                    partidas: [...state.proyectoActual.partidas, partida]
                };
                // Auto-save to list
                const idx = state.savedProjects.findIndex(p => p.id === newProject.id);
                const newSaved = [...state.savedProjects];
                if (idx >= 0) newSaved[idx] = newProject;

                return {
                    proyectoActual: newProject,
                    savedProjects: idx >= 0 ? newSaved : state.savedProjects
                };
            }),

            actualizarPartida: (id, cambios) => set((state) => {
                if (!state.proyectoActual) return state;

                const partidasActualizadas = state.proyectoActual.partidas.map((p) => {
                    if (p.id !== id) return p;
                    const partidaConCambios = { ...p, ...cambios };
                    return CalculadoraAPU.actualizarPartida(
                        partidaConCambios,
                        state.proyectoActual!.config
                    );
                });

                const newProject = {
                    ...state.proyectoActual,
                    partidas: partidasActualizadas
                };

                // Auto-save
                const idx = state.savedProjects.findIndex(p => p.id === newProject.id);
                const newSaved = [...state.savedProjects];
                if (idx >= 0) newSaved[idx] = newProject;

                return {
                    proyectoActual: newProject,
                    savedProjects: idx >= 0 ? newSaved : state.savedProjects
                };
            }),

            eliminarPartida: (id) => set((state) => {
                if (!state.proyectoActual) return state;
                const newProject = {
                    ...state.proyectoActual,
                    partidas: state.proyectoActual.partidas.filter(p => p.id !== id)
                };
                // Auto-save
                const idx = state.savedProjects.findIndex(p => p.id === newProject.id);
                const newSaved = [...state.savedProjects];
                if (idx >= 0) newSaved[idx] = newProject;

                return {
                    proyectoActual: newProject,
                    savedProjects: idx >= 0 ? newSaved : state.savedProjects
                };
            }),

            actualizarConfiguracion: (cambiosConfig) => {
                const state = get();
                if (!state.proyectoActual) return;

                const nuevaConfig = { ...state.proyectoActual.config, ...cambiosConfig };

                const partidasRecalculadas = state.proyectoActual.partidas.map(p =>
                    CalculadoraAPU.actualizarPartida(p, nuevaConfig)
                );

                const newProject = {
                    ...state.proyectoActual,
                    config: nuevaConfig,
                    partidas: partidasRecalculadas
                };
                // Auto-save
                const idx = state.savedProjects.findIndex(p => p.id === newProject.id);
                const newSaved = [...state.savedProjects];
                if (idx >= 0) newSaved[idx] = newProject;

                set({
                    proyectoActual: newProject,
                    savedProjects: idx >= 0 ? newSaved : state.savedProjects
                });
            },

            actualizarProyecto: (cambios) => set((state) => {
                if (!state.proyectoActual) return state;
                const newProject = { ...state.proyectoActual, ...cambios };
                // Auto-save
                const idx = state.savedProjects.findIndex(p => p.id === newProject.id);
                const newSaved = [...state.savedProjects];
                if (idx >= 0) newSaved[idx] = newProject;

                return {
                    proyectoActual: newProject,
                    savedProjects: idx >= 0 ? newSaved : state.savedProjects
                };
            }),

            recalcularProyecto: () => {
                const state = get();
                if (!state.proyectoActual) return;

                const partidasRecalculadas = state.proyectoActual.partidas.map(p =>
                    CalculadoraAPU.actualizarPartida(p, state.proyectoActual!.config)
                );

                const newProject = {
                    ...state.proyectoActual,
                    partidas: partidasRecalculadas
                };
                // Auto-save
                const idx = state.savedProjects.findIndex(p => p.id === newProject.id);
                const newSaved = [...state.savedProjects];
                if (idx >= 0) newSaved[idx] = newProject;

                set({
                    proyectoActual: newProject,
                    savedProjects: idx >= 0 ? newSaved : state.savedProjects
                });
            },

            agregarRecurso: (recurso) => set((state) => ({
                recursos: [...state.recursos, recurso]
            })),

            agregarValuacion: (val) => set((state) => {
                if (!state.proyectoActual) return state;
                const newProject = {
                    ...state.proyectoActual,
                    valuaciones: [...(state.proyectoActual.valuaciones || []), val]
                };
                // Auto-save
                const idx = state.savedProjects.findIndex(p => p.id === newProject.id);
                const newSaved = [...state.savedProjects];
                if (idx >= 0) newSaved[idx] = newProject;
                return { proyectoActual: newProject, savedProjects: idx >= 0 ? newSaved : state.savedProjects };
            }),

            eliminarValuacion: (id) => set((state) => {
                if (!state.proyectoActual) return state;
                const newProject = {
                    ...state.proyectoActual,
                    valuaciones: (state.proyectoActual.valuaciones || []).filter(v => v.id !== id)
                };
                // Auto-save
                const idx = state.savedProjects.findIndex(p => p.id === newProject.id);
                const newSaved = [...state.savedProjects];
                if (idx >= 0) newSaved[idx] = newProject;
                return { proyectoActual: newProject, savedProjects: idx >= 0 ? newSaved : state.savedProjects };
            }),

            agregarDependencia: (dep) => set((state) => {
                if (!state.proyectoActual) return state;
                const newProject = {
                    ...state.proyectoActual,
                    dependencias: [...(state.proyectoActual.dependencias || []), dep]
                };
                // Auto-save
                const idx = state.savedProjects.findIndex(p => p.id === newProject.id);
                const newSaved = [...state.savedProjects];
                if (idx >= 0) newSaved[idx] = newProject;
                return { proyectoActual: newProject, savedProjects: idx >= 0 ? newSaved : state.savedProjects };
            }),

            eliminarDependencia: (id) => set((state) => {
                if (!state.proyectoActual) return state;
                const newProject = {
                    ...state.proyectoActual,
                    dependencias: (state.proyectoActual.dependencias || []).filter(d => d.id !== id)
                };
                // Auto-save
                const idx = state.savedProjects.findIndex(p => p.id === newProject.id);
                const newSaved = [...state.savedProjects];
                if (idx >= 0) newSaved[idx] = newProject;
                return { proyectoActual: newProject, savedProjects: idx >= 0 ? newSaved : state.savedProjects };
            }),

            resetProyecto: () => set({ proyectoActual: null, partidaEditando: null }),
        }),
        {
            name: 'apu-storage',
            partialize: (state) => ({
                savedProjects: state.savedProjects, // Now we persist the list
                // We don't persist proyectoActual or currentView to force dashboard on load? 
                // Or maybe we do? Let's persist current project for convenience, but maybe not view if it causes issues.
                // Let's persist everything for now.
                proyectoActual: state.proyectoActual,
                recursos: state.recursos,
                currentView: state.currentView
            }),
            version: 4, // Bump version
            migrate: (persistedState: any, version) => {
                if (version < 4) {
                    return {
                        savedProjects: persistedState.proyectoActual ? [persistedState.proyectoActual] : [],
                        proyectoActual: null,
                        recursos: persistedState.recursos || [],
                        currentView: 'dashboard'
                    };
                }
                return persistedState;
            },
        }
    )
);
