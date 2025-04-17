// src/pages/events/steps/components/DiscountCodeModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './discountCodeModal.module.scss';

/**
 * DiscountCodeModal component for creating and editing discount codes
 * 
 * @param {Object} props Component props
 * @param {Object} props.discountCode Discount code data
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @param {Function} props.onSave Function to save the discount code
 * @returns {JSX.Element} DiscountCodeModal component
 */
const DiscountCodeModal = ({ 
  discountCode = {}, 
  isOpen = false, 
  onClose = () => {}, 
  onSave = () => {}
}) => {
  // Local state for discount code data
  const [localDiscountCode, setLocalDiscountCode] = useState({
    code: '',
    discountPercentage: '',
    maxDiscountAmount: '',
    minDiscountAmount: '',
    quantity: '',
    ...discountCode
  });
  
  // State for validation errors
  const [errors, setErrors] = useState({});
  
  // Update local discount code when prop changes
  useEffect(() => {
    setLocalDiscountCode({
      code: '',
      discountPercentage: '',
      maxDiscountAmount: '',
      minDiscountAmount: '',
      quantity: '',
      ...discountCode
    });
  }, [discountCode]);
  
  /**
   * Handle input change
   * @param {Object} e - Event object
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalDiscountCode(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  /**
   * Validate discount code data
   * @returns {boolean} Whether the discount code data is valid
   */
  const validateDiscountCode = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!localDiscountCode.code || localDiscountCode.code.trim() === '') {
      newErrors.code = 'Discount code is required';
    }
    
    if (!localDiscountCode.discountPercentage) {
      newErrors.discountPercentage = 'Discount percentage is required';
    } else if (isNaN(localDiscountCode.discountPercentage) || 
               parseFloat(localDiscountCode.discountPercentage) < 0 || 
               parseFloat(localDiscountCode.discountPercentage) > 100) {
      newErrors.discountPercentage = 'Discount percentage must be between 0 and 100';
    }
    
    if (!localDiscountCode.maxDiscountAmount) {
      newErrors.maxDiscountAmount = 'Max discount amount is required';
    } else if (isNaN(localDiscountCode.maxDiscountAmount) || 
               parseFloat(localDiscountCode.maxDiscountAmount) < 0) {
      newErrors.maxDiscountAmount = 'Max discount amount must be a valid number';
    }
    
    if (!localDiscountCode.minDiscountAmount) {
      newErrors.minDiscountAmount = 'Min discount amount is required';
    } else if (isNaN(localDiscountCode.minDiscountAmount) || 
               parseFloat(localDiscountCode.minDiscountAmount) < 0) {
      newErrors.minDiscountAmount = 'Min discount amount must be a valid number';
    }
    
    if (!localDiscountCode.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(localDiscountCode.quantity) || 
               parseInt(localDiscountCode.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (validateDiscountCode()) {
      onSave(localDiscountCode);
    }
  };
  
  if (!isOpen) return null;
  
  // The modal component
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {discountCode.code ? 'Edit Discount Code' : 'Add Discount Code'}
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#333333"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label htmlFor="code" className={styles.formLabel}>
              Discount Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              className={`${styles.formInput} ${errors.code ? styles.inputError : ''}`}
              placeholder="e.g. EARLY10"
              value={localDiscountCode.code || ''}
              onChange={handleInputChange}
            />
            {errors.code && <div className={styles.fieldError}>{errors.code}</div>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="discountPercentage" className={styles.formLabel}>
              Discount Percentage
            </label>
            <input
              type="number"
              id="discountPercentage"
              name="discountPercentage"
              min="0"
              max="100"
              className={`${styles.formInput} ${errors.discountPercentage ? styles.inputError : ''}`}
              placeholder="e.g. 10"
              value={localDiscountCode.discountPercentage || ''}
              onChange={handleInputChange}
            />
            {errors.discountPercentage && <div className={styles.fieldError}>{errors.discountPercentage}</div>}
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="maxDiscountAmount" className={styles.formLabel}>
                Max Discount Amount
              </label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.prefix}>$</span>
                <input
                  type="number"
                  id="maxDiscountAmount"
                  name="maxDiscountAmount"
                  min="0"
                  step="0.01"
                  className={`${styles.formInput} ${styles.withPrefix} ${errors.maxDiscountAmount ? styles.inputError : ''}`}
                  placeholder="0.00"
                  value={localDiscountCode.maxDiscountAmount || ''}
                  onChange={handleInputChange}
                />
              </div>
              {errors.maxDiscountAmount && <div className={styles.fieldError}>{errors.maxDiscountAmount}</div>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="minDiscountAmount" className={styles.formLabel}>
                Min Discount Amount
              </label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.prefix}>$</span>
                <input
                  type="number"
                  id="minDiscountAmount"
                  name="minDiscountAmount"
                  min="0"
                  step="0.01"
                  className={`${styles.formInput} ${styles.withPrefix} ${errors.minDiscountAmount ? styles.inputError : ''}`}
                  placeholder="0.00"
                  value={localDiscountCode.minDiscountAmount || ''}
                  onChange={handleInputChange}
                />
              </div>
              {errors.minDiscountAmount && <div className={styles.fieldError}>{errors.minDiscountAmount}</div>}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="quantity" className={styles.formLabel}>
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              className={`${styles.formInput} ${errors.quantity ? styles.inputError : ''}`}
              placeholder="e.g. 100"
              value={localDiscountCode.quantity || ''}
              onChange={handleInputChange}
            />
            {errors.quantity && <div className={styles.fieldError}>{errors.quantity}</div>}
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          
          <button 
            type="button" 
            className={styles.saveButton}
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

DiscountCodeModal.propTypes = {
  discountCode: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func
};

export default DiscountCodeModal;