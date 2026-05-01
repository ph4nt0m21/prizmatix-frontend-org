import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./ticketSection.module.scss";
import TicketsStep from "../steps/ticketsStep";
import LoadingSpinner from "../../../components/common/loadingSpinner/loadingSpinner";
import {
  GetEventTicketStructuresAPI,
  UpdateTicketStructureAPI,
  DeleteTicketStructureAPI,
  CreateTicketStructureAPI,
  GetEventAPI,
} from "../../../services/allApis";

const formatDateTimeForAPI = (dateString, timeString) => {
  if (!dateString || !timeString) return null;
  const paddedTime = timeString.includes(":") ? timeString : `${timeString}:00`;
  const dateTime = new Date(`${dateString} ${paddedTime}`);
  if (Number.isNaN(dateTime.getTime())) return null;
  return dateTime.toISOString();
};

const TicketSection = ({ onCommitSuccess = () => {} }) => {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState({ tickets: [], dateTime: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTickets, setIsSavingTickets] = useState(false);
  const [error, setError] = useState(null);

  const mapTicketStructureToStepTicket = (ticket = {}) => {
    const startIso = ticket.listingStartTime ? new Date(ticket.listingStartTime) : null;
    const endIso = ticket.listingEndTime ? new Date(ticket.listingEndTime) : null;
    const isValidStart = startIso && !Number.isNaN(startIso.getTime());
    const isValidEnd = endIso && !Number.isNaN(endIso.getTime());

    return {
      id: ticket.id,
      name: ticket.name || "",
      price: ticket.price ?? "",
      quantity: ticket.limitedQuantity ? ticket.ticketCapacity : "No Limit",
      maxPurchaseAmount:
        ticket.maxPurchasePerOrder && ticket.maxPurchasePerOrder > 0
          ? ticket.maxPurchasePerOrder
          : "",
      salesStartDate: isValidStart ? startIso.toISOString().split("T")[0] : "",
      salesStartTime: isValidStart ? startIso.toISOString().split("T")[1].slice(0, 5) : "",
      salesEndDate: isValidEnd ? endIso.toISOString().split("T")[0] : "",
      salesEndTime: isValidEnd ? endIso.toISOString().split("T")[1].slice(0, 5) : "",
      startsAfterTicketStructureId:
        ticket.startsAfterTicketStructureId != null
          ? ticket.startsAfterTicketStructureId
          : null,
      description: ticket.description || "",
      isAdvance: false,
      advanceAmount: "",
    };
  };

  const mapStepTicketToApiPayload = (ticket, dateTime) => {
    const fallbackListingStartTime = new Date(
      Date.now() - 12 * 60 * 60 * 1000
    ).toISOString();
    const eventEndTime = formatDateTimeForAPI(dateTime?.endDate, dateTime?.endTime);

    const depRaw = ticket.startsAfterTicketStructureId;
    const startsAfterTicketStructureId =
      depRaw != null && depRaw !== "" && Number.isFinite(Number(depRaw))
        ? parseInt(depRaw, 10)
        : null;

    return {
      name: ticket.name,
      price: parseFloat(ticket.price),
      finalPrice: parseFloat(ticket.price),
      ticketCapacity: ticket.quantity === "No Limit" ? 0 : parseInt(ticket.quantity, 10),
      maxPurchasePerOrder: ticket.maxPurchaseAmount
        ? parseInt(ticket.maxPurchaseAmount, 10)
        : 0,
      currency: "NZD",
      limitedQuantity: ticket.quantity !== "No Limit",
      description: ticket.description || null,
      listingStartTime:
        formatDateTimeForAPI(ticket.salesStartDate, ticket.salesStartTime) ||
        fallbackListingStartTime,
      listingEndTime:
        formatDateTimeForAPI(ticket.salesEndDate, ticket.salesEndTime) || eventEndTime,
      startsAfterTicketStructureId,
      isActive: true,
      isDeleted: false,
      soldOut: false,
    };
  };

  const fetchEventAndTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [eventResponse, ticketsResponse] = await Promise.all([
        GetEventAPI(eventId),
        GetEventTicketStructuresAPI(eventId),
      ]);

      const event = eventResponse?.data || {};
      const dateTime = event.dateTime || {
        startDate: event.startDate || "",
        startTime: event.startTime || "",
        endDate: event.endDate || "",
        endTime: event.endTime || "",
      };

      const mappedTickets = Array.isArray(ticketsResponse?.data)
        ? ticketsResponse.data
            .filter((t) => t?.isDeleted !== true)
            .map(mapTicketStructureToStepTicket)
        : [];

      setEventData({
        ...event,
        dateTime,
        tickets: mappedTickets,
      });
    } catch (err) {
      console.error("Failed to load ticket section data:", err);
      setError("Failed to load ticket section. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventAndTickets();
    }
  }, [eventId]);

  const handleInputChange = (value, fieldName) => {
    if (fieldName !== "tickets") return;
    setEventData((prev) => ({ ...prev, tickets: value || [] }));
  };

  const validateTickets = (ticketsToCheck) => {
    if (!ticketsToCheck || ticketsToCheck.length === 0) return false;
    const invalidTickets = ticketsToCheck.filter((ticket) => {
      if (!ticket.name || ticket.name.trim() === "") return true;
      if (
        ticket.price === null ||
        ticket.price === "" ||
        Number.isNaN(Number(ticket.price)) ||
        parseFloat(ticket.price) < 0
      ) {
        return true;
      }
      const isUnlimited = ticket.quantity === "No Limit";
      if (!isUnlimited) {
        if (
          ticket.quantity === null ||
          ticket.quantity === "" ||
          Number.isNaN(Number(ticket.quantity)) ||
          !Number.isInteger(Number(ticket.quantity)) ||
          parseInt(ticket.quantity, 10) <= 0
        ) {
          return true;
        }
      }
      if (
        ticket.maxPurchaseAmount &&
        (Number.isNaN(Number(ticket.maxPurchaseAmount)) ||
          !Number.isInteger(Number(ticket.maxPurchaseAmount)) ||
          parseInt(ticket.maxPurchaseAmount, 10) <= 0)
      ) {
        return true;
      }
      return false;
    });
    return invalidTickets.length === 0;
  };

  const onTicketsCommit = async (ticketsOverride = null) => {
    const ticketsToSave = ticketsOverride || eventData.tickets;
    if (!validateTickets(ticketsToSave)) {
      setError("Please complete valid ticket details before saving.");
      return false;
    }

    try {
      setError(null);
      setIsSavingTickets(true);

      const existingResponse = await GetEventTicketStructuresAPI(eventId);
      const existingTickets = Array.isArray(existingResponse?.data)
        ? existingResponse.data.filter((t) => t?.id != null && t.isDeleted !== true)
        : [];
      const currentIds = new Set(
        ticketsToSave
          .map((t) => t?.id)
          .filter((id) => id != null && id !== "" && Number.isFinite(Number(id)))
          .map((id) => parseInt(id, 10))
      );
      for (const existingTicket of existingTickets) {
        const existingId = parseInt(existingTicket.id, 10);
        if (!currentIds.has(existingId)) {
          await DeleteTicketStructureAPI(existingId);
        }
      }

      for (const ticket of ticketsToSave) {
        const payload = mapStepTicketToApiPayload(ticket, eventData.dateTime);
        if (ticket.id) {
          await UpdateTicketStructureAPI(ticket.id, {
            ...payload,
            id: ticket.id,
            eventId: parseInt(eventId, 10),
          });
        } else {
          await CreateTicketStructureAPI(eventId, {
            ...payload,
            eventId: parseInt(eventId, 10),
          });
        }
      }

      const savedTicketsResponse = await GetEventTicketStructuresAPI(eventId);
      const savedTickets = Array.isArray(savedTicketsResponse?.data)
        ? savedTicketsResponse.data
            .filter((t) => t?.isDeleted !== true)
            .map(mapTicketStructureToStepTicket)
        : ticketsToSave;

      setEventData((prev) => ({ ...prev, tickets: savedTickets }));
      onCommitSuccess();
      return savedTickets;
    } catch (err) {
      console.error("Failed to save ticket:", err);
      setError(
        err.response?.data?.message || "Failed to save ticket. Please check your input."
      );
      return false;
    } finally {
      setIsSavingTickets(false);
    }
  };

  return (
    <div className={styles.ticketSectionContainer}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <TicketsStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            onTicketsCommit={onTicketsCommit}
            isSavingTickets={isSavingTickets}
            isValid={validateTickets(eventData.tickets)}
            stepStatus={{ visited: true }}
          />
        </>
      )}
    </div>
  );
};

export default TicketSection;