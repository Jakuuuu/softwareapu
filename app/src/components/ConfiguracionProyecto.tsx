import { useForm, type UseFormRegister } from 'react-hook-form';
import { useProyectoStore } from '../store/useProyectoStore';
import type { Proyecto, TipoObra } from '../types';

type FormValues = {
    nombre: string;
    ubicacion: string;
    propietario: string;
    tipoObra: TipoObra;
    tipoObraOtro?: string;
    iva: number;
    utilidad: number;
    administracion: number;
    // FCAS Components
    fcasFactor: number;
    diasFeriados: number;
    diasUtilidades: number;
    diasVacaciones: number;
    // Tasa
    tasaCambio: number;
};

export const ConfiguracionProyecto = () => {
    const { setProyecto, proyectoActual, setCurrentView } = useProyectoStore();

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            nombre: proyectoActual?.nombre || '',
            ubicacion: proyectoActual?.ubicacion || '',
            propietario: proyectoActual?.propietario || '',
            tipoObra: proyectoActual?.tipoObra || 'EDIFICACION',
            tipoObraOtro: proyectoActual?.tipoObraOtro || '',
            iva: proyectoActual?.config.iva || 16,
            utilidad: proyectoActual?.config.utilidad || 12,
            administracion: proyectoActual?.config.administracion || 12,
            fcasFactor: proyectoActual?.config.fcas.factorTotal || 72,
            diasFeriados: proyectoActual?.config.fcas.diasFeriados || 12,
            diasUtilidades: proyectoActual?.config.fcas.diasUtilidades || 60,
            diasVacaciones: proyectoActual?.config.fcas.diasVacaciones || 15,
            tasaCambio: proyectoActual?.config.tasaCambio || 50.00,
        }
    });

    const currentWorkType = watch('tipoObra');

    const onSubmit = (data: FormValues) => {
        // Create new project structure
        // Note: In a real app we might merge with existing config to preserve other fields like pension settings
        const defaultConfig = proyectoActual?.config || {
            monedaPrincipal: 'USD',
            fuenteTasa: 'BCV_OFICIAL',
            fechaTasa: new Date().toISOString(),
            fcas: {
                porcentajeInces: 2,
                porcentajeIvss: 11,
                porcentajeFaov: 2,
                porcentajePensiones: 9,
                imputacionPensiones: 'COSTO_DIRECTO'
            }
        };

        const nuevoProyecto: Proyecto = {
            id: proyectoActual?.id || crypto.randomUUID(),
            nombre: data.nombre,
            ubicacion: data.ubicacion,
            propietario: data.propietario,
            tipoObra: data.tipoObra,
            tipoObraOtro: data.tipoObra === 'OTRO' ? data.tipoObraOtro : undefined,
            config: {
                ...defaultConfig,
                tasaCambio: Number(data.tasaCambio),
                iva: Number(data.iva),
                utilidad: Number(data.utilidad),
                administracion: Number(data.administracion),
                fcas: {
                    ...defaultConfig.fcas, // Preserve immutable defaults
                    factorTotal: Number(data.fcasFactor),
                    diasFeriados: Number(data.diasFeriados),
                    diasUtilidades: Number(data.diasUtilidades),
                    diasVacaciones: Number(data.diasVacaciones),
                }
            },
            fechaCreacion: proyectoActual?.fechaCreacion || new Date().toISOString(),
            partidas: proyectoActual?.partidas || [],
        };
        setProyecto(nuevoProyecto);
        setCurrentView('presupuesto');
    };

    const workTypes: { id: TipoObra, label: string, icon: string }[] = [
        { id: 'EDIFICACION', label: 'Edificación', icon: 'apartment' },
        { id: 'VIALIDAD', label: 'Vialidad', icon: 'add_road' },
        { id: 'HOSPITAL', label: 'Hospital', icon: 'local_hospital' },
        { id: 'SIERRA', label: 'Sierra', icon: 'landscape' },
        { id: 'OTRO', label: 'Otro', icon: 'construction' },
    ];

    return (
        <div className="flex flex-col h-full min-h-screen bg-background-light text-slate-900">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
                <header className="flex items-center justify-between p-4 max-w-2xl mx-auto w-full">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-primary shadow-sm ring-1 ring-black/5">
                        <span className="material-symbols-outlined">edit_document</span>
                    </div>
                    <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center text-slate-900">
                        Configuración <span className="text-slate-400 font-normal">del Proyecto</span>
                    </h1>
                    <div className="w-10"></div>
                </header>
            </div>

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
                                    cursor-pointer relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all h-32 shadow-sm
                                    ${currentWorkType === type.id
                                        ? 'border-primary bg-blue-50/50 shadow-md scale-[1.02]'
                                        : 'border-slate-200 bg-white hover:border-primary/30 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className={`p-2 rounded-full mb-2 ${currentWorkType === type.id ? 'bg-primary/10' : 'bg-slate-100'}`}>
                                    <span className={`material-symbols-outlined text-3xl transition-colors ${currentWorkType === type.id ? 'text-primary' : 'text-slate-400'}`}>
                                        {type.icon}
                                    </span>
                                </div>
                                <span className={`text-sm font-bold text-center ${currentWorkType === type.id ? 'text-primary' : 'text-slate-600'}`}>
                                    {type.label}
                                </span>
                                {currentWorkType === type.id && (
                                    <div className="absolute top-2 right-2 text-primary bg-white rounded-full flex">
                                        <span className="material-symbols-outlined text-[20px] filled">check_circle</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Custom Work Type Input */}
                    {currentWorkType === 'OTRO' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 mb-1.5 block">Especifique el Tipo de Obra</span>
                                <input
                                    {...register('tipoObraOtro', { required: currentWorkType === 'OTRO' })}
                                    className="w-full rounded-lg border-primary bg-blue-50/20 focus:border-primary focus:ring-primary h-12 px-4 shadow-sm text-base transition-shadow"
                                    placeholder="Ej. Remodelación de Interiores"
                                    autoFocus
                                />
                                {errors.tipoObraOtro && <span className="text-xs text-red-500">Requerido</span>}
                            </label>
                        </div>
                    )}
                </section>

                {/* Economy & FCAS */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary text-[20px]">currency_exchange</span>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Economía & FCAS</h2>
                    </div>
                    <div className="rounded-xl bg-white p-5 border border-gray-200 shadow-sm space-y-5">

                        {/* Exchange Rate */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <label className="block">
                                <span className="text-sm font-bold text-blue-900 mb-1.5 block">Tasa de Cambio (Bs/USD)</span>
                                <div className="relative flex items-center">
                                    <input
                                        {...register('tasaCambio', { required: true, min: 0 })}
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-lg border-blue-200 bg-white focus:border-blue-500 focus:ring-blue-500 h-11 pl-3 pr-12 font-bold text-blue-900 text-right transition-colors shadow-sm"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-3 text-blue-400 font-bold text-sm">Bs</span>
                                </div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                            <InputPercentage label="IVA" name="iva" register={register} />
                            <InputPercentage label="Utilidad" name="utilidad" register={register} />
                            <InputPercentage label="Administración" name="administracion" register={register} />
                            <InputPercentage label="FCAS Total" name="fcasFactor" register={register} />
                        </div>

                        {/* FCAS Breakdown (Simplified) */}
                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase">Detalles FCAS</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <InputNumber label="Días Feriados" name="diasFeriados" register={register} />
                                <InputNumber label="Días Utilid." name="diasUtilidades" register={register} />
                                <InputNumber label="Días Vacac." name="diasVacaciones" register={register} />
                            </div>
                            <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Ley de Pensiones 2025</p>
                                    <p className="text-xs text-slate-500">Incluir 9% en estructura de costos</p>
                                </div>
                                <div className="text-xs font-bold text-primary bg-blue-50 px-2 py-1 rounded">
                                    Automático
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Action */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-40 rounded-b-2xl">
                    <div className="max-w-2xl mx-auto">
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-14 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                            Continuar al Presupuesto
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

// Helper Component for Percentages
const InputPercentage = ({ label, name, register }: { label: string, name: keyof FormValues, register: UseFormRegister<FormValues> }) => (
    <div className="flex flex-col group">
        <div className="flex items-center gap-1 mb-1.5 ml-1">
            <label className="text-xs font-semibold text-slate-500 uppercase group-focus-within:text-primary transition-colors">{label}</label>
        </div>
        <div className="relative flex items-center">
            <input
                {...register(name, { required: true, min: 0 })}
                type="number"
                step="0.1"
                className="w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary h-11 pl-3 pr-8 font-semibold text-slate-800 text-right transition-colors shadow-sm"
                placeholder="0"
            />
            <span className="absolute right-3 text-gray-400 font-medium text-sm">%</span>
        </div>
    </div>
);

// Helper Component for Numbers
const InputNumber = ({ label, name, register }: { label: string, name: keyof FormValues, register: UseFormRegister<FormValues> }) => (
    <div className="flex flex-col group">
        <div className="flex items-center gap-1 mb-1.5 ml-1">
            <label className="text-xs font-semibold text-slate-500 uppercase group-focus-within:text-primary transition-colors">{label}</label>
        </div>
        <div className="relative flex items-center">
            <input
                {...register(name, { required: true, min: 0 })}
                type="number"
                step="1"
                className="w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary h-9 px-2 font-medium text-slate-800 text-right transition-colors shadow-sm text-sm"
                placeholder="0"
            />
        </div>
    </div>
);
