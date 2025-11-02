import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Loading from '../Loading/Loading';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, loading, isAdmin, isDepartmentHead, isUser, isGuest } = useAuth();
  
  if (loading) {
    return <Loading message="Checking authentication..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole) {
    switch (requiredRole) {
      case 'admin':
        if (!isAdmin()) return <Navigate to="/unauthorized" replace />;
        break;
      case 'department_head':
        if (!isDepartmentHead()) return <Navigate to="/unauthorized" replace />;
        break;
      case 'user':
        if (!isUser()) return <Navigate to="/unauthorized" replace />;
        break;
      default:
        if (role !== requiredRole) return <Navigate to="/unauthorized" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;