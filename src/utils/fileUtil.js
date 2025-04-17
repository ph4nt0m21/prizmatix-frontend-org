// src/utils/fileUtils.js

/**
 * Utility functions for file handling and uploads
 */

/**
 * Convert bytes to human-readable file size
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Human-readable file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  /**
   * Check if a file type is supported
   * @param {File} file - File to check
   * @param {Array} supportedTypes - Array of supported file extensions (e.g., ['.jpg', '.png'])
   * @returns {boolean} Whether the file type is supported
   */
  export const isFileTypeSupported = (file, supportedTypes) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return supportedTypes.includes(fileExtension);
  };
  
  /**
   * Check if a file size is within the limit
   * @param {File} file - File to check
   * @param {number} maxSizeMB - Maximum file size in MB
   * @returns {boolean} Whether the file size is within limit
   */
  export const isFileSizeValid = (file, maxSizeMB) => {
    const fileSizeMB = file.size / (1024 * 1024);
    return fileSizeMB <= maxSizeMB;
  };
  
  /**
   * Convert a File object to a Base64 string
   * @param {File} file - File to convert
   * @returns {Promise<string>} Promise that resolves to the Base64 string
   */
  export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  /**
   * Get a file's extension
   * @param {string} filename - File name
   * @returns {string} File extension (e.g., "jpg")
   */
  export const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };
  
  /**
   * Create a file preview URL
   * @param {File} file - File to preview
   * @returns {string} URL for file preview
   */
  /**
   * Create a file preview URL
   * @param {File} file - File to preview
   * @returns {string} URL for file preview
   */
  export const createFilePreviewUrl = (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };
  
  /**
   * Release a file preview URL to free browser memory
   * @param {string} url - URL to release
   */
  export const releaseFilePreviewUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };