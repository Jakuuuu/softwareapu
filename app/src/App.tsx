import { useProyectoStore } from './store/useProyectoStore';
import { ConfiguracionProyecto } from './components/ConfiguracionProyecto';
import { ListaPartidas } from './components/ListaPartidas';
import { EditorAPU } from './components/EditorAPU';

function App() {
  const { proyectoActual, partidaEditando } = useProyectoStore();

  if (!proyectoActual) {
    return (
      <div className="min-h-screen bg-gray-100 py-10">
        <ConfiguracionProyecto />
      </div>
    );
  }

  if (partidaEditando) {
    return <EditorAPU />
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <ListaPartidas />
    </div>
  );
}

export default App;
