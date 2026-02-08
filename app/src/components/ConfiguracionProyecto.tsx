import { useForm, type UseFormRegister } from 'react-hook-form';
import { useProyectoStore } from '../store/useProyectoStore';
import type { Proyecto, TipoObra } from '../types';

type FormValues = {
    nombre: string;
    ubicacion: string;
    propietario: string;
    // Ingeniero
    ingNombre: string;
    ingCiv: string;
    ingCargo: string;
    // Obra
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
            ingNombre: proyectoActual?.ingeniero?.nombre || '',
            ingCiv: proyectoActual?.ingeniero?.civ || '',
            ingCargo: proyectoActual?.ingeniero?.cargo || 'Ingeniero Residente',
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
            ingeniero: {
                nombre: data.ingNombre,
                civ: data.ingCiv,
                cargo: data.ingCargo
            },
            tipoObra: data.tipoObra,
            tipoObraOtro: data.tipoObra === 'OTRO' ? data.tipoObraOtro : undefined,
            config: {
                ...defaultConfig,
                tasaCambio: Number(data.tasaCambio),
                iva: Number(data.iva),
                utilidad: Number(data.utilidad),
                administracion: Number(data.administracion),
                fcas: {
                    ...defaultConfig.fcas,
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
        <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-slate-900 to-blue-900 -z-0 rounded-b-[3rem] shadow-2xl"></div>
            <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-20 left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>

            {/* Main Container */}
            <div className="z-10 w-full max-w-4xl px-4 py-8 flex flex-col items-center">

                {/* Branding Header */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl mb-4">
                        <span className="material-symbols-outlined text-4xl text-blue-200">calculate</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                        APU Software
                    </h1>
                    <p className="text-blue-200 mt-2 text-lg font-medium tracking-wide">
                        Control Integral de Obras
                    </p>
                </div>

                {/* Configuration Card */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150"
                >
                    {/* Card Header */}
                    <div className="bg-slate-50 border-b border-slate-100 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/30">
                                <span className="material-symbols-outlined text-lg">settings</span>
                            </span>
                            Configuración Inicial del Proyecto
                        </h2>
                        <p className="text-slate-500 mt-1 ml-11 text-sm">
                            Complete los datos básicos para iniciar su presupuesto.
                        </p>
                    </div>

                    <div className="p-6 md:p-8 space-y-10">

                        {/* SECTION 1: IDENTIFICATION */}
                        <section className="space-y-5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-slate-300"></span> Identificación
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">Nombre del Proyecto</label>
                                    <input
                                        {...register('nombre', { required: true })}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border-slate-200 border focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium placeholder:text-slate-400"
                                        placeholder="Ej. Residencias Vista Al Mar"
                                    />
                                    {errors.nombre && <span className="text-xs text-red-500 font-medium ml-1">Requerido</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Ubicación</label>
                                    <div className="relative">
                                        <input
                                            {...register('ubicacion', { required: true })}
                                            className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-50 border-slate-200 border focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium placeholder:text-slate-400"
                                            placeholder="Ciudad, Estado"
                                        />
                                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400">location_on</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Cliente / Propietario</label>
                                    <div className="relative">
                                        <input
                                            {...register('propietario', { required: true })}
                                            className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-50 border-slate-200 border focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium placeholder:text-slate-400"
                                            placeholder="Nombre del Cliente"
                                        />
                                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400">person</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 1.5: ENGINEER / RESPONSIBLE */}
                        <section className="space-y-5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-slate-300"></span> Datos del Responsable
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Nombre del Ingeniero</label>
                                    <input
                                        {...register('ingNombre')}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border-slate-200 border focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium placeholder:text-slate-400"
                                        placeholder="Ing. Juan Pérez"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">C.I.V.</label>
                                    <input
                                        {...register('ingCiv')}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border-slate-200 border focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium placeholder:text-slate-400"
                                        placeholder="000.000"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">Cargo</label>
                                    <input
                                        {...register('ingCargo')}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border-slate-200 border focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium placeholder:text-slate-400"
                                        placeholder="Ingeniero Residente"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* SECTION 2: TIPO DE OBRA */}
                        <section className="space-y-5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-slate-300"></span> Tipo de Obra
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {workTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => setValue('tipoObra', type.id)}
                                        className={`
                                            cursor-pointer group relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 h-28
                                            ${currentWorkType === type.id
                                                ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600/20'
                                                : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg hover:-translate-y-1'
                                            }
                                        `}
                                    >
                                        <span className={`material-symbols-outlined text-3xl mb-2 transition-colors ${currentWorkType === type.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`}>
                                            {type.icon}
                                        </span>
                                        <span className={`text-xs font-bold text-center ${currentWorkType === type.id ? 'text-blue-700' : 'text-slate-500'}`}>
                                            {type.label}
                                        </span>
                                        {currentWorkType === type.id && (
                                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                                                <span className="material-symbols-outlined text-sm block">check</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {currentWorkType === 'OTRO' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <input
                                        {...register('tipoObraOtro', { required: currentWorkType === 'OTRO' })}
                                        className="w-full h-12 px-4 rounded-xl bg-blue-50/50 border-blue-200 border focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium placeholder:text-blue-300 text-blue-900"
                                        placeholder="Especifique el tipo de obra..."
                                        autoFocus
                                    />
                                </div>
                            )}
                        </section>

                        {/* SECTION 3: ECONOMY */}
                        <section className="space-y-5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-slate-300"></span> Datos Económicos
                            </h3>

                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Main Rate */}
                                    <div className="md:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                                        <div className="size-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-green-600">currency_exchange</span>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Tasa de Cambio (Bs/USD)</label>
                                            <input
                                                {...register('tasaCambio', { required: true, min: 0 })}
                                                type="number"
                                                step="0.01"
                                                className="w-full text-2xl font-black text-slate-800 bg-transparent outline-none placeholder:text-slate-300"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Percentages Grid */}
                                    <InputPercentage label="I.V.A." name="iva" register={register} icon="percent" />
                                    <InputPercentage label="Utilidad" name="utilidad" register={register} icon="trending_up" />
                                    <InputPercentage label="Gastos Admin." name="administracion" register={register} icon="business_center" />
                                    <InputPercentage label="FCAS Total" name="fcasFactor" register={register} icon="group" />

                                </div>

                                {/* FCAS Details Toggle/Section */}
                                <div className="mt-6 pt-6 border-t border-slate-200/60">
                                    <h4 className="text-xs font-bold text-slate-400 mb-4">DETALLES FCAS</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <InputNumber label="Días Feriados" name="diasFeriados" register={register} />
                                        <InputNumber label="Días Utilid." name="diasUtilidades" register={register} />
                                        <InputNumber label="Días Vacac." name="diasVacaciones" register={register} />
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Footer / Submit */}
                    <div className="bg-slate-50 p-6 md:p-8 border-t border-slate-100 flex flex-col md:flex-row items-center gap-4 justify-between">
                        <p className="text-xs text-slate-400 text-center md:text-left">
                            Al continuar, se creará un nuevo archivo de proyecto local.
                        </p>
                        <button
                            type="submit"
                            className="w-full md:w-auto px-8 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            Iniciar Proyecto
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </form>

                {/* Footer Brand */}
                <div className="mt-8 text-center text-slate-400 text-sm">
                    &copy; {new Date().getFullYear()} APU Software. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
};

// Helper Components
const InputPercentage = ({ label, name, register, icon }: { label: string, name: keyof FormValues, register: UseFormRegister<FormValues>, icon: string }) => (
    <div className="bg-white p-3 rounded-xl border border-slate-100 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-sm">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
            {label}
        </label>
        <div className="flex items-center">
            <input
                {...register(name, { required: true, min: 0 })}
                type="number"
                step="0.1"
                className="w-full font-bold text-slate-700 outline-none text-lg"
                placeholder="0"
            />
            <span className="text-slate-400 font-bold ml-1">%</span>
        </div>
    </div>
);

const InputNumber = ({ label, name, register }: { label: string, name: keyof FormValues, register: UseFormRegister<FormValues> }) => (
    <div className="bg-white p-3 rounded-xl border border-slate-100 focus-within:border-blue-500 transition-all shadow-sm">
        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{label}</label>
        <input
            {...register(name, { required: true, min: 0 })}
            type="number"
            step="1"
            className="w-full font-bold text-slate-700 outline-none text-base"
            placeholder="0"
        />
    </div>
);
