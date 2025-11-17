import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ResearchProvider } from './context/ResearchContext';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import ScrollToTop from './components/common/ScrollToTop/ScrollToTop';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';
import PasswordResetPage from './pages/PasswordResetPage/PasswordResetPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import AdminPage from './pages/AdminPage/AdminPage';
import DepartmentPage from './pages/DepartmentPage/DepartmentPage';
import UserPage from './pages/UserPage/UserPage';
import BrowsePage from './pages/BrowsePage/BrowsePage';
import ResearchDetailPage from './pages/ResearchDetailPage/ResearchDetailPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import AboutPage from './pages/AboutPage/AboutPage';
import CollegesDepartmentsPage from './pages/CollegesDepartmentsPage/CollegesDepartmentsPage';
import CollegePage from './pages/CollegePage/CollegePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import HelpFAQPage from './pages/HelpFAQPage/HelpFAQPage';
import ContactPage from './pages/ContactPage/ContactPage';
import TermsPoliciesPage from './pages/TermsPoliciesPage/TermsPoliciesPage';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import { ROLES } from './utils/constants';
import { getSystemSettings } from './supabase/database';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceMode = async () => {
      try {
        const settings = await getSystemSettings();
        // Check both snake_case and camelCase for compatibility
        const mode = settings.maintenance_mode !== undefined ? settings.maintenance_mode : settings.maintenanceMode;
        setMaintenanceMode(mode === true || mode === 'true');
      } catch (error) {
        console.error('Error fetching maintenance mode:', error);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchMaintenanceMode();

    // Listen for maintenance mode changes from settings page
    const handleMaintenanceModeChanged = () => {
      fetchMaintenanceMode();
    };

    window.addEventListener('maintenanceModeChanged', handleMaintenanceModeChanged);

    // Cleanup
    return () => {
      window.removeEventListener('maintenanceModeChanged', handleMaintenanceModeChanged);
    };
  }, []);

  if (authLoading || settingsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Handle maintenance mode
  if (maintenanceMode) {
    if (isAuthenticated && !isAdmin()) {
      // Authenticated non-admins see maintenance page
      console.log('Showing maintenance mode page - authenticated non-admin');
      return (
        <div className="App">
          <div className="container text-center py-5">
            <h1>System Under Maintenance</h1>
            <p>The system is currently under maintenance. Please try again later.</p>
            <p>If you are an administrator, you can access the system.</p>
            <a href="/login" className="btn btn-primary">Login</a>
          </div>
        </div>
      );
    } else if (!isAuthenticated) {
      // Non-authenticated users can access login/signup, but other routes show maintenance
      console.log('Maintenance mode - allowing limited access for non-authenticated users');
      return (
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<PasswordResetPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={
              <div className="container text-center py-5">
                <h1>System Under Maintenance</h1>
                <p>The system is currently under maintenance. Please try again later.</p>
                <p>If you are an administrator, you can access the system.</p>
                <a href="/login" className="btn btn-primary">Login</a>
              </div>
            } />
          </Routes>
        </div>
      );
    }
    // Authenticated admins fall through to normal app
  }

  return (
    <div className="App">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<PasswordResetPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/research/:id" element={<ResearchDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/colleges" element={<CollegesDepartmentsPage />} />
        <Route path="/colleges/:id" element={<CollegePage />} />
        <Route path="/help" element={<HelpFAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPoliciesPage />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole={ROLES.ADMIN}>
            <AdminPage />
          </ProtectedRoute>
        } />
        <Route path="/department" element={
          <ProtectedRoute requiredRole={ROLES.DEPARTMENT_HEAD}>
            <DepartmentPage />
          </ProtectedRoute>
        } />
        <Route path="/user" element={
          <ProtectedRoute requiredRole={ROLES.USER}>
            <UserPage />
          </ProtectedRoute>
        } />
        <Route path="/unauthorized" element={
          <div className="container text-center py-5">
            <h1>Unauthorized Access</h1>
            <p>You don't have permission to access this page.</p>
            <a href="/" className="btn btn-primary">Go to Homepage</a>
          </div>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ResearchProvider>
        <Router>
          <AppContent />
        </Router>
      </ResearchProvider>
    </AuthProvider>
  );
}

export default App;