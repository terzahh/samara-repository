export const formatDate = (date) => {
  if (!date) return 'N/A';

  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getResearchTypeLabel = (type) => {
  switch (type) {
    case 'thesis':
      return 'Thesis';
    case 'dissertation':
      return 'Dissertation';
    case 'research_paper':
      return 'Research Paper';
    case 'conference_paper':
      return 'Conference Paper';
    case 'project_report':
      return 'Project Report';
    default:
      return 'Unknown';
  }
};

export const getRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'department_head':
      return 'Department Head';
    case 'user':
      return 'User';
    case 'guest':
      return 'Guest';
    default:
      return 'Unknown';
  }
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getResearchLevel = (research) => {
  if (!research) return 'unknown';
  const keywords = (research.keywords || '').toString().toLowerCase();
  if (keywords.includes('level:undergraduate')) return 'undergraduate';
  if (keywords.includes('level:postgraduate')) return 'postgraduate';

  // Fallback heuristics (same as migration script)
  const t = (research.type || '').toLowerCase();
  const title = (research.title || '').toLowerCase();

  // Heuristic 0: explicit keyword (not the level tag)
  if (keywords.includes('postgraduate')) return 'postgraduate';

  // Heuristic 1: Title-based (Strongest)
  if (title.includes('master') || title.includes('phd') || title.includes('doctoral') || title.includes('postgraduate')) return 'postgraduate';
  if (title.includes('undergraduate') || title.includes('bachelor')) return 'undergraduate';

  // Heuristic 2: Type-based (Refined)
  if (['project_report', 'capstone', 'undergraduate_project', 'research_paper', 'conference_paper'].includes(t)) return 'undergraduate';

  // For thesis/dissertation, if title doesn't say PG, assume UG for now to meet requirements
  if (['thesis', 'dissertation'].includes(t)) return 'undergraduate';

  return 'undergraduate'; // Default to UG
};