// src/pages/events/steps/components/TicketDetailsModal.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./ticketDetailsModal.module.scss";

/**
 * TicketDetailsModal component for creating and editing tickets
 *
 * @param {Object} props Component props
 * @param {Object} props.ticket Ticket data
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @param {Function} props.onSave Function to save the ticket
 * @returns {JSX.Element} TicketDetailsModal component
 */
const TicketDetailsModal = ({
  ticket = {},
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  saveButtonText = "Create Ticket", // Add this line
}) => {
  // State for active panel (Basic or Advance)
  const [activePanel, setActivePanel] = useState("basic");

  // State for sale date type
  const [saleDateType, setSaleDateType] = useState("custom");

  // State for quantity type
  const [quantityType, setQuantityType] = useState("limited");

  // Local state for ticket data
  const [localTicket, setLocalTicket] = useState({
    name: "",
    price: "",
    quantity: "",
    maxPurchaseAmount: "No Limit",
    enableMaxPurchase: false,
    purchaseLimit: "",
    salesStartDate: "",
    salesStartTime: "",
    salesEndDate: "",
    salesEndTime: "",
    isAdvance: false,
    advanceAmount: "",
    description: "",
    saleAfterTicket: "",
    ...ticket,
  });

  // Update local ticket when prop changes
  useEffect(() => {
    setLocalTicket({
      name: "",
      price: "",
      quantity: "",
      maxPurchaseAmount: "No Limit",
      enableMaxPurchase: false,
      purchaseLimit: "",
      salesStartDate: "",
      salesStartTime: "",
      salesEndDate: "",
      salesEndTime: "",
      isAdvance: false,
      advanceAmount: "",
      description: "",
      saleAfterTicket: "",
      ...ticket,
    });

    // Set quantity type based on ticket data
    if (ticket.quantity === "No Limit") {
      setQuantityType("unlimited");
    } else {
      setQuantityType("limited");
    }
  }, [ticket]);

  /**
   * Handle input change
   * @param {Object} e - Event object
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalTicket((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Handle quantity type change
   * @param {string} type - Quantity type ('limited' or 'unlimited')
   */
  const handleQuantityTypeChange = (type) => {
    setQuantityType(type);
    if (type === "unlimited") {
      setLocalTicket((prev) => ({
        ...prev,
        quantity: "No Limit",
      }));
    } else if (localTicket.quantity === "No Limit") {
      setLocalTicket((prev) => ({
        ...prev,
        quantity: "",
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    onSave(localTicket);
  };

  if (!isOpen) return null;

  // The modal component
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.sidePanel}>
          <div className={styles.ticketIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 12C20 10.9 19.1 10 18 10H17.74C17.9 9.55 18 9.03 18 8.5C18 6.57 16.43 5 14.5 5C13.45 5 12.46 5.45 11.83 6.39C11.35 5.32 10.24 4.5 8.89 4.5C7.16 4.5 5.75 5.91 5.75 7.64C5.75 8.47 6.09 9.24 6.64 9.81C5.09 10.24 4 11.7 4 13.34C4 15.3 5.54 16.91 7.5 16.98V17H18C19.1 17 20 16.1 20 15V12Z"
                fill="#7C3AED"
              />
            </svg>
          </div>
          <h3 className={styles.sidePanelTitle}>New Ticket</h3>
          <p className={styles.sidePanelSubtitle}>Ticket Advance Options</p>

          <div className={styles.navigationMenu}>
            <button
              type="button"
              className={`${styles.navItem} ${
                activePanel === "basic" ? styles.active : ""
              }`}
              onClick={() => setActivePanel("basic")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"
                  fill="currentColor"
                />
              </svg>
              Basic Details
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${
                activePanel === "advance" ? styles.active : ""
              }`}
              onClick={() => setActivePanel("advance")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.14 12.94C19.59 12.64 19.89 12.12 19.89 11.5C19.89 10.88 19.59 10.36 19.14 10.06L12.36 5.93C12.08 5.75 11.75 5.65 11.39 5.65C10.32 5.65 9.39 6.55 9.39 7.65V16.35C9.39 17.45 10.32 18.35 11.39 18.35C11.75 18.35 12.08 18.25 12.36 18.07L19.14 13.94C19.59 13.64 19.89 13.12 19.89 12.5C19.89 11.88 19.59 11.36 19.14 11.06Z"
                  fill="currentColor"
                />
                <path d="M4 20H6V4H4V20Z" fill="currentColor" />
              </svg>
              Advance details
            </button>
          </div>
        </div>

        <div className={styles.contentPanel}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              {activePanel === "basic" ? "Basic Details" : "Advance Details"}
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
            {activePanel === "basic" ? (
              // Basic Details Panel
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    Ticket Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={styles.formInput}
                    placeholder="Early Bird"
                    value={localTicket.name || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="price" className={styles.formLabel}>
                    Ticket Price
                  </label>
                  <div className={styles.inputWithPrefix}>
                    <span className={styles.prefix}>$</span>
                    <input
                      type="text"
                      id="price"
                      name="price"
                      className={styles.formInput}
                      placeholder="0.00"
                      value={localTicket.price || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="quantity" className={styles.formLabel}>
                    Ticket Quantity
                  </label>
                  <div className={styles.quantityToggle}>
                    <div className={styles.saleTypeToggle}>
                      <button
                        type="button"
                        className={`${styles.saleTypeBtn} ${
                          quantityType === "limited" ? styles.active : ""
                        }`}
                        onClick={() => handleQuantityTypeChange("limited")}
                      >
                        Limited
                      </button>
                      <button
                        type="button"
                        className={`${styles.saleTypeBtn} ${
                          quantityType === "unlimited" ? styles.active : ""
                        }`}
                        onClick={() => handleQuantityTypeChange("unlimited")}
                      >
                        Unlimited
                      </button>
                    </div>

                    {quantityType === "limited" ? (
                      <input
                        type="text"
                        id="quantity"
                        name="quantity"
                        className={styles.formInput}
                        placeholder="Enter quantity"
                        value={
                          localTicket.quantity === "No Limit"
                            ? ""
                            : localTicket.quantity || ""
                        }
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className={styles.noLimitText}>
                        No limit on the number of tickets
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="enableMaxPurchase"
                      name="enableMaxPurchase"
                      className={styles.checkboxInput}
                      checked={localTicket.enableMaxPurchase || false}
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="enableMaxPurchase"
                      className={styles.checkboxLabel}
                    >
                      Maximum Purchase Limit
                    </label>
                  </div>

                  {localTicket.enableMaxPurchase && (
                    <div className={styles.formGroup}>
                      <label
                        htmlFor="purchaseLimit"
                        className={styles.formLabel}
                      >
                        Purchase Limit
                      </label>
                      <input
                        type="text"
                        id="purchaseLimit"
                        name="purchaseLimit"
                        className={styles.formInput}
                        placeholder="Maximum tickets per order"
                        value={localTicket.purchaseLimit || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Advance Details Panel
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="description" className={styles.formLabel}>
                    Description
                  </label>
                  <div className={styles.richTextEditor}>
                    <div className={styles.editorToolbar}>
                      <button type="button" className={styles.editorButton}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12ZM8 13H16V11H8V13ZM17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      className={styles.editorContent}
                      placeholder="Enter ticket description"
                      value={localTicket.description || ""}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sale start/end</label>
                  <p className={styles.formHelper}>Discount Codes</p>

                  <div className={styles.saleTypeToggle}>
                    <button
                      type="button"
                      className={`${styles.saleTypeBtn} ${
                        saleDateType === "custom" ? styles.active : ""
                      }`}
                      onClick={() => setSaleDateType("custom")}
                    >
                      Custom
                    </button>
                    <button
                      type="button"
                      className={`${styles.saleTypeBtn} ${
                        saleDateType === "beforeAfter" ? styles.active : ""
                      }`}
                      onClick={() => setSaleDateType("beforeAfter")}
                    >
                      Before/After
                    </button>
                  </div>

                  {saleDateType === "custom" ? (
                    // Custom sales dates
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Sales Start</label>
                        <p className={styles.formHelper}>
                          Enter the official name of your event that will be
                          displayed to attendees
                        </p>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label
                              htmlFor="salesStartDate"
                              className={styles.formLabel}
                            >
                              Date
                            </label>
                            <input
                              type="text"
                              id="salesStartDate"
                              name="salesStartDate"
                              className={styles.formInput}
                              placeholder="MM/DD/YYYY"
                              value={localTicket.salesStartDate || ""}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label
                              htmlFor="salesStartTime"
                              className={styles.formLabel}
                            >
                              Time
                            </label>
                            <input
                              type="text"
                              id="salesStartTime"
                              name="salesStartTime"
                              className={styles.formInput}
                              placeholder="HH:MM AM/PM"
                              value={localTicket.salesStartTime || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Sales End</label>
                        <p className={styles.formHelper}>
                          Enter the official name of your event that will be
                          displayed to attendees
                        </p>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label
                              htmlFor="salesEndDate"
                              className={styles.formLabel}
                            >
                              Date
                            </label>
                            <input
                              type="text"
                              id="salesEndDate"
                              name="salesEndDate"
                              className={styles.formInput}
                              placeholder="MM/DD/YYYY"
                              value={localTicket.salesEndDate || ""}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label
                              htmlFor="salesEndTime"
                              className={styles.formLabel}
                            >
                              Time
                            </label>
                            <input
                              type="text"
                              id="salesEndTime"
                              name="salesEndTime"
                              className={styles.formInput}
                              placeholder="HH:MM AM/PM"
                              value={localTicket.salesEndTime || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Before/After sales
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Sales After</label>
                      <p
                        className={`${styles.formHelper} ${styles.salesAfter}`}
                      >
                        Start sales after the selected ticket is sold out
                      </p>

                      <input
                        type="text"
                        id="saleAfterTicket"
                        name="saleAfterTicket"
                        className={styles.formInput}
                        placeholder="Select ticket type"
                        value={localTicket.saleAfterTicket || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.createButton}
              onClick={handleSubmit}
            >
              {saveButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

TicketDetailsModal.propTypes = {
  ticket: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  saveButtonText: PropTypes.string, // Add this line
};

export default TicketDetailsModal;
