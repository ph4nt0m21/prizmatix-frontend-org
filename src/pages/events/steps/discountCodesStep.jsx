// src/pages/events/steps/discountCodesStep.jsx
import React, { useState, useEffect, useRef } from 'react';
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
 * @param {Function} props.fetchAvailableTickets Function to fetch available tickets
 * @returns {JSX.Element} DiscountCodesStep component
 */
const DiscountCodesStep = ({
  eventData = {},
  handleInputChange = () => { },
  isValid = false,
  stepStatus = { visited: false },
  fetchAvailableTickets,
}) => {
  const [discountCodes, setDiscountCodes] = useState(eventData.discountCodes || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDiscountCode, setCurrentDiscountCode] = useState(null);
  const [currentDiscountCodeIndex, setCurrentDiscountCodeIndex] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const ticketsFetched = useRef(false);

  useEffect(() => {
    handleInputChange(discountCodes, 'discountCodes');
  }, [discountCodes, handleInputChange]);

  const handleTicketDropdownClick = async (e, index) => {
    e.preventDefault();

    if (!ticketsFetched.current) {
      setIsLoadingTickets(true);
      try {
        const response = await fetchAvailableTickets();
        if (response.data && Array.isArray(response.data)) {
          setAvailableTickets(response.data);
          ticketsFetched.current = true;
        } else {
          setAvailableTickets([]);
        }
      } catch (error) {
        console.error("Failed to fetch available tickets:", error);
        setAvailableTickets([]);
      } finally {
        setIsLoadingTickets(false);
      }
    }
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const handleAddDiscountCodeRow = () => {
    const newDiscountCode = {
      code: '',
      type: 'percentage',
      value: '',
      validFromDate: '',
      validFromTime: '',
      validUntilDate: '',
      validUntilTime: '',
      usageLimit: '',
      ticketsApplicable: [],
      isActive: true,
    };
    setDiscountCodes(prevCodes => [...prevCodes, newDiscountCode]);
  };

  const handleDiscountCodeRowChange = (e, index) => {
    const { name, value } = e.target;
    const updatedCodes = [...discountCodes];
    updatedCodes[index] = { ...updatedCodes[index], [name]: value };
    setDiscountCodes(updatedCodes);
  };

  const handleTicketCheckChange = (e, index) => {
    const { value, checked } = e.target;
    const updatedCodes = [...discountCodes];
    const ticketId = parseInt(value, 10);
    if (checked) {
      updatedCodes[index].ticketsApplicable = [...updatedCodes[index].ticketsApplicable, ticketId];
    } else {
      updatedCodes[index].ticketsApplicable = updatedCodes[index].ticketsApplicable.filter(id => id !== ticketId);
    }
    setDiscountCodes(updatedCodes);
  };

  const handleEditDiscountCode = (index) => {
    setCurrentDiscountCode({ ...discountCodes[index] });
    setCurrentDiscountCodeIndex(index);
    setIsModalOpen(true);
  };

  const handleSaveDiscountCode = (discountCodeData) => {
    if (currentDiscountCodeIndex !== null) {
      const updatedDiscountCodes = [...discountCodes];
      updatedDiscountCodes[currentDiscountCodeIndex] = discountCodeData;
      setDiscountCodes(updatedDiscountCodes);
    } else {
      setDiscountCodes([...discountCodes, discountCodeData]);
    }
    setIsModalOpen(false);
    setCurrentDiscountCode(null);
    setCurrentDiscountCodeIndex(null);
  };

  const handleDeleteDiscountCode = (index) => {
    const updatedDiscountCodes = [...discountCodes];
    updatedDiscountCodes.splice(index, 1);
    setDiscountCodes(updatedDiscountCodes);
  };

  const isExpired = (code) => {
  if (!code.validUntilDate || !code.validUntilTime) return false;
  const expiry = new Date(`${code.validUntilDate}T${code.validUntilTime}:00Z`);
  return new Date() > expiry;
  };

  const getSelectedTicketNames = (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) {
      return "All Tickets";
    }
    const names = selectedIds.map(id => {
      const ticket = availableTickets.find(t => t.id === id);
      return ticket ? ticket.name : null;
    }).filter(name => name !== null);

    return names.join(', ');
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M21.41 11.58L12.41 2.58C12.05 2.22 11.55 2 11 2H4C2.9 2 2 2.9 2 4V11C2 11.55 2.22 12.05 2.59 12.42L11.59 21.42C11.95 21.78 12.45 22 13 22C13.55 22 14.05 21.78 14.41 21.41L21.41 14.41C21.78 14.05 22 13.55 22 13C22 12.45 21.77 11.94 21.41 11.58ZM5.5 7C4.67 7 4 6.33 4 5.5C4 4.67 4.67 4 5.5 4C6.33 4 7 4.67 7 5.5C7 6.33 6.33 7 5.5 7Z" fill="#7C3AED" />
        </svg>
        <h2 className={styles.stepTitle}>Add Coupon Code</h2>
      </div>

      <div className={styles.formSection}>
        {isLoadingTickets ? (
          <div className={styles.loadingState}>Loading tickets...</div>
        ) : discountCodes.length === 0 ? (
          <div className={styles.emptyDiscountCodesContainer}>
            <h3 className={styles.emptyStateTitle}>Add Coupon Code</h3>
            <p className={styles.emptyStateDescription}>You can add them later or don't add at all if you want</p>
            <button
              type="button"
              className={styles.createCouponButton}
              onClick={handleAddDiscountCodeRow}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" /></svg>
              Create Coupon code
            </button>
          </div>
        ) : (
          <div className={styles.discountCodesContainer}>
            <div className={styles.tableWrapper}>
              <div className={styles.tableContent}>
                <div className={styles.discountCodeTableHeader}>
                  <div className={styles.discountCode}>Code</div>
                  <div className={styles.discountType}>Type</div>
                  <div className={styles.discountValue}>Value</div>
                  <div className={styles.discountUsageLimit}>Usage Limit</div>
                  <div className={styles.ticketsApplicable}>Applicable Tickets</div>
                  <div className={styles.discountStatus}>Status</div>

                  <div className={styles.discountActions}>Action</div>
                </div>

                {discountCodes.map((code, index) => (
                  <div key={index} className={styles.discountCodeItem}>
                    <div className={styles.discountCode}>
                      <input
                        type="text"
                        name="code"
                        placeholder="e.g. BUZZ25"
                        value={code.code || ''}
                        onChange={(e) => handleDiscountCodeRowChange(e, index)}
                        className={styles.inlineInput}
                      />
                    </div>
                    <div className={styles.discountType}>
                      <select
                        name="type"
                        value={code.type || 'percentage'}
                        onChange={(e) => handleDiscountCodeRowChange(e, index)}
                        className={styles.inlineSelect}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed ($)</option>
                      </select>
                    </div>
                    <div className={styles.discountValue}>
                      <input
                        type="number"
                        name="value"
                        placeholder="25"
                        step="0.01"
                        value={code.value || ''}
                        onChange={(e) => handleDiscountCodeRowChange(e, index)}
                        className={styles.inlineInput}
                      />
                    </div>
                    <div className={styles.discountUsageLimit}>
                      <input
                        type="number"
                        name="usageLimit"
                        placeholder="100"
                        value={code.usageLimit || ''}
                        onChange={(e) => handleDiscountCodeRowChange(e, index)}
                        className={styles.inlineInput}
                      />
                    </div>
                    <div className={styles.ticketsApplicable}>
                      <div className={styles.customDropdown}>
                        <button
                          type="button"
                          className={styles.dropdownButton}
                          onClick={(e) => handleTicketDropdownClick(e, index)}
                        >
                          <span>{isLoadingTickets ? 'Loading...' : getSelectedTicketNames(code.ticketsApplicable)}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
                          </svg>
                        </button>
                        {openDropdownIndex === index && (
                          <div className={styles.dropdownMenu}>
                            {availableTickets.map((ticket) => (
                              <label key={ticket.id} className={styles.checkboxLabel}>
                                <input
                                  type="checkbox"
                                  value={ticket.id}
                                  checked={code.ticketsApplicable.includes(ticket.id)}
                                  onChange={(e) => handleTicketCheckChange(e, index)}
                                  className={styles.checkboxInput}
                                />
                                {ticket.name}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.discountActions}>
                      <div className={styles.actionMenuContainer}>
                        <button type="button" className={styles.discountActionButton} onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === index ? null : index); }} aria-label="Actions">
                          <svg width="4" height="16" viewBox="0 0 4 16" fill="#6B7280" xmlns="http://www.w3.org/2000/svg"><path d="M2 4C3.1 4 4 3.1 4 2s-.9-2-2-2-2 .9-2 2 .9 4 2 4zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>
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
              </div>
            </div>

            <div className={styles.addDiscountCodeRow}>
              <button type="button" className={styles.addDiscountCodeInlineButton} onClick={handleAddDiscountCodeRow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" /></svg>
                Create Coupon code
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <DiscountCodeModal
          discountCode={currentDiscountCode}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDiscountCode}
          availableTickets={availableTickets}
        />
      )}
    </div>
  );
};

DiscountCodesStep.propTypes = {
  eventData: PropTypes.object,
  handleInputChange: PropTypes.func,
  isValid: PropTypes.bool,
  stepStatus: PropTypes.object,
  fetchAvailableTickets: PropTypes.func.isRequired,
};

export default DiscountCodesStep;