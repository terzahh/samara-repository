import React from 'react';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import DepartmentDashboard from '../../components/department/DepartmentDashboard/DepartmentDashboard';
import ProtectedRoute from '../../components/common/ProtectedRoute/ProtectedRoute';
import { ROLES } from '../../utils/constants';
import './DepartmentPage.css';

const DepartmentPage = () => {
  return (
    <div className="department-page">
      <Header />
      
      <main className="department-main">
        <ProtectedRoute requiredRole={ROLES.DEPARTMENT_HEAD}>
          <DepartmentDashboard />
        </ProtectedRoute>
      </main>
      
      <Footer />
    </div>
  );
};

export default DepartmentPage;