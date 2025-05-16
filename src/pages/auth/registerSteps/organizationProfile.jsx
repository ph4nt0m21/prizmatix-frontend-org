import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './organizationProfile.module.scss';

// Import SVG components
import { ReactComponent as ArrowIcon } from "../../../assets/icons/arrow-icon.svg";
import { ReactComponent as UploadIcon } from "../../../assets/icons/upload-icon.svg";
import { ReactComponent as WebsiteIcon } from "../../../assets/icons/globe-icon.svg";
import { ReactComponent as FacebookIcon } from "../../../assets/icons/facebook-icon.svg";
import { ReactComponent as InstagramIcon } from "../../../assets/icons/instagram-icon.svg";
import { ReactComponent as TwitterIcon } from "../../../assets/icons/twitter-icon.svg";
import { ReactComponent as TikTokIcon } from "../../../assets/icons/tiktok-icon.svg";
import { ReactComponent as OtherIcon } from "../../../assets/icons/plus-circle-icon.svg";

// Import images
import wallpaperBg from "../../../assets/images/register2-bg.png";
import logoImage from "../../../assets/images/logo2.svg";

/**
 * OrganizationProfile component - Fourth step of the registration process
 * Collects organization information like name, bio, and social links
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.nextStep - Function to proceed to next step
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.handleFileUpload - Function to handle file upload
 * @param {Object} props.uploadedLogo - Uploaded logo data
 * @param {Function} props.setUploadedLogo - Function to set uploaded logo
 * @param {Array} props.socialLinks - Social links array
 * @param {Function} props.setSocialLinks - Function to set social links
 * @param {Function} props.onGoBack - Function to handle going back
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
  setSocialLinks,
  onGoBack
}) => {
  // File input ref
  const fileInputRef = useRef(null);
  
  // Crop modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Social links state
  const [showAddSocialModal, setShowAddSocialModal] = useState(false);
  const [activeSocialPlatform, setActiveSocialPlatform] = useState(null);
  const [socialInputValue, setSocialInputValue] = useState('');
  
  // Social platforms data
  const socialPlatforms = [
    { id: 'website', name: 'Website', icon: <WebsiteIcon /> },
    { id: 'facebook', name: 'Facebook', icon: <FacebookIcon /> },
    { id: 'instagram', name: 'Instagram', icon: <InstagramIcon /> },
    { id: 'twitter', name: 'X (Twitter)', icon: <TwitterIcon /> },
    { id: 'tiktok', name: 'TikTok', icon: <TikTokIcon /> },
    { id: 'other', name: 'Other', icon: <OtherIcon /> }
  ];

  const navigate = useNavigate();

  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    nextStep();
  };

  /**
   * Trigger file input click
   */
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  /**
   * Handle logo file selection
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
   * Handle zoom level change
   * @param {Event} e - Range input change event
   */
  const handleZoomChange = (e) => {
    setZoomLevel(parseFloat(e.target.value));
  };

  /**
   * Apply crop and save uploaded logo
   */
  const handleCropConfirm = () => {
    // In a real implementation, you would apply the crop to the image
    setUploadedLogo({
      url: selectedImage,
      name: `${formData.name || 'logo'}.jpg`
    });
    setShowCropModal(false);
    setSelectedImage(null);
    setZoomLevel(1);
  };

  /**
   * Cancel crop operation
   */
  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage(null);
    setZoomLevel(1);
  };

  /**
   * Remove uploaded logo
   */
  const handleRemoveLogo = () => {
    setUploadedLogo(null);
  };

  /**
   * Handle social platform button click
   * @param {string} platformId - Platform ID
   */
  const handleSocialButtonClick = (platformId) => {
    setActiveSocialPlatform(platformId);
    setShowAddSocialModal(true);
    setSocialInputValue('');
  };

  /**
   * Add social link to list
   */
  const handleAddSocialLink = () => {
    if (socialInputValue && activeSocialPlatform) {
      const platform = socialPlatforms.find(p => p.id === activeSocialPlatform);
      if (platform) {
        const newLink = {
          platform: platform.id,
          name: platform.name,
          url: socialInputValue
        };
        
        setSocialLinks([...socialLinks, newLink]);
        setShowAddSocialModal(false);
        setSocialInputValue('');
        setActiveSocialPlatform(null);
      }
    }
  };

  /**
   * Remove social link from list
   * @param {number} index - Index of the link to remove
   */
  const handleRemoveSocialLink = (index) => {
    const updatedLinks = [...socialLinks];
    updatedLinks.splice(index, 1);
    setSocialLinks(updatedLinks);
  };

  /**
   * Handle skipping the organization profile step
   */
  const handleSkip = () => {
    // Log that the step is being skipped
    console.log('Organization profile step skipped, using default values and submitting registration');
    
    // Create a complete form data object with default values for organization profile
    const completeFormData = {
      ...formData,
      name: `${formData.firstName}'s Organization`,
      description: "Organization description",
      bio: ""
    };
    
    console.log('Skipping with default values:', completeFormData);
    
    // Call handleSubmit directly with the complete form data
    // This will make the API call and complete registration
    handleSubmit(completeFormData);
  };

  // Render error message if exists
  const renderErrorMessage = () => {
    if (!errors || !errors.name) return null;
    
    return <div className={styles.errorMessage}>{errors.name}</div>;
  };

  return (
    <div className={styles.loginPanel}>
      {/* Left Panel with dark background */}
      <div className={styles.leftPanel}>
        <img className={styles.wallpaper} alt="Background" src={wallpaperBg} />
        <div className={styles.leftPanelContent}>
          <img src={logoImage} alt="Prizmatix Logo" className={styles.leftLogo} />
        </div>
      </div>

      {/* Right Panel with form */}
      <div className={styles.rightPanel}>
        {/* Header with back button and steps indicator */}
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={onGoBack}
            aria-label="Go back"
          >
            <ArrowIcon className={styles.backIcon} />
          </button>
          
          {/* Step indicator */}
          <div className={styles.stepsIndicator}>
            <div className={`${styles.step} ${styles.completed}`}></div>
            <div className={`${styles.step} ${styles.completed}`}></div>
            <div className={`${styles.step} ${styles.active}`}></div>
            <div className={styles.step}></div>
          </div>
          
          <div className={styles.emptySpace}></div>
        </div>
        
        {/* Main content with form */}
        <div className={styles.formContainer}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Setup Organization Profile
            </h1>
            <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
          </div>
          
          {renderErrorMessage()}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Profile Photo */}
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                Profile Photo
              </label>
              <p className={styles.photoSizeHint}>Recommended size: 300 × 300</p>
              
              {!uploadedLogo ? (
                <div className={styles.uploadContainer} onClick={triggerFileInput}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className={styles.fileInput} 
                    onChange={handleLogoUpload}
                    accept="image/*"
                  />
                  <div className={styles.uploadIconContainer}>
                    <UploadIcon className={styles.uploadIcon} />
                  </div>
                </div>
              ) : (
                <div className={styles.uploadedContainer}>
                  <div className={styles.uploadedPreview}>
                    <img src={uploadedLogo.url} alt="Profile" className={styles.previewImage} />
                    <div className={styles.previewInfo}>
                      <span className={styles.previewTitle}>Profile Photo</span>
                      <span className={styles.previewFilename}>{uploadedLogo.name}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={styles.removeButton}
                    onClick={handleRemoveLogo}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            
            {/* Organization Name */}
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.inputLabel}>
                Organization Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={styles.input}
                placeholder=""
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors?.name && (
                <span className={styles.fieldError}>{errors.name}</span>
              )}
            </div>
            
            {/* Bio */}
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.inputLabel}>
                Bio
              </label>
              <textarea
                id="description"
                name="description"
                className={styles.textarea}
                placeholder="Tell Something about your organization"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                rows={4}
              />
            </div>
            
            {/* Social Media Links */}
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                Social Media Links
              </label>
              
              {/* Display added social links */}
              {socialLinks.length > 0 && (
                <div className={styles.socialLinksContainer}>
                  {socialLinks.map((link, index) => (
                    <div key={index} className={styles.socialLinkItem}>
                      <div className={styles.socialLinkContent}>
                        {socialPlatforms.find(p => p.id === link.platform)?.icon}
                        <span className={styles.socialLinkUrl}>{link.url}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.removeSocialBtn}
                        onClick={() => handleRemoveSocialLink(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Social links grid */}
              <div className={styles.socialGrid}>
                {socialPlatforms.map((platform) => (
                  <div 
                    key={platform.id}
                    className={styles.socialGridItem}
                    onClick={() => handleSocialButtonClick(platform.id)}
                  >
                    <div className={styles.socialIconContainer}>
                      {platform.icon}
                    </div>
                    <span className={styles.socialName}>{platform.name}</span>
                    <span className={styles.socialPlusIcon}>+</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Next and Skip buttons */}
            <div className={styles.actionButtons}>
              <button
                type="submit"
                className={styles.nextButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  "Next"
                )}
              </button>
              
              <button
                type="button"
                className={styles.skipButton}
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip this step
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.copyright}>
            Copyright © 2025 <span className={styles.companyName}>Prizmatix</span>
          </p>
        </div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.cropModal}>
            <div className={styles.cropModalHeader}>
              <h3 className={styles.cropModalTitle}>Crop Image</h3>
              <button 
                className={styles.closeModalButton} 
                onClick={handleCropCancel}
              >
                ×
              </button>
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
                    className={styles.cropImage} 
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
            
            <div className={styles.cropControlsContainer}>
              {/* <div className={styles.cropTools}>
                <button className={`${styles.cropTool} ${styles.active}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                </button>
                <button className={styles.cropTool}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </button>
              </div> */}
              
              <div className={styles.zoomContainer}>
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
                  className={styles.cancelCropButton} 
                  onClick={handleCropCancel}
                >
                  Cancel
                </button>
                <button 
                  className={styles.uploadCropButton} 
                  onClick={handleCropConfirm}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Social Link Modal */}
      {showAddSocialModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.socialModal}>
            <div className={styles.socialModalHeader}>
              <h3 className={styles.socialModalTitle}>
                Add {socialPlatforms.find(p => p.id === activeSocialPlatform)?.name} Link
              </h3>
              <button 
                className={styles.closeModalButton} 
                onClick={() => setShowAddSocialModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.socialModalContent}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>URL</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder={`Enter ${activeSocialPlatform === 'website' ? 'website URL' : 'social media profile URL'}`}
                  value={socialInputValue}
                  onChange={(e) => setSocialInputValue(e.target.value)}
                />
              </div>
              
              <div className={styles.socialModalActions}>
                <button 
                  className={styles.cancelSocialButton} 
                  onClick={() => setShowAddSocialModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className={styles.addSocialButton} 
                  onClick={handleAddSocialLink}
                  disabled={!socialInputValue}
                >
                  Add
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
  setSocialLinks: PropTypes.func,
  onGoBack: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

export default OrganizationProfile;