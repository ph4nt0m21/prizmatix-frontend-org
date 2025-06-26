import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './artStep.module.scss';
// --- [NEW] Import the cropping library and its CSS ---
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


/**
 * ArtStep component - Fifth step of event creation
 * Handles thumbnail and banner image uploads for the event
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data from parent component
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @returns {JSX.Element} ArtStep component
 */
const ArtStep = ({
  eventData = {},
  handleInputChange = () => { },
  isValid = false,
  stepStatus = { visited: false }
}) => {
  const artData = eventData.art || {};

  const [files, setFiles] = useState({
    thumbnail: artData.thumbnailFile || null,
    banner: artData.bannerFile || null
  });

  const [previews, setPreviews] = useState({
    thumbnail: null,
    banner: null
  });

  const [dragActive, setDragActive] = useState({
    thumbnail: false,
    banner: false
  });

  const thumbnailInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // --- [NEW] State and Refs for the cropping modal ---
  const [showCropModal, setShowCropModal] = useState(false);
  const [croppingType, setCroppingType] = useState(null); // 'thumbnail' or 'banner'
  const [croppingImage, setCroppingImage] = useState(null); // The image source (data URL) for the cropper
  const [originalFile, setOriginalFile] = useState(null); // The original file object
  const [crop, setCrop] = useState(); // The crop selection state
  const [completedCrop, setCompletedCrop] = useState(null); // The completed crop data
  const imgRef = useRef(null); // Ref to the image element in the cropper
  const previewCanvasRef = useRef(null); // Ref to the hidden canvas for drawing the preview

  const supportedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
  const maxSizes = {
    thumbnail: 100, // 100 MB
    banner: 100 // 100 MB
  };

  useEffect(() => {
    // Get the file objects from the parent component's data
    const thumbnailFile = artData.thumbnailFile;
    const bannerFile = artData.bannerFile;

    // Create new blob URLs only if the files exist
    const newThumbnailUrl = thumbnailFile ? URL.createObjectURL(thumbnailFile) : null;
    const newBannerUrl = bannerFile ? URL.createObjectURL(bannerFile) : null;

    // Update the local preview state
    setPreviews({
      thumbnail: newThumbnailUrl,
      banner: newBannerUrl
    });
        // IMPORTANT: Return a cleanup function
    // This runs when the component unmounts or when the files change,
    // preventing memory leaks by revoking the old URLs.
    return () => {
      if (newThumbnailUrl) {
        URL.revokeObjectURL(newThumbnailUrl);
      }
      if (newBannerUrl) {
        URL.revokeObjectURL(newBannerUrl);
      }
    };
    // This effect's dependency array ensures it re-runs if the file objects change
  }, [artData.thumbnailFile, artData.bannerFile]);

  const releaseFilePreviewUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isFileTypeSupported = (file) => {
    if (!file || !file.name) return false;
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return supportedTypes.includes(fileExtension);
  };

const isFileSizeValid = (file, maxSizeMB) => {
  // Return false if the file or its size is not available
  if (!file?.size) {
    return false;
  }

  const maxSizeInBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

  /**
   * [MODIFIED] Opens the cropping modal instead of directly setting the file.
   * @param {string} type - 'thumbnail' or 'banner'
   * @param {File} file - Selected file
   */
  const handleFileChange = (type, file) => {
    if (!file || !file.name || !file.size) return;

    if (!isFileTypeSupported(file)) {
      alert(`Unsupported file type. Please use ${supportedTypes.join(', ')}`);
      return;
    }
    if (!isFileSizeValid(file, maxSizes[type])) {
      alert(`File size exceeds the ${maxSizes[type]} MB limit.`);
      return;
    }

    setOriginalFile(file); // Store the original file
    setCroppingType(type); // Set the type for aspect ratio

    // Use FileReader to create a data URL for the cropper
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCroppingImage(reader.result?.toString() || '');
      setShowCropModal(true); // Show the modal after the image is loaded
    });
    reader.readAsDataURL(file);
  };

  /**
   * [NEW] This function runs after the user finishes cropping.
   * It sets the final preview and updates the parent state.
   * @param {string} type - 'thumbnail' or 'banner'
   * @param {File} croppedFile - The new file created from the canvas
   */
  const handleCropFinalized = (type, croppedFile) => {
    if (previews[type]) {
      releaseFilePreviewUrl(previews[type]);
    }

    const fileUrl = URL.createObjectURL(croppedFile);

    setFiles(prev => ({ ...prev, [type]: croppedFile }));
    setPreviews(prev => ({ ...prev, [type]: fileUrl }));

    const newArtData = {
      ...artData,
      [`${type}File`]: croppedFile,
      [`${type}Url`]: fileUrl,
      [`${type}Name`]: croppedFile.name,
    };

    handleInputChange(newArtData, 'art');
  };

  const handleFileInputChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      handleFileChange(type, file);
      e.target.value = null;
    }
  };

  const handleDrag = (e, type, dragState) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragState === 'enter') {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (dragState === 'leave') {
      setDragActive(prev => ({ ...prev, [type]: false }));
    } else if (dragState === 'drop') {
      setDragActive(prev => ({ ...prev, [type]: false }));
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChange(type, e.dataTransfer.files[0]);
      }
    }
  };

  const handleBrowseClick = (type) => {
    if (type === 'thumbnail' && thumbnailInputRef.current) {
      thumbnailInputRef.current.click();
    } else if (type === 'banner' && bannerInputRef.current) {
      bannerInputRef.current.click();
    }
  };

  const removeFile = (type) => {
    if (previews[type]) {
      releaseFilePreviewUrl(previews[type]);
    }
    setFiles(prev => ({ ...prev, [type]: null }));
    setPreviews(prev => ({ ...prev, [type]: null }));
    const newArtData = {
      ...artData,
      [`${type}File`]: null,
      [`${type}Url`]: null,
      [`${type}Name`]: null,
    };
    handleInputChange(newArtData, 'art');
  };

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const isBanner = croppingType === 'banner';
    
    // --- [MODIFIED] ---
    // Change the aspect ratio for the banner to 4:1 (from 1200 / 300).
    // The thumbnail aspect ratio remains 1:1.
    const aspect = isBanner ? 16/6 : 1; 
    
    // This sets the initial width of the crop selection. 98% is fine.
    const cropWidth = isBanner ? 98 : 90;

    setCrop(
      centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: cropWidth,
          },
          aspect, // Use the new aspect ratio here
          width,
          height
        ),
        width,
        height
      )
    );
  }

  const handleCropComplete = () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
      const image = imgRef.current;
      const canvas = previewCanvasRef.current;
      const crop = completedCrop;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');
      const pixelRatio = window.devicePixelRatio;

      canvas.width = crop.width * pixelRatio * scaleX;
      canvas.height = crop.height * pixelRatio * scaleY;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );

      // Define your desired quality level (0.0 to 1.0)
      const quality = 0.85; 

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          
          // If the original was a PNG, we should update the name to reflect the new JPG format
          const newFileName = originalFile.name.replace(/\.(png|gif)$/i, '.jpg');

          const croppedFile = new File([blob], newFileName, {
            type: 'image/jpeg', // Force the blob to be treated as a JPEG
          });
          handleCropFinalized(croppingType, croppedFile);
          handleCancelCrop();
        },
        'image/jpeg', // Force the output format to JPEG
        quality 
      );
    }
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setCroppingImage(null);
    setOriginalFile(null);
    setCompletedCrop(null);
    setCroppingType(null);
    setCrop(undefined);
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="#7C3AED" />
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
            className={`${styles.uploadDropzoneThumbnail} ${dragActive.thumbnail ? styles.dragActive : ''} ${files.thumbnail ? styles.hasFile : ''}`}
            onDragEnter={(e) => handleDrag(e, 'thumbnail', 'enter')}
            onDragOver={(e) => handleDrag(e, 'thumbnail', 'enter')}
            onDragLeave={(e) => handleDrag(e, 'thumbnail', 'leave')}
            onDrop={(e) => handleDrag(e, 'thumbnail', 'drop')}
          >
            {files.thumbnail ? (
              <div className={styles.imagePreview}>
                <img
                  src={previews.thumbnail}
                  alt="Thumbnail Preview"
                  className={styles.previewImage}
                />
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{files.thumbnail.name}</span>
                  <span className={styles.fileSize}>{formatFileSize(files.thumbnail.size)}</span>
                </div>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeFile('thumbnail')}
                  aria-label="Remove thumbnail"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className={styles.uploadInterfaceThumbnail}>
                <div className={styles.uploadIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="#7C3AED" />
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
                  accept=".jpg,.jpeg,.png,.webp"
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
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#666666" />
              </svg>
              Supported files: .jpg, .jpeg, .png, .webp
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
            className={`${styles.uploadDropzoneBanner} ${dragActive.banner ? styles.dragActive : ''} ${files.banner ? styles.hasFile : ''}`}
            onDragEnter={(e) => handleDrag(e, 'banner', 'enter')}
            onDragOver={(e) => handleDrag(e, 'banner', 'enter')}
            onDragLeave={(e) => handleDrag(e, 'banner', 'leave')}
            onDrop={(e) => handleDrag(e, 'banner', 'drop')}
          >
            {files.banner ? (
              <div className={styles.imagePreview}>
                <img
                  src={previews.banner}
                  alt="Banner Preview"
                  className={styles.previewImage}
                />
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{files.banner.name}</span>
                  <span className={styles.fileSize}>{formatFileSize(files.banner.size)}</span>
                </div>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeFile('banner')}
                  aria-label="Remove banner"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className={styles.uploadInterfaceBanner}>
                <div className={styles.uploadIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="#7C3AED" />
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
                  accept=".jpg,.jpeg,.png,.webp"
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
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#666666" />
              </svg>
              Supported files: .jpg, .jpeg, .png, .webp
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
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#7C3AED" />
            </svg>
            Image Recommendations
          </h3>
          <ul className={styles.recommendationsList}>
            <li>Thumbnail: Use a square image (1:1 ratio), minimum 500x500 pixels</li>
            <li>Banner: Use a wide image (16:6 ratio), minimum 1200x450 pixels</li>
            <li>Make sure text is readable and images are clear</li>
            <li>Use high-quality images that represent your event well</li>
          </ul>
        </div>
      </div>

      <canvas ref={previewCanvasRef} style={{ display: 'none' }} />

      {showCropModal && (
        <div className={styles.cropModalBackdrop}>
          <div className={styles.cropModalContent}>
            <h2>Crop Image</h2>
            <div className={styles.cropContainer}>
              {croppingImage && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={croppingType === 'banner' ? 16 / 6 : 1}
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    src={croppingImage}
                    alt="Crop Preview"
                    onLoad={onImageLoad}
                    style={{ maxHeight: '70vh' }}
                  />
                </ReactCrop>
              )}
            </div>
            <div className={styles.cropModalActions}>
              <button type="button" onClick={handleCancelCrop} className={styles.cancelButton}>Cancel</button>
              <button type="button" onClick={handleCropComplete} className={styles.doneButton}>Done</button>
            </div>
          </div>
        </div>
      )}
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