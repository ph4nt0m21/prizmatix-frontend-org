import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import styles from "./settingsOverlay.module.scss";
import ProfilePhotoField from "../common/profilePhotoField/profilePhotoField";
import OptionalLabel from "../common/optionalLabel/optionalLabel";
import { useAuth } from "../../context/authContext";
import {
  GetOrganizerProfileAPI,
  UpdateBasicDetailsAPI,
  UpdateOrganizationProfileAPI,
  UploadOrganizerProfilePhotoAPI,
  ChangePasswordAPI,
} from "../../services/allApis";
import {
  mapProfileResponseToUserData,
  notifyProfileUpdated,
  isPlaceholderOrganizationName,
} from "../../utils/profileUtil";

const GeneralIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" />
  </svg>
);
const OrganisationIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11ZM19 20H5V13H19V20ZM12 17H17V15H12V17ZM12 10C14.7614 10 17 7.76142 17 5C17 2.23858 14.7614 0 12 0C9.23858 0 7 2.23858 7 5C7 7.76142 9.23858 10 12 10ZM12 8C10.8954 8 10 7.10457 10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6C14 7.10457 13.1046 8 12 8Z" fill="currentColor" />
  </svg>
);
const CloseIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
  </svg>
);
const EyeIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

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
  const { refreshProfile } = useAuth();
  const [activeSection, setActiveSection] = useState("general");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingBasic, setIsSavingBasic] = useState(false);
  const [isSavingOrganization, setIsSavingOrganization] = useState(false);

  const [basicDetails, setBasicDetails] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
  });
  const [organizationDetails, setOrganizationDetails] = useState({
    organizationName: "",
    profilePhotoUrl: "",
  });
  const [savedOrganizationName, setSavedOrganizationName] = useState("");

  const [photoPreview, setPhotoPreview] = useState({ url: "", name: "", file: null });
  const [removePhoto, setRemovePhoto] = useState(false);

  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(validateNewPassword(""));
  const [changePasswordError, setChangePasswordError] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const applyProfileToState = (profile) => {
    setBasicDetails({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      mobileNumber: profile.mobileNumber || "",
      email: profile.email || "",
    });
    const organizationName = profile.organizationName || "";
    setOrganizationDetails({
      organizationName,
      profilePhotoUrl: profile.profilePhotoUrl || "",
    });
    setSavedOrganizationName(organizationName);
    setPhotoPreview({ url: "", name: "", file: null });
    setRemovePhoto(false);
  };

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await GetOrganizerProfileAPI();
      const profile = response?.data?.data;
      if (profile) {
        applyProfileToState(mapProfileResponseToUserData(profile));
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Could not load profile settings.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  useEffect(() => {
    setPasswordValidation(validateNewPassword(newPassword));
  }, [newPassword]);

  if (!isOpen) return null;

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const currentPhotoPreview = removePhoto
    ? ""
    : photoPreview.url || organizationDetails.profilePhotoUrl;

  const handlePhotoReady = ({ url, name, file }) => {
    if (photoPreview.url?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview.url);
    }
    setPhotoPreview({ url, name, file });
    setRemovePhoto(false);
  };

  const handlePhotoRemove = () => {
    if (photoPreview.url?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview.url);
    }
    setPhotoPreview({ url: "", name: "", file: null });
    setRemovePhoto(true);
  };

  const syncProfile = async (profile) => {
    const mapped = mapProfileResponseToUserData(profile);
    applyProfileToState(mapped);
    await refreshProfile();
    notifyProfileUpdated();
  };

  const handleSaveBasicDetails = async () => {
    if (!basicDetails.firstName.trim() || !basicDetails.lastName.trim() || !basicDetails.mobileNumber.trim()) {
      toast.error("First name, last name, and mobile number are required.");
      return;
    }

    setIsSavingBasic(true);
    try {
      const response = await UpdateBasicDetailsAPI({
        firstName: basicDetails.firstName.trim(),
        lastName: basicDetails.lastName.trim(),
        mobileNumber: basicDetails.mobileNumber.trim(),
      });
      const latestProfile = response?.data?.data;
      if (latestProfile) {
        await syncProfile(latestProfile);
      }
      toast.success("Basic details saved.");
    } catch (err) {
      console.error("Failed to save basic details:", err);
      toast.error(err.response?.data?.message || "Could not save basic details.");
    } finally {
      setIsSavingBasic(false);
    }
  };

  const organizationNameChanged =
    organizationDetails.organizationName.trim() !== savedOrganizationName.trim();
  const hasOrganizationChanges = organizationNameChanged || Boolean(photoPreview.file);

  const handleSaveOrganizationDetails = async () => {
    if (!hasOrganizationChanges) {
      toast.info("No organisation changes to save.");
      return;
    }

    if (organizationNameChanged && !organizationDetails.organizationName.trim()) {
      toast.error("Organisation name is required.");
      return;
    }

    setIsSavingOrganization(true);
    try {
      let latestProfile = null;

      if (organizationNameChanged) {
        const nameResponse = await UpdateOrganizationProfileAPI({
          name: organizationDetails.organizationName.trim(),
        });
        latestProfile = nameResponse?.data?.data;
      }

      if (photoPreview.file) {
        const photoResponse = await UploadOrganizerProfilePhotoAPI(photoPreview.file);
        latestProfile = photoResponse?.data?.data || latestProfile;
      }

      if (latestProfile) {
        await syncProfile(latestProfile);
      }

      const savedParts = [];
      if (organizationNameChanged) savedParts.push("organisation name");
      if (photoPreview.file) savedParts.push("profile photo");
      toast.success(`${savedParts.join(" and ")} saved.`);
    } catch (err) {
      console.error("Failed to save organization details:", err);
      toast.error(err.response?.data?.message || "Could not save organisation details.");
    } finally {
      setIsSavingOrganization(false);
    }
  };

  const toggleChangePasswordForm = () => {
    setShowChangePasswordForm((prev) => !prev);
    if (showChangePasswordForm) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangePasswordError("");
      setConfirmTouched(false);
      setNewPasswordFocused(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangePasswordError("");

    if (!currentPassword.trim()) {
      setChangePasswordError("Current password is required");
      return;
    }
    if (!isNewPasswordValid(passwordValidation)) {
      setChangePasswordError("New password does not meet requirements");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError("New password and confirm password do not match");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await ChangePasswordAPI({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePasswordForm(false);
    } catch (err) {
      setChangePasswordError(err.response?.data?.message || "Could not change password.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const renderGeneralSection = () => (
    <div className={styles.sectionContent}>
      <h3 className={styles.contentTitle}>Basic Details</h3>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.label}>First Name</label>
          <input
            id="firstName"
            className={styles.input}
            value={basicDetails.firstName}
            onChange={(e) => setBasicDetails((prev) => ({ ...prev, firstName: e.target.value }))}
            disabled={isSavingBasic || isLoadingProfile}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lastName" className={styles.label}>Last Name</label>
          <input
            id="lastName"
            className={styles.input}
            value={basicDetails.lastName}
            onChange={(e) => setBasicDetails((prev) => ({ ...prev, lastName: e.target.value }))}
            disabled={isSavingBasic || isLoadingProfile}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="mobileNumber" className={styles.label}>Mobile Number</label>
        <input
          id="mobileNumber"
          className={styles.input}
          value={basicDetails.mobileNumber}
          onChange={(e) => setBasicDetails((prev) => ({ ...prev, mobileNumber: e.target.value }))}
          disabled={isSavingBasic || isLoadingProfile}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input id="email" className={`${styles.input} ${styles.readOnlyInput}`} value={basicDetails.email} readOnly />
        <p className={styles.formHelper}>Email cannot be changed here.</p>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Password</label>
        <button type="button" className={styles.changePasswordButton} onClick={toggleChangePasswordForm}>
          {showChangePasswordForm ? "Cancel" : "Change Password"}
        </button>
        {showChangePasswordForm && (
          <form className={styles.changePasswordForm} onSubmit={handleChangePasswordSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.label}>Current password</label>
              <div className={styles.inputWithIcon}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  className={styles.input}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSubmittingPassword}
                />
                <button type="button" className={styles.iconButton} onClick={() => setShowCurrentPassword((p) => !p)}>
                  {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>New password</label>
              <div className={styles.inputWithIcon}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  className={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setNewPasswordFocused(true)}
                  disabled={isSubmittingPassword}
                />
                <button type="button" className={styles.iconButton} onClick={() => setShowNewPassword((p) => !p)}>
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            {newPasswordFocused && (
              <div className={styles.passwordRequirements}>
                {Object.entries({
                  length: "At least 8 characters",
                  lowercase: "One lowercase letter",
                  uppercase: "One uppercase letter",
                  special: "One special character",
                  number: "One number",
                }).map(([key, label]) => (
                  <span
                    key={key}
                    className={`${styles.requirementItem} ${
                      passwordValidation[key] ? styles.metRequirement : styles.unmetRequirement
                    }`}
                  >
                    <span className={styles.checkIcon}>●</span>
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            )}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm new password</label>
              <div className={styles.inputWithIcon}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className={styles.input}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmTouched(true);
                  }}
                  disabled={isSubmittingPassword}
                />
                <button type="button" className={styles.iconButton} onClick={() => setShowConfirmPassword((p) => !p)}>
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            {changePasswordError && <div className={styles.fieldError}>{changePasswordError}</div>}
            <div className={styles.changePasswordActions}>
              <div className={styles.buttonTooltipWrapper}>
                <button
                  type="submit"
                  className={styles.saveChangesButton}
                  disabled={isSubmittingPassword || !currentPassword || !isNewPasswordValid(passwordValidation) || !passwordsMatch}
                >
                  {isSubmittingPassword ? "Updating…" : "Update password"}
                </button>
                {confirmTouched && confirmPassword && (
                  <span className={`${styles.buttonTooltip} ${passwordsMatch ? styles.tooltipSuccess : styles.tooltipError}`}>
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </span>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      <div className={styles.tabFooter}>
        <button
          type="button"
          className={styles.saveTabButton}
          onClick={handleSaveBasicDetails}
          disabled={isSavingBasic || isLoadingProfile}
        >
          {isSavingBasic ? "Saving…" : "Save basic details"}
        </button>
      </div>
    </div>
  );

  const renderOrganizationSection = () => (
    <div className={styles.sectionContent}>
      <h3 className={styles.contentTitle}>Organisation Details</h3>

      <div className={styles.formGroup}>
        <label className={styles.label}>Profile Photo<OptionalLabel /></label>
        <ProfilePhotoField
          previewUrl={currentPhotoPreview}
          fileName={photoPreview.name}
          onPhotoReady={handlePhotoReady}
          onRemove={handlePhotoRemove}
          disabled={isSavingOrganization || isLoadingProfile}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="organizationName" className={styles.label}>Organisation Name</label>
        <input
          id="organizationName"
          className={styles.input}
          value={organizationDetails.organizationName}
          onChange={(e) =>
            setOrganizationDetails((prev) => ({ ...prev, organizationName: e.target.value }))
          }
          maxLength={100}
          disabled={isSavingOrganization || isLoadingProfile}
        />
        {isPlaceholderOrganizationName(organizationDetails.organizationName) && (
          <p className={styles.formHelper}>
            You skipped this during signup — update it to your real organisation name.
          </p>
        )}
      </div>

      <div className={styles.tabFooter}>
        <button
          type="button"
          className={styles.saveTabButton}
          onClick={handleSaveOrganizationDetails}
          disabled={isSavingOrganization || isLoadingProfile || !hasOrganizationChanges}
        >
          {isSavingOrganization ? "Saving…" : "Save organisation details"}
        </button>
      </div>
    </div>
  );

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
              <li className={activeSection === "general" ? styles.active : ""} onClick={() => setActiveSection("general")}>
                <GeneralIcon className={styles.navIcon} /> Basic Details
              </li>
              <li className={activeSection === "organisation" ? styles.active : ""} onClick={() => setActiveSection("organisation")}>
                <OrganisationIcon className={styles.navIcon} /> Organisation
              </li>
            </ul>
          </nav>
          <div className={styles.mainContent}>
            {isLoadingProfile ? (
              <div className={styles.loadingState}>Loading profile…</div>
            ) : activeSection === "general" ? (
              renderGeneralSection()
            ) : (
              renderOrganizationSection()
            )}
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
