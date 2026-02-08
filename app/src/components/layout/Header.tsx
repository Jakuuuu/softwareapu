import { useState, useRef, useEffect } from 'react';
import { useProyectoStore } from '../../store/useProyectoStore';


interface HeaderProps {
    onExportPDF?: () => void;
    onExportJSON?: () => void;
    onImportJSON?: () => void;
    onToggleSidebar: () => void;
}

export const Header = ({ onExportPDF, onExportJSON, onImportJSON, onToggleSidebar }: HeaderProps) => {
    const { proyectoActual, actualizarProyecto } = useProyectoStore();
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleEditClick = () => {
        if (!proyectoActual) return;
        setTempName(proyectoActual.nombre);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (tempName.trim()) {
            actualizarProyecto({ nombre: tempName.trim() });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') setIsEditing(false);
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-sm">
            {/* Left: Hamburger + Project Context */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                    title="Menu Principal"
                >
                    <span className="material-symbols-outlined text-[28px]">menu</span>
                </button>

                <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg hidden md:flex">
                        <span className="material-symbols-outlined">apartment</span>
                    </div>
                    <div>
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={handleKeyDown}
                                className="text-sm font-bold text-slate-900 leading-tight border-b-2 border-blue-500 outline-none w-48 md:w-64 p-0 bg-transparent"
                            />
                        ) : (
                            <h1
                                className={`text-sm font-bold text-slate-900 leading-tight ${proyectoActual ? 'cursor-pointer hover:text-blue-600' : ''}`}
                                onClick={handleEditClick}
                                title="Haz clic para editar el nombre"
                            >
                                {proyectoActual?.nombre || 'Nuevo Proyecto'}
                            </h1>
                        )}
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">location_on</span>
                            {proyectoActual ? proyectoActual.ubicacion : 'Sin ubicación'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-3">
                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={onImportJSON}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors"
                        title="Importar Proyecto (JSON)"
                    >
                        <span className="material-symbols-outlined text-xl">upload_file</span>
                    </button>
                    <button
                        onClick={onExportJSON}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors"
                        title="Guardar Respaldo (JSON)"
                    >
                        <span className="material-symbols-outlined text-xl">save</span>
                    </button>
                </div>

                <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

                <button
                    onClick={onExportPDF}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                >
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    <span className="hidden md:inline">Exportar</span>
                    <span className="md:hidden">PDF</span>
                </button>
            </div>
        </header>
    );
};
