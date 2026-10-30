import { useEffect } from 'react';

/**
 * useDashboardTheme
 * Asegura que los paneles administrativos, de moderación, marketing y organizador
 * mantengan de forma consistente su paleta clara y profesional con tarjetas blancas.
 * Evita que el modo oscuro global de las páginas públicas afecte a las tablas, modales
 * o componentes de estos dashboards.
 * Al salir del dashboard, restaura inmediatamente el tema preferido del usuario.
 */
export function useDashboardTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = localStorage.getItem('eventhive_theme') || 'dark';

    // Establecer modo claro para el entorno de trabajo del dashboard
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';

    return () => {
      // Al salir del panel y regresar al frontend público, restaurar la preferencia
      if (previousTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
    };
  }, []);
}
