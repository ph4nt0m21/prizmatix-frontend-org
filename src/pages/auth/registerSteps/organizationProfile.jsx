import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './organizationProfile.module.scss';
import ProfilePhotoField from '../../../components/common/profilePhotoField/profilePhotoField';
import OptionalLabel from '../../../components/common/optionalLabel/optionalLabel';

// Import SVG components
import { ReactComponent as ArrowIcon } from "../../../assets/icons/arrow-icon.svg";
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
 * @param {Object} props.uploadedLogo - Uploaded logo data
 * @param {Function} props.setUploadedLogo - Function to set uploaded logo
 * @param {Array} props.socialLinks - Social links array
 * @param {Function} props.setSocialLinks - Function to set social links
 * @param {Function} props.onGoBack - Function to handle going back
 * @param {Function} props.completeRegistration - Completes registration and signs the user in
 * @returns {JSX.Element} OrganizationProfile component
 */
const OrganizationProfile = ({ 
  formData, 
  handleChange, 
  nextStep, 
  errors, 
  isLoading,
  uploadedLogo,
  setUploadedLogo,
  socialLinks,
  setSocialLinks,
  onGoBack,
  completeRegistration
}) => {
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

  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const onFormSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const handlePhotoReady = ({ url, name, file }) => {
    if (uploadedLogo?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedLogo.url);
    }
    setUploadedLogo({ url, name, file });
  };

  const handleRemoveLogo = () => {
    if (uploadedLogo?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedLogo.url);
    }
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
    completeRegistration({
      name: `${formData.firstName}'s Organisation`,
      bio: "",
    });
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
              Setup Organisation Profile
            </h1>
            <p className={styles.welcomeSubtitle}>Enter your details to create an account</p>
          </div>
          
          {renderErrorMessage()}
          
          <form onSubmit={onFormSubmit} className={styles.form}>
            {/* Profile Photo */}
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                Profile Photo<OptionalLabel />
              </label>
              <ProfilePhotoField
                previewUrl={uploadedLogo?.url || ""}
                fileName={uploadedLogo?.name || ""}
                onPhotoReady={handlePhotoReady}
                onRemove={handleRemoveLogo}
                disabled={isLoading}
                uploadLabel="Upload picture"
              />
            </div>
            
            {/* Organisation Name */}
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.inputLabel}>
                Organisation Name<OptionalLabel />
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
              <label htmlFor="bio" className={styles.inputLabel}>
                Bio<OptionalLabel />
              </label>
              <textarea
                id="bio"
                name="bio"
                className={styles.textarea}
                placeholder="Tell something about your organisation"
                value={formData.bio || ""}
                onChange={handleChange}
                disabled={isLoading}
                rows={4}
              />
            </div>
            
            {/* Social Media Links */}
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                Social Media Links<OptionalLabel />
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
        
      </div>

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
  uploadedLogo: PropTypes.object,
  setUploadedLogo: PropTypes.func,
  socialLinks: PropTypes.array,
  setSocialLinks: PropTypes.func,
  onGoBack: PropTypes.func.isRequired,
  completeRegistration: PropTypes.func.isRequired
};

export default OrganizationProfile;