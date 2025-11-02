import React from 'react';
import Header from '../../components/common/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import ResearchList from '../../components/research/ResearchList/ResearchList';
import './BrowsePage.css';

const BrowsePage = () => {
  return (
    <div className="browse-page">
      <Header />
      
      <main className="browse-main">
        <div className="container-fluid">
          <div className="browse-header">
            <h1>Browse Research</h1>
            <p>Explore the collection of research papers, theses, and dissertations</p>
          </div>
          
          <ResearchList />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BrowsePage;