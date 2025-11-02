export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim() !== '';
};

export const validateResearchForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.title)) {
    errors.title = 'Title is required';
  }
  
  if (!validateRequired(formData.author)) {
    errors.author = 'Author is required';
  }
  
  if (!validateRequired(formData.department_id)) {
    errors.department = 'Department is required';
  }
  
  if (!validateRequired(formData.type)) {
    errors.type = 'Type is required';
  }
  
  if (!validateRequired(formData.year)) {
    errors.year = 'Year is required';
  } else if (isNaN(formData.year) || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
    errors.year = 'Please enter a valid year';
  }
  
  if (!validateRequired(formData.abstract)) {
    errors.abstract = 'Abstract is required';
  }
  
  if (!validateRequired(formData.keywords)) {
    errors.keywords = 'Keywords are required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};