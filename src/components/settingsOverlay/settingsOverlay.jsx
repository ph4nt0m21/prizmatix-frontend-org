// src/components/settingsOverlay/settingsOverlay.jsx
import React, { useState, useEffect } from 'react';
import styles from './settingsOverlay.module.scss';
import { getUserData } from '../../utils/authUtil';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { ChangePasswordAPI } from '../../services/allApis';

// Icon placeholders (replace with actual SVGs from your assets if available)
const GeneralIcon = (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/></svg>;
const OrganisationIcon = (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11ZM19 20H5V13H19V20ZM12 17H17V15H12V17ZM12 10C14.7614 10 17 7.76142 17 5C17 2.23858 14.7614 0 12 0C9.23858 0 7 2.23858 7 5C7 7.76142 9.23858 10 12 10ZM12 8C10.8954 8 10 7.10457 10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6C14 7.10457 13.1046 8 12 8Z" fill="currentColor"/></svg>;
const CloseIcon = (props) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/></svg>;
const EyeIcon = (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = (props) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

// Password validation criteria (same as organization registration)
const validateNewPassword = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
});
const isNewPasswordValid = (validation) =>
  validation.length && validation.uppercase && validation.lowercase && validation.number && validation.special;

const SettingsOverlay = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [currentUserData, setCurrentUserData] = useState(null);

  // Change password form state
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(validateNewPassword(''));
  const [changePasswordError, setChangePasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const user = getUserData();
      setCurrentUserData(user || { name: 'User Name', email: 'user@example.com' });
    }
  }, [isOpen]);

  useEffect(() => {
    setPasswordValidation(validateNewPassword(newPassword));
  }, [newPassword]);

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  if (!isOpen) return null;

  const handleProfilePhotoUpload = () => {
    alert('Upload new picture functionality (Not implemented)');
  };

  const toggleChangePasswordForm = () => {
    setShowChangePasswordForm((prev) => !prev);
    if (showChangePasswordForm) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangePasswordError('');
      setConfirmTouched(false);
      setNewPasswordFocused(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangePasswordError('');

    if (!currentPassword.trim()) {
      setChangePasswordError('Current password is required');
      return;
    }
    if (!newPassword.trim()) {
      setChangePasswordError('New password is required');
      return;
    }
    if (!isNewPasswordValid(passwordValidation)) {
      setChangePasswordError('New password does not meet requirements');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError('New password and confirm password do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await ChangePasswordAPI({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      toast.success('Password changed successfully. You can use your new password on next login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePasswordForm(false);
      setConfirmTouched(false);
      setNewPasswordFocused(false);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 400 && message) {
        setChangePasswordError(message);
      } else if (status === 401) {
        toast.error('Session expired. Please log in again.');
        onClose();
      } else if (status === 404 || status === 500) {
        setChangePasswordError('Something went wrong. Please try again later.');
      } else {
        setChangePasswordError(message || 'Something went wrong. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
              <button
                type="button"
                className={styles.changePasswordButton}
                onClick={toggleChangePasswordForm}
              >
                {showChangePasswordForm ? 'Cancel' : 'Change Password'}
              </button>
              {showChangePasswordForm && (
                <form className={styles.changePasswordForm} onSubmit={handleChangePasswordSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="currentPassword" className={styles.label}>Current password</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        className={styles.input}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => setShowCurrentPassword((p) => !p)}
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="newPassword" className={styles.label}>New password</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        className={styles.input}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onFocus={() => setNewPasswordFocused(true)}
                        onBlur={() => setNewPasswordFocused(!!newPassword)}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => setShowNewPassword((p) => !p)}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  {newPasswordFocused && (
                    <div className={styles.passwordRequirements}>
                      <span className={styles.requirementItem}>
                        <span className={`${styles.checkIcon} ${passwordValidation.length ? styles.validIcon : ''}`}>●</span>
                        <span className={passwordValidation.length ? styles.validText : ''}>At least 8 characters</span>
                      </span>
                      <span className={styles.requirementItem}>
                        <span className={`${styles.checkIcon} ${passwordValidation.lowercase ? styles.validIcon : ''}`}>●</span>
                        <span className={passwordValidation.lowercase ? styles.validText : ''}>One lowercase letter</span>
                      </span>
                      <span className={styles.requirementItem}>
                        <span className={`${styles.checkIcon} ${passwordValidation.uppercase ? styles.validIcon : ''}`}>●</span>
                        <span className={passwordValidation.uppercase ? styles.validText : ''}>One uppercase letter</span>
                      </span>
                      <span className={styles.requirementItem}>
                        <span className={`${styles.checkIcon} ${passwordValidation.special ? styles.validIcon : ''}`}>●</span>
                        <span className={passwordValidation.special ? styles.validText : ''}>One special character</span>
                      </span>
                      <span className={styles.requirementItem}>
                        <span className={`${styles.checkIcon} ${passwordValidation.number ? styles.validIcon : ''}`}>●</span>
                        <span className={passwordValidation.number ? styles.validText : ''}>One number</span>
                      </span>
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.label}>Confirm new password</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        className={styles.input}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setConfirmTouched(true); }}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {confirmTouched && confirmPassword && (
                      <span className={passwordsMatch ? styles.matchText : styles.fieldError}>
                        {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    )}
                  </div>
                  {changePasswordError && (
                    <div className={styles.fieldError} role="alert">{changePasswordError}</div>
                  )}
                  <div className={styles.changePasswordActions}>
                    <button
                      type="submit"
                      className={styles.saveChangesButton}
                      disabled={isSubmitting || !currentPassword || !isNewPasswordValid(passwordValidation) || !passwordsMatch}
                    >
                      {isSubmitting ? 'Updating…' : 'Update password'}
                    </button>
                  </div>
                </form>
              )}
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
              {/* <li className={activeSection === 'organisation' ? styles.active : ''} onClick={() => setActiveSection('organisation')}>
                <OrganisationIcon className={styles.navIcon} /> Organisation
              </li> */}
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