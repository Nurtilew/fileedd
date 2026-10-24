import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Prevent silent blank screen from unhandled errors
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled Promise rejection trapped:', event.reason);
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

