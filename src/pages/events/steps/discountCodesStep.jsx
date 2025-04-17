// src/pages/events/steps/discountCodesStep.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './steps.module.scss';
import DiscountCodeModal from './discountCodeModal';

/**
 * DiscountCodesStep component - Seventh step of event creation
 * Allows creating and managing discount codes for the event
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data from parent component
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @returns {JSX.Element} DiscountCodesStep component
 */
const DiscountCodesStep = ({ 
  eventData = {}, 
  handleInputChange = () => {}, 
  isValid = false, 
  stepStatus = { visited: false }
}) => {
  // Extract discount codes data from eventData or use defaults
  const [discountCodes, setDiscountCodes] = useState(eventData.discountCodes || []);
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDiscountCode, setCurrentDiscountCode] = useState(null);
  const [currentDiscountCodeIndex, setCurrentDiscountCodeIndex] = useState(null);
  
  // State for validation errors
  const [errors, setErrors] = useState({});
  
  // Effect to propagate discount codes changes to parent component
  useEffect(() => {
    // Send the updated discount codes data to parent component
    handleInputChange(discountCodes, 'discountCodes');
    
    // Validate on data change
    validateDiscountCodes();
  }, [discountCodes]);
  
  // Update parent component about form validity
  useEffect(() => {
    if (stepStatus.visited) {
      const isDiscountCodesValid = validateDiscountCodes();
      handleInputChange(isDiscountCodesValid, 'discountCodesValid');
    }
  }, [discountCodes, stepStatus.visited]);
  
  /**
   * Validate discount codes data
   * @returns {boolean} Whether discount codes data is valid
   */
  const validateDiscountCodes = () => {
    // Discount codes are optional, so even empty array is valid
    if (!discountCodes || discountCodes.length === 0) {
      setErrors({});
      return true;
    }
    
    // Check if all discount codes have required fields
    const invalidDiscountCodes = discountCodes.filter(code => {
      return !code.code || !code.discountPercentage || 
             !code.maxDiscountAmount || !code.minDiscountAmount || 
             !code.quantity;
    });
    
    if (invalidDiscountCodes.length > 0) {
      setErrors({ general: 'All discount codes must have all required fields' });
      return false;
    }
    
    // Clear errors if everything is valid
    setErrors({});
    return true;
  };
  
  /**
   * Open discount code modal for creating a new discount code
   */
  const handleCreateDiscountCode = () => {
    setCurrentDiscountCode({
      code: '',
      discountPercentage: '',
      maxDiscountAmount: '',
      minDiscountAmount: '',
      quantity: ''
    });
    setCurrentDiscountCodeIndex(null);
    setIsModalOpen(true);
  };
  
  /**
   * Open discount code modal for editing an existing discount code
   * @param {number} index Index of the discount code to edit
   */
  const handleEditDiscountCode = (index) => {
    setCurrentDiscountCode({ ...discountCodes[index] });
    setCurrentDiscountCodeIndex(index);
    setIsModalOpen(true);
  };
  
  /**
   * Save the current discount code data
   * @param {Object} discountCodeData Discount code data to save
   */
  const handleSaveDiscountCode = (discountCodeData) => {
    if (currentDiscountCodeIndex !== null) {
      // Editing existing discount code
      const updatedDiscountCodes = [...discountCodes];
      updatedDiscountCodes[currentDiscountCodeIndex] = discountCodeData;
      setDiscountCodes(updatedDiscountCodes);
    } else {
      // Adding new discount code
      setDiscountCodes([...discountCodes, discountCodeData]);
    }
    
    // Close the modal
    setIsModalOpen(false);
    setCurrentDiscountCode(null);
    setCurrentDiscountCodeIndex(null);
  };
  
  /**
   * Delete a discount code
   * @param {number} index Index of the discount code to delete
   */
  const handleDeleteDiscountCode = (index) => {
    const updatedDiscountCodes = [...discountCodes];
    updatedDiscountCodes.splice(index, 1);
    setDiscountCodes(updatedDiscountCodes);
  };
  
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M21.41 11.58L12.41 2.58C12.05 2.22 11.55 2 11 2H4C2.9 2 2 2.9 2 4V11C2 11.55 2.22 12.05 2.59 12.42L11.59 21.42C11.95 21.78 12.45 22 13 22C13.55 22 14.05 21.78 14.41 21.41L21.41 14.41C21.78 14.05 22 13.55 22 13C22 12.45 21.77 11.94 21.41 11.58ZM5.5 7C4.67 7 4 6.33 4 5.5C4 4.67 4.67 4 5.5 4C6.33 4 7 4.67 7 5.5C7 6.33 6.33 7 5.5 7Z" fill="#7C3AED"/>
        </svg>
        <h2 className={styles.stepTitle}>Add Coupon Code</h2>
        <p className={styles.stepDescription}>Add your first ticket category</p>
      </div>
      
      <div className={styles.formSection}>
        {discountCodes.length === 0 ? (
          // Empty state for no discount codes
          <div className={styles.emptyDiscountCodesContainer}>
            <button 
              type="button" 
              className={styles.addDiscountCodeButton}
              onClick={handleCreateDiscountCode}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
              </svg>
              Add Coupon Code
            </button>
          </div>
        ) : (
          // List of discount codes
          <div className={styles.discountCodesContainer}>
            {/* Discount Codes table header */}
            <div className={styles.discountCodeTableHeader}>
              <div className={styles.discountCode}>Discount Code</div>
              <div className={styles.discountPercentage}>Discount Percentage</div>
              <div className={styles.maxDiscountAmount}>Max Discount amount</div>
              <div className={styles.minDiscountAmount}>Min discount amount</div>
              <div className={styles.discountQuantity}>Quantity</div>
              <div className={styles.discountActions}></div>
            </div>
            
            {/* Discount codes list */}
            {discountCodes.map((code, index) => (
              <div key={index} className={styles.discountCodeItem}>
                <div className={styles.discountCode} onClick={() => handleEditDiscountCode(index)}>
                  {code.code}
                </div>
                <div className={styles.discountPercentage}>
                  {code.discountPercentage}
                </div>
                <div className={styles.maxDiscountAmount}>
                  {code.maxDiscountAmount}
                </div>
                <div className={styles.minDiscountAmount}>
                  {code.minDiscountAmount}
                </div>
                <div className={styles.discountQuantity}>
                  {code.quantity}
                </div>
                <div className={styles.discountActions}>
                  <button 
                    type="button" 
                    className={styles.discountActionButton}
                    onClick={() => handleDeleteDiscountCode(index)}
                    aria-label="More options"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="#666666"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add discount code button */}
            <div className={styles.addDiscountCodeRow}>
              <button 
                type="button" 
                className={styles.addDiscountCodeInlineButton}
                onClick={handleCreateDiscountCode}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                </svg>
                Add Coupon Code
              </button>
            </div>
          </div>
        )}
        
        {errors.general && (
          <div className={styles.fieldError}>{errors.general}</div>
        )}
      </div>
      
      {/* Discount code modal */}
      {isModalOpen && (
        <DiscountCodeModal
          discountCode={currentDiscountCode}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDiscountCode}
        />
      )}
    </div>
  );
};

DiscountCodesStep.propTypes = {
  eventData: PropTypes.object,
  handleInputChange: PropTypes.func,
  isValid: PropTypes.bool,
  stepStatus: PropTypes.object
};

export default DiscountCodesStep;