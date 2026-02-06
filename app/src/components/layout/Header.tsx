import { useProyectoStore } from '../../store/useProyectoStore';

export const Header = () => {
    const { proyectoActual } = useProyectoStore();

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
            {/* Left: Project Context */}
            <div className="flex items-center gap-2">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <span className="material-symbols-outlined">apartment</span>
                </div>
                <div>
                    <h1 className="text-sm font-bold text-slate-900 leading-tight">
                        {proyectoActual?.nombre || 'Nuevo Proyecto'}
                    </h1>
                    <p className="text-xs text-slate-500">
                        {proyectoActual ? `Ubicación: ${proyectoActual.ubicacion}` : 'Configuración Inicial'}
                    </p>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                </div>

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                        <span className="material-symbols-outlined text-xl">notifications</span>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                        <span className="material-symbols-outlined text-xl">help</span>
                    </button>
                </div>

                <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    Exportar
                </button>
            </div>
        </header>
    );
};
