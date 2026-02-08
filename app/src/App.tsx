import { useProyectoStore } from './store/useProyectoStore';
import { ConfiguracionProyecto } from './components/ConfiguracionProyecto';
import { ListaPartidas } from './components/ListaPartidas';
import { EditorAPU } from './components/EditorAPU';
import { FCASCalculator } from './components/FCASCalculator';
import { AppShell } from './components/layout/AppShell';
import { ResourceSummary } from './components/ResourceSummary';
import { generarPDFPresupuesto } from './utils/exportPDF';
import { ProjectSnapshots } from './components/ProjectSnapshots';
import { useRef } from 'react';

function App() {
  const { proyectoActual, partidaEditando, resetProyecto, setProyecto, currentView } = useProyectoStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    if (!proyectoActual) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(proyectoActual, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${(proyectoActual.nombre || "proyecto").replace(/ /g, "_")}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.partidas) {
          setProyecto(json);
          alert("Proyecto importado correctamente.");
        } else {
          alert("El archivo no parece ser un proyecto válido.");
        }
      } catch (err) {
        console.error(err);
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExportPDF = () => {
    if (proyectoActual) {
      generarPDFPresupuesto(proyectoActual);
    }
  };

  // 1. Landing / Config Screen (Full Screen)
  // If no project is loaded, strictly show the Landing Config
  if (!proyectoActual) {
    return <ConfiguracionProyecto />;
  }

  // 2. Main App Logic
  const renderContent = () => {
    if (partidaEditando) {
      return <EditorAPU />;
    }

    switch (currentView) {
      case 'presupuesto':
      case 'dashboard':
        return (
          <div className="max-w-6xl mx-auto space-y-6">
            <ListaPartidas
              onImport={() => fileInputRef.current?.click()}
              onReport={handleExportPDF}
            />
          </div>
        );
      case 'insumos':
        return <ResourceSummary type="materiales" title="Resumen de Materiales" />;
      case 'mano_obra':
        return <ResourceSummary type="manoObra" title="Resumen de Mano de Obra" />;
      case 'equipos':
        return <ResourceSummary type="equipos" title="Resumen de Equipos" />;
      case 'versiones':
        return <div className="max-w-4xl mx-auto h-[calc(100vh-140px)]"><ProjectSnapshots /></div>;
      case 'configuracion':
        // Reuse the component but ensure it fits within the shell layout
        // Note: The new design is full screen, so it might look a bit different inside
        // a container, but it's responsive so it should be fine.
        return <div className="max-w-4xl mx-auto"><ConfiguracionProyecto /></div>;
      default:
        return <ListaPartidas
          onImport={() => fileInputRef.current?.click()}
          onReport={handleExportPDF}
        />;
    }
  };

  return (
    <AppShell
      onExportPDF={handleExportPDF}
      onExportJSON={handleExportJSON}
      onImportJSON={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        style={{ display: 'none' }}
        accept=".json"
      />

      {renderContent()}

      {/* Reset Button (Development/Emergency) - Only show on Dashboard/Presupuesto to avoid clutter */}
      {proyectoActual && !partidaEditando && currentView === 'presupuesto' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              if (confirm('¿Estás seguro de reiniciar todo el proyecto? Se perderán los datos actuales.')) {
                resetProyecto();
              }
            }}
            className="bg-red-100 hover:bg-red-200 text-red-600 p-3 rounded-full shadow-lg transition-colors flex items-center justify-center"
            title="Reiniciar Proyecto"
          >
            <span className="material-symbols-outlined">restart_alt</span>
          </button>
        </div>
      )}
    </AppShell>
  );
}

export default App;
