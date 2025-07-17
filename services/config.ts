// Simple development mode detection
export const isDevelopment = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.MODE === 'development';
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development';
    }
  } catch (error) {
    // Silently handle environment detection errors
  }
  return true; // Default to development mode for safety
};

// Basic validation for the app
export const validateConfig = () => {
  // For now, always return true since we don't need external APIs for basic flow
  return true;
};