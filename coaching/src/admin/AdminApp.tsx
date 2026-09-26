import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import { AuthProvider } from '../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import MessagesPage from './pages/MessagesPage';
import { CoursesPage, FeaturesPage, ResultsPage, FacultyPage, TestimonialsPage } from './pages/SectionPages';

export default function AdminApp() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="hero" element={<SettingsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="why" element={<FeaturesPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="faculty" element={<FacultyPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
    </AuthProvider>
  );
}
