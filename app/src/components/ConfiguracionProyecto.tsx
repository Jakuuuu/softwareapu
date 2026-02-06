import { useForm } from 'react-hook-form';
import { useProyectoStore } from '../store/useProyectoStore';
import type { Proyecto, TipoObra } from '../types';

type FormValues = {
    nombre: string;
    ubicacion: string;
    propietario: string;
    tipoObra: TipoObra;
    iva: number;
    utilidad: number;
    administracion: number;
    fcas: number;
};

export const ConfiguracionProyecto = () => {
    const { setProyecto, proyectoActual } = useProyectoStore();

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            nombre: proyectoActual?.nombre || '',
            ubicacion: proyectoActual?.ubicacion || '',
            propietario: proyectoActual?.propietario || '',
            tipoObra: proyectoActual?.tipoObra || 'EDIFICACION',
            iva: proyectoActual?.factoresGlobales.iva || 16,
            utilidad: proyectoActual?.factoresGlobales.utilidad || 12,
            administracion: proyectoActual?.factoresGlobales.administracion || 12,
            fcas: proyectoActual?.factoresGlobales.fcas || 72,
        }
    });

    const currentWorkType = watch('tipoObra');

    const onSubmit = (data: FormValues) => {
        const nuevoProyecto: Proyecto = {
            id: proyectoActual?.id || crypto.randomUUID(),
            nombre: data.nombre,
            ubicacion: data.ubicacion,
            propietario: data.propietario,
            tipoObra: data.tipoObra,
            factoresGlobales: {
                iva: Number(data.iva),
                utilidad: Number(data.utilidad),
                administracion: Number(data.administracion),
                fcas: Number(data.fcas),
            },
            fechaCreacion: proyectoActual?.fechaCreacion || new Date().toISOString(),
            partidas: proyectoActual?.partidas || [],
        };
        setProyecto(nuevoProyecto);
        // Note: Navigation is handled by App.tsx observing proyectoActual
    };

    const workTypes: { id: TipoObra, label: string, icon: string }[] = [
        { id: 'EDIFICACION', label: 'Edificación', icon: 'apartment' },
        { id: 'VIALIDAD', label: 'Vialidad', icon: 'add_road' },
        { id: 'HOSPITAL', label: 'Hospital', icon: 'local_hospital' },
        { id: 'SIERRA', label: 'Sierra', icon: 'landscape' },
    ];

    return (
        <div className="flex flex-col h-full min-h-screen bg-background-light text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-white/90 backdrop-blur-md p-4 border-b border-gray-200">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <span className="material-symbols-outlined">edit_document</span>
                </div>
                <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Configuración del Proyecto</h1>
                <div className="w-10"></div> {/* Spacer for alignment */}
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col p-4 gap-6 pb-28 max-w-2xl mx-auto w-full">

                {/* Identification */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Identificación</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 mb-1.5 block">Nombre del Proyecto</span>
                            <input
                                {...register('nombre', { required: true })}
                                className="w-full rounded-lg border-gray-300 bg-white focus:border-primary focus:ring-primary h-12 px-4 shadow-sm text-base transition-shadow"
                                placeholder="Ej. Residencial Los Pinos"
                            />
                            {errors.nombre && <span className="text-xs text-red-500">Requerido</span>}
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 mb-1.5 block">Ubicación</span>
                            <div className="relative flex items-center">
                                <input
                                    {...register('ubicacion', { required: true })}
                                    className="w-full rounded-lg border-gray-300 bg-white focus:border-primary focus:ring-primary h-12 pl-4 pr-12 shadow-sm text-base transition-shadow"
                                    placeholder="Ciudad, Estado"
                                />
                                <span className="absolute right-2 p-2 text-primary">
                                    <span className="material-symbols-outlined">location_on</span>
                                </span>
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 mb-1.5 block">Propietario / Cliente</span>
                            <input
                                {...register('propietario', { required: true })}
                                className="w-full rounded-lg border-gray-300 bg-white focus:border-primary focus:ring-primary h-12 px-4 shadow-sm text-base transition-shadow"
                                placeholder="Nombre del Cliente"
                            />
                        </label>
                    </div>
                </section>

                {/* Type of Work */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary text-[20px]">category</span>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Tipo de Obra</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {workTypes.map((type) => (
                            <div
                                key={type.id}
                                onClick={() => setValue('tipoObra', type.id)}
                                className={`
                                    cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all h-28
                                    ${currentWorkType === type.id
                                        ? 'border-primary bg-blue-50 ring-1 ring-primary'
                                        : 'border-gray-200 bg-white hover:border-primary/50'
                                    }
                                `}
                            >
                                <span className={`material-symbols-outlined text-3xl mb-2 transition-colors ${currentWorkType === type.id ? 'text-primary' : 'text-gray-400'}`}>
                                    {type.icon}
                                </span>
                                <span className={`text-sm font-medium text-center ${currentWorkType === type.id ? 'text-primary' : 'text-slate-700'}`}>
                                    {type.label}
                                </span>
                                {currentWorkType === type.id && (
                                    <div className="absolute top-2 right-2 text-primary">
                                        <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Global Factors */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary text-[20px]">settings</span>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Factores Globales</h2>
                    </div>
                    <div className="rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 mb-5 font-medium">Porcentajes base para el análisis de precios unitarios.</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                            <InputPercentage label="IVA" name="iva" register={register} />
                            <InputPercentage label="Utilidad" name="utilidad" register={register} />
                            <InputPercentage label="Administración" name="administracion" register={register} />
                            <InputPercentage label="FCAS" name="fcas" register={register} />
                        </div>
                    </div>
                </section>

                {/* Footer Action */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-40 rounded-b-2xl">
                    <div className="max-w-2xl mx-auto">
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-14 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            Continuar al Presupuesto
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

// Helper Component for Percentages
const InputPercentage = ({ label, name, register }: { label: string, name: keyof FormValues, register: any }) => (
    <div className="flex flex-col">
        <div className="flex items-center gap-1 mb-1.5 ml-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
        </div>
        <div className="relative flex items-center">
            <input
                {...register(name, { required: true, min: 0 })}
                type="number"
                step="0.1"
                className="w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary h-11 pl-3 pr-8 font-semibold text-slate-800 text-right transition-colors"
                placeholder="0"
            />
            <span className="absolute right-3 text-gray-400 font-medium text-sm">%</span>
        </div>
    </div>
);
