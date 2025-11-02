import React from 'react';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import ResearchDetail from '../../components/research/ResearchDetail/ResearchDetail';
import './ResearchDetailPage.css';

const ResearchDetailPage = () => {
  return (
    <div className="research-detail-page">
      <Header />
      
      <main className="research-detail-main">
        <div className="container">
          <ResearchDetail />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResearchDetailPage;