import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';
import ResearchList from '../../components/research/ResearchList/ResearchList';
import { getAllDepartments } from '../../supabase/database';
import { useResearch } from '../../hooks/useResearch';
import './BrowsePage.css';

const BrowsePage = () => {
  const [searchParams] = useSearchParams();
  const departmentId = searchParams.get('department');
  const navigate = useNavigate();
  const { setFilters } = useResearch();
  const [departmentName, setDepartmentName] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadDeptName = async () => {
      if (!departmentId) {
        setDepartmentName('');
        return;
      }
      try {
        const depts = await getAllDepartments();
        const match = depts.find(d => String(d.id) === String(departmentId));
        if (!cancelled) {
          setDepartmentName(match ? match.name : '');
        }
      } catch {
        if (!cancelled) setDepartmentName('');
      }
    };
    loadDeptName();
    return () => { cancelled = true; };
  }, [departmentId]);

  const clearDepartmentFilter = () => {
    setFilters({ department: '' });
    navigate('/browse', { replace: true });
  };

  return (
    <div className="browse-page">
      
      <main className="browse-main">
        <div className="container-fluid">
          <div className="browse-header">
            <h1>
              Browse Research
              {departmentId && (
                <>
                  <Badge bg="primary" className="ms-2">
                    {departmentName ? departmentName : 'Department Filter'}
                  </Badge>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="ms-2"
                    onClick={clearDepartmentFilter}
                  >
                    Clear
                  </Button>
                </>
              )}
            </h1>
            <p>
              {departmentId 
                ? (departmentName 
                    ? `Viewing research for ${departmentName}`
                    : 'Viewing research for the selected department')
                : 'Explore the collection of research papers, theses, and dissertations'}
            </p>
          </div>
          
          <ResearchList />
        </div>
      </main>
      
    </div>
  );
};

export default BrowsePage;