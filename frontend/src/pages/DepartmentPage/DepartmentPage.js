import React from 'react';
import DepartmentDashboard from '../../components/department/DepartmentDashboard/DepartmentDashboard';
import ProtectedRoute from '../../components/common/ProtectedRoute/ProtectedRoute';
import { ROLES } from '../../utils/constants';
import './DepartmentPage.css';

const DepartmentPage = () => {
  return (
    <div className="department-page">
      
      <main className="department-main">
        <ProtectedRoute requiredRole={ROLES.DEPARTMENT_HEAD}>
          <DepartmentDashboard />
        </ProtectedRoute>
      </main>
      
    </div>
  );
};

export default DepartmentPage;