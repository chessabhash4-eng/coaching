import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SiteProvider } from './contexts/SiteContext';
import Home from './pages/Home';

const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <SiteProvider>
              <Home />
            </SiteProvider>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center font-hand text-2xl text-ink-2">opening the admin notebook…</div>}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
