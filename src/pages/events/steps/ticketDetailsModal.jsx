import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker'; // IMPORTED
import 'react-datepicker/dist/react-datepicker.css'; // IMPORTED
import styles from './ticketDetailsModal.module.scss';

/**
 * Helper function to create a Date object from date and time strings.
 * Returns a valid Date object or null if inputs are invalid.
 * @param {string} dateStr - e.g., '2025-06-25'
 * @param {string} timeStr - e.g., '14:30'
 * @returns {Date|null}
 */
const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) {
    return null;
  }
  const dateTimeString = `${dateStr}T${timeStr}`;
  const date = new Date(dateTimeString);
  // Check if the created date is valid
  return isNaN(date.getTime()) ? null : date;
};

/**
 * TicketDetailsModal component for creating and editing tickets
 * * @param {Object} props Component props
 * @param {Object} props.ticket Ticket data
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @param {Function} props.onSave Function to save the ticket
 * @returns {JSX.Element} TicketDetailsModal component
 */
const TicketDetailsModal = ({
  ticket = {},
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  allTickets = []
}) => {
  const [activePanel, setActivePanel] = useState('basic');
  const [saleDateType, setSaleDateType] = useState('custom');
  const [quantityType, setQuantityType] = useState('limited');
  const [localTicket, setLocalTicket] = useState({});

  // Effect to synchronize the local state when the ticket prop changes
  useEffect(() => {
    const initialState = {
      name: '',
      price: '',
      quantity: '',
      maxPurchaseAmount: 'No Limit', // RENAMED and SIMPLIFIED
      salesStartDate: '',
      salesStartTime: '',
      salesEndDate: '',
      salesEndTime: '',
      isAdvance: false,
      advanceAmount: '',
      description: '',
      saleAfterTicket: '',
      ...ticket, // Overwrite defaults with any passed ticket data
    };
    setLocalTicket(initialState);
    
    // Set quantity type based on incoming ticket data
    setQuantityType(ticket.quantity === 'No Limit' ? 'unlimited' : 'limited');
  }, [ticket]);

  /**
   * Handle changes for standard form inputs (text, number, etc.).
   * @param {Object} e - The input change event object
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalTicket(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  /**
   * Handle date changes from react-datepicker.
   * @param {Date} date - The full Date object from the picker
   * @param {string} dateFieldName - The state property for the date (e.g., 'salesStartDate')
   * @param {string} timeFieldName - The state property for the time (e.g., 'salesStartTime')
   */
  const handleDateChange = (date, dateFieldName, timeFieldName) => {
    if (date) {
      // Format to YYYY-MM-DD
      const dateString = date.toISOString().split('T')[0]; 
      // Format to HH:mm
      const timeString = date.toTimeString().split(' ')[0].substring(0, 5); 
      
      setLocalTicket(prev => ({
        ...prev,
        [dateFieldName]: dateString,
        [timeFieldName]: timeString,
      }));
    } else {
      // Clear values if the date picker is cleared
      setLocalTicket(prev => ({
        ...prev,
        [dateFieldName]: '',
        [timeFieldName]: '',
      }));
    }
  };

  /**
   * Handle toggling between limited and unlimited quantity.
   * @param {string} type - 'limited' or 'unlimited'
   */
  const handleQuantityTypeChange = (type) => {
    setQuantityType(type);
    if (type === 'unlimited') {
      setLocalTicket(prev => ({ ...prev, quantity: 'No Limit' }));
    } else if (localTicket.quantity === 'No Limit') {
      // When switching back to limited, clear the 'No Limit' string
      setLocalTicket(prev => ({ ...prev, quantity: '' }));
    }
  };
  
  /**
   * Handle form submission by calling the onSave prop.
   */
  const handleSubmit = () => {
    onSave(localTicket);
  };
  
  if (!isOpen) return null;
  
  // The modal component
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.sidePanel}>
          <div className={styles.ticketIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12C20 10.9 19.1 10 18 10H17.74C17.9 9.55 18 9.03 18 8.5C18 6.57 16.43 5 14.5 5C13.45 5 12.46 5.45 11.83 6.39C11.35 5.32 10.24 4.5 8.89 4.5C7.16 4.5 5.75 5.91 5.75 7.64C5.75 8.47 6.09 9.24 6.64 9.81C5.09 10.24 4 11.7 4 13.34C4 15.3 5.54 16.91 7.5 16.98V17H18C19.1 17 20 16.1 20 15V12Z" fill="#7C3AED"/>
            </svg>
          </div>
          <h3 className={styles.sidePanelTitle}>Ticket Options</h3>
          <p className={styles.sidePanelSubtitle}>Advanced Ticket Options</p>
          
          <div className={styles.navigationMenu}>
            <button 
              type="button" 
              className={`${styles.navItem} ${activePanel === 'basic' ? styles.active : ''}`}
              onClick={() => setActivePanel('basic')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/></svg>
              Basic Details
            </button>
            
            <button 
              type="button" 
              className={`${styles.navItem} ${activePanel === 'advance' ? styles.active : ''}`}
              onClick={() => setActivePanel('advance')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94C19.59 12.64 19.89 12.12 19.89 11.5C19.89 10.88 19.59 10.36 19.14 10.06L12.36 5.93C12.08 5.75 11.75 5.65 11.39 5.65C10.32 5.65 9.39 6.55 9.39 7.65V16.35C9.39 17.45 10.32 18.35 11.39 18.35C11.75 18.35 12.08 18.25 12.36 18.07L19.14 13.94C19.59 13.64 19.89 13.12 19.89 12.5C19.89 11.88 19.59 11.36 19.14 11.06Z" fill="currentColor"/><path d="M4 20H6V4H4V20Z" fill="currentColor"/></svg>
              Advance Details
            </button>
          </div>
        </div>
        
        <div className={styles.contentPanel}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              {activePanel === 'basic' ? 'Basic Details' : 'Advance Details'}
            </h2>
            <button 
              className={styles.closeButton} 
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#333333"/></svg>
            </button>
          </div>
          
          <div className={styles.modalContent}>
            {activePanel === 'basic' ? (
              // Basic Details Panel
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={styles.formInput}
                    placeholder="e.g., Early Bird"
                    value={localTicket.name || ''}
                    onChange={handleInputChange}
                  />
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
                      step="0.01"
                      className={styles.formInput}
                      placeholder="25.00"
                      value={localTicket.price || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="quantity" className={styles.formLabel}>
                    Quantity
                  </label>
                  <div className={styles.quantityToggle}>
                    <div className={styles.saleTypeToggle}>
                      <button
                        type="button"
                        className={`${styles.saleTypeBtn} ${quantityType === 'limited' ? styles.active : ''}`}
                        onClick={() => handleQuantityTypeChange('limited')}
                      >
                        Limited
                      </button>
                      <button
                        type="button"
                        className={`${styles.saleTypeBtn} ${quantityType === 'unlimited' ? styles.active : ''}`}
                        onClick={() => handleQuantityTypeChange('unlimited')}
                      >
                        Unlimited
                      </button>
                    </div>
                    
                    {quantityType === 'limited' ? (
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        className={styles.formInput}
                        placeholder="Enter quantity"
                        value={localTicket.quantity === 'No Limit' ? '' : (localTicket.quantity || '')}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className={styles.noLimitText}>
                        No limit on the number of tickets
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="maxPurchaseAmount" className={styles.formLabel}>
                    Max Purchase
                  </label>
                  <input
                    type="number"
                    id="maxPurchaseAmount"
                    name="maxPurchaseAmount"
                    className={styles.formInput}
                    placeholder="e.g., 10"
                    value={localTicket.maxPurchaseAmount === 'No Limit' ? '' : localTicket.maxPurchaseAmount || ''}
                    onChange={handleInputChange}
                  />
                   <p className={styles.formHelper}>Max tickets that can be bought in one order. Leave blank for no limit.</p>
                </div>
              </>
            ) : (
              // Advance Details Panel
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="description" className={styles.formLabel}>
                    Description
                  </label>
                  <div className={styles.richTextEditor}>
                    <div className={styles.editorToolbar}>
                      <button type="button" className={styles.editorButton}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12ZM8 13H16V11H8V13ZM17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7Z" fill="currentColor"/></svg></button>
                    </div>
                    <textarea
                      id="description" name="description"
                      className={styles.editorContent} placeholder="Enter ticket description..."
                      value={localTicket.description || ''} onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sale Start/End</label>
                  <p className={styles.formHelper}>Set when tickets are available for purchase.</p>
                  
                  <div className={styles.saleTypeToggle}>
                    <button
                      type="button"
                      className={`${styles.saleTypeBtn} ${saleDateType === 'custom' ? styles.active : ''}`}
                      onClick={() => setSaleDateType('custom')}
                    >
                      Custom Dates
                    </button>
                    <button
                      type="button"
                      className={`${styles.saleTypeBtn} ${saleDateType === 'beforeAfter' ? styles.active : ''}`}
                      onClick={() => setSaleDateType('beforeAfter')}
                    >
                      After
                    </button>
                  </div>
                  
                  {saleDateType === 'custom' ? (
                    // Custom sales dates using DatePicker
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Sales Start</label>
                         <DatePicker
                          selected={combineDateAndTime(localTicket.salesStartDate, localTicket.salesStartTime)}
                          onChange={date => handleDateChange(date, 'salesStartDate', 'salesStartTime')}
                          showTimeSelect
                          dateFormat="MM/dd/yyyy h:mm aa"
                          className={styles.formInput}
                          placeholderText="Select start date and time"
                          isClearable
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Sales End</label>
                        <DatePicker
                          selected={combineDateAndTime(localTicket.salesEndDate, localTicket.salesEndTime)}
                          onChange={date => handleDateChange(date, 'salesEndDate', 'salesEndTime')}
                          showTimeSelect
                          dateFormat="MM/dd/yyyy h:mm aa"
                          className={styles.formInput}
                          placeholderText="Select end date and time"
                          isClearable
                        />
                      </div>
                    </>
                  ) : (
                    // Before/After sales
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Start Sales After</label>
                      <p className={`${styles.formHelper} ${styles.salesAfter}`}>
                        Start sales for this ticket once the selected ticket is sold out.
                      </p>
                      <select
                        id="saleAfterTicket"
                        name="saleAfterTicket"
                        className={styles.formSelect} // Use formSelect for dropdown styling
                        value={localTicket.saleAfterTicket || ''}
                        onChange={handleInputChange}
                      >
                        <option value="" disabled>Select a ticket to start after...</option>
                        {/* Filter out the current ticket from the options */}
                        {allTickets
                          .filter(t => t.name !== ticket.name)
                          .map((t, index) => (
                            <option key={index} value={t.name}>
                              {t.name}
                            </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className={styles.cancelButton} // Optional: Add a cancel button
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className={styles.createButton}
              onClick={handleSubmit}
            >
              Save Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

TicketDetailsModal.propTypes = {
  ticket: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default TicketDetailsModal;