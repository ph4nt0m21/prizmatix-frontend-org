// src/pages/auth/registerSteps/organizationProfile.jsx
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from '../authPages.module.scss';

/**
 * OrganizationProfile component - Step for setting up organization profile
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.nextStep - Function to proceed to next step
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} OrganizationProfile component
 */
const OrganizationProfile = ({ 
  formData, 
  handleChange, 
  nextStep, 
  errors, 
  isLoading,
  handleFileUpload,
  uploadedLogo,
  setUploadedLogo,
  socialLinks,
  setSocialLinks
}) => {
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [socialPlatforms, setSocialPlatforms] = useState([
    { 
      id: 'website', 
      label: 'Website', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      ) 
    },
    { 
      id: 'facebook', 
      label: 'Facebook', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      ) 
    },
    { 
      id: 'instagram', 
      label: 'Instagram', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      ) 
    },
    { 
      id: 'x', 
      label: 'X (Twitter)', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
      ) 
    },
    { 
      id: 'tiktok', 
      label: 'TikTok', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 0V5l8 3v6"></path>
        </svg>
      ) 
    },
    { 
      id: 'other', 
      label: 'Other', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <line x1="12" y1="2" x2="12" y2="22"></line>
        </svg>
      ) 
    }
  ]);

  const fileInputRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  /**
   * Handle logo upload
   * @param {Event} e - File input change event
   */
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle crop confirmation
   * @param {string} croppedImageUrl - URL of the cropped image
   */
  const handleCropConfirm = () => {
    // In a real implementation, you would apply the crop to the image
    // For now, we'll just use the selected image
    setUploadedLogo({
      url: selectedImage,
      name: 'hard_rock_cafe_logo1.jpg' // Default name or get from file
    });
    setShowCropModal(false);
    setSelectedImage(null);
    setZoomLevel(1);
  };

  /**
   * Cancel the crop operation
   */
  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage(null);
    setZoomLevel(1);
  };

  /**
   * Open file dialog
   */
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  /**
   * Remove uploaded logo
   */
  const handleRemoveLogo = () => {
    setUploadedLogo(null);
  };

  /**
   * Handle zoom level change
   * @param {Event} e - Range input change event
   */
  const handleZoomChange = (e) => {
    setZoomLevel(parseFloat(e.target.value));
  };

  /**
   * Handle adding a social link
   * @param {string} platform - Platform ID
   */
  const handleSocialButtonClick = (platform) => {
    // This would typically open a dialog to enter the URL
    // For now, we'll just add a placeholder URL
    const newSocialLinks = [...socialLinks];
    
    // Find the platform object
    const platformObj = socialPlatforms.find(p => p.id === platform);
    
    if (platformObj) {
      newSocialLinks.push({
        platform: platformObj.label,
        url: `https://www.example.com/${platform}`
      });
      setSocialLinks(newSocialLinks);
    }
  };

  return (
    <div className={styles.organizationFormContainer}>
      <div className={styles.loginHeader}>
        <h1 className={styles.welcomeTitle}>Setup Organization Profile</h1>
        <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
      </div>
      
      {/* Display any errors if they exist */}
      {(errors?.name) && (
        <div className={styles.errorMessage}>
          {errors?.name}
        </div>
      )}
      
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        {/* Profile Photo */}
        <div className={styles.formGroup}>
          <label className={styles.inputLabelModern}>
            Profile Photo
          </label>
          <p className={styles.photoSizeHint}>Recommended size: 300 × 300</p>
          
          {!uploadedLogo ? (
            <div className={styles.profilePhotoUploadContainer}>
              <div className={styles.profilePhotoUpload} onClick={triggerFileInput}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className={styles.fileInput} 
                  onChange={handleLogoUpload}
                  accept="image/*"
                />
                <div className={styles.uploadIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.uploadedProfileContainer}>
              <div className={styles.uploadedProfile}>
                <img src={uploadedLogo.url} alt="Profile" className={styles.profileImage} />
                <div className={styles.profileInfo}>
                  <span className={styles.profileLabel}>Profile Photo</span>
                  <span className={styles.profileFilename}>{uploadedLogo.name}</span>
                </div>
              </div>
              <button 
                type="button" 
                className={styles.removeProfileBtn}
                onClick={handleRemoveLogo}
              >
                ×
              </button>
            </div>
          )}
        </div>
        
        {/* Organization Name */}
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.inputLabelModern}>
            Organization Name
          </label>
          <div className={styles.inputContainer}>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.modernInput}
              placeholder="eg. johndoe@gmail.com"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Bio */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.inputLabelModern}>
            Bio
          </label>
          <div className={styles.textareaContainer}>
            <textarea
              id="description"
              name="description"
              className={styles.modernTextarea}
              placeholder="Tell Something about your organization"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className={styles.formGroup}>
          <label className={styles.inputLabelModern}>
            Social Media Links
          </label>
          
          {/* Social links grid */}
          <div className={styles.socialLinksGrid}>
            <div className={styles.socialLinkRow}>
              <div className={styles.socialLinkItem} onClick={() => handleSocialButtonClick('website')}>
                <span className={styles.socialPlatformIcon}>
                  {socialPlatforms.find(p => p.id === 'website').icon}
                </span>
                <span className={styles.socialPlatformName}>Website</span>
                <span className={styles.socialAddIcon}>+</span>
              </div>
              <div className={styles.socialLinkItem} onClick={() => handleSocialButtonClick('facebook')}>
                <span className={styles.socialPlatformIcon}>
                  {socialPlatforms.find(p => p.id === 'facebook').icon}
                </span>
                <span className={styles.socialPlatformName}>Facebook</span>
                <span className={styles.socialAddIcon}>+</span>
              </div>
            </div>
            
            <div className={styles.socialLinkRow}>
              <div className={styles.socialLinkItem} onClick={() => handleSocialButtonClick('instagram')}>
                <span className={styles.socialPlatformIcon}>
                  {socialPlatforms.find(p => p.id === 'instagram').icon}
                </span>
                <span className={styles.socialPlatformName}>Instagram</span>
                <span className={styles.socialAddIcon}>+</span>
              </div>
              <div className={styles.socialLinkItem} onClick={() => handleSocialButtonClick('x')}>
                <span className={styles.socialPlatformIcon}>
                  {socialPlatforms.find(p => p.id === 'x').icon}
                </span>
                <span className={styles.socialPlatformName}>X (Twitter)</span>
                <span className={styles.socialAddIcon}>+</span>
              </div>
            </div>
            
            <div className={styles.socialLinkRow}>
              <div className={styles.socialLinkItem} onClick={() => handleSocialButtonClick('tiktok')}>
                <span className={styles.socialPlatformIcon}>
                  {socialPlatforms.find(p => p.id === 'tiktok').icon}
                </span>
                <span className={styles.socialPlatformName}>TikTok</span>
                <span className={styles.socialAddIcon}>+</span>
              </div>
              <div className={styles.socialLinkItem} onClick={() => handleSocialButtonClick('other')}>
                <span className={styles.socialPlatformIcon}>
                  {socialPlatforms.find(p => p.id === 'other').icon}
                </span>
                <span className={styles.socialPlatformName}>Other</span>
                <span className={styles.socialAddIcon}>+</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Next Button */}
        <button
          type="submit"
          className={styles.purpleButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.buttonSpinner}></span>
          ) : (
            "Next"
          )}
        </button>
      </form>

      {/* Image Crop Modal */}
      {showCropModal && (
        <div className={styles.cropModalOverlay}>
          <div className={styles.cropModal}>
            <div className={styles.cropModalHeader}>
              <h3>Crop Image</h3>
              <button className={styles.closeCropModal} onClick={handleCropCancel}>×</button>
            </div>
            
            <div className={styles.cropImageContainer}>
              <div 
                className={styles.cropImageWrapper}
                style={{ 
                  transform: `scale(${zoomLevel})` 
                }}
              >
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="To crop" 
                    className={styles.imageToCrop} 
                  />
                )}
              </div>
              
              <div className={styles.cropSelectionBox}>
                <div className={styles.cropCorner} style={{ top: 0, left: 0 }}></div>
                <div className={styles.cropCorner} style={{ top: 0, right: 0 }}></div>
                <div className={styles.cropCorner} style={{ bottom: 0, left: 0 }}></div>
                <div className={styles.cropCorner} style={{ bottom: 0, right: 0 }}></div>
              </div>
            </div>
            
            <div className={styles.cropControls}>
              <div className={styles.cropToolOptions}>
                <button className={`${styles.cropToolBtn} ${styles.active}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                </button>
                <button className={styles.cropToolBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </button>
                <button className={styles.cropToolBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="13" height="13" rx="2" ry="2"></rect>
                  </svg>
                </button>
              </div>
              
              <div className={styles.zoomSliderContainer}>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoomLevel}
                  onChange={handleZoomChange}
                  className={styles.zoomSlider}
                />
              </div>
              
              <div className={styles.cropActions}>
                <button 
                  className={styles.cancelCropBtn} 
                  onClick={handleCropCancel}
                >
                  Cancel
                </button>
                <button 
                  className={styles.uploadCropBtn} 
                  onClick={handleCropConfirm}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

OrganizationProfile.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool,
  handleFileUpload: PropTypes.func,
  uploadedLogo: PropTypes.object,
  setUploadedLogo: PropTypes.func,
  socialLinks: PropTypes.array,
  setSocialLinks: PropTypes.func
};

// Default props
OrganizationProfile.defaultProps = {
  socialLinks: [],
  setSocialLinks: () => {},
  uploadedLogo: null,
  setUploadedLogo: () => {},
  handleFileUpload: () => {}
};

export default OrganizationProfile;