// src/pages/events/steps/descriptionStep.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { UpdateEventDescriptionAPI } from '../../../services/allApis';
import styles from './descriptionStep.module.scss';

/**
 * DescriptionStep component - Fourth step of event creation
 * Provides a rich text editor for event description
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data from parent component
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @returns {JSX.Element} DescriptionStep component
 */
const DescriptionStep = ({ 
  eventData = {}, 
  handleInputChange = () => {}, 
  isValid = false, 
  stepStatus = { visited: false }
}) => {
  // Reference to the description editor
  const editorRef = useRef(null);
  
  // Extract description data from eventData or use defaults
  const [description, setDescription] = useState(eventData.description || '');
  
  // State for validation errors
  const [errors, setErrors] = useState({});

  // API-related state
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  /**
   * Initialize the rich text editor
   */
  useEffect(() => {
    // This would be replaced with an actual rich text editor initialization
    // like CKEditor, TinyMCE, Quill, etc.
    // For now, we're just using a contentEditable div
    if (editorRef.current) {
      editorRef.current.innerHTML = description;
    }
  }, []);
  
  /**
   * Validate the description
   * @returns {boolean} Is the description valid
   */
  const validateDescription = () => {
    // For this example, any non-empty description is valid
    // You might want to add more validation rules
    const isValid = !!description.trim();
    
    if (!isValid) {
      setErrors({ description: 'Event description is required' });
    } else {
      setErrors({});
    }
    
    return isValid;
  };
  
  // Effect to propagate description changes to parent component
  useEffect(() => {
    // Send the updated description to parent component
    handleInputChange(description, 'description');
  }, [description, handleInputChange]);
  
  // Update parent component about form validity
  useEffect(() => {
    // Tell parent component if form is valid when step is visited
    if (stepStatus.visited && handleInputChange) {
      const isDescriptionValid = validateDescription();
      handleInputChange(isDescriptionValid, 'descriptionValid');
    }
  }, [description, stepStatus, handleInputChange]);
  
  /**
   * Handle editor content changes
   */
  const handleEditorChange = () => {
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };
  
  /**
   * Apply formatting to selected text
   * @param {string} command - The formatting command
   * @param {string} value - The value for the command (optional)
   */
  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
    handleEditorChange();
  };
  
  /**
   * Save description data to API
   * This function can be used for auto-save functionality
   * @param {string} eventId - Event ID
   * @param {Object} userData - Current user data for updatedBy field
   */
  const saveDescriptionData = async (eventId, userData) => {
    if (!validateDescription() || !eventId) return;
    
    setIsSaving(true);
    setApiError(null);
    
    try {
      // Format description data for API
      const descriptionApiData = {
        id: eventId,
        description: description,
        shortDescription: description.replace(/<[^>]*>/g, '').substring(0, 150), // Create a short description without HTML tags
        keywords: "", // Not available in form
        isPrivate: eventData.eventType === 'private',
        updatedBy: userData?.id || 0
      };
      
      await UpdateEventDescriptionAPI(eventId, descriptionApiData);
      
      // Success handling could be added here
    } catch (error) {
      console.error('Error saving description data:', error);
      setApiError('Failed to save description. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className={styles.stepContainer}>
      {apiError && (
        <div className={styles.errorAlert}>
          {apiError}
          <button 
            className={styles.dismissButton}
            onClick={() => setApiError(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#7C3AED"/>
        </svg>
        <h2 className={styles.stepTitle}>Event Description</h2>
      </div>
      
      <div className={styles.formSection}>
        {/* Rich Text Editor Toolbar */}
        <div className={styles.editorToolbar}>
          <button 
            type="button"
            className={styles.editorButton}
            onClick={() => applyFormatting('bold')}
            title="Bold"
            disabled={isSaving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.6 10.79C16.57 10.12 17.25 9.02 17.25 8C17.25 5.74 15.5 4 13.25 4H7V18H14.04C16.13 18 17.75 16.3 17.75 14.21C17.75 12.69 16.89 11.39 15.6 10.79ZM10 6.5H13C13.83 6.5 14.5 7.17 14.5 8C14.5 8.83 13.83 9.5 13 9.5H10V6.5ZM13.5 15.5H10V12.5H13.5C14.33 12.5 15 13.17 15 14C15 14.83 14.33 15.5 13.5 15.5Z" fill="currentColor"/>
            </svg>
          </button>
          
          <button 
            type="button"
            className={styles.editorButton}
            onClick={() => applyFormatting('italic')}
            title="Italic"
            disabled={isSaving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V7H12.21L8.79 15H6V18H14V15H11.79L15.21 7H18V4H10Z" fill="currentColor"/>
            </svg>
          </button>
          
          <button 
            type="button"
            className={styles.editorButton}
            onClick={() => applyFormatting('underline')}
            title="Underline"
            disabled={isSaving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17C15.31 17 18 14.31 18 11V3H15.5V11C15.5 12.93 13.93 14.5 12 14.5C10.07 14.5 8.5 12.93 8.5 11V3H6V11C6 14.31 8.69 17 12 17ZM5 19V21H19V19H5Z" fill="currentColor"/>
            </svg>
          </button>
          
          <span className={styles.editorDivider}></span>
          
          <button 
            type="button"
            className={styles.editorButton}
            onClick={() => applyFormatting('insertUnorderedList')}
            title="Bullet List"
            disabled={isSaving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10.5C3.17 10.5 2.5 11.17 2.5 12C2.5 12.83 3.17 13.5 4 13.5C4.83 13.5 5.5 12.83 5.5 12C5.5 11.17 4.83 10.5 4 10.5ZM4 4.5C3.17 4.5 2.5 5.17 2.5 6C2.5 6.83 3.17 7.5 4 7.5C4.83 7.5 5.5 6.83 5.5 6C5.5 5.17 4.83 4.5 4 4.5ZM4 16.5C3.17 16.5 2.5 17.18 2.5 18C2.5 18.82 3.18 19.5 4 19.5C4.82 19.5 5.5 18.82 5.5 18C5.5 17.18 4.83 16.5 4 16.5ZM7 19H21V17H7V19ZM7 13H21V11H7V13ZM7 5V7H21V5H7Z" fill="currentColor"/>
            </svg>
          </button>
          
          <button 
            type="button"
            className={styles.editorButton}
            onClick={() => applyFormatting('insertOrderedList')}
            title="Numbered List"
            disabled={isSaving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 17H4V17.5H3V18.5H4V19H2V20H5V16H2V17ZM3 8H4V4H2V5H3V8ZM2 11H3.8L2 13.1V14H5V13H3.2L5 10.9V10H2V11ZM7 5V7H21V5H7ZM7 19H21V17H7V19ZM7 13H21V11H7V13Z" fill="currentColor"/>
            </svg>
          </button>
          
          <span className={styles.editorDivider}></span>
          
          <button 
            type="button"
            className={styles.editorButton}
            onClick={() => applyFormatting('createLink', prompt('Enter URL:'))}
            title="Insert Link"
            disabled={isSaving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12ZM8 13H16V11H8V13ZM17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7Z" fill="currentColor"/>
            </svg>
          </button>
          
          <button 
            type="button"
            className={styles.editorButton}
            onClick={() => applyFormatting('insertImage', prompt('Enter image URL:'))}
            title="Insert Image"
            disabled={isSaving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="currentColor"/>
            </svg>
          </button>
          
          <button 
            type="button"
            className={styles.editorButton}
            onClick={() => applyFormatting('formatBlock', 'blockquote')}
            title="Quote"
            disabled={isSaving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 17H8.6L13.2 9.2V7H6V17ZM14.8 17H17.4L22 9.2V7H14.8V17Z" fill="currentColor"/>
            </svg>
          </button>
          
          <span className={styles.editorDivider}></span>
        </div>
        
        {/* Rich Text Editor Content */}
        <div 
          className={`${styles.editorContent} ${isSaving ? styles.disabled : ''}`}
          contentEditable={!isSaving}
          ref={editorRef}
          onInput={handleEditorChange}
          placeholder="Describe your event, including what attendees can expect, highlights, and any other important details..."
        ></div>
        
        {errors.description && (
          <div className={styles.fieldError}>{errors.description}</div>
        )}

        {/* Character count and help text */}
        <div className={styles.editorHelp}>
          <div className={styles.characterCount}>
            {description.length} characters
          </div>
          <div className={styles.editorTip}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#666666"/>
            </svg>
            Rich formatting helps make your event description more engaging
          </div>
        </div>
      </div>
    </div>
  );
};

DescriptionStep.propTypes = {
  eventData: PropTypes.object,
  handleInputChange: PropTypes.func,
  isValid: PropTypes.bool,
  stepStatus: PropTypes.object
};

export default DescriptionStep;