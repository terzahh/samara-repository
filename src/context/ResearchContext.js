import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  getAllResearch, 
  searchResearch, 
  getResearchById,
  getComments 
} from '../supabase/database';

const ResearchContext = createContext();

const researchReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RESEARCH_LIST':
      return {
        ...state,
        researchList: action.payload.research,
        totalCount: action.payload.totalCount,
        totalPages: action.payload.totalPages,
        loading: false
      };
    case 'SET_CURRENT_RESEARCH':
      return {
        ...state,
        currentResearch: action.payload,
        loading: false
      };
    case 'SET_COMMENTS':
      return {
        ...state,
        comments: action.payload,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
    default:
      return state;
  }
};

const initialState = {
  researchList: [],
  currentResearch: null,
  comments: [],
  loading: true,
  searchTerm: '',
  filters: {
    department: '',
    type: '',
    year: '',
    accessLevel: 'all'
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalCount: 0,
    totalPages: 0
  }
};

export const ResearchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(researchReducer, initialState);

  const fetchResearchList = async (page = 1, reset = false) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      if (state.searchTerm || Object.values(state.filters).some(filter => filter !== '' && filter !== 'all')) {
        // Search with filters
        const results = await searchResearch(state.searchTerm, state.filters);
        dispatch({ 
          type: 'SET_RESEARCH_LIST', 
          payload: {
            research: results,
            totalCount: results.length,
            totalPages: 1
          }
        });
      } else {
        // Get all research with pagination
        const { research, totalCount, totalPages } = await getAllResearch(
          page, 
          state.pagination.itemsPerPage, 
          state.filters
        );
        
        dispatch({ 
          type: 'SET_RESEARCH_LIST', 
          payload: {
            research,
            totalCount,
            totalPages
          }
        });
        
        dispatch({ 
          type: 'SET_PAGINATION', 
          payload: { currentPage: page } 
        });
      }
    } catch (error) {
      console.error('Error fetching research list:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const fetchResearchById = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const research = await getResearchById(id);
      dispatch({ type: 'SET_CURRENT_RESEARCH', payload: research });
    } catch (error) {
      console.error('Error fetching research:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchComments = async (researchId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const comments = await getComments(researchId);
      dispatch({ type: 'SET_COMMENTS', payload: comments });
    } catch (error) {
      console.error('Error fetching comments:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setSearchTerm = (term) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const resetFilters = () => {
    dispatch({ 
      type: 'SET_FILTERS', 
      payload: {
        department: '',
        type: '',
        year: '',
        accessLevel: 'all'
      } 
    });
  };

  return (
    <ResearchContext.Provider value={{
      ...state,
      fetchResearchList,
      fetchResearchById,
      fetchComments,
      setSearchTerm,
      setFilters,
      resetFilters
    }}>
      {children}
    </ResearchContext.Provider>
  );
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
};