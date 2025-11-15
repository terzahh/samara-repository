import React from 'react';
import ResearchDetail from '../../components/research/ResearchDetail/ResearchDetail';
import './ResearchDetailPage.css';

const ResearchDetailPage = () => {
  return (
    <div className="research-detail-page">
      
      <main className="research-detail-main">
        <div className="container">
          <ResearchDetail />
        </div>
      </main>
      
    </div>
  );
};

export default ResearchDetailPage;