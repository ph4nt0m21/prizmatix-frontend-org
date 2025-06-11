import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ticketSection.module.scss';

// Temporary unique ID generator for new tickets
const generateUniqueId = () => `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/**
 * TicketSection component for managing event tickets.
 * Allows adding, editing, and deleting ticket types.
 *
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data from parent component (e.g., manageEventPage)
 * @param {Function} props.onSave Function to call when changes are saved
 * @param {Function} props.onCancel Function to call when editing is cancelled
 * @returns {JSX.Element} TicketSection component
 */
const TicketSection = ({ eventData = {}, onSave = () => {}, onCancel = () => {} }) => {
  const [tickets, setTickets] = useState(eventData.tickets || []);
  const [editingTicketId, setEditingTicketId] = useState(null); // ID of the ticket being edited
  const [newTicket, setNewTicket] = useState({
    id: null,
    name: '',
    type: 'paid', // 'paid', 'free', 'donation'
    quantity: '',
    price: '', // Only for paid tickets
    description: '',
    salesStart: '',
    salesEnd: '',
    minPerOrder: 1,
    maxPerOrder: 10,
    isHidden: false,
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  // Sync internal state with eventData prop
  useEffect(() => {
    setTickets(eventData.tickets || []);
  }, [eventData.tickets]);

  /**
   * Resets the newTicket form state.
   */
  const resetForm = () => {
    setNewTicket({
      id: null,
      name: '',
      type: 'paid',
      quantity: '',
      price: '',
      description: '',
      salesStart: '',
      salesEnd: '',
      minPerOrder: 1,
      maxPerOrder: 10,
      isHidden: false,
    });
    setEditingTicketId(null);
    setShowForm(false);
    setError(null);
  };

  /**
   * Handles changes in the ticket form fields.
   * @param {Object} e - The event object.
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTicket(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  /**
   * Validates the current ticket form data.
   * @returns {boolean} True if valid, false otherwise.
   */
  const validateTicketForm = () => {
    if (!newTicket.name.trim()) {
      setError('Ticket name is required.');
      return false;
    }
    if (newTicket.type === 'paid') {
      if (newTicket.price === '' || isNaN(parseFloat(newTicket.price)) || parseFloat(newTicket.price) < 0) {
        setError('Price is required and must be a non-negative number for paid tickets.');
        return false;
      }
    }
    if (newTicket.quantity !== '' && (isNaN(parseInt(newTicket.quantity)) || parseInt(newTicket.quantity) <= 0)) {
        setError('Quantity must be a positive number or left blank for unlimited.');
        return false;
    }
    if (!newTicket.salesStart || !newTicket.salesEnd) {
      setError('Sales start and end dates/times are required.');
      return false;
    }
    if (new Date(newTicket.salesStart) >= new Date(newTicket.salesEnd)) {
      setError('Sales end date/time must be after sales start date/time.');
      return false;
    }
    if (newTicket.minPerOrder <= 0 || newTicket.maxPerOrder <= 0 || newTicket.minPerOrder > newTicket.maxPerOrder) {
      setError('Min/Max per order values are invalid.');
      return false;
    }
    setError(null);
    return true;
  };

  /**
   * Adds a new ticket or updates an existing one.
   */
  const handleSubmitTicket = () => {
    if (!validateTicketForm()) {
      return;
    }

    if (editingTicketId) {
      // Update existing ticket
      setTickets(prev => prev.map(ticket =>
        ticket.id === editingTicketId ? { ...newTicket, quantity: newTicket.quantity === '' ? null : parseInt(newTicket.quantity), price: newTicket.type === 'paid' ? parseFloat(newTicket.price) : 0 } : ticket
      ));
    } else {
      // Add new ticket
      setTickets(prev => [
        ...prev,
        { ...newTicket, id: generateUniqueId(), quantity: newTicket.quantity === '' ? null : parseInt(newTicket.quantity), price: newTicket.type === 'paid' ? parseFloat(newTicket.price) : 0 }
      ]);
    }
    resetForm();
  };

  /**
   * Sets a ticket for editing.
   * @param {Object} ticket - The ticket object to edit.
   */
  const handleEditTicket = (ticket) => {
    setNewTicket({
      ...ticket,
      quantity: ticket.quantity === null ? '' : ticket.quantity, // Convert null back to empty string for input
      price: ticket.type === 'paid' ? ticket.price : '', // Ensure price is empty for non-paid types when editing
    });
    setEditingTicketId(ticket.id);
    setShowForm(true);
  };

  /**
   * Deletes a ticket by its ID.
   * @param {string} id - The ID of the ticket to delete.
   */
  const handleDeleteTicket = (id) => {
    if (window.confirm('Are you sure you want to delete this ticket type?')) {
      setTickets(prev => prev.filter(ticket => ticket.id !== id));
      setError(null);
    }
  };

  /**
   * Saves all changes and calls the parent onSave function.
   */
  const handleSaveAll = () => {
    if (tickets.length === 0) {
      setError('Please add at least one ticket type.');
      return;
    }
    onSave({ tickets: tickets });
    setError(null);
  };

  return (
    <div className={styles.ticketSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Tickets</h2>
        <p className={styles.sectionDescription}>
          Create and manage ticket types for your event.
        </p>
      </div>

      <div className={styles.contentCard}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Existing Tickets List */}
        {tickets.length > 0 && (
          <div className={styles.ticketsList}>
            <div className={styles.listHeader}>
              <div className={styles.headerItem}>Ticket Name</div>
              <div className={styles.headerItem}>Type</div>
              <div className={styles.headerItem}>Quantity</div>
              <div className={styles.headerItem}>Price</div>
              <div className={styles.headerItem}>Sales Period</div>
              <div className={styles.headerItem}>Actions</div>
            </div>
            {tickets.map(ticket => (
              <div key={ticket.id} className={styles.ticketItem}>
                <div className={styles.ticketDetail}>{ticket.name}</div>
                <div className={styles.ticketDetail}>
                  <span className={`${styles.ticketTypeBadge} ${styles[ticket.type]}`}>
                    {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
                  </span>
                </div>
                <div className={styles.ticketDetail}>{ticket.quantity === null ? 'Unlimited' : ticket.quantity}</div>
                <div className={styles.ticketDetail}>
                  {ticket.type === 'paid' ? `$${ticket.price.toFixed(2)}` : 'N/A'}
                </div>
                <div className={styles.ticketDetail}>
                  {new Date(ticket.salesStart).toLocaleDateString()} - {new Date(ticket.salesEnd).toLocaleDateString()}
                </div>
                <div className={styles.ticketActions}>
                  <button onClick={() => handleEditTicket(ticket)} className={styles.actionButton}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTicket(ticket.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Ticket Button / Form Toggle */}
        {!showForm && (
          <button onClick={() => setShowForm(true)} className={styles.addNewButton}>
            + Add New Ticket Type
          </button>
        )}

        {/* Ticket Creation/Edit Form */}
        {showForm && (
          <div className={styles.ticketForm}>
            <h3>{editingTicketId ? 'Edit Ticket Type' : 'Add New Ticket Type'}</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Ticket Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newTicket.name}
                  onChange={handleInputChange}
                  placeholder="e.g., General Admission, VIP"
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="type">Ticket Type *</label>
                <select
                  id="type"
                  name="type"
                  value={newTicket.type}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="paid">Paid</option>
                  <option value="free">Free</option>
                  <option value="donation">Donation</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="quantity">Quantity Available</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={newTicket.quantity}
                  onChange={handleInputChange}
                  placeholder="Leave blank for unlimited"
                  min="1"
                  className={styles.formInput}
                />
              </div>
              {newTicket.type === 'paid' && (
                <div className={styles.formGroup}>
                  <label htmlFor="price">Price *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={newTicket.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 25.00"
                    min="0"
                    step="0.01"
                    className={styles.formInput}
                  />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newTicket.description}
                onChange={handleInputChange}
                placeholder="Brief description of the ticket type (optional)"
                rows="2"
                className={styles.formTextarea}
              ></textarea>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="salesStart">Sales Start *</label>
                <input
                  type="datetime-local"
                  id="salesStart"
                  name="salesStart"
                  value={newTicket.salesStart}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="salesEnd">Sales End *</label>
                <input
                  type="datetime-local"
                  id="salesEnd"
                  name="salesEnd"
                  value={newTicket.salesEnd}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="minPerOrder">Min Tickets Per Order</label>
                <input
                  type="number"
                  id="minPerOrder"
                  name="minPerOrder"
                  value={newTicket.minPerOrder}
                  onChange={handleInputChange}
                  min="1"
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="maxPerOrder">Max Tickets Per Order</label>
                <input
                  type="number"
                  id="maxPerOrder"
                  name="maxPerOrder"
                  value={newTicket.maxPerOrder}
                  onChange={handleInputChange}
                  min="1"
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  name="isHidden"
                  checked={newTicket.isHidden}
                  onChange={handleInputChange}
                  className={styles.checkboxInput}
                />
                <span className={styles.checkboxLabel}>Hide this ticket type</span>
              </label>
            </div>

            <div className={styles.formActions}>
              <button onClick={resetForm} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleSubmitTicket} className={styles.saveButton}>
                {editingTicketId ? 'Update Ticket' : 'Add Ticket'}
              </button>
            </div>
          </div>
        )}

        {/* Save All Button */}
        {tickets.length > 0 && !showForm && (
            <div className={styles.overallActions}>
                <button onClick={handleSaveAll} className={styles.saveAllButton}>
                    Save All Ticket Changes
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

TicketSection.propTypes = {
  eventData: PropTypes.object,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

export default TicketSection;