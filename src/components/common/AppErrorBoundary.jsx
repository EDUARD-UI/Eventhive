import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error al renderizar la interfaz:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900">
          <h1 className="text-2xl font-black">No pudimos mostrar esta pantalla</h1>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Ocurrió un error inesperado. Intenta cargar la página nuevamente.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400"
          >
            Volver a cargar
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
