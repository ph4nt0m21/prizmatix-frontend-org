import React, { useState } from "react"; // Import useState
import PropTypes from "prop-types";
import styles from "./ticketSection.module.scss";
import TicketDetailsModal from "./ticketDetailsModal"; // Import the modal

// Dummy data to match the design. Replace with your actual ticket data.
const dummyTickets = [
  { id: "01", name: "Early Bird", quantity: 100, sold: 46, price: 20.0 },
  { id: "02", name: "VIP", quantity: 100, sold: 46, price: 20.0 },
  { id: "03", name: "Early Bird", quantity: 100, sold: 46, price: 20.0 },
  { id: "04", name: "Early Bird", quantity: 100, sold: 46, price: 20.0 },
];

/**
 * TicketSection component - Displays and manages event tickets
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data containing ticket information
 * @returns {JSX.Element} TicketSection component
 */
const TicketSection = ({ eventData }) => {
  // State for modal visibility and the ticket being edited
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  // In a real app, you would fetch and use tickets from eventData
  const tickets = dummyTickets;

  /**
   * Handle clicking the "Create New Ticket" button
   */
  const handleCreateNew = () => {
    setEditingTicket(null); // No ticket data for a new one
    setIsModalOpen(true);
  };

  /**
   * Handle clicking the edit button on a ticket row
   * @param {Object} ticket The ticket to edit
   */
  const handleEditClick = (ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  /**
   * Handle closing the modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTicket(null);
  };

  /**
   * Handle saving the ticket from the modal
   * @param {Object} ticketData The data from the modal form
   */
  const handleSaveTicket = (ticketData) => {
    if (editingTicket) {
      // Logic to update an existing ticket
      console.log("Updating ticket:", ticketData);
    } else {
      // Logic to create a new ticket
      console.log("Creating new ticket:", ticketData);
    }
    handleCloseModal(); // Close the modal after save
  };

  return (
    <>
      <div className={styles.ticketSectionContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Tickets</h2>
          <button
            className={styles.createTicketButton}
            onClick={handleCreateNew} // Add onClick handler
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
            >
              <path
                d="M10 4.16669V15.8334"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.16602 10H15.8327"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Create New Ticket
          </button>
        </div>

        <div className={styles.ticketsList}>
          {/* Table Header */}
          <div className={`${styles.ticketRow} ${styles.ticketsHeader}`}>
            <div className={`${styles.ticketCell} ${styles.cellId}`}>#</div>
            <div className={`${styles.ticketCell} ${styles.cellTicket}`}>
              Ticket
            </div>
            <div className={`${styles.ticketCell} ${styles.cellQuantity}`}>
              Quantity
            </div>
            <div className={`${styles.ticketCell} ${styles.cellSold}`}>
              Sold
            </div>
            <div className={`${styles.ticketCell} ${styles.cellPrice}`}>
              Price
            </div>
            <div className={`${styles.ticketCell} ${styles.cellActions}`}></div>
          </div>

          {/* Table Body */}
          {tickets.map((ticket) => (
            <div key={ticket.id} className={styles.ticketRow}>
              <div className={`${styles.ticketCell} ${styles.cellId}`}>
                {ticket.id}
              </div>
              <div className={`${styles.ticketCell} ${styles.cellTicket}`}>
                {ticket.name}
              </div>
              <div className={`${styles.ticketCell} ${styles.cellQuantity}`}>
                {ticket.quantity}
              </div>
              <div className={`${styles.ticketCell} ${styles.cellSold}`}>
                {ticket.sold}
              </div>
              <div className={`${styles.ticketCell} ${styles.cellPrice}`}>
                ${ticket.price.toFixed(2)}
              </div>
              <div className={`${styles.ticketCell} ${styles.cellActions}`}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditClick(ticket)} // Add onClick handler
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                  >
                    <path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render the modal */}
      <TicketDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTicket}
        ticket={editingTicket || {}}
        saveButtonText={editingTicket ? "Save Changes" : "Create Ticket"}
      />
    </>
  );
};

TicketSection.propTypes = {
  eventData: PropTypes.object.isRequired,
};

export default TicketSection;
