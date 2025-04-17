// src/pages/events/steps/components/TicketDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ticketDetailsModal.module.scss';

/**
 * TicketDetailsModal component for creating and editing tickets
 * 
 * @param {Object} props Component props
 * @param {Object} props.ticket Ticket data
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @param {Function} props.onSave Function to save the ticket
 * @param {string} props.activeStep Current active step in modal
 * @param {Function} props.setActiveStep Function to change active step
 * @returns {JSX.Element} TicketDetailsModal component
 */
const TicketDetailsModal = ({ 
  ticket = {}, 
  isOpen = false, 
  onClose = () => {}, 
  onSave = () => {},
  activeStep = 'basic',
  setActiveStep = () => {}
}) => {
  // Local state for ticket data
  const [localTicket, setLocalTicket] = useState({
    name: '',
    price: '',
    quantity: '',
    maxPurchaseAmount: 'No Limit',
    salesStartDate: '',
    salesStartTime: '',
    salesEndDate: '',
    salesEndTime: '',
    isAdvance: false,
    advanceAmount: '',
    ...ticket
  });
  
  // State for validation errors
  const [errors, setErrors] = useState({});
  
  // Update local ticket when prop changes
  useEffect(() => {
    setLocalTicket({
      name: '',
      price: '',
      quantity: '',
      maxPurchaseAmount: 'No Limit',
      salesStartDate: '',
      salesStartTime: '',
      salesEndDate: '',
      salesEndTime: '',
      isAdvance: false,
      advanceAmount: '',
      ...ticket
    });
  }, [ticket]);
  
  /**
   * Handle input change
   * @param {Object} e - Event object
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalTicket(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  /**
   * Validate ticket data
   * @returns {boolean} Whether the ticket data is valid
   */
  const validateTicket = () => {
    const newErrors = {};
    
    // Basic validation
    if (activeStep === 'basic') {
      if (!localTicket.name || localTicket.name.trim() === '') {
        newErrors.name = 'Ticket name is required';
      }
      
      if (!localTicket.price) {
        newErrors.price = 'Price is required';
      } else if (isNaN(localTicket.price) || parseFloat(localTicket.price) < 0) {
        newErrors.price = 'Price must be a valid number';
      }
      
      if (!localTicket.quantity) {
        newErrors.quantity = 'Quantity is required';
      } else if (isNaN(localTicket.quantity) || parseInt(localTicket.quantity) <= 0) {
        newErrors.quantity = 'Quantity must be a positive number';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return false;
      }
    }
    
    // Additional validation for other steps can be added here
    
    return true;
  };
  
  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    // If we're on the first step (basic), validate and go to next step
    if (activeStep === 'basic') {
      if (validateTicket()) {
        setActiveStep('pricing');
      }
      return;
    }
    
    // If we're on the pricing step, validate and go to next step
    if (activeStep === 'pricing') {
      if (validateTicket()) {
        setActiveStep('sale');
      }
      return;
    }
    
    // If we're on the sales step, validate and save
    if (activeStep === 'sale') {
      if (validateTicket()) {
        onSave(localTicket);
      }
    }
  };
  
  /**
   * Handle back button
   */
  const handleBack = () => {
    if (activeStep === 'pricing') {
      setActiveStep('basic');
    } else if (activeStep === 'sale') {
      setActiveStep('pricing');
    }
  };
  
  /**
   * Render step content based on active step
   * @returns {JSX.Element} Step content
   */
  const renderStepContent = () => {
    switch (activeStep) {
      case 'basic':
        return (
          <div className={styles.modalContent}>
            <h3 className={styles.sectionTitle}>Basic Details</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Ticket Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                placeholder="eg. The great Music Festival 2025"
                value={localTicket.name || ''}
                onChange={handleInputChange}
              />
              {errors.name && <div className={styles.fieldError}>{errors.name}</div>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.formLabel}>
                Price
              </label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.prefix}>$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  className={`${styles.formInput} ${styles.withPrefix} ${errors.price ? styles.inputError : ''}`}
                  placeholder="0.00"
                  value={localTicket.price || ''}
                  onChange={handleInputChange}
                />
              </div>
              {errors.price && <div className={styles.fieldError}>{errors.price}</div>}
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
                value={localTicket.quantity || ''}
                onChange={handleInputChange}
              />
              {errors.quantity && <div className={styles.fieldError}>{errors.quantity}</div>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="maxPurchaseAmount" className={styles.formLabel}>
                Max Purchase Amount
              </label>
              <select
                id="maxPurchaseAmount"
                name="maxPurchaseAmount"
                className={styles.formSelect}
                value={localTicket.maxPurchaseAmount || 'No Limit'}
                onChange={handleInputChange}
              >
                <option value="No Limit">No Limit</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      
      case 'pricing':
        return (
          <div className={styles.modalContent}>
            <h3 className={styles.sectionTitle}>Pricing & Quantity</h3>
            
            <div className={styles.formGroup}>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="isAdvance"
                  name="isAdvance"
                  className={styles.checkboxInput}
                  checked={localTicket.isAdvance || false}
                  onChange={handleInputChange}
                />
                <label htmlFor="isAdvance" className={styles.checkboxLabel}>
                  Enable advance payment
                </label>
              </div>
              {localTicket.isAdvance && (
                <div className={`${styles.formGroup} ${styles.indented}`}>
                  <label htmlFor="advanceAmount" className={styles.formLabel}>
                    Advance Amount
                  </label>
                  <div className={styles.inputWithPrefix}>
                    <span className={styles.prefix}>$</span>
                    <input
                      type="number"
                      id="advanceAmount"
                      name="advanceAmount"
                      min="0"
                      step="0.01"
                      className={`${styles.formInput} ${styles.withPrefix} ${errors.advanceAmount ? styles.inputError : ''}`}
                      placeholder="0.00"
                      value={localTicket.advanceAmount || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.advanceAmount && (
                    <div className={styles.fieldError}>{errors.advanceAmount}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'sale':
        return (
          <div className={styles.modalContent}>
            <h3 className={styles.sectionTitle}>
              Sale start/end
              <div className={styles.saleTypeSelector}>
                <button
                  type="button"
                  className={`${styles.saleTypeBtn} ${!localTicket.customSaleDates ? styles.active : ''}`}
                  onClick={() => 
                    setLocalTicket(prev => ({ ...prev, customSaleDates: false }))
                  }
                >
                  Before/After
                </button>
                <button
                  type="button"
                  className={`${styles.saleTypeBtn} ${localTicket.customSaleDates ? styles.active : ''}`}
                  onClick={() => 
                    setLocalTicket(prev => ({ ...prev, customSaleDates: true }))
                  }
                >
                  Custom
                </button>
              </div>
            </h3>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Sales Start
              </label>
              <p className={styles.formDescription}>
                Enter the official name of your event that will be displayed to attendees
              </p>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="salesStartDate" className={styles.formLabel}>
                    Date
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="date"
                      id="salesStartDate"
                      name="salesStartDate"
                      className={styles.formInput}
                      value={localTicket.salesStartDate || ''}
                      onChange={handleInputChange}
                    />
                    <div className={styles.inputIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11Z" fill="#7C3AED"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="salesStartTime" className={styles.formLabel}>
                    Time
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="time"
                      id="salesStartTime"
                      name="salesStartTime"
                      className={styles.formInput}
                      value={localTicket.salesStartTime || ''}
                      onChange={handleInputChange}
                    />
                    <div className={styles.inputIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7V12.25L17 14.92L16.25 16.15L11 13V7H12.5Z" fill="#7C3AED"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Sales End
              </label>
              <p className={styles.formDescription}>
                Enter the official name of your event that will be displayed to attendees
              </p>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="salesEndDate" className={styles.formLabel}>
                    Date
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="date"
                      id="salesEndDate"
                      name="salesEndDate"
                      className={styles.formInput}
                      value={localTicket.salesEndDate || ''}
                      onChange={handleInputChange}
                    />
                    <div className={styles.inputIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11Z" fill="#7C3AED"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="salesEndTime" className={styles.formLabel}>
                    Time
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="time"
                      id="salesEndTime"
                      name="salesEndTime"
                      className={styles.formInput}
                      value={localTicket.salesEndTime || ''}
                      onChange={handleInputChange}
                    />
                    <div className={styles.inputIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7V12.25L17 14.92L16.25 16.15L11 13V7H12.5Z" fill="#7C3AED"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  if (!isOpen) return null;
  
  // The modal component
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <h2>Ticket Details</h2>
            <div className={styles.modalTabs}>
              <button 
                type="button"
                className={`${styles.tabButton} ${activeStep === 'basic' ? styles.active : ''}`}
                onClick={() => setActiveStep('basic')}
              >
                Basic Details
              </button>
              <button 
                type="button"
                className={`${styles.tabButton} ${activeStep === 'pricing' ? styles.active : ''}`}
                onClick={() => {
                  if (validateTicket()) {
                    setActiveStep('pricing');
                  }
                }}
              >
                Pricing & Quantity
              </button>
              <button 
                type="button"
                className={`${styles.tabButton} ${activeStep === 'sale' ? styles.active : ''}`}
                onClick={() => {
                  if (validateTicket() && activeStep === 'pricing') {
                    setActiveStep('sale');
                  } else if (validateTicket()) {
                    setActiveStep('pricing');
                  }
                }}
              >
                Sale start/end
              </button>
            </div>
          </div>
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
        
        {renderStepContent()}
        
        <div className={styles.modalFooter}>
          {activeStep !== 'basic' && (
            <button 
              type="button" 
              className={styles.backButton}
              onClick={handleBack}
            >
              Back
            </button>
          )}
          
          <button 
            type="button" 
            className={styles.saveButton}
            onClick={handleSubmit}
          >
            {activeStep === 'sale' ? 'Save' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

TicketDetailsModal.propTypes = {
  ticket: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  activeStep: PropTypes.string,
  setActiveStep: PropTypes.func
};

export default TicketDetailsModal;