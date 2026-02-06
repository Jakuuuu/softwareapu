import { useProyectoStore } from '../store/useProyectoStore';
import { generarPDFPresupuesto } from '../utils/exportPDF';
import { Button } from './ui/Button';

// This component can be expanded to show a preview later
export const ReporteFinal = () => {
    const { proyectoActual } = useProyectoStore();

    const handleDownload = () => {
        if (proyectoActual) {
            try {
                generarPDFPresupuesto(proyectoActual);
            } catch (error) {
                console.error("Error generating PDF:", error);
                alert("Hubo un error al generar el reporte. Por favor revisa que todos los datos del proyecto estén completos.");
            }
        }
    };

    if (!proyectoActual) return null;

    return (
        <div className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">Reporte de Presupuesto</h2>
            <p>Genera un archivo PDF profesional con el detallado del proyecto.</p>

            <div className="flex justify-center gap-4">
                <Button onClick={handleDownload}>
                    📄 Descargar PDF
                </Button>
            </div>
        </div>
    );
};
