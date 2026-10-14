import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./discountSection.module.scss";
import DiscountCodesStep from "../steps/discountCodesStep";
import LoadingSpinner from "../../../components/common/loadingSpinner/loadingSpinner";
import {
  GetEventDiscountCodesAPI,
  UpdateEventDiscountCodesAPI,
  GetEventTicketStructuresAPI,
  GetEventAPI,
} from "../../../services/allApis";
import {
  parseUsageLimitForAPI,
  filterBlankDiscountCodes,
  validateDiscountCodesList,
  mapApiDiscountToStepDiscount,
  buildDiscountValidityInstants,
} from "../../../utils/eventUtil";
import {
  mapApiDateTimeToFormDateTime,
  eventEndInstantFromFormDateTime,
  resolveEventTimezone,
} from "../../../utils/datetimeUtil";

const formatTimeObject = (timeValue) => {
  if (typeof timeValue === "string") {
    return timeValue;
  }
  if (typeof timeValue === "object" && timeValue !== null) {
    const hour = String(timeValue.hour).padStart(2, "0");
    const minute = String(timeValue.minute).padStart(2, "0");
    const second = String(timeValue.second || 0).padStart(2, "0");
    return `${hour}:${minute}:${second}`;
  }
  return "00:00:00";
};

const DiscountSection = ({ onCommitSuccess = () => {} }) => {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState({ discountCodes: [], dateTime: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDiscountCodes, setIsSavingDiscountCodes] = useState(false);
  const [error, setError] = useState(null);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [discountsResponse, eventResponse] = await Promise.all([
        GetEventDiscountCodesAPI(eventId),
        GetEventAPI(eventId),
      ]);

      const event = eventResponse?.data || {};
      const dateTime = mapApiDateTimeToFormDateTime(
        event.dateTime || {
          startDate: event.startDate || "",
          startTime: formatTimeObject(event.startTime),
          endDate: event.endDate || "",
          endTime: formatTimeObject(event.endTime),
          timezone: event.timezone || event.timeZone,
        },
        {}
      );
      const eventTimezone = resolveEventTimezone(dateTime.timezone);
      const discountData = discountsResponse?.data?.discountCodes || discountsResponse?.data || [];
      const mappedDiscountCodes = Array.isArray(discountData)
        ? discountData
            .filter((d) => d?.isDeleted !== true)
            .map((discount) => mapApiDiscountToStepDiscount(discount, eventTimezone))
        : [];

      setEventData({
        ...event,
        dateTime,
        discountCodes: mappedDiscountCodes,
      });
    } catch (err) {
      console.error("Failed to fetch discount section data:", err);
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

  const handleInputChange = (value, fieldName) => {
    if (fieldName !== "discountCodes") return;
    setEventData((prev) => ({ ...prev, discountCodes: value || [] }));
  };

  const validateDiscountCodes = (codesToCheck) =>
    validateDiscountCodesList(codesToCheck);

  const onDiscountCodesCommit = async (codesOverride = null) => {
    const codesToSave = filterBlankDiscountCodes(
      codesOverride ?? eventData.discountCodes ?? []
    );
    if (!validateDiscountCodes(codesToSave)) {
      setError("Please complete valid coupon details before saving.");
      return false;
    }

    try {
      setError(null);
      setIsSavingDiscountCodes(true);
      const existingResponse = await GetEventDiscountCodesAPI(eventId);
      const existingData =
        existingResponse?.data?.discountCodes || existingResponse?.data || [];
      const existingCodes = Array.isArray(existingData) ? existingData : [];

      const fallbackValidFrom = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      const fallbackValidUntil = eventEndInstantFromFormDateTime(eventData.dateTime);
      const eventTimezone = resolveEventTimezone(eventData.dateTime?.timezone);
      const activePayloadIds = new Set(
        codesToSave
          .map((code) => parseInt(code.id, 10))
          .filter((id) => Number.isFinite(id))
      );
      const deletedCodesPayload = existingCodes
        .filter((code) => {
          const codeId = parseInt(code?.id, 10);
          if (!Number.isFinite(codeId)) return false;
          if (code?.isDeleted === true) return false;
          return !activePayloadIds.has(codeId);
        })
        .map((code) => ({
          id: parseInt(code.id, 10),
          code: code.code || "",
          type: code.type === "percentage" ? "percentage" : "fixed",
          value: parseFloat(code.value) || 0,
          validFrom: code.validFrom || fallbackValidFrom,
          validUntil: code.validUntil || fallbackValidUntil,
          usageLimit: parseUsageLimitForAPI(code.usageLimit),
          isActive: code.isActive !== false,
          isDeleted: true,
          ticketsApplicable: (code.ticketsApplicable || [])
            .map((id) => parseInt(id, 10))
            .filter((id) => Number.isFinite(id)),
        }));

      const payload = {
        discountCodes: [
          ...codesToSave.map((code) => {
            const { validFrom, validUntil } = buildDiscountValidityInstants(
              code,
              eventTimezone,
              eventData.dateTime
            );
            return {
              id: code.id || null,
              code: code.code,
              type: code.type,
              value: parseFloat(code.value),
              validFrom,
              validUntil,
              usageLimit: parseUsageLimitForAPI(code.usageLimit),
              isActive: code.isActive !== false,
              isDeleted: code.isDeleted === true,
              ticketsApplicable: (code.ticketsApplicable || [])
                .map((id) => parseInt(id, 10))
                .filter((id) => Number.isFinite(id)),
            };
          }),
          ...deletedCodesPayload,
        ],
      };

      await UpdateEventDiscountCodesAPI(eventId, payload);
      const savedResponse = await GetEventDiscountCodesAPI(eventId);
      const savedData = savedResponse?.data?.discountCodes || savedResponse?.data || [];
      const mappedSavedCodes = Array.isArray(savedData)
        ? savedData
            .filter((d) => d?.isDeleted !== true)
            .map((discount) => mapApiDiscountToStepDiscount(discount, eventTimezone))
        : codesToSave;

      setEventData((prev) => ({ ...prev, discountCodes: mappedSavedCodes }));
      onCommitSuccess();
      return mappedSavedCodes;
    } catch (err) {
      console.error("Failed to save discount codes:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while updating the discount codes."
      );
      return false;
    } finally {
      setIsSavingDiscountCodes(false);
    }
  };

  const handleSaveDiscountsClick = async () => {
    const ok = await onDiscountCodesCommit();
    if (ok) {
      toast.success("Coupon codes saved successfully.");
    }
  };

  const canSaveDiscountCodes = validateDiscountCodes(eventData.discountCodes);

  return (
    <div className={styles.discountSectionContainer}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <DiscountCodesStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            onDiscountCodesCommit={onDiscountCodesCommit}
            isSavingDiscountCodes={isSavingDiscountCodes}
            isValid={validateDiscountCodes(eventData.discountCodes)}
            stepStatus={{ visited: true }}
            fetchAvailableTickets={() => GetEventTicketStructuresAPI(eventId)}
          />
          <div className={styles.saveActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSaveDiscountsClick}
              disabled={isSavingDiscountCodes || !canSaveDiscountCodes}
            >
              {isSavingDiscountCodes ? "Saving…" : "Save changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DiscountSection;
