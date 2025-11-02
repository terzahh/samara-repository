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