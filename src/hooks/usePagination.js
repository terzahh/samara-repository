import { useState } from 'react';

export const usePagination = (initialPage = 1, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const nextPage = () => {
    setCurrentPage(prev => prev + 1);
  };
  
  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const goToPage = (page) => {
    setCurrentPage(Math.max(page, 1));
  };
  
  const resetPagination = () => {
    setCurrentPage(initialPage);
  };
  
  return {
    currentPage,
    itemsPerPage,
    nextPage,
    prevPage,
    goToPage,
    resetPagination
  };
};