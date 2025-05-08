import Cookies from 'js-cookie';

/**
 * Get user data from localStorage
 * @returns {Object|null} User data object or null if not found
 */
export const getUserData = () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  };
  
  /**
   * Set user data in localStorage
   * @param {Object} userData - User data to store
   */
  export const setUserData = (userData) => {
    try {
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };
  
  /**
   * Clear user data from localStorage
   */
  export const clearUserData = () => {
    localStorage.removeItem('userData');
  };
  
  /**
   * Check if user is authenticated
   * @returns {boolean} Whether the user is authenticated
   */
  export const isAuthenticated = () => {
    return !!localStorage.getItem('userData') && !!Cookies.get('token');
  };