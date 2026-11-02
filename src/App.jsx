import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient.js';
import AppRouter from './routes/AppRouter.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import AppErrorBoundary from './components/common/AppErrorBoundary.jsx';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AppErrorBoundary>
            <AppRouter />
          </AppErrorBoundary>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
