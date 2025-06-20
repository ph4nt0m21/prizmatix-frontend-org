import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './artStep.module.scss';

/**
 * ArtStep component - Fifth step of event creation
 * Handles thumbnail and banner image uploads for the event
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data from parent component
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @returns {JSX.Element} ArtStep component
 */
const ArtStep = ({ 
  eventData = {},
  handleInputChange = () => {},
  isValid = false,
  stepStatus = { visited: false }
}) => {
  // Extract art data from eventData or use defaults
const artData = eventData.art || {}; // Use eventData.art for consistency  
  // State for uploaded files and previews
  const [files, setFiles] = useState({
    thumbnail: artData.thumbnailFile || null,
    banner: artData.bannerFile || null
  });
  
  // State for preview URLs
  const [previews, setPreviews] = useState({
    thumbnail: artData.thumbnailUrl || null,
    banner: artData.bannerUrl || null
  });
  
  // State for drag-and-drop functionality
  const [dragActive, setDragActive] = useState({
    thumbnail: false,
    banner: false
  });
  
  // Refs for file input elements
  const thumbnailInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  
  // Supported file types and size limits
  const supportedTypes = ['.jpg', '.png', '.webp'];
  const maxSizes = {
    thumbnail: 10, // 10 MB
    banner: 10 // 10 MB
  };
  
  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previews.thumbnail) releaseFilePreviewUrl(previews.thumbnail);
      if (previews.banner) releaseFilePreviewUrl(previews.banner);
    };
  }, []);

  useEffect(() => {
  // When the eventData.art prop changes from the parent
  if (eventData.art) {
    // Update the local state for previews
    setPreviews({
      thumbnail: eventData.art.thumbnailUrl || null,
      banner: eventData.art.bannerUrl || null,
    });
    // Also update the local file state if needed (though files themselves aren't props)
    setFiles({
        thumbnail: eventData.art.thumbnailFile || null,
        banner: eventData.art.bannerFile || null
    })
  }
}, [eventData.art]); // Dependency array watches for changes in the art prop
  
  /**
   * Release a file preview URL to free browser memory
   * @param {string} url - URL to release
   */
  const releaseFilePreviewUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };
  
  /**
   * Format file size to human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  /**
   * Check if file type is supported
   * @param {File} file - File to check
   * @returns {boolean} Whether file type is supported
   */
  const isFileTypeSupported = (file) => {
    // Make sure the file has a name property before trying to use split()
    if (!file || !file.name) {
      console.warn('File object does not have a name property:', file);
      return false;
    }
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return supportedTypes.includes(fileExtension);
  };
  
  /**
   * Check if file size is within limit
   * @param {File} file - File to check
   * @param {number} maxSizeMB - Maximum file size in MB
   * @returns {boolean} Whether file size is within limit
   */
  const isFileSizeValid = (file, maxSizeMB) => {
    // Make sure the file has a size property
    if (!file || !file.size) {
      console.warn('File object does not have a size property:', file);
      return false;
    }
    
    const fileSizeMB = file.size / (1024 * 1024);
    return fileSizeMB <= maxSizeMB;
  };

  /**
   * Handle file selection change
   * @param {string} type - 'thumbnail' or 'banner'
   * @param {File} file - Selected file
   */
  const handleFileChange = (type, file) => {
    if (!file) {
      console.warn('No file provided to handleFileChange');
      return;
    }
    
    // Make sure the file is valid before proceeding
    if (!file.name || !file.size) {
      console.warn('Invalid file object:', file);
      return;
    }
    
    // Simple validation
    if (!isFileTypeSupported(file) || !isFileSizeValid(file, maxSizes[type])) {
      console.warn('File validation failed:', file);
      return;
    }
    
    // Release previous preview URL if exists
    if (previews[type]) {
      releaseFilePreviewUrl(previews[type]);
    }
    
    // Create a URL for the file to preview
    const fileUrl = URL.createObjectURL(file);
    
    // Update files and previews state
    setFiles(prev => ({
      ...prev,
      [type]: file
    }));
    
    setPreviews(prev => ({
      ...prev,
      [type]: fileUrl
    }));
    
    // Prepare art data to be passed to parent
    const newArtData = {
      ...artData,
      [`${type}File`]: file,
      [`${type}Url`]: fileUrl,
      [`${type}Name`]: file.name
    };
    
    // Update parent state
    handleInputChange(newArtData, 'art');
  };
  
  /**
   * Handle file input change
   * @param {Event} e - File input change event
   * @param {string} type - 'thumbnail' or 'banner'
   */
  const handleFileInputChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      handleFileChange(type, file);
    }
  };
  
  /**
   * Handle drag events
   * @param {Event} e - Drag event
   * @param {string} type - 'thumbnail' or 'banner'
   * @param {string} dragState - 'enter', 'leave', or 'drop'
   */
  const handleDrag = (e, type, dragState) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dragState === 'enter') {
      setDragActive(prev => ({
        ...prev,
        [type]: true
      }));
    } else if (dragState === 'leave') {
      setDragActive(prev => ({
        ...prev,
        [type]: false
      }));
    } else if (dragState === 'drop') {
      setDragActive(prev => ({
        ...prev,
        [type]: false
      }));
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChange(type, e.dataTransfer.files[0]);
      }
    }
  };
  
  /**
   * Trigger click on hidden file input
   * @param {string} type - 'thumbnail' or 'banner'
   */
  const handleBrowseClick = (type) => {
    if (type === 'thumbnail' && thumbnailInputRef.current) {
      thumbnailInputRef.current.click();
    } else if (type === 'banner' && bannerInputRef.current) {
      bannerInputRef.current.click();
    }
  };
  
  /**
   * Remove file
   * @param {string} type - 'thumbnail' or 'banner'
   */
  const removeFile = (type) => {
    // Release preview URL if exists
    if (previews[type]) {
      releaseFilePreviewUrl(previews[type]);
    }
    
    // Update files and previews state
    setFiles(prev => ({
      ...prev,
      [type]: null
    }));
    
    setPreviews(prev => ({
      ...prev,
      [type]: null
    }));
    
    // Update parent state
    const newArtData = {
      ...artData,
      [`${type}File`]: null,
      [`${type}Url`]: null,
      [`${type}Name`]: null
    };
    
    handleInputChange(newArtData, 'art');
  };
  
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="#7C3AED"/>
        </svg>
        <h2 className={styles.stepTitle}>Thumbnail and Banner</h2>
      </div>
      
      <div className={styles.formSection}>
        {/* Thumbnail Upload Section */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Thumbnail
          </label>
          <p className={styles.formDescription}>
            A square image that will be displayed in event listings and search results
          </p>
          
          <div 
            className={`${styles.uploadDropzone} ${dragActive.thumbnail ? styles.dragActive : ''} ${files.thumbnail ? styles.hasFile : ''}`}
            onDragEnter={(e) => handleDrag(e, 'thumbnail', 'enter')}
            onDragOver={(e) => handleDrag(e, 'thumbnail', 'enter')}
            onDragLeave={(e) => handleDrag(e, 'thumbnail', 'leave')}
            onDrop={(e) => handleDrag(e, 'thumbnail', 'drop')}
          >
            {files.thumbnail ? (
              // Preview the uploaded image
              <div className={styles.imagePreview}>
                <img 
                  src={previews.thumbnail} 
                  alt="Thumbnail Preview" 
                  className={styles.previewImage}
                />
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{files.thumbnail.name}</span>
                  <span className={styles.fileSize}>
                    {formatFileSize(files.thumbnail.size)}
                  </span>
                </div>
                <button 
                  type="button" 
                  className={styles.removeButton}
                  onClick={() => removeFile('thumbnail')}
                  aria-label="Remove thumbnail"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            ) : (
              // Upload interface
              <div className={styles.uploadInterface}>
                <div className={styles.uploadIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="#7C3AED"/>
                  </svg>
                </div>
                <p className={styles.uploadText}>
                  Drop your files here,
                  <br />
                  or <button 
                    type="button" 
                    className={styles.browseButton}
                    onClick={() => handleBrowseClick('thumbnail')}
                  >
                    click to browse
                  </button>
                </p>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  id="thumbnailUpload"
                  className={styles.fileInput}
                  accept=".jpg,.png,.webp"
                  onChange={(e) => handleFileInputChange(e, 'thumbnail')}
                />
              </div>
            )}
          </div>
          
          {stepStatus.visited && files.thumbnail && !isFileTypeSupported(files.thumbnail) && (
            <div className={styles.fieldError}>Unsupported file type. Please use {supportedTypes.join(', ')}</div>
          )}
          
          {stepStatus.visited && files.thumbnail && !isFileSizeValid(files.thumbnail, maxSizes.thumbnail) && (
            <div className={styles.fieldError}>File size exceeds {maxSizes.thumbnail} MB limit</div>
          )}
          
          <div className={styles.fileInfoText}>
            <div className={styles.supportedTypes}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#666666"/>
              </svg>
              Supported files: .jpg, .png, .webp
            </div>
            <div className={styles.maxSize}>
              Maximum Size: {maxSizes.thumbnail} MB
            </div>
          </div>
        </div>
        
        {/* Banner Upload Section */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Banner
          </label>
          <p className={styles.formDescription}>
            A wide image that will be displayed at the top of your event page
          </p>
          
          <div 
            className={`${styles.uploadDropzone} ${dragActive.banner ? styles.dragActive : ''} ${files.banner ? styles.hasFile : ''}`}
            onDragEnter={(e) => handleDrag(e, 'banner', 'enter')}
            onDragOver={(e) => handleDrag(e, 'banner', 'enter')}
            onDragLeave={(e) => handleDrag(e, 'banner', 'leave')}
            onDrop={(e) => handleDrag(e, 'banner', 'drop')}
          >
            {files.banner ? (
              // Preview the uploaded image
              <div className={styles.imagePreview}>
                <img 
                  src={previews.banner} 
                  alt="Banner Preview" 
                  className={styles.previewImage}
                />
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{files.banner.name}</span>
                  <span className={styles.fileSize}>
                    {formatFileSize(files.banner.size)}
                  </span>
                </div>
                <button 
                  type="button" 
                  className={styles.removeButton}
                  onClick={() => removeFile('banner')}
                  aria-label="Remove banner"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            ) : (
              // Upload interface
              <div className={styles.uploadInterface}>
                <div className={styles.uploadIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="#7C3AED"/>
                  </svg>
                </div>
                <p className={styles.uploadText}>
                  Drop your files here, or <button 
                    type="button" 
                    className={styles.browseButton}
                    onClick={() => handleBrowseClick('banner')}
                  >
                    click to browse
                  </button>
                </p>
                <input
                  ref={bannerInputRef}
                  type="file"
                  id="bannerUpload"
                  className={styles.fileInput}
                  accept=".jpg,.png,.webp"
                  onChange={(e) => handleFileInputChange(e, 'banner')}
                />
              </div>
            )}
          </div>
          
          {stepStatus.visited && files.banner && !isFileTypeSupported(files.banner) && (
            <div className={styles.fieldError}>Unsupported file type. Please use {supportedTypes.join(', ')}</div>
          )}
          
          {stepStatus.visited && files.banner && !isFileSizeValid(files.banner, maxSizes.banner) && (
            <div className={styles.fieldError}>File size exceeds {maxSizes.banner} MB limit</div>
          )}
          
          <div className={styles.fileInfoText}>
            <div className={styles.supportedTypes}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#666666"/>
              </svg>
              Supported files: .jpg, .png, .webp
            </div>
            <div className={styles.maxSize}>
              Maximum Size: {maxSizes.banner} MB
            </div>
          </div>
        </div>

        {/* Image Recommendations */}
        <div className={styles.recommendationsBox}>
          <h3 className={styles.recommendationsTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#7C3AED"/>
            </svg>
            Image Recommendations
          </h3>
          <ul className={styles.recommendationsList}>
            <li>Thumbnail: Use a square image (1:1 ratio), minimum 500x500 pixels</li>
            <li>Banner: Use a wide image (16:9 ratio), minimum 1200x675 pixels</li>
            <li>Make sure text is readable and images are clear</li>
            <li>Use high-quality images that represent your event well</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

ArtStep.propTypes = {
  eventData: PropTypes.object,
  handleInputChange: PropTypes.func,
  isValid: PropTypes.bool,
  stepStatus: PropTypes.object
};

export default ArtStep;