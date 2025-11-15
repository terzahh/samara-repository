import React from 'react';
import AdminDashboard from '../../components/admin/AdminDashboard/AdminDashboard';
import ProtectedRoute from '../../components/common/ProtectedRoute/ProtectedRoute';
import { ROLES } from '../../utils/constants';
import './AdminPage.css';

const AdminPage = () => {
  return (
    <div className="admin-page">
      
      <main className="admin-main">
        <ProtectedRoute requiredRole={ROLES.ADMIN}>
          <AdminDashboard />
        </ProtectedRoute>
      </main>
      
    </div>
  );
};

export default AdminPage;