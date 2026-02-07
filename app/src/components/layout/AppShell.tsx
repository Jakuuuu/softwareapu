import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { type ReactNode } from 'react';

interface AppShellProps {
    children: ReactNode;
    onExportPDF?: () => void;
    onExportJSON?: () => void;
    onImportJSON?: () => void;
}

export const AppShell = ({ children, onExportPDF, onExportJSON, onImportJSON }: AppShellProps) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-20 md:ml-64 transition-all duration-300 flex flex-col min-h-screen">
                <Header
                    onExportPDF={onExportPDF}
                    onExportJSON={onExportJSON}
                    onImportJSON={onImportJSON}
                />
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
