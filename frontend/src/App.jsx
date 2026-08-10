import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalysisResults from './pages/AnalysisResults';
import AnalysisHistory from './pages/AnalysisHistory';
import VersionCompare from './pages/VersionCompare';
import Settings from './pages/Settings';

import Sidebar from './components/Sidebar';
import DashboardBackground from './components/DashboardBackground';

const AuthenticatedLayout = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#05070B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <DashboardBackground>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </DashboardBackground>
  );
};

const PublicLayout = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB] dark:bg-transparent text-[#111827] dark:text-[#F8FAFC] font-sans transition-colors duration-250">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        {!user && <Footer />}
      </div>
    </div>
  );
};

function AppContent() {
  const { theme } = useTheme();

  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis/:id" element={<AnalysisResults />} />
          <Route path="/history" element={<AnalysisHistory />} />
          <Route path="/compare" element={<VersionCompare />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster position="top-right" theme={theme === 'dark' ? 'dark' : 'light'} richColors />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
