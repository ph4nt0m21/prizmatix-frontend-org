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
  onDiscountCodesCommit = null,
  isSavingDiscountCodes = false,
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
  const isPersistedDiscountCode = (discountCode) =>
    discountCode?.id != null &&
    discountCode?.id !== "" &&
    Number.isFinite(Number(discountCode.id));

  useEffect(() => {
    handleInputChange(discountCodes, 'discountCodes');
  }, [discountCodes, handleInputChange]);

  useEffect(() => {
    if (openMenuIndex === null && openDropdownIndex === null) return undefined;

    const handlePointerDown = (e) => {
      const inTicketDropdown = e.target.closest(`.${styles.customDropdown}`);
      const inActionMenu = e.target.closest(`.${styles.actionMenuContainer}`);
      if (!inTicketDropdown) setOpenDropdownIndex(null);
      if (!inActionMenu) setOpenMenuIndex(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [openMenuIndex, openDropdownIndex]);

  useEffect(() => {
    const hasSelectedTickets = discountCodes.some(
      (code) => Array.isArray(code.ticketsApplicable) && code.ticketsApplicable.length > 0
    );
    if (!hasSelectedTickets || ticketsFetched.current) return;

    const preloadTickets = async () => {
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
        console.error("Failed to preload available tickets:", error);
        setAvailableTickets([]);
      } finally {
        setIsLoadingTickets(false);
      }
    };

    preloadTickets();
  }, [discountCodes, fetchAvailableTickets]);

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
    setOpenMenuIndex(null);
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const handleAddDiscountCodeRow = async () => {
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
    if (discountCodes.length > 0 && onDiscountCodesCommit) {
      const persistedCodes = await onDiscountCodesCommit(discountCodes);
      if (!persistedCodes) return;
      setDiscountCodes([...persistedCodes, newDiscountCode]);
      return;
    }
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

  const handleSaveDiscountCode = async (discountCodeData) => {
    let updatedDiscountCodes = [];
    if (currentDiscountCodeIndex !== null) {
      updatedDiscountCodes = [...discountCodes];
      updatedDiscountCodes[currentDiscountCodeIndex] = discountCodeData;
    } else {
      updatedDiscountCodes = [...discountCodes, discountCodeData];
    }
    if (onDiscountCodesCommit) {
      const persistedCodes = await onDiscountCodesCommit(updatedDiscountCodes);
      if (!persistedCodes) return;
      setDiscountCodes(persistedCodes);
    } else {
      setDiscountCodes(updatedDiscountCodes);
    }
    setIsModalOpen(false);
    setCurrentDiscountCode(null);
    setCurrentDiscountCodeIndex(null);
  };

  const handleDeleteDiscountCode = async (index) => {
    const updatedDiscountCodes = [...discountCodes];
    updatedDiscountCodes.splice(index, 1);
    if (onDiscountCodesCommit) {
      const persistedCodes = await onDiscountCodesCommit(updatedDiscountCodes);
      if (!persistedCodes) return;
      setDiscountCodes(persistedCodes);
      return;
    }
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
      const normalizedId = parseInt(id, 10);
      const ticket = availableTickets.find(t => parseInt(t.id, 10) === normalizedId);
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
        <div className={styles.stepTextContainer}>
          <h2 className={styles.stepTitle}>Add Coupon Code</h2>
          <p className={styles.stepDescription}>Create and manage discount codes for your attendees.</p>
        </div>
      </div>

      <div className={styles.formSection}>
        {discountCodes.length === 0 ? (
          <div className={styles.emptyDiscountCodesContainer}>
            <h3 className={styles.emptyStateTitle}>Add Coupon Code</h3>
            <p className={styles.emptyStateDescription}>You can add them later or don't add at all if you want</p>
            <button
              type="button"
              className={styles.createCouponButton}
              onClick={handleAddDiscountCodeRow}
              disabled={isSavingDiscountCodes}
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
                                  checked={(code.ticketsApplicable || [])
                                    .map((id) => parseInt(id, 10))
                                    .includes(parseInt(ticket.id, 10))}
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
                    <div className={styles.discountStatus}>
                      <label className={styles.toggleSwitch}>
                        <input
                          type="checkbox"
                          checked={code.isActive !== false}
                          onChange={async (e) => {
                            const updatedCodes = [...discountCodes];
                            updatedCodes[index] = { ...updatedCodes[index], isActive: e.target.checked };
                            if (onDiscountCodesCommit) {
                              const persistedCodes = await onDiscountCodesCommit(updatedCodes);
                              if (!persistedCodes) return;
                              setDiscountCodes(persistedCodes);
                              return;
                            }
                            setDiscountCodes(updatedCodes);
                          }}
                          disabled={isExpired(code)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                    <div className={styles.discountActions}>
                      <div className={styles.actionMenuContainer}>
                        <button type="button" className={styles.discountActionButton} onClick={(e) => { e.stopPropagation(); setOpenDropdownIndex(null); setOpenMenuIndex(openMenuIndex === index ? null : index); }} aria-label="Actions">
                          <svg width="4" height="16" viewBox="0 0 4 16" fill="#6B7280" xmlns="http://www.w3.org/2000/svg"><path d="M2 4C3.1 4 4 3.1 4 2s-.9-2-2-2-2 .9-2 2 .9 4 2 4zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>
                        </button>
                        {openMenuIndex === index && (
                          <div className={styles.actionMenu}>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleEditDiscountCode(index); setOpenMenuIndex(null); }}>Edit</button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteDiscountCode(index); setOpenMenuIndex(null); }} className={styles.deleteAction}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.addDiscountCodeRow}>
              <button type="button" className={styles.addDiscountCodeInlineButton} onClick={handleAddDiscountCodeRow} disabled={isSavingDiscountCodes}>
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
          isSaving={isSavingDiscountCodes}
          saveButtonText={isPersistedDiscountCode(currentDiscountCode) ? "Update Coupon" : "Save Coupon"}
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
  onDiscountCodesCommit: PropTypes.func,
  isSavingDiscountCodes: PropTypes.bool,
};

export default DiscountCodesStep;