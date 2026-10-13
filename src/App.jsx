import AppRouter from './routes/AppRouter.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import BackendStatusBadge from './components/common/BackendStatusBadge.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
      <BackendStatusBadge />
    </ThemeProvider>
  );
}
