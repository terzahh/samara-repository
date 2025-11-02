import { useResearch as useResearchContext } from '../context/ResearchContext';

export const useResearch = () => {
  return useResearchContext();
};