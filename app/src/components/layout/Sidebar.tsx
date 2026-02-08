import { useProyectoStore } from '../../store/useProyectoStore';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SidebarItem {
    icon: string;
    label: string;
    view: string;
}

const ITEMS: SidebarItem[] = [
    { icon: 'dashboard', label: 'Dashboard', view: 'dashboard' },
    { icon: 'format_list_bulleted', label: 'Presupuesto', view: 'presupuesto' },
    { icon: 'inventory_2', label: 'Insumos', view: 'insumos' },
    { icon: 'groups', label: 'Mano de Obra', view: 'mano_obra' },
    { icon: 'agriculture', label: 'Equipos', view: 'equipos' },
    { icon: 'history', label: 'Versiones', view: 'versiones' },
    { icon: 'calendar_month', label: 'Cronograma', view: 'cronograma' },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { currentView, setCurrentView } = useProyectoStore();

    // Bottom items (Config)
    const handleNavigation = (view: string) => {
        setCurrentView(view);
        onClose(); // Close sidebar on mobile/tablet after selection
    };

    return (
        <>
            {/* Backdrop Overlay */}
            <div
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-72 z-50 
                    bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 
                    text-white shadow-2xl transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Header / Logo Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md border border-white/10">
                            <span className="material-symbols-outlined text-blue-200">calculate</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight text-white leading-none">APU Software</h1>
                            <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Control de Obra</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
                    <p className="px-4 py-2 text-xs font-bold text-blue-300/60 uppercase tracking-widest">Menú Principal</p>
                    {ITEMS.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => handleNavigation(item.view)}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === item.view
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-medium'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${currentView === item.view ? 'text-white' : 'text-slate-400 group-hover:text-blue-200'}`}>
                                {item.icon}
                            </span>
                            <span className="ml-3 text-sm">{item.label}</span>
                            {currentView === item.view && (
                                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer / Config */}
                <div className="absolute bottom-0 w-full p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
                    <button
                        onClick={() => handleNavigation('configuracion')}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'configuracion'
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-white">settings</span>
                        <div className="ml-3 text-left">
                            <span className="block text-sm font-medium">Configuración</span>
                            <span className="block text-[10px] text-slate-400">Preferencias del proyecto</span>
                        </div>
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                        <span>v1.0.0</span>
                    </div>
                </div>
            </aside>
        </>
    );
};
