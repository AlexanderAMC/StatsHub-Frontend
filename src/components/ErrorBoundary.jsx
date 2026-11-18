import { Component } from 'react';

// Evita que un error de render deje la pantalla en blanco: muestra un aviso y permite recargar.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado en la interfaz:', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
        <div className="text-center" role="alert" style={{ maxWidth: '420px' }}>
          <h1 className="h4 fw-bold mb-2">Algo salió mal</h1>
          <p className="text-muted mb-4">
            Ocurrió un error inesperado al mostrar esta pantalla. Puedes recargar la página para continuar.
          </p>
          <button type="button" className="btn btn-dark" onClick={() => window.location.reload()}>
            Recargar
          </button>
        </div>
      </div>
    );
  }
}
