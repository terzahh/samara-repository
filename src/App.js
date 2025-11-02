import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase/supabase';
import { AuthProvider } from './context/AuthContext';
import { ResearchProvider } from './context/ResearchContext';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';
import AdminPage from './pages/AdminPage/AdminPage';
import DepartmentPage from './pages/DepartmentPage/DepartmentPage';
import UserPage from './pages/UserPage/UserPage';
import BrowsePage from './pages/BrowsePage/BrowsePage';
import ResearchDetailPage from './pages/ResearchDetailPage/ResearchDetailPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import { ROLES } from './utils/constants';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ResearchProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/research/:id" element={<ResearchDetailPage />} />
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
          </div>
        </Router>
      </ResearchProvider>
    </AuthProvider>
  );
}

export default App;