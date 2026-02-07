/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password) => {
  return password.length >= 6;
};

/**
 * Validate required field
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate form data
 */
export const validateForm = (data, rules) => {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const error = rule(data[field], data);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Common validation rules
export const required = (message = 'This field is required') => (value) =>
  !isRequired(value) ? message : null;

export const email = (message = 'Invalid email address') => (value) =>
  value && !isValidEmail(value) ? message : null;

export const minLength = (min, message) => (value) =>
  value && value.length < min ? message || `Must be at least ${min} characters` : null;

export const positiveNumber = (message = 'Must be a positive number') => (value) =>
  value && !isPositiveNumber(value) ? message : null;
