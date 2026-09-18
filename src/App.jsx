import { useState, useEffect } from 'react';
import { FlaskConical, Workflow } from 'lucide-react';
import LabTracker from './LabTracker.jsx';
import ProcessFlowBoard from './components/ProcessFlowBoard.jsx';

const ROUTES = { flow: 'flow', labs: 'labs' };

function routeFromHash() {
  return window.location.hash === '#/process-flow' ? ROUTES.flow : ROUTES.labs;
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goTo = (next) => {
    window.location.hash = next === ROUTES.flow ? '#/process-flow' : '#/';
  };

  return (
    <div>
      <div className="bg-stone-800 text-stone-300 text-xs">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1">
          <button
            onClick={() => goTo(ROUTES.labs)}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-colors border-b-2 ${
              route === ROUTES.labs ? 'text-white border-teal-400' : 'border-transparent hover:text-white'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Lab Tracker
          </button>
          <button
            onClick={() => goTo(ROUTES.flow)}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-colors border-b-2 ${
              route === ROUTES.flow ? 'text-white border-cyan-400' : 'border-transparent hover:text-white'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            Process Flow
          </button>
        </div>
      </div>

      {route === ROUTES.flow ? <ProcessFlowBoard /> : <LabTracker />}
    </div>
  );
}
