import React from 'react';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import AdminDashboard from '../../components/admin/AdminDashboard/AdminDashboard';
import ProtectedRoute from '../../components/common/ProtectedRoute/ProtectedRoute';
import { ROLES } from '../../utils/constants';
import './AdminPage.css';

const AdminPage = () => {
  return (
    <div className="admin-page">
      <Header />
      
      <main className="admin-main">
        <ProtectedRoute requiredRole={ROLES.ADMIN}>
          <AdminDashboard />
        </ProtectedRoute>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPage;