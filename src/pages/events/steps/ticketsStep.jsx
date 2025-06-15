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

  const [openMenuIndex, setOpenMenuIndex] = useState(null); //state for managing the action menu dropdown
  
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
  
  // Connect this to the main "Add Ticket" button.
const handleAddTicketRow = () => {
  const newTicket = {
    name: '',
    price: '0.00',
    quantity: '0',
    maxPurchaseAmount: 'No Limit',
    salesStartDate: '',
    salesStartTime: '',
    salesEndDate: '',
    salesEndTime: '',
    isAdvance: false,
    advanceAmount: '',
  };
  setTickets(prevTickets => [...prevTickets, newTicket]);
};

// ADD this new function to handle inline input changes.
const handleTicketRowChange = (e, index) => {
  const { name, value } = e.target;
  const updatedTickets = [...tickets];
  updatedTickets[index] = { ...updatedTickets[index], [name]: value };
  setTickets(updatedTickets);
};

// ADD this function to duplicate a ticket.
const handleDuplicateTicket = (index) => {
  const ticketToDuplicate = { ...tickets[index] };
  ticketToDuplicate.name = ticketToDuplicate.name ? `${ticketToDuplicate.name} (Copy)` : '';

  const updatedTickets = [...tickets];
  updatedTickets.splice(index + 1, 0, ticketToDuplicate);
  setTickets(updatedTickets);
  setOpenMenuIndex(null); // Close the actions menu
};

  return (
    <div className={styles.stepContainer}>
      
      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M20 12C20 10.9 19.1 10 18 10H17.74C17.9 9.55 18 9.03 18 8.5C18 6.57 16.43 5 14.5 5C13.45 5 12.46 5.45 11.83 6.39C11.35 5.32 10.24 4.5 8.89 4.5C7.16 4.5 5.75 5.91 5.75 7.64C5.75 8.47 6.09 9.24 6.64 9.81C5.09 10.24 4 11.7 4 13.34C4 15.3 5.54 16.91 7.5 16.98V17H18C19.1 17 20 16.1 20 15V12ZM10.75 13.13L8.92 11.29L8.21 12L10.75 14.54L15.79 9.5L15.08 8.79L10.75 13.13Z" fill="#7C3AED"/>
        </svg>
        <h2 className={styles.stepTitle}>Create Your Tickets</h2>
      </div>
      
      <div className={styles.formSection}>
        {tickets.length === 0 ? (
          // ============== EMPTY STATE ==============
          // Shown only when there are no tickets.
          <div className={styles.emptyTicketsContainer}>
            <h3 className={styles.emptyStateTitle}>Create Your First Ticket</h3>
            <p className={styles.emptyStateDescription}>Add your first ticket category.</p>
            <button 
              type="button" 
              className={styles.createTicketButton}
              onClick={handleAddTicketRow} // This will create the first row and show the table
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
              </svg>
              Create a Ticket
            </button>
          </div>
        ) : (
          // ============== TICKETS TABLE ==============
          // Shown when at least one ticket exists.
          <div className={styles.ticketsContainer}>
            {/* Tickets table header */}
            <div className={styles.ticketTableHeader}>
              <div className={styles.ticketDrag} style={{ marginRight: '8px' }}/>
              <div className={styles.ticketName}>Ticket Name</div>
              <div className={styles.ticketCount}>Ticket Count</div>
              <div className={styles.ticketPrice}>Ticket Price</div>
              <div className={styles.ticketActions} style={{ justifyContent: 'center' }}>Action</div>
            </div>
            
            {/* Tickets list */}
            {tickets.map((ticket, index) => (
              <div key={index} className={styles.ticketRow}>
                {/* ... existing ticket row JSX from previous step ... */}
                <div className={styles.ticketDrag}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-grip-vertical" viewBox="0 0 16 16">
                        <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>
                </div>
                <div className={styles.ticketName}><input name="name" type="text" className={styles.ticketInput} placeholder="eg. General Admission" value={ticket.name || ''} onChange={(e) => handleTicketRowChange(e, index)}/></div>
                <div className={styles.ticketCount}><input name="quantity" type="number" className={styles.ticketInput} placeholder="100" value={ticket.quantity === 'No Limit' ? '' : ticket.quantity || ''} onChange={(e) => handleTicketRowChange(e, index)}/></div>
                <div className={styles.ticketPrice}><input name="price" type="number" step="0.01" className={styles.ticketInput} placeholder="10.00" value={ticket.price || ''} onChange={(e) => handleTicketRowChange(e, index)}/></div>
                <div className={styles.ticketActions}><div className={styles.actionMenuContainer}><button type="button" className={styles.ticketActionButton} onClick={() => handleEditTicket(index)} aria-label="Advanced settings"><svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7280" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.69-1.62-.92L14.4 2.25C14.34 2.02 14.12 1.87 13.88 1.87H10.12c-.25 0-.47.15-.53.38L9.2 4.87c-.58.23-1.12.54-1.62.92L5.19 4.81c-.22-.08-.47 0-.59.22L2.69 8.35c-.11.2-.06.47.12.61l2.03 1.58c-.05.32-.07.64-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.69 1.62.92l.39 2.62c.06.23.28.38.53.38h3.75c.25 0 .47-.15.53-.38l.39-2.62c.58.23 1.12.54 1.62-.92l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.11-.2-.06-.47-.12-.61l-2.03-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></button><button type="button" className={styles.ticketActionButton} onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)} aria-label="More actions"><svg width="4" height="16" viewBox="0 0 4 16" fill="#6B7280" xmlns="http://www.w3.org/2000/svg"><path d="M2 4C3.1 4 4 3.1 4 2s-.9-2-2-2-2 .9-2 2 .9 4 2 4zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg></button>{openMenuIndex === index && (<div className={styles.actionMenu}><button onClick={() => { handleDuplicateTicket(index); }}>Duplicate</button><button onClick={() => { handleEditTicket(index); setOpenMenuIndex(null); }}>Edit</button><button onClick={() => { handleDeleteTicket(index); setOpenMenuIndex(null); }} className={styles.deleteAction}>Delete</button></div>)}</div></div>
              </div>
            ))}
            
            <div className={styles.addTicketRow}>
              <button 
                type="button" 
                className={styles.addTicketInlineButton}
                onClick={handleAddTicketRow}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                </svg>
                Add Ticket
              </button>
            </div>
          </div>
        )}
      </div>
        
        {/* Show validation error if the step has been visited and is not valid */}
        {/* {!isValid && stepStatus.visited && tickets.length === 0 && (
          <div className={styles.fieldError}>
            Please add at least one ticket type for your event
          </div>
        )} */}

        {/* Ticket types information box */}
        {/* <div className={styles.infoBox}>
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
        </div> */}
      
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