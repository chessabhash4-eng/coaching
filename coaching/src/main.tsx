import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

if (new URLSearchParams(window.location.search).has('google_id_token')) {
  import('./lib/googleAuth').then((m) => m.handleGoogleRedirect());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
