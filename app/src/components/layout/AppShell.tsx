import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useState, type ReactNode } from 'react';

interface AppShellProps {
    children: ReactNode;
    onExportPDF?: () => void;
    onExportJSON?: () => void;
    onImportJSON?: () => void;
}

export const AppShell = ({ children, onExportPDF, onExportJSON, onImportJSON }: AppShellProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative overflow-hidden">
            {/* Sidebar (Overlay) */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            {/* Note: No margin-left anymore, as sidebar is overlay */}
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full">
                <Header
                    onExportPDF={onExportPDF}
                    onExportJSON={onExportJSON}
                    onImportJSON={onImportJSON}
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                />
                <main className="flex-1 p-4 md:p-8 overflow-auto max-w-[1600px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
