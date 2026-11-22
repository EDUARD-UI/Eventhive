import React from 'react';

/**
 * AppErrorBoundary
 * Captura excepciones críticas de renderizado o desconexión de red y redirige a la página 404 oficial de Event Hive.
 */
export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Fallo crítico en componente:', error, errorInfo);
    if (typeof window !== 'undefined' && window.location.pathname !== '/404') {
      window.location.assign('/404');
    }
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('offline', this.handleOffline);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  handleOffline = () => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/404') {
      window.location.assign('/404');
    }
  };

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
