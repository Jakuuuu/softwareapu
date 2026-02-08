import { useState } from 'react';
import { useProyectoStore } from '../../store/useProyectoStore';

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
    { icon: 'settings', label: 'Configuración', view: 'configuracion' },
];

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { currentView, setCurrentView } = useProyectoStore();

    return (
        <aside className={`bg-slate-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 z-50 ${collapsed ? 'w-20' : 'w-64'}`}>
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                {!collapsed && <span className="text-xl font-bold tracking-tight text-blue-400">Boostear</span>}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400"
                >
                    <span className="material-symbols-outlined">
                        {collapsed ? 'menu_open' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {ITEMS.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => setCurrentView(item.view)}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${currentView === item.view
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                        {!collapsed && <span className="ml-3 font-medium text-sm">{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* User Profile / Status */}
            <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-xs font-bold">JD</span>
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Juan David</p>
                            <p className="text-xs text-slate-500 truncate">Ingeniero Jefe</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
