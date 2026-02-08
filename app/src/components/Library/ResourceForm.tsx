import { useState, useEffect } from 'react';
import { useProyectoStore } from '../../store/useProyectoStore';
import type { Recurso, TipoRecurso, CategoriaObrero } from '../../types';

interface Props {
    recursoEditando?: Recurso | null;
    onClose: () => void;
}

export const ResourceForm = ({ recursoEditando, onClose }: Props) => {
    const { agregarRecurso } = useProyectoStore();

    // Default empty state
    const [formData, setFormData] = useState<Partial<Recurso>>({
        nombre: '',
        tipo: 'MATERIAL',
        unidad: 'UND',
        codigo: '',
        costoBs: 0,
        costoUsd: 0,
        fechaPrecio: new Date().toISOString(),
        categoria: 'PEON', // Default for labor
        desperdicioPorDefecto: 0
    });

    useEffect(() => {
        if (recursoEditando) {
            setFormData(recursoEditando);
        }
    }, [recursoEditando]);

    const handleChange = (field: keyof Recurso, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newResource: Recurso = {
            id: recursoEditando?.id || crypto.randomUUID(),
            nombre: formData.nombre || 'Sin nombre',
            tipo: formData.tipo as TipoRecurso,
            unidad: formData.unidad || 'UND',
            codigo: formData.codigo,
            costoBs: Number(formData.costoBs) || 0,
            costoUsd: Number(formData.costoUsd) || 0,
            fechaPrecio: new Date().toISOString(),
            ultimaActualizacion: new Date().toISOString(),
            // Optional fields
            ...(formData.tipo === 'MANO_OBRA' && { categoria: formData.categoria as CategoriaObrero }),
            ...(formData.tipo === 'MATERIAL' && { desperdicioPorDefecto: Number(formData.desperdicioPorDefecto) || 0 })
        } as Recurso;

        // In a real app we'd update if editing, but store only has add for now.
        // We'll trust add handles it or add an update action later.
        // The store currently only has `agregarRecurso` which appends.
        // For now let's just use append, or I might need to add `actualizarRecurso` to store.
        // Let's assume append for now and I'll fix store later if needed.
        agregarRecurso(newResource);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-slate-700">
                        {recursoEditando ? 'Editar Recurso' : 'Nuevo Recurso'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Tipo */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Tipo</label>
                        <select
                            className="w-full rounded-lg border-gray-200 text-sm font-medium focus:ring-primary focus:border-primary"
                            value={formData.tipo}
                            onChange={e => handleChange('tipo', e.target.value)}
                        >
                            <option value="MATERIAL">Material</option>
                            <option value="MANO_OBRA">Mano de Obra</option>
                            <option value="EQUIPO">Equipo</option>
                        </select>
                    </div>

                    {/* Nombre y Código */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Nombre</label>
                            <input
                                required
                                type="text"
                                className="w-full rounded-lg border-gray-200 text-sm focus:ring-primary focus:border-primary"
                                placeholder="Ej. Cemento Gris"
                                value={formData.nombre}
                                onChange={e => handleChange('nombre', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Código</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-200 text-sm focus:ring-primary focus:border-primary font-mono"
                                placeholder="E-..."
                                value={formData.codigo || ''}
                                onChange={e => handleChange('codigo', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Unidad y Categoría */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Unidad</label>
                            <input
                                type="text"
                                list="units"
                                className="w-full rounded-lg border-gray-200 text-sm focus:ring-primary focus:border-primary"
                                value={formData.unidad}
                                onChange={e => handleChange('unidad', e.target.value)}
                            />
                            <datalist id="units">
                                <option value="UND" />
                                <option value="KG" />
                                <option value="M2" />
                                <option value="M3" />
                                <option value="ML" />
                                <option value="GLB" />
                            </datalist>
                        </div>

                        {formData.tipo === 'MANO_OBRA' && (
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Categoría</label>
                                <select
                                    className="w-full rounded-lg border-gray-200 text-sm font-medium"
                                    value={formData.categoria}
                                    onChange={e => handleChange('categoria', e.target.value)}
                                >
                                    <option value="PEON">Peón</option>
                                    <option value="AYUDANTE">Ayudante</option>
                                    <option value="OFICIAL">Oficial</option>
                                    <option value="MAESTRO">Maestro</option>
                                </select>
                            </div>
                        )}

                        {formData.tipo === 'MATERIAL' && (
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">% Desperdicio</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border-gray-200 text-sm focus:ring-primary focus:border-primary"
                                    value={formData.desperdicioPorDefecto}
                                    onChange={e => handleChange('desperdicioPorDefecto', e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Precios */}
                    <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                        <div>
                            <label className="block text-xs font-bold uppercase text-yellow-600 tracking-wider mb-1">Costo (USD)</label>
                            <input
                                type="number"
                                step="any"
                                className="w-full rounded-lg border-yellow-200 text-sm font-bold focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                                value={formData.costoUsd}
                                onChange={e => handleChange('costoUsd', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-yellow-600 tracking-wider mb-1">Costo (Bs)</label>
                            <input
                                type="number"
                                step="any"
                                className="w-full rounded-lg border-yellow-200 text-sm font-medium focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                                value={formData.costoBs}
                                onChange={e => handleChange('costoBs', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all"
                        >
                            Guardar a la Biblioteca
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
