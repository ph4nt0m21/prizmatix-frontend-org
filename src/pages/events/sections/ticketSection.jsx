import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { format } from 'date-fns'; // Import the format function
import styles from "./ticketSection.module.scss";
import TicketDetailsModal from "./ticketDetailsModal";
import LoadingSpinner from "../../../components/common/loadingSpinner/loadingSpinner";
import { 
  GetEventTicketStructuresAPI, 
  UpdateTicketStructureAPI, 
  DeleteTicketStructureAPI,
  CreateTicketStructureAPI
} from "../../../services/allApis";

// We can add a local helper function to use the same logic
const formatDateTimeForAPI = (dateString, timeString) => {
  if (!dateString || !timeString) return null;
  const paddedTime = timeString.includes(':') ? timeString : `${timeString}:00`;
  const dateTime = new Date(`${dateString} ${paddedTime}`);
  if (isNaN(dateTime.getTime())) {
    console.warn("Invalid date or time provided:", dateString, timeString);
    return null;
  }
  return format(dateTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
};

const TicketSection = () => {
  const { eventId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await GetEventTicketStructuresAPI(eventId);
      setTickets(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchTickets();
    }
  }, [eventId]);

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
    // Map API data to modal's expected format
    const mappedTicket = {
      ...ticket,
      name: ticket.name,
      price: ticket.price,
      quantity: ticket.limitedQuantity ? ticket.ticketCapacity : "No Limit",
      enableMaxPurchase: !!ticket.maxPurchasePerOrder,
      purchaseLimit: ticket.maxPurchasePerOrder,
      salesStartDate: ticket.listingStartTime ? new Date(ticket.listingStartTime).toLocaleDateString() : '',
      salesStartTime: ticket.listingStartTime ? new Date(ticket.listingStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      salesEndDate: ticket.listingEndTime ? new Date(ticket.listingEndTime).toLocaleDateString() : '',
      salesEndTime: ticket.listingEndTime ? new Date(ticket.listingEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    };
    setEditingTicket(mappedTicket);
    setIsModalOpen(true);
  };

  /**
   * Handle deleting a ticket
   * @param {number} ticketId The ID of the ticket to delete
   */
  const handleDeleteClick = async (ticketId) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await DeleteTicketStructureAPI(ticketId);
        console.log(`Ticket with ID ${ticketId} deleted successfully.`);
        fetchTickets(); // Re-fetch the data to update the table
      } catch (err)
        {
        console.error("Failed to delete ticket:", err);
        setError("Failed to delete the ticket. Please try again.");
      }
    }
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
  const handleSaveTicket = async (ticketData) => {
    try {
      // Define fallback dates
      const fallbackListingStartTime = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      const fallbackListingEndTime = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // You might want to get this from the event data

      const listingStartTime = formatDateTimeForAPI(ticketData.salesStartDate, ticketData.salesStartTime) || fallbackListingStartTime;
      const listingEndTime = formatDateTimeForAPI(ticketData.salesEndDate, ticketData.salesEndTime) || fallbackListingEndTime;
      
      const commonPayload = {
        name: ticketData.name,
        price: parseFloat(ticketData.price),
        finalPrice: parseFloat(ticketData.price), // Assuming finalPrice is same as price
        ticketCapacity: ticketData.quantity === "No Limit" ? 0 : parseInt(ticketData.quantity),
        maxPurchasePerOrder: ticketData.enableMaxPurchase ? parseInt(ticketData.maxPurchaseAmount, 10) : 0, // Set to 0 if not enabled
        currency: "NZD", // Assuming default currency
        limitedQuantity: ticketData.quantity !== "No Limit",
        description: ticketData.description || null,
        listingStartTime: listingStartTime,
        listingEndTime: listingEndTime,
        isActive: true, // Assuming new/updated tickets are active
        isDeleted: false, // Assuming new/updated tickets are not deleted
        soldOut: false, // This might be set by backend based on ticketCapacity and sales
      };

      if (editingTicket) {
        // Logic to update an existing ticket
        const payload = {
          ...commonPayload,
          id: editingTicket.id, // Include existing ID for update
          eventId: parseInt(eventId, 10), // Ensure eventId is passed in body for PUT
        };
        await UpdateTicketStructureAPI(editingTicket.id, payload);
        console.log("Updating ticket:", payload);
      } else {
        // Logic to create a new ticket
        const payload = {
          ...commonPayload,
          // For creation, ID is usually generated by backend, so don't include it
          eventId: parseInt(eventId, 10), // Pass eventId in body for POST
        };
        await CreateTicketStructureAPI(eventId, payload); // Use eventId in URL for POST
        console.log("Creating new ticket:", payload);
      }
      
      // After a successful save, close the modal and re-fetch the tickets.
      handleCloseModal();
      fetchTickets(); // Re-fetch the data to update the table
      
    } catch (err) {
      console.error("Failed to save ticket:", err);
      setError(err.response?.data?.message || "Failed to save ticket. Please check your input.");
    }
  };

  const formatQuantity = (ticket) => {
    return ticket.limitedQuantity ? ticket.ticketCapacity : "Unlimited";
  };

  const formatMaxPurchase = (ticket) => {
    return ticket.maxPurchasePerOrder > 0 ? ticket.maxPurchasePerOrder : "No Limit";
  };

  return (
    <>
      <div className={styles.ticketSectionContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Tickets</h2>
          <button
            className={styles.createTicketButton}
            onClick={handleCreateNew}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : tickets.length > 0 ? (
          <div className={styles.tableWrapper}>
            <div className={styles.ticketsList}>
              {/* Table Header */}
              <div className={`${styles.ticketRow} ${styles.ticketsHeader}`}>
                {/* <div className={`${styles.ticketCell} ${styles.cellId}`}>#</div> */}
                <div className={`${styles.ticketCell} ${styles.cellTicket}`}>
                  Ticket
                </div>
                <div className={`${styles.ticketCell} ${styles.cellQuantity}`}>
                  Quantity
                </div>
                <div className={`${styles.ticketCell} ${styles.cellMaxPurchase}`}>
                  Max Per Order
                </div>
                <div className={`${styles.ticketCell} ${styles.cellPrice}`}>
                  Price
                </div>
                <div className={`${styles.ticketCell} ${styles.cellActions}`}></div>
              </div>

              {/* Table Body */}
              {tickets.map((ticket) => (
                <div key={ticket.id} className={styles.ticketRow}>
                  {/* <div className={`${styles.ticketCell} ${styles.cellId}`}>
                    {ticket.id}
                  </div> */}
                  <div className={`${styles.ticketCell} ${styles.cellTicket}`}>
                    {ticket.name}
                  </div>
                  <div className={`${styles.ticketCell} ${styles.cellQuantity}`}>
                    {formatQuantity(ticket)}
                  </div>
                  <div className={`${styles.ticketCell} ${styles.cellMaxPurchase}`}>
                    {formatMaxPurchase(ticket)}
                  </div>
                  <div className={`${styles.ticketCell} ${styles.cellPrice}`}>
                    ${ticket.price.toFixed(2)}
                  </div>
                  <div className={`${styles.ticketCell} ${styles.cellActions}`}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditClick(ticket)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteClick(ticket.id)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.noTicketsMessage}>No tickets have been created for this event.</div>
        )}
      </div>

      <TicketDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTicket}
        ticket={editingTicket || {}}
        saveButtonText={editingTicket ? "Save Changes" : "Create Ticket"}
        editingTicket={editingTicket} // Pass editingTicket prop to the modal
      />
    </>
  );
};

TicketSection.propTypes = {
  // We removed eventData as it's now fetched locally
};

export default TicketSection;