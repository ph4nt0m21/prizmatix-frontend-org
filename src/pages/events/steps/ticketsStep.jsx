import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import TicketDetailsModal from './ticketDetailsModal';
import AnchoredActionMenu, {
  anchoredActionMenuStyles,
} from '../../../components/common/anchoredActionMenu/anchoredActionMenu';
import styles from './ticketsStep.module.scss';
import OptionalLabel from '../../../components/common/optionalLabel/optionalLabel';

/**
 * TicketsStep component - Sixth step of event creation
 * Allows creating and managing different ticket types for the event
 * * @param {Object} props Component props
 * @param {Object} props.eventData Event data from parent component
 * @param {Function} props.handleInputChange Function to handle input changes
 * @param {boolean} props.isValid Whether the form is valid
 * @param {Object} props.stepStatus Status of this step
 * @returns {JSX.Element} TicketsStep component
 */
const TicketsStep = ({
  eventData = {},
  handleInputChange = () => { },
  onTicketsCommit = null,
  onSoldOutOverrideToggle = null,
  isSavingTickets = false,
  isValid = false,
  stepStatus = { visited: false }
}) => {
  const isPersistedTicket = (ticket) =>
    ticket?.id != null && ticket?.id !== "" && Number.isFinite(Number(ticket.id));

  const isDonationTicket = (ticket) =>
    String(ticket?.ticketKind || "").toUpperCase() === "DONATION";

  // Extract tickets data from eventData or use defaults
  const [tickets, setTickets] = useState(eventData.tickets || []);
  const hasRegularTickets = tickets.some((t) => !isDonationTicket(t));
  const hasDonationTicket = tickets.some((t) => isDonationTicket(t));
  const isCompletelyEmpty = !hasRegularTickets && !hasDonationTicket;

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(null);
  const [activeModalStep, setActiveModalStep] = useState("basic"); // basic, pricing, sale

  const [openMenuIndex, setOpenMenuIndex] = useState(null); //state for managing the action menu dropdown
  const menuAnchorRefs = useRef({});

  // Effect to propagate tickets changes to parent component
  useEffect(() => {
    // Send the updated tickets data to parent component
    handleInputChange(tickets, 'tickets');
  }, [tickets, handleInputChange]);

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
  const handleSaveTicket = async (ticketData) => {
    let updatedTickets = [];
    if (currentTicketIndex !== null) {
      // Editing existing ticket
      updatedTickets = [...tickets];
      updatedTickets[currentTicketIndex] = ticketData;
    } else {
      // Adding new ticket
      updatedTickets = [...tickets, ticketData];
    }

    if (onTicketsCommit) {
      const persistedTickets = await onTicketsCommit(updatedTickets);
      if (!persistedTickets) return;
      setTickets(persistedTickets);
    } else {
      setTickets(updatedTickets);
    }

    // Close the modal
    setIsModalOpen(false);
    setCurrentTicket(null);
    setCurrentTicketIndex(null);
  };

  const handleSoldOutOverrideMenuToggle = async (index) => {
    const ticket = tickets[index];
    if (!onSoldOutOverrideToggle || !isPersistedTicket(ticket)) return;
    const nextValue = !Boolean(ticket.soldOutOverride);
    const savedTickets = await onSoldOutOverrideToggle(ticket.id, nextValue);
    if (savedTickets) {
      setTickets(savedTickets);
    }
    setOpenMenuIndex(null);
  };

  /**
   * Delete a ticket
   * @param {number} index Index of the ticket to delete
   */
  const handleDeleteTicket = async (index) => {
    const updatedTickets = [...tickets];
    updatedTickets.splice(index, 1);

    if (onTicketsCommit) {
      const persistedTickets = await onTicketsCommit(updatedTickets);
      if (!persistedTickets) return;
      setTickets(persistedTickets);
    } else {
      setTickets(updatedTickets);
    }

    setOpenMenuIndex(null);
  };

  // Connect this to the main "Add Ticket" button.
  const handleAddTicketRow = async () => {
    const newTicket = {
      name: '',
      price: '',
      quantity: '',
      maxPurchaseAmount: '',
      salesStartDate: '',
      salesStartTime: '',
      salesEndDate: '',
      salesEndTime: '',
      isAdvance: false,
      advanceAmount: '',
      startsAfterTicketStructureId: null,
      ticketKind: 'STANDARD',
      suggestedAmounts: [],
      donationRequired: false,
      isActive: true,
    };

    // If there are existing rows, persist them first so IDs are available
    // for before/after dependencies on the next ticket.
    if (tickets.length > 0 && onTicketsCommit) {
      const persistedTickets = await onTicketsCommit(tickets);
      if (!persistedTickets) return;
      setTickets([...persistedTickets, newTicket]);
      return;
    }

    setTickets(prevTickets => [...prevTickets, newTicket]);
  };

  const handleAddDonationTicketRow = async () => {
    if (hasDonationTicket) return;

    const newDonation = {
      name: 'Donation',
      price: '',
      quantity: 'No Limit',
      maxPurchaseAmount: '',
      salesStartDate: '',
      salesStartTime: '',
      salesEndDate: '',
      salesEndTime: '',
      isAdvance: false,
      advanceAmount: '',
      startsAfterTicketStructureId: null,
      ticketKind: 'DONATION',
      suggestedAmounts: [],
      donationRequired: false,
      isActive: true,
      description: '',
    };

    if (tickets.length > 0 && onTicketsCommit) {
      const persistedTickets = await onTicketsCommit(tickets);
      if (!persistedTickets) return;
      setTickets([...persistedTickets, newDonation]);
      return;
    }

    setTickets((prevTickets) => [...prevTickets, newDonation]);
  };

  const handleTogglePause = (index) => {
    const updatedTickets = [...tickets];
    const ticket = updatedTickets[index];
    updatedTickets[index] = {
      ...ticket,
      salesPaused: !ticket.salesPaused,
    };
    setTickets(updatedTickets);
    setOpenMenuIndex(null);
  };

  // ADD this new function to handle inline input changes.
  const handleTicketRowChange = (e, index) => {
    const { name, value } = e.target;
    const updatedTickets = [...tickets];
    const ticket = updatedTickets[index];

    if (name === 'quantity') {
      const soldCount = ticket.soldCount || 0;
      if (value !== '' && Number(value) < soldCount) {
        return; // never allow the total to drop below tickets already sold
      }
    }
    if ((name === 'name' || name === 'price') && ticket.soldCount > 0) {
      return; // locked once sales begin
    }

    updatedTickets[index] = { ...ticket, [name]: value };
    setTickets(updatedTickets);
  };

  // ADD this function to duplicate a ticket.
  const handleDuplicateTicket = (index) => {
    const ticketToDuplicate = { ...tickets[index] };
    if (isDonationTicket(ticketToDuplicate)) {
      // Only one donation is allowed per event.
      setOpenMenuIndex(null);
      return;
    }
    ticketToDuplicate.name = ticketToDuplicate.name ? `${ticketToDuplicate.name} (Copy)` : '';
    delete ticketToDuplicate.id;
    ticketToDuplicate.soldCount = 0;

    const updatedTickets = [...tickets];
    updatedTickets.splice(index + 1, 0, ticketToDuplicate);
    setTickets(updatedTickets);
    setOpenMenuIndex(null); // Close the actions menu
  };

  const renderRegularTicketRow = (ticket, index) => (
      <div key={ticket.id || `ticket-${index}`} className={styles.ticketItem}>
        <div className={styles.ticketDrag}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-grip-vertical" viewBox="0 0 16 16">
            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
          </svg>
        </div>
        <div className={styles.ticketName} data-label="Name">
          <input
            name="name"
            type="text"
            className={styles.ticketInput}
            value={ticket.name || ''}
            onChange={(e) => handleTicketRowChange(e, index)}
            placeholder="Name"
            disabled={ticket.soldCount > 0}
            title={ticket.soldCount > 0 ? 'Locked — tickets have already been sold' : undefined}
          />
        </div>
        <div className={styles.ticketCount} data-label="Quantity">
          <input
            name="quantity"
            type="number"
            min={ticket.soldCount || 0}
            className={styles.ticketInput}
            value={ticket.quantity === 'No Limit' ? '' : ticket.quantity || ''}
            onChange={(e) => handleTicketRowChange(e, index)}
            placeholder="Quantity"
          />
          {ticket.soldCount > 0 && (
            <span className={styles.soldIndicator}>Sold: {ticket.soldCount}</span>
          )}
        </div>
        <div className={styles.ticketPrice} data-label="Price">
          <div className={styles.inputWithPrefix}>
            <span className={styles.prefix}>$</span>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              className={styles.ticketInput}
              value={ticket.price || ''}
              onChange={(e) => handleTicketRowChange(e, index)}
              placeholder="Price"
              disabled={ticket.soldCount > 0}
              title={ticket.soldCount > 0 ? 'Locked — tickets have already been sold' : undefined}
            />
          </div>
        </div>
        <div className={styles.ticketCount} data-label="Max Purchase">
          <input
            name="maxPurchaseAmount"
            type="number"
            className={styles.ticketInput}
            value={ticket.maxPurchaseAmount === 'No Limit' ? '' : ticket.maxPurchaseAmount || ''}
            onChange={(e) => handleTicketRowChange(e, index)}
            placeholder="Max purchase"
          />
        </div>
        <div className={styles.ticketActions} data-label="Action">
          <div className={styles.actionMenuContainer}>
            <button type="button" className={styles.ticketActionButton} onClick={() => handleEditTicket(index)} aria-label="Advanced settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7280" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.69-1.62-.92L14.4 2.25C14.34 2.02 14.12 1.87 13.88 1.87H10.12c-.25 0-.47.15-.53.38L9.2 4.87c-.58.23-1.12.54-1.62.92L5.19 4.81c-.22-.08-.47 0-.59.22L2.69 8.35c-.11.2-.06.47.12.61l2.03 1.58c-.05.32-.07.64-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.69 1.62.92l.39 2.62c.06.23.28.38.53.38h3.75c.25 0 .47-.15.53-.38l.39-2.62c.58.23 1.12.54 1.62-.92l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.11-.2-.06-.47-.12-.61l-2.03-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" /></svg>
            </button>
            <button
              type="button"
              ref={(el) => {
                menuAnchorRefs.current[index] = el;
              }}
              className={styles.ticketActionButton}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuIndex(openMenuIndex === index ? null : index);
              }}
              aria-label="More actions"
              aria-expanded={openMenuIndex === index}
            >
              <svg width="4" height="16" viewBox="0 0 4 16" fill="#6B7280" xmlns="http://www.w3.org/2000/svg"><path d="M2 4C3.1 4 4 3.1 4 2s-.9-2-2-2-2 .9-2 2 .9 4 2 4zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>
            </button>
            <AnchoredActionMenu
              open={openMenuIndex === index}
              anchorEl={menuAnchorRefs.current[index]}
              onClose={() => setOpenMenuIndex(null)}
            >
              <button
                type="button"
                className={anchoredActionMenuStyles.menuItem}
                onClick={() => {
                  handleDuplicateTicket(index);
                  setOpenMenuIndex(null);
                }}
              >
                Duplicate
              </button>
              <button
                type="button"
                className={anchoredActionMenuStyles.menuItem}
                onClick={() => {
                  handleEditTicket(index);
                  setOpenMenuIndex(null);
                }}
              >
                Edit
              </button>
              {onSoldOutOverrideToggle && isPersistedTicket(ticket) && (
                <button
                  type="button"
                  className={anchoredActionMenuStyles.menuItem}
                  onClick={() => handleSoldOutOverrideMenuToggle(index)}
                  disabled={isSavingTickets}
                >
                  {ticket.soldOutOverride ? 'Remove sold out override' : 'Mark as sold out'}
                </button>
              )}
              <button
                type="button"
                className={anchoredActionMenuStyles.menuItem}
                onClick={() => {
                  handleDeleteTicket(index);
                  setOpenMenuIndex(null);
                }}
              >
                Delete
              </button>
            </AnchoredActionMenu>
          </div>
        </div>
      </div>
  );

  const renderDonationRow = (ticket, index) => (
      <div key={ticket.id || `donation-${index}`} className={styles.donationItem}>
        <div className={styles.ticketDrag}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-grip-vertical" viewBox="0 0 16 16">
            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
          </svg>
        </div>
        <div className={styles.ticketName} data-label="Name">
          <input
            name="name"
            type="text"
            className={styles.ticketInput}
            value={ticket.name || ''}
            onChange={(e) => handleTicketRowChange(e, index)}
            placeholder="Name"
          />
        </div>
        <div className={styles.ticketPrice} data-label="Min amount">
          <div className={styles.inputWithPrefix}>
            <span className={styles.prefix}>$</span>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              className={styles.ticketInput}
              value={ticket.price || ''}
              onChange={(e) => handleTicketRowChange(e, index)}
              placeholder="Min amount"
            />
          </div>
        </div>
        <div className={styles.ticketActions} data-label="Action">
          <div className={styles.actionMenuContainer}>
            <button type="button" className={styles.ticketActionButton} onClick={() => handleEditTicket(index)} aria-label="Advanced settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7280" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.69-1.62-.92L14.4 2.25C14.34 2.02 14.12 1.87 13.88 1.87H10.12c-.25 0-.47.15-.53.38L9.2 4.87c-.58.23-1.12.54-1.62.92L5.19 4.81c-.22-.08-.47 0-.59.22L2.69 8.35c-.11.2-.06.47.12.61l2.03 1.58c-.05.32-.07.64-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.69 1.62.92l.39 2.62c.06.23.28.38.53.38h3.75c.25 0 .47-.15.53-.38l.39-2.62c.58.23 1.12.54 1.62-.92l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.11-.2-.06-.47-.12-.61l-2.03-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" /></svg>
            </button>
            <button
              type="button"
              ref={(el) => {
                menuAnchorRefs.current[index] = el;
              }}
              className={styles.ticketActionButton}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuIndex(openMenuIndex === index ? null : index);
              }}
              aria-label="More actions"
              aria-expanded={openMenuIndex === index}
            >
              <svg width="4" height="16" viewBox="0 0 4 16" fill="#6B7280" xmlns="http://www.w3.org/2000/svg"><path d="M2 4C3.1 4 4 3.1 4 2s-.9-2-2-2-2 .9-2 2 .9 4 2 4zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>
            </button>
            <AnchoredActionMenu
              open={openMenuIndex === index}
              anchorEl={menuAnchorRefs.current[index]}
              onClose={() => setOpenMenuIndex(null)}
            >
              <button
                type="button"
                className={anchoredActionMenuStyles.menuItem}
                onClick={() => {
                  handleEditTicket(index);
                  setOpenMenuIndex(null);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className={anchoredActionMenuStyles.menuItem}
                onClick={() => handleTogglePause(index)}
              >
                {ticket.salesPaused ? 'Resume sales' : 'Pause sales'}
              </button>
              <button
                type="button"
                className={anchoredActionMenuStyles.menuItem}
                onClick={() => {
                  handleDeleteTicket(index);
                  setOpenMenuIndex(null);
                }}
              >
                Delete
              </button>
            </AnchoredActionMenu>
          </div>
        </div>
      </div>
  );

  const addDonationButton = (
    <button
      type="button"
      className={styles.addTicketInlineButton}
      onClick={handleAddDonationTicketRow}
      disabled={isSavingTickets || hasDonationTicket}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
      </svg>
      Add Donation
    </button>
  );

  const addTicketButton = (
    <button
      type="button"
      className={styles.addTicketInlineButton}
      onClick={handleAddTicketRow}
      disabled={isSavingTickets}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
      </svg>
      Add Ticket
    </button>
  );

  return (
    <div className={styles.stepContainer}>

      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M20 12C20 10.9 19.1 10 18 10H17.74C17.9 9.55 18 9.03 18 8.5C18 6.57 16.43 5 14.5 5C13.45 5 12.46 5.45 11.83 6.39C11.35 5.32 10.24 4.5 8.89 4.5C7.16 4.5 5.75 5.91 5.75 7.64C5.75 8.47 6.09 9.24 6.64 9.81C5.09 10.24 4 11.7 4 13.34C4 15.3 5.54 16.91 7.5 16.98V17H18C19.1 17 20 16.1 20 15V12ZM10.75 13.13L8.92 11.29L8.21 12L10.75 14.54L15.79 9.5L15.08 8.79L10.75 13.13Z" fill="#7C3AED" />
        </svg>
        <div className={styles.stepTextContainer}>
          <h2 className={styles.stepTitle}>Create Your Tickets</h2>
          <p className={styles.stepDescription}>Manage and configure your event tickets.</p>
        </div>
      </div>

      <div className={styles.formSection}>
        {isCompletelyEmpty ? (
          <div className={styles.emptyTicketsContainer}>
            <h3 className={styles.emptyStateTitle}>Create Your First Ticket</h3>
            <div className={styles.emptyStateActions}>
              <button
                type="button"
                className={styles.createTicketButton}
                onClick={handleAddTicketRow}
                disabled={isSavingTickets}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
                </svg>
                Create a Ticket
              </button>
              <button
                type="button"
                className={styles.createTicketButton}
                onClick={handleAddDonationTicketRow}
                disabled={isSavingTickets || hasDonationTicket}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
                </svg>
                Add Donation
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Regular tickets table — only when at least one regular ticket exists */}
            <div className={styles.ticketsSection}>
              <div className={styles.sectionHeading}>
                <h3 className={styles.sectionTitle}>Tickets</h3>
                <p className={styles.sectionSubtitle}>Paid or free entry tickets for your event.</p>
              </div>
              {hasRegularTickets ? (
                <div className={styles.ticketsContainer}>
                  <div className={styles.tableWrapper}>
                    <div className={styles.tableContent}>
                      <div className={styles.ticketTableHeader}>
                        <div className={styles.ticketDrag} />
                        <div className={styles.ticketName}>Name</div>
                        <div className={styles.ticketCount}>Quantity</div>
                        <div className={styles.ticketPrice}>Price</div>
                        <div className={styles.ticketCount}>Max Purchase<OptionalLabel /></div>
                        <div className={styles.ticketActions}>Action</div>
                      </div>

                      {tickets.map((ticket, index) =>
                        isDonationTicket(ticket) ? null : renderRegularTicketRow(ticket, index)
                      )}
                    </div>
                  </div>

                  <div className={styles.addTicketRow}>
                    {addTicketButton}
                  </div>
                </div>
              ) : (
                <div className={styles.standaloneAddRow}>
                  {addTicketButton}
                </div>
              )}
            </div>

            {/* Donation section — separate table / button with clear gap */}
            <div className={styles.donationSection}>
              <div className={styles.sectionHeading}>
                <h3 className={styles.sectionTitle}>Donation</h3>
                <p className={styles.sectionSubtitle}>Optional or required contribution buyers can add at checkout.</p>
              </div>
              {hasDonationTicket ? (
                <div className={styles.donationTableWrapper}>
                  <div className={styles.donationTableContent}>
                    <div className={styles.donationTableHeader}>
                      <div className={styles.ticketDrag} />
                      <div className={styles.ticketName}>Name</div>
                      <div className={styles.ticketPrice}>Min amount</div>
                      <div className={styles.ticketActions}>Action</div>
                    </div>
                    {tickets.map((ticket, index) =>
                      isDonationTicket(ticket) ? renderDonationRow(ticket, index) : null
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.standaloneAddRow}>
                  {addDonationButton}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Ticket details modal */}
      {isModalOpen && (
        <TicketDetailsModal
          ticket={currentTicket}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTicket}
          isSaving={isSavingTickets}
          saveButtonText={
            isDonationTicket(currentTicket)
              ? (isPersistedTicket(currentTicket) ? 'Update Donation' : 'Add Donation')
              : (isPersistedTicket(currentTicket) ? 'Update Ticket' : 'Save Ticket')
          }
          activeStep={activeModalStep}
          setActiveStep={setActiveModalStep}
          allTickets={tickets}
          excludeTicketIndex={currentTicketIndex}
        />
      )}
    </div>
  );
};

TicketsStep.propTypes = {
  eventData: PropTypes.object,
  handleInputChange: PropTypes.func,
  onTicketsCommit: PropTypes.func,
  onSoldOutOverrideToggle: PropTypes.func,
  isSavingTickets: PropTypes.bool,
  isValid: PropTypes.bool,
  stepStatus: PropTypes.object
};

export default TicketsStep;