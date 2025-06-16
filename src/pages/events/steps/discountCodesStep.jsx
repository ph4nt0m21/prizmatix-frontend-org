// src/pages/events/steps/discountCodesStep.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DiscountCodeModal from './discountCodeModal';
import styles from './discountCodesStep.module.scss';

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

  const [openMenuIndex, setOpenMenuIndex] = useState(null);

    const availableTickets = [
    { id: 'all', name: 'All Tickets' },
    { id: 'TICKET_01', name: 'Early Bird' },
    { id: 'TICKET_02', name: 'General Admission' },
    { id: 'TICKET_03', name: 'VIP Pass' },
  ];
  
  // Effect to propagate discount codes changes to parent component
  useEffect(() => {
    // Send the updated discount codes data to parent component
    handleInputChange(discountCodes, 'discountCodes');
  }, [discountCodes, handleInputChange]);
  
  /**
   * Open discount code modal for creating a new discount code
   */
  // UPDATE the create handler to include a default ticketType
  const handleAddDiscountCodeRow = () => {
    const newDiscountCode = {
      code: '',
      ticketType: 'all', // Default to 'All Tickets'
      discountPercentage: '',
      maxDiscountAmount: '',
      minDiscountAmount: '',
      quantity: '',
    };
    setDiscountCodes(prevCodes => [...prevCodes, newDiscountCode]);
  };

    // ADD this new handler for the inline input fields.
  const handleDiscountCodeRowChange = (e, index) => {
    const { name, value } = e.target;
    const updatedDiscountCodes = [...discountCodes];
    updatedDiscountCodes[index] = { ...updatedDiscountCodes[index], [name]: value };
    setDiscountCodes(updatedDiscountCodes);
  };

    // ADD a handler to manage the new Ticket Type dropdown in the table
  const handleTicketTypeChange = (e, index) => {
    const newTicketType = e.target.value;
    const updatedDiscountCodes = [...discountCodes];
    updatedDiscountCodes[index].ticketType = newTicketType;
    setDiscountCodes(updatedDiscountCodes);
    // Note: This changes the value directly. You might want to add a "save" button
    // or automatically persist this change to your backend if necessary.
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
      </div>
      
      <div className={styles.formSection}>
        {discountCodes.length === 0 ? (
          // ============== EMPTY STATE ==============
          <div className={styles.emptyDiscountCodesContainer}>
            <h3 className={styles.emptyStateTitle}>Add Coupon Code</h3>
            <p className={styles.emptyStateDescription}>You can add them later or don't add at all if you want</p>
            <button 
              type="button" 
              className={styles.createCouponButton}
              onClick={handleAddDiscountCodeRow} // Changed to add a row
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/></svg>
              Create Coupon code
            </button>
          </div>
        ) : (
          // ============== INLINE-EDITABLE CODES TABLE ==============
          <div className={styles.discountCodesContainer}>
            <div className={styles.discountCodeTableHeader}>
              <div className={styles.discountCode}>Name</div>
              <div className={styles.ticketType}>Ticket Type</div>
              <div className={styles.discountPercentage}>Discount %</div>
              <div className={styles.maxDiscountAmount}>Max Discount</div>
              <div className={styles.minDiscountAmount}>Min Discount</div>
              <div className={styles.discountQuantity}>Quantity</div>
              <div className={styles.discountActions}>Action</div>
            </div>
            
            {discountCodes.map((code, index) => (
              <div key={index} className={styles.discountCodeItem}>
                <div className={styles.discountCode}>
                    <input type="text" name="code" placeholder="e.g. BUZZ25" value={code.code || ''} onChange={(e) => handleDiscountCodeRowChange(e, index)} className={styles.inlineInput} />
                </div>
                <div className={styles.ticketType}>
                  <select value={code.ticketType || 'all'} onChange={(e) => handleTicketTypeChange(e, index)} className={styles.ticketTypeSelect} >
                    {availableTickets.map(ticket => (
                      <option key={ticket.id} value={ticket.id}>{ticket.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.discountPercentage}>
                    <input type="number" name="discountPercentage" placeholder="15" value={code.discountPercentage || ''} onChange={(e) => handleDiscountCodeRowChange(e, index)} className={styles.inlineInput} />
                </div>
                <div className={styles.maxDiscountAmount}>
                    <input type="number" name="maxDiscountAmount" placeholder="20.00" step="0.01" value={code.maxDiscountAmount || ''} onChange={(e) => handleDiscountCodeRowChange(e, index)} className={styles.inlineInput} />
                </div>
                <div className={styles.minDiscountAmount}>
                    <input type="number" name="minDiscountAmount" placeholder="5.00" step="0.01" value={code.minDiscountAmount || ''} onChange={(e) => handleDiscountCodeRowChange(e, index)} className={styles.inlineInput} />
                </div>
                <div className={styles.discountQuantity}>
                    <input type="number" name="quantity" placeholder="100" value={code.quantity || ''} onChange={(e) => handleDiscountCodeRowChange(e, index)} className={styles.inlineInput} />
                </div>
                <div className={styles.discountActions}>
                  <div className={styles.actionMenuContainer}>
                    <button type="button" className={styles.discountActionButton} onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === index ? null : index); }} aria-label="Actions">
                      <svg width="4" height="16" viewBox="0 0 4 16" fill="#6B7280" xmlns="http://www.w3.org/2000/svg"><path d="M2 4C3.1 4 4 3.1 4 2s-.9-2-2-2-2 .9-2 2 .9 4 2 4zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
                    </button>
                    {openMenuIndex === index && (
                      <div className={styles.actionMenu}>
                        <button onClick={(e) => { e.stopPropagation(); handleEditDiscountCode(index); setOpenMenuIndex(null); }}>Edit in Modal</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteDiscountCode(index); setOpenMenuIndex(null); }} className={styles.deleteAction}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className={styles.addDiscountCodeRow}>
              <button type="button" className={styles.addDiscountCodeInlineButton} onClick={handleAddDiscountCodeRow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/></svg>
                Create Coupon code
              </button>
            </div>
          </div>
        )}
      </div>

        {/* Discount codes information box */}
        {/* <div className={styles.infoBox}>
          <div className={styles.infoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#7C3AED"/>
            </svg>
          </div>
          <div className={styles.infoContent}>
            <h3 className={styles.infoTitle}>About Discount Codes</h3>
            <p className={styles.infoText}>
              Discount codes allow you to offer special pricing to specific attendees. You can create different codes for different discount amounts, set minimum purchase requirements, and limit the number of uses per code.
            </p>
          </div>
        </div> */}
      
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