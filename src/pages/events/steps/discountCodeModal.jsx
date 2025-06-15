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

  const [selectedTicketType, setSelectedTicketType] = useState('');

  const handleTicketTypeChange = (e) => {
    setSelectedTicketType(e.target.value);
  };
  
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
  };
  
  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    onSave(localDiscountCode);
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
              className={styles.formInput}
              placeholder="e.g. EARLY10"
              value={localDiscountCode.code || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
  <label htmlFor="ticketType" className={styles.formLabel}>
    Ticket Type
  </label>
  <select
    id="ticketType"
    name="ticketType"
    className={styles.formInput}
    value={selectedTicketType} // You'll need to manage this state in your component
    onChange={handleTicketTypeChange} // A new handler for the dropdown
  >
    <option value="">Select a ticket type</option>
    <option value="EARLY10">Early Bird</option>
    <option value="GENERAL">General Admission</option>
    <option value="VIP">VIP</option>
    {/* Add more ticket types as needed */}
  </select>
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
              className={styles.formInput}
              placeholder="e.g. 10"
              value={localDiscountCode.discountPercentage || ''}
              onChange={handleInputChange}
            />
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
                  className={`${styles.formInput} ${styles.withPrefix}`}
                  placeholder="0.00"
                  value={localDiscountCode.maxDiscountAmount || ''}
                  onChange={handleInputChange}
                />
              </div>
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
                  className={`${styles.formInput} ${styles.withPrefix}`}
                  placeholder="0.00"
                  value={localDiscountCode.minDiscountAmount || ''}
                  onChange={handleInputChange}
                />
              </div>
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
              className={styles.formInput}
              placeholder="e.g. 100"
              value={localDiscountCode.quantity || ''}
              onChange={handleInputChange}
            />
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