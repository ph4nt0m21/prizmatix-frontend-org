import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
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
import {
  mapTicketStructureToStepTicket,
  mapStepTicketToApiPayload,
} from "../../../utils/eventUtil";
import {
  mapApiDateTimeToFormDateTime,
  resolveEventTimezone,
} from "../../../utils/datetimeUtil";

const TicketSection = ({ onCommitSuccess = () => {} }) => {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState({ tickets: [], dateTime: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTickets, setIsSavingTickets] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventAndTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [eventResponse, ticketsResponse] = await Promise.all([
        GetEventAPI(eventId),
        GetEventTicketStructuresAPI(eventId),
      ]);

      const event = eventResponse?.data || {};
      const dateTime = mapApiDateTimeToFormDateTime(
        event.dateTime || {
          startDate: event.startDate || "",
          startTime: event.startTime || "",
          endDate: event.endDate || "",
          endTime: event.endTime || "",
          timezone: event.timezone || event.timeZone,
        },
        {}
      );
      const eventTimezone = resolveEventTimezone(dateTime.timezone);

      const mappedTickets = Array.isArray(ticketsResponse?.data)
        ? ticketsResponse.data
            .filter((t) => t?.isDeleted !== true)
            .map((ticket) => mapTicketStructureToStepTicket(ticket, eventTimezone))
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

  const isDonationTicket = (ticket) =>
    String(ticket?.ticketKind || "").toUpperCase() === "DONATION";

  const getInvalidTicketItems = (ticketsToCheck) => {
    if (!ticketsToCheck || ticketsToCheck.length === 0) {
      return { invalidTickets: [], invalidDonations: [] };
    }

    const invalidTickets = [];
    const invalidDonations = [];

    ticketsToCheck.forEach((ticket) => {
      const donation = isDonationTicket(ticket);
      const missingName = !ticket.name || ticket.name.trim() === "";
      const invalidPrice =
        ticket.price === null ||
        ticket.price === "" ||
        Number.isNaN(Number(ticket.price)) ||
        parseFloat(ticket.price) < 0;

      if (donation) {
        if (missingName || invalidPrice) {
          invalidDonations.push(ticket);
        }
        return;
      }

      if (missingName || invalidPrice) {
        invalidTickets.push(ticket);
        return;
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
          invalidTickets.push(ticket);
          return;
        }
      }
      if (
        ticket.maxPurchaseAmount &&
        (Number.isNaN(Number(ticket.maxPurchaseAmount)) ||
          !Number.isInteger(Number(ticket.maxPurchaseAmount)) ||
          parseInt(ticket.maxPurchaseAmount, 10) <= 0)
      ) {
        invalidTickets.push(ticket);
      }
    });

    return { invalidTickets, invalidDonations };
  };

  const validateTickets = (ticketsToCheck) => {
    if (!ticketsToCheck || ticketsToCheck.length === 0) return false;
    const { invalidTickets, invalidDonations } = getInvalidTicketItems(ticketsToCheck);
    return invalidTickets.length === 0 && invalidDonations.length === 0;
  };

  const getValidationErrorMessage = (ticketsToCheck) => {
    const { invalidTickets, invalidDonations } = getInvalidTicketItems(ticketsToCheck);
    if (invalidDonations.length > 0 && invalidTickets.length === 0) {
      return "Please complete valid donation details before saving.";
    }
    if (invalidTickets.length > 0 && invalidDonations.length === 0) {
      return "Please complete valid ticket details before saving.";
    }
    if (invalidTickets.length > 0 && invalidDonations.length > 0) {
      return "Please complete valid ticket and donation details before saving.";
    }
    return "Please complete valid ticket details before saving.";
  };

  const onTicketsCommit = async (ticketsOverride = null) => {
    const ticketsToSave = ticketsOverride || eventData.tickets;
    if (ticketsToSave.length > 0 && !validateTickets(ticketsToSave)) {
      setError(getValidationErrorMessage(ticketsToSave));
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
        const payload = mapStepTicketToApiPayload(ticket, eventData.dateTime?.timezone);
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
            .map((t) => mapTicketStructureToStepTicket(t, eventData.dateTime?.timezone))
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

  const handleSoldOutOverrideToggle = async (ticketId, nextValue) => {
    const ticket = eventData.tickets.find((t) => String(t.id) === String(ticketId));
    if (!ticket) return false;

    try {
      setError(null);
      setIsSavingTickets(true);
      const payload = {
        ...mapStepTicketToApiPayload(ticket, eventData.dateTime?.timezone),
        id: parseInt(ticketId, 10),
        eventId: parseInt(eventId, 10),
        soldOutOverride: nextValue,
      };
      await UpdateTicketStructureAPI(ticketId, payload);
      const savedTicketsResponse = await GetEventTicketStructuresAPI(eventId);
      const savedTickets = Array.isArray(savedTicketsResponse?.data)
        ? savedTicketsResponse.data
            .filter((t) => t?.isDeleted !== true)
            .map((t) => mapTicketStructureToStepTicket(t, eventData.dateTime?.timezone))
        : [];
      setEventData((prev) => ({ ...prev, tickets: savedTickets }));
      return savedTickets;
    } catch (err) {
      console.error("Failed to update sold out override:", err);
      setError(err.response?.data?.message || "Failed to update sold out override.");
      return false;
    } finally {
      setIsSavingTickets(false);
    }
  };

  const getTicketsSaveSuccessMessage = (ticketsToCheck) => {
    const list = ticketsToCheck || [];
    const hasDonation = list.some(isDonationTicket);
    const hasRegular = list.some((t) => !isDonationTicket(t));
    if (hasDonation && !hasRegular) return "Donation saved successfully.";
    if (hasDonation && hasRegular) return "Tickets and donation saved successfully.";
    return "Tickets saved successfully.";
  };

  const handleSaveTicketsClick = async () => {
    const ticketsToSave = eventData.tickets;
    const ok = await onTicketsCommit();
    if (ok) {
      toast.success(getTicketsSaveSuccessMessage(ticketsToSave));
    }
  };

  const canSaveTickets =
    eventData.tickets?.length > 0 && validateTickets(eventData.tickets);

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
            onSoldOutOverrideToggle={handleSoldOutOverrideToggle}
            isSavingTickets={isSavingTickets}
            isValid={validateTickets(eventData.tickets)}
            stepStatus={{ visited: true }}
          />
          <div className={styles.saveActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSaveTicketsClick}
              disabled={isSavingTickets || !canSaveTickets}
            >
              {isSavingTickets ? "Saving…" : "Save changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketSection;
