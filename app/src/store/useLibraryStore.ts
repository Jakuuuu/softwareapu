import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LibraryItem {
    id: string;
    nombre: string;
    unidad: string; // e.g., kg, m2, day, hr
    precioBaseUsd: number; // Current market price
    tipo: 'MATERIAL' | 'MANO_OBRA' | 'EQUIPO';
    tags?: string[]; // e.g., 'construction', 'electrical'
}

interface LibraryStore {
    materiales: LibraryItem[];
    manoObra: LibraryItem[];
    equipos: LibraryItem[];

    addItem: (item: Omit<LibraryItem, 'id'>) => void;
    removeItem: (id: string, tipo: LibraryItem['tipo']) => void;
    updateItem: (id: string, updates: Partial<LibraryItem>) => void;
    importDefaults: () => void; // Optional: Load some default data
}

export const useLibraryStore = create<LibraryStore>()(
    persist(
        (set) => ({
            materiales: [],
            manoObra: [],
            equipos: [],

            addItem: (item) => {
                const newItem = { ...item, id: crypto.randomUUID() };
                set((state) => {
                    const target = item.tipo === 'MATERIAL' ? 'materiales' :
                        item.tipo === 'MANO_OBRA' ? 'manoObra' : 'equipos';
                    return { [target]: [...state[target], newItem] };
                });
            },

            removeItem: (id, tipo) => {
                set((state) => {
                    const target = tipo === 'MATERIAL' ? 'materiales' :
                        tipo === 'MANO_OBRA' ? 'manoObra' : 'equipos';
                    return { [target]: state[target].filter((i) => i.id !== id) };
                });
            },

            updateItem: (id, updates) => {
                set((state) => {
                    // This is a bit tricky if we don't know the type, but usually updating implies knowing the type.
                    // For simplicity, we search in all lists or require type. 
                    // Let's search all for now or assume passed in updates.
                    // Actually, let's just loop all 3.
                    const newMats = state.materiales.map(i => i.id === id ? { ...i, ...updates } : i);
                    const newMO = state.manoObra.map(i => i.id === id ? { ...i, ...updates } : i);
                    const newEq = state.equipos.map(i => i.id === id ? { ...i, ...updates } : i);
                    return { materiales: newMats, manoObra: newMO, equipos: newEq };
                });
            },

            importDefaults: () => {
                // TODO: Add some starter values if empty
            }
        }),
        {
            name: 'apu-library-storage',
        }
    )
);
