import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

// Prevent unhandled cross-origin / iframe script errors from crashing runtime
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[Global Unhandled Rejection Caught]:', event.reason);
  // Prevent default browser error popup for network/SSE hiccups
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  if (event.message === 'Script error.' || event.message?.includes('ResizeObserver')) {
    // Benign cross-origin or ResizeObserver loop warning - ignore
    event.preventDefault();
    return;
  }
  console.warn('[Global Error Caught]:', event.message, event.filename, event.lineno);
});

// Register Service Worker for offline shell and background synchronization
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] ServiceWorker successfully registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] ServiceWorker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


