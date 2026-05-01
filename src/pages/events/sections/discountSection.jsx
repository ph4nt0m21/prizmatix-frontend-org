import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./discountSection.module.scss";
import DiscountCodesStep from "../steps/discountCodesStep";
import LoadingSpinner from "../../../components/common/loadingSpinner/loadingSpinner";
import {
  GetEventDiscountCodesAPI,
  UpdateEventDiscountCodesAPI,
  GetEventTicketStructuresAPI,
  GetEventAPI,
} from "../../../services/allApis";

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

const toDateAndTime = (iso) => {
  if (!iso) return { date: "", time: "" };
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return { date: "", time: "" };
  return {
    date: dt.toISOString().split("T")[0],
    time: dt.toISOString().split("T")[1].slice(0, 5),
  };
};

const formatToISO = (date, time) => {
  if (!date || !time) return null;
  const paddedTime = time.includes(":") ? time : `${time}:00`;
  return new Date(`${date}T${paddedTime}`).toISOString();
};

const mapApiDiscountToStepDiscount = (code = {}) => {
  const validFrom = toDateAndTime(code.validFrom);
  const validUntil = toDateAndTime(code.validUntil);
  return {
    id: code.id,
    code: code.code || "",
    type: code.type || "percentage",
    value: code.value ?? "",
    usageLimit: code.usageLimit ?? "",
    validFromDate: validFrom.date,
    validFromTime: validFrom.time,
    validUntilDate: validUntil.date,
    validUntilTime: validUntil.time,
    ticketsApplicable: Array.isArray(code.ticketsApplicable)
      ? code.ticketsApplicable
          .map((id) => parseInt(id, 10))
          .filter((id) => Number.isFinite(id))
      : [],
    isActive: code.isActive !== false,
    isDeleted: code.isDeleted === true,
  };
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
      const dateTime = event.dateTime || {
        startDate: event.startDate || "",
        startTime: formatTimeObject(event.startTime),
        endDate: event.endDate || "",
        endTime: formatTimeObject(event.endTime),
      };
      const discountData = discountsResponse?.data?.discountCodes || discountsResponse?.data || [];
      const mappedDiscountCodes = Array.isArray(discountData)
        ? discountData.filter((d) => d?.isDeleted !== true).map(mapApiDiscountToStepDiscount)
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

  const validateDiscountCodes = (codesToCheck) => {
    if (!codesToCheck || codesToCheck.length === 0) return true;
    const invalid = codesToCheck.filter((code) => {
      if (!code.code || code.code.trim() === "") return true;
      if (!code.type || (code.type !== "fixed" && code.type !== "percentage")) return true;
      if (code.value === null || code.value === "" || Number.isNaN(parseFloat(code.value)) || parseFloat(code.value) < 0) return true;
      if (code.usageLimit && (Number.isNaN(parseInt(code.usageLimit, 10)) || parseInt(code.usageLimit, 10) < 0)) return true;
      return false;
    });
    return invalid.length === 0;
  };

  const onDiscountCodesCommit = async (codesOverride = null) => {
    const codesToSave = codesOverride || eventData.discountCodes;
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
      const fallbackValidUntil = formatToISO(
        eventData.dateTime?.startDate,
        eventData.dateTime?.startTime
      );
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
          usageLimit: parseInt(code.usageLimit, 10) || 0,
          isActive: code.isActive !== false,
          isDeleted: true,
          ticketsApplicable: (code.ticketsApplicable || [])
            .map((id) => parseInt(id, 10))
            .filter((id) => Number.isFinite(id)),
        }));

      const payload = {
        discountCodes: [
          ...codesToSave.map((code) => ({
            id: code.id || null,
            code: code.code,
            type: code.type,
            value: parseFloat(code.value),
            validFrom:
              formatToISO(code.validFromDate, code.validFromTime) || fallbackValidFrom,
            validUntil:
              formatToISO(code.validUntilDate, code.validUntilTime) || fallbackValidUntil,
            usageLimit: parseInt(code.usageLimit, 10) || 0,
            isActive: code.isActive !== false,
            isDeleted: code.isDeleted === true,
            ticketsApplicable: (code.ticketsApplicable || [])
              .map((id) => parseInt(id, 10))
              .filter((id) => Number.isFinite(id)),
          })),
          ...deletedCodesPayload,
        ],
      };

      await UpdateEventDiscountCodesAPI(eventId, payload);
      const savedResponse = await GetEventDiscountCodesAPI(eventId);
      const savedData = savedResponse?.data?.discountCodes || savedResponse?.data || [];
      const mappedSavedCodes = Array.isArray(savedData)
        ? savedData.filter((d) => d?.isDeleted !== true).map(mapApiDiscountToStepDiscount)
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
        </>
      )}
    </div>
  );
};

export default DiscountSection;