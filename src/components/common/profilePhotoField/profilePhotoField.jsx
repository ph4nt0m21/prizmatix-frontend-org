import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { createCroppedJpegFile } from "../../../utils/imageCropUtil";
import ProfileAvatar from "../profileAvatar/profileAvatar";
import styles from "./profilePhotoField.module.scss";

const SUPPORTED_TYPES = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE_MB = 100;

const ProfilePhotoField = ({
  previewUrl,
  fileName,
  onPhotoReady,
  onRemove,
  disabled = false,
  uploadLabel = "Upload new picture",
}) => {
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);

  const isFileTypeSupported = (file) => {
    if (!file?.name) return false;
    const fileExtension = `.${file.name.split(".").pop().toLowerCase()}`;
    return SUPPORTED_TYPES.includes(fileExtension);
  };

  const isFileSizeValid = (file) => file?.size && file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;

  const onImageLoad = (event) => {
    const { width, height } = event.currentTarget;
    const nextCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(nextCrop);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isFileTypeSupported(file)) {
      toast.error(`Unsupported file type. Please use ${SUPPORTED_TYPES.join(", ")}`);
      return;
    }
    if (!isFileSizeValid(file)) {
      toast.error(`File size exceeds the ${MAX_FILE_SIZE_MB} MB limit.`);
      return;
    }

    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    event.target.value = null;
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage(null);
    setOriginalFile(null);
    setCompletedCrop(null);
  };

  const handleCropConfirm = async () => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current || !originalFile) {
      return;
    }

    try {
      const croppedFile = await createCroppedJpegFile({
        image: imgRef.current,
        crop: completedCrop,
        fileName: originalFile.name || "profile-photo.jpg",
      });
      const preview = URL.createObjectURL(croppedFile);
      onPhotoReady({
        url: preview,
        name: croppedFile.name,
        file: croppedFile,
      });
      setShowCropModal(false);
      setSelectedImage(null);
      setOriginalFile(null);
      setCompletedCrop(null);
    } catch (err) {
      console.error("Failed to crop profile photo:", err);
      toast.error("Could not process the image. Please try another file.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.photoRow}>
        <div className={styles.avatarPreview}>
          <ProfileAvatar
            src={previewUrl}
            alt="Profile"
            className={styles.avatarImage}
          />
        </div>
        <div className={styles.photoActions}>
          <span className={styles.hint}>Recommended size: 300 × 300</span>
          {previewUrl ? (
            <div className={styles.selectedFile}>
              <span className={styles.fileName}>{fileName || "Profile photo selected"}</span>
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  {uploadLabel}
                </button>
                {onRemove && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={onRemove}
                    disabled={disabled}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              {uploadLabel}
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {showCropModal && (
        <div className={styles.cropBackdrop}>
          <div className={styles.cropModal}>
            <h3>Crop profile photo</h3>
            <div className={styles.cropContainer}>
              {selectedImage && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(nextCrop) => setCompletedCrop(nextCrop)}
                  aspect={1}
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    src={selectedImage}
                    alt="To crop"
                    onLoad={onImageLoad}
                    className={styles.cropImage}
                  />
                </ReactCrop>
              )}
            </div>
            <div className={styles.cropActions}>
              <button type="button" className={styles.cancelButton} onClick={handleCropCancel}>
                Cancel
              </button>
              <button type="button" className={styles.doneButton} onClick={handleCropConfirm}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProfilePhotoField.propTypes = {
  previewUrl: PropTypes.string,
  fileName: PropTypes.string,
  onPhotoReady: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  disabled: PropTypes.bool,
  uploadLabel: PropTypes.string,
};

export default ProfilePhotoField;
