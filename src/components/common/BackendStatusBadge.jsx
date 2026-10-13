import React, { useState, useEffect } from 'react';
import {
  Server,
  Laptop,
  Cloud,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getActiveBackend,
  getApiBaseUrl,
  getFallbackState,
  setBackendTarget,
  resetToRender,
  subscribeBackendChanges,
  testBackendConnection,
  RENDER_API_URL,
  LOCAL_API_URL,
} from '../../config/api.js';

export default function BackendStatusBadge() {
  const [backendState, setBackendState] = useState(() => ({
    target: getActiveBackend(),
    url: getApiBaseUrl(),
    isFallback: getFallbackState().isFallback,
    reason: getFallbackState().reason,
    renderUrl: RENDER_API_URL,
    localUrl: LOCAL_API_URL,
  }));

  const [isOpen, setIsOpen] = useState(false);
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeBackendChanges((state) => {
      setBackendState(state);
      if (state.isFallback) {
        setShowFallbackBanner(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSwitch = (newTarget) => {
    setBackendTarget(newTarget);
    setTestResults(null);
  };

  const handleTestConnections = async () => {
    setTesting(true);
    setTestResults(null);
    const [renderRes, localRes] = await Promise.all([
      testBackendConnection(RENDER_API_URL),
      testBackendConnection(LOCAL_API_URL),
    ]);
    setTestResults({
      render: renderRes,
      local: localRes,
    });
    setTesting(false);
  };

  const isLocal = backendState.target === 'local';

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2 select-none font-sans">
      {/* 1. Banner flotante cuando ocurre el Fallback automático */}
      {showFallbackBanner && backendState.isFallback && (
        <div className="w-[320px] sm:w-[380px] bg-amber-950/90 border border-amber-500/70 text-amber-100 rounded-xl p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Render no disponible
                </p>
                <p className="text-xs text-amber-100/90 mt-0.5">
                  El servidor en la nube no respondió ({backendState.reason || 'Sin conexión'}).
                </p>
                <p className="text-xs text-emerald-300 font-medium mt-1">
                  👉 Conmutado a backend local:{' '}
                  <span className="font-mono bg-amber-900/60 px-1 py-0.5 rounded text-amber-200">
                    localhost:8080
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFallbackBanner(false)}
              className="text-amber-400/80 hover:text-white p-1 rounded transition-colors"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-amber-800/60 flex items-center justify-end gap-2 text-xs">
            <button
              onClick={() => {
                resetToRender();
                setShowFallbackBanner(false);
              }}
              className="px-2.5 py-1 rounded-md bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/60 transition-colors"
            >
              Reintentar Render
            </button>
            <button
              onClick={() => setShowFallbackBanner(false)}
              className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors"
            >
              Usar Local 8080
            </button>
          </div>
        </div>
      )}

      {/* 2. Panel desplegable con controles de backend */}
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md text-slate-200 text-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white text-sm">Servidor Backend</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-400 mt-2 mb-3">
            Selecciona qué backend debe atender las peticiones de EventHive:
          </p>

          <div className="space-y-2">
            {/* Opción Render */}
            <button
              type="button"
              onClick={() => handleSwitch('render')}
              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between ${
                backendState.target === 'render'
                  ? 'bg-amber-500/10 border-amber-500/80 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Cloud
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    backendState.target === 'render' ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">Nube (Render)</span>
                    {backendState.target === 'render' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                        ACTIVO
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono break-all block mt-0.5">
                    {RENDER_API_URL}
                  </span>
                </div>
              </div>
              {testResults?.render && (
                <div className="shrink-0 ml-2">
                  {testResults.render.ok ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-semibold" title={testResults.render.error}>
                      <XCircle className="w-3.5 h-3.5" /> Offline
                    </span>
                  )}
                </div>
              )}
            </button>

            {/* Opción Localhost */}
            <button
              type="button"
              onClick={() => handleSwitch('local')}
              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between ${
                backendState.target === 'local'
                  ? 'bg-amber-500/10 border-amber-500/80 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Laptop
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    backendState.target === 'local' ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">Local (localhost:8080)</span>
                    {backendState.target === 'local' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                        {backendState.isFallback ? 'FALLBACK ACTIVO' : 'ACTIVO'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {LOCAL_API_URL}
                  </span>
                </div>
              </div>
              {testResults?.local && (
                <div className="shrink-0 ml-2">
                  {testResults.local.ok ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-semibold" title={testResults.local.error}>
                      <XCircle className="w-3.5 h-3.5" /> Offline
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleTestConnections}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-amber-400' : ''}`} />
              {testing ? 'Comprobando...' : 'Probar conexión'}
            </button>

            <span className="text-[11px] text-slate-400">
              {isLocal ? 'Usando Backend Local' : 'Usando Backend Nube'}
            </span>
          </div>
        </div>
      )}

      {/* 3. Píldora / Botón activador minimalista */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md border transition-all cursor-pointer ${
          isLocal
            ? 'bg-slate-900/90 hover:bg-slate-800/90 text-amber-300 border-amber-500/50 hover:border-amber-400'
            : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 border-slate-700 hover:border-slate-500'
        }`}
        title="Clic para ver o cambiar backend activo (Render / Localhost 8080)"
      >
        <span className="relative flex h-2 w-2">
          {isLocal ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          )}
        </span>

        {isLocal ? (
          <span className="flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-amber-400" />
            <span>Backend: <strong className="font-semibold text-white">localhost:8080</strong></span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Backend: <strong className="font-semibold text-slate-200">Render</strong></span>
          </span>
        )}

        {isOpen ? <ChevronDown className="w-3.5 h-3.5 opacity-70" /> : <ChevronUp className="w-3.5 h-3.5 opacity-70" />}
      </button>
    </div>
  );
}
