import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./discountCodeModal.module.scss";

/**
 * Helper function to create a Date object from date and time strings.
 * @param {string} dateStr - e.g., '2025-06-25'
 * @param {string} timeStr - e.g., '14:30'
 * @returns {Date|null}
 */
const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) {
    return null;
  }
  const dateTimeString = `${dateStr}T${timeStr}:00.000Z`;
  const date = new Date(dateTimeString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Helper to format a Date object into a date and time string.
 * @param {Date} date - The Date object
 * @returns {{date: string, time: string}}
 */
const formatDateObject = (date) => {
  if (!date) {
    return { date: '', time: '' };
  }
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].substring(0, 5);
  return { date: dateStr, time: timeStr };
};

/**
 * DiscountCodeModal component for creating and editing discount codes
 *
 * @param {Object} props Component props
 * @param {Object} props.discountCode Discount code data
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @param {Function} props.onSave Function to save the discount code
 * @param {Array} props.availableTickets List of tickets to apply the discount to
 * @returns {JSX.Element} DiscountCodeModal component
 */
const DiscountCodeModal = ({
  discountCode = {},
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  availableTickets = [],
  isExpired = false,
}) => {
  const [activePanel, setActivePanel] = useState('basic');
  const [localDiscountCode, setLocalDiscountCode] = useState({
    code: "",
    type: "percentage",
    value: "",
    validFromDate: "",
    validFromTime: "",
    validUntilDate: "",
    validUntilTime: "",
    usageLimit: "",
    ticketsApplicable: [],
  });
  
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setLocalDiscountCode({
      code: "",
      type: "percentage",
      value: "",
      validFromDate: "",
      validFromTime: "",
      validUntilDate: "",
      validUntilTime: "",
      usageLimit: "",
      isActive: true,
      ...discountCode,
    });
    setSelectedTickets(discountCode.ticketsApplicable || []);
  }, [discountCode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalDiscountCode((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

   const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setLocalDiscountCode(prev => ({
      ...prev,
      [name]: checked,
    }));
  }; 

  const handleDateChange = (date, dateFieldName, timeFieldName) => {
    const { date: dateStr, time: timeStr } = formatDateObject(date);
    setLocalDiscountCode(prev => ({
      ...prev,
      [dateFieldName]: dateStr,
      [timeFieldName]: timeStr,
    }));
  };
  
  const handleTicketCheckChange = (e) => {
    const { value, checked } = e.target;
    setSelectedTickets(prev => {
      const ticketId = parseInt(value, 10);
      if (checked) {
        return [...prev, ticketId];
      } else {
        return prev.filter(id => id !== ticketId);
      }
    });
  };
  
  const handleSubmit = () => {
    const finalDiscountCode = {
      ...localDiscountCode,
      ticketsApplicable: selectedTickets,
    };
    onSave(finalDiscountCode);
  };

  const getSelectedTicketNames = () => {
    if (selectedTickets.length === 0) {
      return "All Tickets";
    }
    const names = selectedTickets.map(id => {
      const ticket = availableTickets.find(t => t.id === id);
      return ticket ? ticket.name : null;
    }).filter(name => name !== null);
    return names.join(", ");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.sidePanel}>
          <div className={styles.ticketIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.41 11.58L12.41 2.58C12.05 2.22 11.55 2 11 2H4C2.9 2 2 2.9 2 4V11C2 11.55 2.22 12.05 2.59 12.42L11.59 21.42C11.95 21.78 12.45 22 13 22C13.55 22 14.05 21.78 14.41 21.41L21.41 14.41C21.78 14.05 22 13.55 22 13C22 12.45 21.77 11.94 21.41 11.58ZM5.5 7C4.67 7 4 6.33 4 5.5C4 4.67 4.67 4 5.5 4C6.33 4 7 4.67 7 5.5C7 6.33 6.33 7 5.5 7Z" fill="#7C3AED"/>
            </svg>
          </div>
          <h3 className={styles.sidePanelTitle}>Coupon Options</h3>
          <p className={styles.sidePanelSubtitle}>Advanced Coupon Options</p>

          <div className={styles.navigationMenu}>
            <button 
              type="button" 
              className={`${styles.navItem} ${activePanel === 'basic' ? styles.active : ''}`}
              onClick={() => setActivePanel('basic')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/></svg>
              Basic Details
            </button>
            
            <button 
              type="button" 
              className={`${styles.navItem} ${activePanel === 'advance' ? styles.active : ''}`}
              onClick={() => setActivePanel('advance')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94C19.59 12.64 19.89 12.12 19.89 11.5C19.89 10.88 19.59 10.36 19.14 10.06L12.36 5.93C12.08 5.75 11.75 5.65 11.39 5.65C10.32 5.65 9.39 6.55 9.39 7.65V16.35C9.39 17.45 10.32 18.35 11.39 18.35C11.75 18.35 12.08 18.25 12.36 18.07L19.14 13.94C19.59 13.64 19.89 13.12 19.89 12.5C19.89 11.88 19.59 11.36 19.14 11.06Z" fill="currentColor"/><path d="M4 20H6V4H4V20Z" fill="currentColor"/></svg>
              Advance Details
            </button>
          </div>
        </div>

        <div className={styles.contentPanel}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              {activePanel === 'basic' ? 'Basic Details' : 'Advance Details'}
            </h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="#333333"
                />
              </svg>
            </button>
          </div>

          <div className={styles.modalContent}>
            {activePanel === 'basic' ? (
              // Basic Details Panel
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="code" className={styles.formLabel}>
                    Discount Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    className={styles.formInput}
                    placeholder="e.g. EARLY10"
                    value={localDiscountCode.code || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="type" className={styles.formLabel}>
                    Discount Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    className={styles.formInput}
                    value={localDiscountCode.type || "percentage"}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="value" className={styles.formLabel}>
                    Discount Value
                  </label>
                  <input
                    type="number"
                    id="value"
                    name="value"
                    min="0"
                    step="0.01"
                    className={styles.formInput}
                    placeholder="e.g. 10"
                    value={localDiscountCode.value || ""}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="usageLimit" className={styles.formLabel}>
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    min="0"
                    className={styles.formInput}
                    placeholder="e.g. 100"
                    value={localDiscountCode.usageLimit || ""}
                    onChange={handleInputChange}
                  />
                </div>

                {/* ✅ Add the toggle switch here */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <div className={styles.toggleContainer}>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={localDiscountCode.isActive && !isExpired}
                        onChange={handleToggleChange}
                        disabled={isExpired}
                      />
                      <span className={styles.slider}></span>
                    </label>
                    <span className={styles.toggleLabel}>
                      {isExpired ? "Expired" : localDiscountCode.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>                

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Applicable Tickets
                  </label>
                  <p className={styles.formHelper}>Select the tickets to which this coupon code will apply.</p>
                  <div className={styles.customDropdown}>
                    <button
                      type="button"
                      className={styles.dropdownButton}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span>{getSelectedTicketNames()}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {availableTickets.map((ticket) => (
                          <label key={ticket.id} className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              value={ticket.id}
                              checked={selectedTickets.includes(ticket.id)}
                              onChange={handleTicketCheckChange}
                              className={styles.checkboxInput}
                            />
                            {ticket.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Advance Details Panel
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Valid From</label>
                  <DatePicker
                    selected={combineDateAndTime(localDiscountCode.validFromDate, localDiscountCode.validFromTime)}
                    onChange={date => handleDateChange(date, 'validFromDate', 'validFromTime')}
                    showTimeSelect
                    dateFormat="MM/dd/yyyy h:mm aa"
                    className={styles.formInput}
                    placeholderText="Select start date and time"
                    isClearable
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Valid Until</label>
                  <DatePicker
                    selected={combineDateAndTime(localDiscountCode.validUntilDate, localDiscountCode.validUntilTime)}
                    onChange={date => handleDateChange(date, 'validUntilDate', 'validUntilTime')}
                    showTimeSelect
                    dateFormat="MM/dd/yyyy h:mm aa"
                    className={styles.formInput}
                    placeholderText="Select end date and time"
                    isClearable
                  />
                </div>
              </>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DiscountCodeModal.propTypes = {
  discountCode: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  availableTickets: PropTypes.array,
  isExpired: PropTypes.bool,
};

export default DiscountCodeModal;