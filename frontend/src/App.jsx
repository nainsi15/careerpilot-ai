import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toaster } from 'sonner';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardBackground from './components/DashboardBackground';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalysisResults from './pages/AnalysisResults';
import AnalysisHistory from './pages/AnalysisHistory';
import VersionCompare from './pages/VersionCompare';
import Settings from './pages/Settings';


/* =========================
   AUTHENTICATED LAYOUT
========================= */

const AuthenticatedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070B] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardBackground>
      <div className="min-h-screen flex">

        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0 border-r border-white/[0.08]">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>

      </div>
    </DashboardBackground>
  );
};


/* =========================
   PUBLIC LAYOUT
========================= */

const PublicLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Hide Navbar only on Landing page */}
      {location.pathname !== '/' && <Navbar />}

      <Outlet />
    </>
  );
};


/* =========================
   APP CONTENT
========================= */

function AppContent() {
  const { theme } = useTheme();

  return (
    <>
      <Routes>

        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>


        {/* Protected Pages */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis/:id" element={<AnalysisResults />} />
          <Route path="/history" element={<AnalysisHistory />} />
          <Route path="/compare" element={<VersionCompare />} />
          <Route path="/settings" element={<Settings />} />
        </Route>


        {/* Unknown Route */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      <Toaster
        position="top-right"
        theme={theme === 'dark' ? 'dark' : 'light'}
        richColors
      />
    </>
  );
}


/* =========================
   APP
========================= */

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}