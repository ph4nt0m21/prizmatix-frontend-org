// src/components/settingsOverlay/settingsOverlay.jsx
import React, { useState, useEffect } from 'react'; // CORRECTED LINE
import styles from './settingsOverlay.module.scss';
import { getUserData } from '../../utils/authUtil'; // Assuming getUserData can fetch user details for settings
import PropTypes from 'prop-types';

// Icon placeholders (replace with actual SVGs from your assets if available)
const GeneralIcon = (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/></svg>;
const OrganisationIcon = (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11ZM19 20H5V13H19V20ZM12 17H17V15H12V17ZM12 10C14.7614 10 17 7.76142 17 5C17 2.23858 14.7614 0 12 0C9.23858 0 7 2.23858 7 5C7 7.76142 9.23858 10 12 10ZM12 8C10.8954 8 10 7.10457 10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6C14 7.10457 13.1046 8 12 8Z" fill="currentColor"/></svg>;
const CloseIcon = (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/></svg>;

const SettingsOverlay = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [currentUserData, setCurrentUserData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch fresh user data when overlay opens, or use existing from context/cookies
      const user = getUserData(); // Assuming getUserData returns a comprehensive user object
      setCurrentUserData(user || { name: 'User Name', email: 'user@example.com' }); // Fallback data
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProfilePhotoUpload = () => {
    alert('Upload new picture functionality (Not implemented)');
  };

  const handleChangePassword = () => {
    alert('Change password functionality (Not implemented)');
  };

  const handleSaveChanges = () => {
    console.log('Saving changes for:', currentUserData);
    alert('Changes saved (simulated)!');
    onClose(); // Close the overlay after saving
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className={styles.sectionContent}>
            <h3 className={styles.contentTitle}>Basic Details</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Profile Photo</label>
              <div className={styles.profilePhotoArea}>
                <div className={styles.profileAvatarLarge}>{currentUserData?.name ? currentUserData.name.substring(0, 2).toUpperCase() : 'UN'}</div>
                <div className={styles.photoInfo}>
                  <span>Recommended size: 300 x 300</span>
                  <button className={styles.uploadButton} onClick={handleProfilePhotoUpload}>
                    Upload new picture
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="userName" className={styles.label}>Name</label>
              <input
                type="text"
                id="userName"
                className={styles.input}
                value={currentUserData?.name || ''}
                onChange={(e) => setCurrentUserData({ ...currentUserData, name: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="userEmail" className={styles.label}>Email</label>
              <input
                type="email"
                id="userEmail"
                className={styles.input}
                value={currentUserData?.email || ''}
                onChange={(e) => setCurrentUserData({ ...currentUserData, email: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="userPassword" className={styles.label}>Password</label>
              <button className={styles.changePasswordButton} onClick={handleChangePassword}>
                Change Password
              </button>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.saveChangesButton} onClick={handleSaveChanges}>Save Changes</button>
            </div>
          </div>
        );
      case 'organisation':
        return (
          <div className={styles.sectionContent}>
            <h3 className={styles.contentTitle}>Organization Settings</h3>
            <p>Details about your organization can be managed here.</p>
            {/* Add organization specific fields here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Profile Settings</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close settings">
            <CloseIcon />
          </button>
        </div>
        <div className={styles.contentWrapper}>
          <nav className={styles.sidebar}>
            <ul>
              <li className={activeSection === 'general' ? styles.active : ''} onClick={() => setActiveSection('general')}>
                <GeneralIcon className={styles.navIcon} /> General
              </li>
              <li className={activeSection === 'organisation' ? styles.active : ''} onClick={() => setActiveSection('organisation')}>
                <OrganisationIcon className={styles.navIcon} /> Organisation
              </li>
            </ul>
          </nav>
          <div className={styles.mainContent}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

SettingsOverlay.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SettingsOverlay;