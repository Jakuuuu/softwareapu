import { useProyectoStore } from './store/useProyectoStore';
import { ConfiguracionProyecto } from './components/ConfiguracionProyecto';
import { ListaPartidas } from './components/ListaPartidas';
import { EditorAPU } from './components/EditorAPU';
import { FCASCalculator } from './components/FCASCalculator';
import { AppShell } from './components/layout/AppShell';

function App() {
  const { proyectoActual, partidaEditando, resetProyecto } = useProyectoStore();

  return (
    <AppShell>
      {!proyectoActual ? (
        <div className="max-w-3xl mx-auto">
          <ConfiguracionProyecto />
          <div className="mt-8 border-t pt-8">
            <FCASCalculator />
          </div>
        </div>
      ) : partidaEditando ? (
        <EditorAPU />
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          <ListaPartidas />

          {/* Reset Button (Development/Emergency) */}
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
        </div>
      )}
    </AppShell>
  );
}

export default App;
