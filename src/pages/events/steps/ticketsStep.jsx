// src/pages/events/steps/ticketsStep.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  
  // Effect to propagate tickets changes to parent component
  useEffect(() => {
    // Send the updated tickets data to parent component
    handleInputChange(tickets, 'tickets');
  }, [tickets, handleInputChange]);
  
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
  
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M20 12C20 10.9 19.1 10 18 10H17.74C17.9 9.55 18 9.03 18 8.5C18 6.57 16.43 5 14.5 5C13.45 5 12.46 5.45 11.83 6.39C11.35 5.32 10.24 4.5 8.89 4.5C7.16 4.5 5.75 5.91 5.75 7.64C5.75 8.47 6.09 9.24 6.64 9.81C5.09 10.24 4 11.7 4 13.34C4 15.3 5.54 16.91 7.5 16.98V17H18C19.1 17 20 16.1 20 15V12ZM10.75 13.13L8.92 11.29L8.21 12L10.75 14.54L15.79 9.5L15.08 8.79L10.75 13.13Z" fill="#7C3AED"/>
        </svg>
        <h2 className={styles.stepTitle}>Create Your First Ticket</h2>
        <p className={styles.stepDescription}>Add your first ticket category</p>
      </div>
      
      <div className={styles.formSection}>
// Replace the tickets list in ticketsStep.jsx with this new structure
{tickets.length > 0 && (
  <div className={styles.ticketsTableContainer}>
    {/* Table header */}
    <div className={styles.ticketsTable}>
      <div className={styles.ticketTableHeader}>
        <div className={styles.ticketDrag}></div>
        <div className={styles.ticketName}>Ticket Name</div>
        <div className={styles.ticketCount}>Ticket Count</div>
        <div className={styles.ticketPrice}>Ticket Price</div>
        <div className={styles.ticketActions}>Action</div>
      </div>
      
      {/* Tickets list */}
      {tickets.map((ticket, index) => (
        <div key={index} className={styles.ticketRow}>
          <div className={styles.ticketDrag}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="#999"/>
            </svg>
          </div>
          <div className={styles.ticketName}>
            <input
              type="text"
              value={ticket.name}
              className={styles.ticketInput}
              readOnly
              onClick={() => handleEditTicket(index)}
            />
          </div>
          <div className={styles.ticketCount}>
            <input
              type="text"
              value={ticket.quantity === 'No Limit' ? 'Unlimited' : ticket.quantity}
              className={styles.ticketInput}
              readOnly
              onClick={() => handleEditTicket(index)}
            />
          </div>
          <div className={styles.ticketPrice}>
            <input
              type="text"
              value={`${parseFloat(ticket.price).toFixed(2)}`}
              className={styles.ticketInput}
              readOnly
              onClick={() => handleEditTicket(index)}
            />
          </div>
          <div className={styles.ticketActions}>
            <button 
              type="button" 
              className={styles.ticketActionButton}
              onClick={() => handleEditTicket(index)}
              aria-label="Edit ticket"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="#6B7280"/>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
    
    {/* Add ticket button */}
    <div className={styles.addTicketContainer}>
      <button 
        type="button" 
        className={styles.addTicketButton}
        onClick={handleCreateTicket}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
        </svg>
        Add Ticket
      </button>
    </div>
  </div>
)}
        
        {/* Display validation message if there are no tickets and the step has been visited */}
        {!isValid && stepStatus.visited && tickets.length === 0 && (
          <div className={styles.fieldError}>At least one ticket type is required</div>
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