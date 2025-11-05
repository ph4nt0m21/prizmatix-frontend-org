import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./discountSection.module.scss";
import DiscountCodeModal from "./discountCodeModal";
import LoadingSpinner from "../../../components/common/loadingSpinner/loadingSpinner";

import {
  GetEventDiscountCodesAPI,
  UpdateEventDiscountCodesAPI,
  GetEventTicketStructuresAPI,
  GetEventAPI
} from "../../../services/allApis";

const formatApiEventData = (apiEventData) => {
  if (!apiEventData) return null;

  const formatTimeObject = (timeValue) => {
    if (typeof timeValue === 'string') {
      return timeValue;
    }
    if (typeof timeValue === 'object' && timeValue !== null) {
      const hour = String(timeValue.hour).padStart(2, '0');
      const minute = String(timeValue.minute).padStart(2, '0');
      const second = String(timeValue.second || 0).padStart(2, '0');
      return `${hour}:${minute}:${second}`;
    }
    return "00:00:00";
  };

  return {
    ...apiEventData,
    dateTime: {
      startDate: apiEventData.startDate,
      startTime: formatTimeObject(apiEventData.startTime),
      endDate: apiEventData.endDate,
      endTime: formatTimeObject(apiEventData.endTime),
      timezone: apiEventData.timezone,
    },
  };
};

const DiscountSection = () => {
  const { eventId } = useParams();
  const [discounts, setDiscounts] = useState([]);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [discountsResponse, ticketsResponse, eventResponse] = await Promise.all([
        GetEventDiscountCodesAPI(eventId),
        GetEventTicketStructuresAPI(eventId),
        GetEventAPI(eventId)
      ]);

      const formattedEventData = formatApiEventData(eventResponse.data);
      const discountData = discountsResponse.data.discountCodes || discountsResponse.data || [];
      const ticketData = ticketsResponse.data.ticketStructures || ticketsResponse.data || [];

      setDiscounts(discountData);
      setAvailableTickets(ticketData);
      setEventDetails(formattedEventData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch section data:", err);
      setError("Failed to load discount data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchInitialData();
    }
  }, [eventId]);

  // ✅ New centralized function to handle API updates
  const updateDiscountsOnServer = async (updatedDiscountsList) => {
    try {
      const payload = { discountCodes: updatedDiscountsList };
      await UpdateEventDiscountCodesAPI(eventId, payload);
      // Refresh data from server to ensure consistency
      await fetchInitialData(); 
    } catch (err) {
      console.error("Failed to update discounts:", err);
      setError(err.response?.data?.message || "An error occurred while updating the discounts.");
      // Optionally, revert state on failure
      // fetchInitialData(); 
    }
  };
  
  // ✅ Handler for the new toggle switch
  const handleToggleActive = async (discountId) => {
    const nextDiscounts = discounts.map(d => 
      d.id === discountId ? { ...d, isActive: !d.isActive } : d
    );
    setDiscounts(nextDiscounts); // Optimistic UI update
    await updateDiscountsOnServer(nextDiscounts);
  };

  // ✅ Handler for the new delete button
  const handleDelete = async (discountId) => {
    if (window.confirm("Are you sure you want to delete this discount code?")) {
        const nextDiscounts = discounts.map(d =>
            d.id === discountId ? { ...d, isDeleted: true } : d
        );
        // We don't need to set state here as fetchInitialData will be called
        // after the update, and the filter will remove it from view.
        await updateDiscountsOnServer(nextDiscounts);
    }
  };

  const handleCreateNew = () => {
    setEditingDiscount(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (discount) => {
    setEditingDiscount(discount);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
  };

  const handleSaveDiscount = async (modalData) => {
      const formatToISO = (date, time) => {
        if (!date || !time) return null;
        const paddedTime = time.includes(':') ? time : `${time}:00`;
        return new Date(`${date}T${paddedTime}`).toISOString();
      };
      
      const eventDateTime = eventDetails?.dateTime || {};
      const fallbackValidFrom = new Date().toISOString();
      const fallbackValidUntil = formatToISO(eventDateTime.startDate, eventDateTime.startTime);

      let nextDiscounts = [];
      const payloadData = {
        // For new items, API will assign an ID. Use a temporary one for the key or handle differently.
        id: editingDiscount ? editingDiscount.id : `new_${Date.now()}`, 
        code: modalData.code,
        type: modalData.type,
        value: parseFloat(modalData.value) || 0,
        usageLimit: modalData.usageLimit ? parseInt(modalData.usageLimit, 10) : 0,
        validFrom: formatToISO(modalData.validFromDate, modalData.validFromTime) || fallbackValidFrom,
        validUntil: formatToISO(modalData.validUntilDate, modalData.validUntilTime) || fallbackValidUntil,
        ticketsApplicable: modalData.ticketsApplicable || [],
        isActive: modalData.isActive !== undefined ? modalData.isActive : true,
        isDeleted: false, // Ensure new/edited items are not deleted
      };

      if (editingDiscount) {
        nextDiscounts = discounts.map(d => d.id === editingDiscount.id ? payloadData : d);
      } else {
        nextDiscounts = [...discounts, payloadData];
      }

      await updateDiscountsOnServer(nextDiscounts);
      handleCloseModal();
  };
  
  const formatDiscountValue = (discount) => {
    if (discount.type === 'percentage') return `${discount.value}%`;
    if (discount.type === 'fixed') return `$${discount.value.toFixed(2)}`;
    return discount.value;
  };

  const getTicketNamesForDisplay = (ticketIds) => {
    if (!ticketIds || ticketIds.length === 0) {
        return 'All Tickets';
    }
    const names = ticketIds.map(id => {
        const ticket = availableTickets.find(t => t.id === id);
        return ticket ? ticket.name : null;
    }).filter(Boolean);
    return names.join(', ');
  };

  return (
    <>
      <div className={styles.discountSectionContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Discounts</h2>
          <button className={styles.createDiscountButton} onClick={handleCreateNew}>Create New Discount</button>
        </div>

        {isLoading ? <LoadingSpinner />
        : error ? <div className="error-message">{error}</div>
        : discounts.filter(d => !d.isDeleted).length > 0 ? ( // ✅ Filter out soft-deleted items
          <div className={styles.tableWrapper}>
            <div className={styles.discountsList}>
              <div className={`${styles.discountRow} ${styles.discountsHeader}`}>
                <div className={`${styles.discountCell} ${styles.cellCode}`}>Code</div>
                <div className={`${styles.discountCell} ${styles.cellType}`}>Type</div>
                <div className={`${styles.discountCell} ${styles.cellValue}`}>Value</div>
                <div className={`${styles.discountCell} ${styles.cellUsage}`}>Usage Limit</div>
                <div className={`${styles.discountCell} ${styles.cellTickets}`}>Applicable Tickets</div>
                <div className={`${styles.discountCell} ${styles.cellStatus}`}>Status</div>
                <div className={`${styles.discountCell} ${styles.cellActions}`}>Actions</div>
              </div>

              {discounts
                .filter(d => !d.isDeleted) // ✅ Filter here as well
                .map((discount) => (
                <div key={discount.id} className={styles.discountRow}>
                  <div className={`${styles.discountCell} ${styles.cellCode}`}>{discount.code}</div>
                  <div className={`${styles.discountCell} ${styles.cellType}`}>{discount.type}</div>
                  <div className={`${styles.discountCell} ${styles.cellValue}`}>{formatDiscountValue(discount)}</div>
                  <div className={`${styles.discountCell} ${styles.cellUsage}`}>{discount.usageLimit || 'Unlimited'}</div>
                  <div className={`${styles.discountCell} ${styles.cellTickets}`}>{getTicketNamesForDisplay(discount.ticketsApplicable)}</div>
                  <div className={`${styles.discountCell} ${styles.cellStatus}`}>
                    {/* ✅ New Toggle Switch */}
                    <label className={styles.toggleSwitch}>
                        <input 
                            type="checkbox" 
                            checked={discount.isActive} 
                            onChange={() => handleToggleActive(discount.id)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                  </div>
                  <div className={`${styles.discountCell} ${styles.cellActions}`}>
                    <button className={styles.editButton} onClick={() => handleEditClick(discount)}>
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                      </svg>
                    </button>
                    {/* ✅ New Delete Button */}
                    <button className={styles.deleteButton} onClick={() => handleDelete(discount.id)}>
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
          <div className="no-data-message">No discount codes have been created for this event.</div>
        )}
      </div>

      <DiscountCodeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDiscount}
        discountCode={editingDiscount || {}}
        availableTickets={availableTickets}
      />
    </>
  );
};

export default DiscountSection;