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

// ✅ 1. Add the helper function back into your file
const formatApiEventData = (apiEventData) => {
  if (!apiEventData) return null;

  // ✅ This function is now more robust
  const formatTimeObject = (timeValue) => {
    // If time is already a string, just use it
    if (typeof timeValue === 'string') {
      return timeValue;
    }
    
    // If time is an object, format it
    if (typeof timeValue === 'object' && timeValue !== null) {
      const hour = String(timeValue.hour).padStart(2, '0');
      const minute = String(timeValue.minute).padStart(2, '0');
      const second = String(timeValue.second || 0).padStart(2, '0'); // Handle missing seconds
      return `${hour}:${minute}:${second}`;
    }

    // Fallback for null or other types
    return "00:00:00";
  };

  return {
    ...apiEventData,
    // This will now correctly use the top-level time values
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

          // --- DEBUGGING LOGS ---
    console.log("Raw event data from API:", eventResponse.data);
    const formattedEventData = formatApiEventData(eventResponse.data);
    console.log("Formatted event data for state:", formattedEventData);
      
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
    try {
      // Robust date formatting function with fallbacks, inspired by eventUtil.js
      const formatToISO = (date, time) => {
        if (!date || !time) return null;
        const paddedTime = time.includes(':') ? time : `${time}:00`;
        return new Date(`${date}T${paddedTime}`).toISOString();
      };
      const fallbackValidFrom = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

      const eventDateTime = eventDetails?.dateTime || {};
      const fallbackValidUntil = formatToISO(eventDateTime.startDate, eventDateTime.startTime);

          // --- DEBUGGING LOG ---
    console.log("Fallback for validUntil:", fallbackValidUntil);
    // ---------------------

      let nextDiscounts = [];
      const payloadData = {
        id: editingDiscount ? editingDiscount.id : null,
        code: modalData.code,
        type: modalData.type,
        value: parseFloat(modalData.value) || 0,
        usageLimit: modalData.usageLimit ? parseInt(modalData.usageLimit, 10) : 0,
        validFrom: formatToISO(modalData.validFromDate, modalData.validFromTime) || fallbackValidFrom,
        validUntil: formatToISO(modalData.validUntilDate, modalData.validUntilTime) || fallbackValidUntil,
        ticketsApplicable: modalData.ticketsApplicable || [],
        isActive: true,
      };

      if (editingDiscount) {
        nextDiscounts = discounts.map(d => d.id === editingDiscount.id ? { ...d, ...payloadData } : d);
      } else {
        nextDiscounts = [...discounts, payloadData];
      }

      const payload = { discountCodes: nextDiscounts };
      await UpdateEventDiscountCodesAPI(eventId, payload);
      handleCloseModal();
      fetchInitialData();
    } catch (err) {
      console.error("Failed to save discount:", err);
      setError(err.response?.data?.message || "Failed to save the discount code.");
    }
  };
  
  const formatDiscountValue = (discount) => {
    if (discount.type === 'percentage') return `${discount.value}%`;
    if (discount.type === 'fixed') return `$${discount.value.toFixed(2)}`;
    return discount.value;
  };

  const determineStatus = (discount) => {
    return discount.isActive ? "Active" : "Expired";
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
        : discounts.length > 0 ? (
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

              {discounts.map((discount) => (
                <div key={discount.id} className={styles.discountRow}>
                  <div className={`${styles.discountCell} ${styles.cellCode}`}>{discount.code}</div>
                  <div className={`${styles.discountCell} ${styles.cellType}`}>{discount.type}</div>
                  <div className={`${styles.discountCell} ${styles.cellValue}`}>{formatDiscountValue(discount)}</div>
                  <div className={`${styles.discountCell} ${styles.cellUsage}`}>{discount.usageLimit || 'Unlimited'}</div>
                  <div className={`${styles.discountCell} ${styles.cellTickets}`}>{getTicketNamesForDisplay(discount.ticketsApplicable)}</div>
                  <div className={`${styles.discountCell} ${styles.cellStatus}`}>
                    <span className={`${styles.statusBadge} ${styles[determineStatus(discount).toLowerCase()]}`}>{determineStatus(discount)}</span>
                  </div>
                  <div className={`${styles.discountCell} ${styles.cellActions}`}>
                    <button className={styles.editButton} onClick={() => handleEditClick(discount)}>
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
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