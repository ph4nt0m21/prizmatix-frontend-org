/*
File: ticketEditPage.jsx
*/
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './ticketEditPage.module.scss'; // New SCSS module for this page

const TicketEditPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [ticketData, setTicketData] = useState(null); // State to hold ticket data for this event

  useEffect(() => {
    // Simulate fetching ticket-specific data for the event
    const fetchTicketDetails = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        // In a real app, fetch ticket types, pricing, availability, etc. using eventId
        setTicketData({
          id: eventId,
          ticketTypes: [
            { name: 'General Admission', price: 50.00, quantity: 200, salesStart: '2025-01-01', salesEnd: '2025-05-10' },
            { name: 'VIP Pass', price: 150.00, quantity: 50, salesStart: '2025-01-01', salesEnd: '2025-05-10' },
          ],
          // ... other ticket management details
        });
      } catch (error) {
        console.error("Failed to fetch ticket details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchTicketDetails();
    } else {
      setIsLoading(false);
      console.warn("No eventId provided for TicketEditPage. This page might require an event ID.");
    }
  }, [eventId]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading ticket details...</p>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className={styles.errorContainer}>
        <p>Ticket data not found or an error occurred.</p>
        <button onClick={() => navigate('/events')}>Back to Events</button>
      </div>
    );
  }

  return (
    <div className={styles.ticketEditPageContainer}>
      {/* This will be the new sidebar for editing different aspects of the event */}
      {/* It's the same sidebar as in eventEditPage, but you might want to create a common component later */}
      <div className={styles.eventEditSidebar}>
        <h3>Edit Event Options</h3>
        <ul>
          <li onClick={() => navigate(`/events/edit-page/${eventId}`)}>Event Page</li>
          <li className={styles.activeEditOption}>Tickets</li>
          {/* Add more edit options here later (Date & Time, Location, etc.) */}
        </ul>
      </div>

      <div className={styles.mainContent}>
        <h2>Manage Tickets for: {eventId}</h2>
        <p className={styles.sectionDescription}>
          Create, edit, and manage ticket types and pricing for your event.
        </p>

        <div className={styles.contentCard}>
          {/* Placeholder for Ticket Management UI */}
          <h3>Current Ticket Types</h3>
          {ticketData.ticketTypes.length > 0 ? (
            <ul className={styles.ticketList}>
              {ticketData.ticketTypes.map((ticket, index) => (
                <li key={index} className={styles.ticketItem}>
                  <span>{ticket.name}</span>
                  <span>Price: ${ticket.price.toFixed(2)}</span>
                  <span>Quantity: {ticket.quantity}</span>
                  <button className={styles.editButton}>Edit</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No ticket types defined yet. Add your first ticket!</p>
          )}

          <button className={styles.addTicketButton}>+ Add New Ticket Type</button>

          <div className={styles.actions}>
            <button className={styles.saveButton}>Save Ticket Changes</button>
            <button className={styles.cancelButton} onClick={() => navigate(`/events/manage/${eventId}/overview`)}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketEditPage;