// src/pages/events/steps/ticketsStep.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { UpdateEventTicketsAPI } from '../../../services/allApis';
import TicketDetailsModal from './ticketDetailsModal';
import styles from './ticketsStep.module.scss';

/**
 * TicketsStep component - Sixth step of event creation
 * Allows creating and managing different ticket types for the event
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data from parent component
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @returns {JSX.Element} TicketsStep component
 */
const TicketsStep = ({ 
  eventData = {}, 
  handleInputChange = () => {}, 
  isValid = false, 
  stepStatus = { visited: false }
}) => {
  // Extract tickets data from eventData or use defaults
  const [tickets, setTickets] = useState(eventData.tickets || []);
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(null);
  const [activeModalStep, setActiveModalStep] = useState("basic"); // basic, pricing, sale
  
  // State for validation errors
  const [errors, setErrors] = useState({});

  // API-related state
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Effect to propagate tickets changes to parent component
  useEffect(() => {
    // Send the updated tickets data to parent component
    handleInputChange(tickets, 'tickets');
    
    // Validate on data change
    validateTickets();
  }, [tickets]);
  
  // Update parent component about form validity
  useEffect(() => {
    if (stepStatus.visited) {
      const isTicketsValid = validateTickets();
      handleInputChange(isTicketsValid, 'ticketsValid');
    }
  }, [tickets, stepStatus.visited]);
  
  /**
   * Validate tickets data
   * @returns {boolean} Whether tickets data is valid
   */
  const validateTickets = () => {
    // At least one ticket is required
    if (tickets.length === 0) {
      setErrors({ general: 'At least one ticket type is required' });
      return false;
    }
    
    // Check if all tickets have required fields
    const invalidTickets = tickets.filter(ticket => {
      return !ticket.name || !ticket.price || !ticket.quantity;
    });
    
    if (invalidTickets.length > 0) {
      setErrors({ general: 'All tickets must have name, price, and quantity' });
      return false;
    }
    
    // Clear errors if everything is valid
    setErrors({});
    return true;
  };
  
  /**
   * Open ticket modal for creating a new ticket
   */
  const handleCreateTicket = () => {
    setCurrentTicket({
      name: '',
      price: '',
      quantity: '',
      maxPurchaseAmount: 'No Limit',
      salesStartDate: '',
      salesStartTime: '',
      salesEndDate: '',
      salesEndTime: '',
      isAdvance: false,
      advanceAmount: ''
    });
    setCurrentTicketIndex(null);
    setActiveModalStep("basic");
    setIsModalOpen(true);
  };
  
  /**
   * Open ticket modal for editing an existing ticket
   * @param {number} index Index of the ticket to edit
   */
  const handleEditTicket = (index) => {
    setCurrentTicket({ ...tickets[index] });
    setCurrentTicketIndex(index);
    setActiveModalStep("basic");
    setIsModalOpen(true);
  };
  
  /**
   * Save the current ticket data
   * @param {Object} ticketData Ticket data to save
   */
  const handleSaveTicket = (ticketData) => {
    if (currentTicketIndex !== null) {
      // Editing existing ticket
      const updatedTickets = [...tickets];
      updatedTickets[currentTicketIndex] = ticketData;
      setTickets(updatedTickets);
    } else {
      // Adding new ticket
      setTickets([...tickets, ticketData]);
    }
    
    // Close the modal
    setIsModalOpen(false);
    setCurrentTicket(null);
    setCurrentTicketIndex(null);
  };
  
  /**
   * Delete a ticket
   * @param {number} index Index of the ticket to delete
   */
  const handleDeleteTicket = (index) => {
    const updatedTickets = [...tickets];
    updatedTickets.splice(index, 1);
    setTickets(updatedTickets);
  };

  /**
   * Save tickets data to API
   * This function can be used for auto-save functionality
   * @param {string} eventId - Event ID
   * @param {Object} userData - Current user data for updatedBy field
   */
  const saveTicketsData = async (eventId, userData) => {
    if (!validateTickets() || !eventId) return;
    
    setIsSaving(true);
    setApiError(null);
    
    try {
      // Format tickets data for API
      const ticketsApiData = {
        id: eventId,
        ticketStructures: tickets.map(ticket => ({
          id: ticket.id || 0, // Use existing ID or 0 for new tickets
          name: ticket.name,
          price: parseFloat(ticket.price),
          finalPrice: parseFloat(ticket.price), // Same as price unless there are fees
          ticketCapacity: parseInt(ticket.quantity),
          maxPurchasePerOrder: ticket.maxPurchaseAmount === 'No Limit' ? 0 : parseInt(ticket.maxPurchaseAmount),
          currency: "USD", // Default to USD, could be made configurable
          limitedQuantity: true,
          description: "", // Not available in basic form
          // Convert dates and times to ISO format for API
          listingStartTime: ticket.salesStartDate && ticket.salesStartTime ? 
            `${ticket.salesStartDate}T${ticket.salesStartTime}:00Z` : null,
          listingEndTime: ticket.salesEndDate && ticket.salesEndTime ? 
            `${ticket.salesEndDate}T${ticket.salesEndTime}:00Z` : null,
          toBeDeleted: false
        })),
        updatedBy: userData?.id || 0
      };
      
      await UpdateEventTicketsAPI(eventId, ticketsApiData);
      
      // Success handling could be added here
    } catch (error) {
      console.error('Error saving tickets data:', error);
      setApiError('Failed to save tickets information. Please try again.');
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
          <path d="M20 12C20 10.9 19.1 10 18 10H17.74C17.9 9.55 18 9.03 18 8.5C18 6.57 16.43 5 14.5 5C13.45 5 12.46 5.45 11.83 6.39C11.35 5.32 10.24 4.5 8.89 4.5C7.16 4.5 5.75 5.91 5.75 7.64C5.75 8.47 6.09 9.24 6.64 9.81C5.09 10.24 4 11.7 4 13.34C4 15.3 5.54 16.91 7.5 16.98V17H18C19.1 17 20 16.1 20 15V12ZM10.75 13.13L8.92 11.29L8.21 12L10.75 14.54L15.79 9.5L15.08 8.79L10.75 13.13Z" fill="#7C3AED"/>
        </svg>
        <h2 className={styles.stepTitle}>Create Your First Ticket</h2>
        <p className={styles.stepDescription}>Add your first ticket category</p>
      </div>
      
      <div className={styles.formSection}>
        {tickets.length === 0 ? (
          // Empty state for no tickets
          <div className={styles.emptyTicketsContainer}>
            <button 
              type="button" 
              className={styles.addTicketButton}
              onClick={handleCreateTicket}
              disabled={isSaving}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
              </svg>
              Create a Ticket
            </button>
          </div>
        ) : (
          // List of tickets
          <div className={styles.ticketsContainer}>
            {/* Ticket table header */}
            <div className={styles.ticketTableHeader}>
              <div className={styles.ticketType}>Ticket Type</div>
              <div className={styles.ticketQuantity}>Quantity</div>
              <div className={styles.ticketPrice}>Price</div>
              <div className={styles.ticketAdvance}>Advance</div>
            </div>
            
            {/* Tickets list */}
            {tickets.map((ticket, index) => (
              <div key={index} className={styles.ticketItem}>
                <div className={styles.ticketHandle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="#999"/>
                  </svg>
                </div>
                <div className={styles.ticketType} onClick={() => !isSaving && handleEditTicket(index)}>
                  {ticket.name}
                </div>
                <div className={styles.ticketQuantity}>
                  {ticket.quantity}
                </div>
                <div className={styles.ticketPrice}>
                  ${parseFloat(ticket.price).toFixed(2)}
                </div>
                <div className={styles.ticketAdvance}>
                  {ticket.isAdvance ? `$${parseFloat(ticket.advanceAmount).toFixed(2)}` : '-'}
                </div>
                <div className={styles.ticketActions}>
                  <button 
                    type="button" 
                    className={styles.ticketActionButton}
                    onClick={() => !isSaving && handleEditTicket(index)}
                    aria-label="Edit ticket"
                    disabled={isSaving}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="#666"/>
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    className={styles.ticketActionButton}
                    onClick={() => !isSaving && handleDeleteTicket(index)}
                    aria-label="Delete ticket"
                    disabled={isSaving}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="#666"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add ticket button */}
            <div className={styles.addTicketRow}>
              <button 
                type="button" 
                className={styles.addTicketInlineButton}
                onClick={handleCreateTicket}
                disabled={isSaving}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                </svg>
                Add Ticket
              </button>
            </div>
          </div>
        )}
        
        {errors.general && (
          <div className={styles.fieldError}>{errors.general}</div>
        )}

        {/* Ticket types information box */}
        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#7C3AED"/>
            </svg>
          </div>
          <div className={styles.infoContent}>
            <h3 className={styles.infoTitle}>Ticket Types</h3>
            <p className={styles.infoText}>
              Create different ticket types for your event, such as 'General Admission', 'VIP', or 'Early Bird'.
              You can set different prices, quantities, and sale periods for each ticket type.
            </p>
          </div>
        </div>
      </div>
      
      {/* Ticket details modal */}
      {isModalOpen && (
        <TicketDetailsModal
          ticket={currentTicket}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTicket}
          activeStep={activeModalStep}
          setActiveStep={setActiveModalStep}
        />
      )}
    </div>
  );
};

TicketsStep.propTypes = {
  eventData: PropTypes.object,
  handleInputChange: PropTypes.func,
  isValid: PropTypes.bool,
  stepStatus: PropTypes.object
};

export default TicketsStep;