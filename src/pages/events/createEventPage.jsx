import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { LoginAPI } from "../../services/allApis";
import EventHeaderNav from "./components/eventHeaderNav";
import EventCreationSidebar from "./components/eventCreationSidebar";
import BasicInfoStep from "./steps/basicInfoStep";
import LocationStep from "./steps/locationStep";
import DateTimeStep from "./steps/dateTimeStep";
import DescriptionStep from "./steps/descriptionStep";
import ArtStep from "./steps/artStep";
import TicketsStep from "./steps/ticketsStep";
import DiscountCodesStep from "./steps/discountCodesStep";
import PublishStep from "./steps/publishStep";
import LoadingSpinner from "../../components/common/loadingSpinner/loadingSpinner";
import {
  CreateEventAPI,
  UpdateEventLocationAPI,
  UpdateEventDateTimeAPI,
  UpdateEventDescriptionAPI,
  GetEventAPI,
  UploadEventBannerAPI,
  CreateTicketStructureAPI,
  UpdateTicketStructureAPI,
  DeleteTicketStructureAPI,
  UpdateEventTicketsAPI,
  UpdateEventDiscountCodesAPI,
  GetEventDiscountCodesAPI,
  PublishEventAPI,
  GetEventStatusAPI,
  GetEventTicketStructuresAPI,
} from "../../services/allApis";
import styles from "./createEventPage.module.scss";
import { getUserData, setUserData } from "../../utils/authUtil";
import {
  saveEventData,
  getEventData,
  clearEventData,
  prepareLocationDataForAPI,
  prepareDateTimeDataForAPI,
  prepareDescriptionDataForAPI,
  prepareArtDataForAPI,
  prepareTicketsDataForAPI,
  preparePublishEventDataForAPI,
} from "../../utils/eventUtil";

/**
 * CreateEventPage component for the multi-step event creation process
 * Manages the overall state of the event creation flow and renders the appropriate step
 */
const CreateEventPage = () => {
  const navigate = useNavigate();
  const { eventId, step } = useParams();

  // Local state for this page's creation sidebar visibility
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  // Loading state
  const [isLoading, setIsLoading] = useState({
    saveEvent: false,
    saveTickets: false,
    saveDiscountCodes: false,
    fetchEvent: false,
    publishEvent: false,
  });

  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Success message state
  const [successMessage, setSuccessMessage] = useState(null);

  // Event data state
  const [eventData, setEventData] = useState({
    // Basic Info (Step 1)
    name: "",
    eventType: "public",
    showHostProfile: true,
    organizationId: null,
    createdBy: null,
    // category: "",
    // searchTags: [],

    // Location (Step 2)
    location: {
      isToBeAnnounced: false,
      isPrivateLocation: false,
      googleMapLink: "",
      venue: "",
      street: "",
      streetNumber: "",
      city: "",
      postalCode: "",
      state: "",
      country: "",
      additionalInfo: "",
      latitude: "",
      longitude: "",
    },

    // Date/Time (Step 3)
    dateTime: {
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    },

    // Description (Step 4)
    description: "",

    // Art (Step 5)
    art: {
      thumbnailFile: null,
      thumbnailUrl: null,
      thumbnailName: null,
      bannerFile: null,
      bannerUrl: null,
      bannerName: null,
    },

    // Tickets (Step 6)
    tickets: [],

    // Discount Codes (Step 7)
    discountCodes: [],

    // Publish (Step 8)
    publishStatus: "draft",
    publishedAt: null,

    // Additional organizer info for publish preview
    organizerName: "City Music Festival Ltd.",
    organizerMeta: "23 Events Conducted",
  });

  // Track completion status for each step
  const [stepStatus, setStepStatus] = useState({
    basicInfo: { completed: false, valid: false, visited: false },
    location: { completed: false, valid: false, visited: false },
    dateTime: { completed: false, valid: false, visited: false },
    description: { completed: false, valid: false, visited: false },
    art: { completed: false, valid: false, visited: false },
    tickets: { completed: false, valid: false, visited: false },
    discountCodes: { completed: false, valid: false, visited: false },
    publish: { completed: false, valid: false, visited: false },
  });

  const areAllPreviousStepsCompleted = () => {
    return (
      stepStatus.basicInfo.completed &&
      stepStatus.location.completed &&
      stepStatus.dateTime.completed &&
      stepStatus.description.completed &&
      stepStatus.art.completed &&
      stepStatus.tickets.completed &&
      stepStatus.discountCodes.completed 
    );
  };

  // Current step state (default to 1 if not specified)
  const [currentStep, setCurrentStep] = useState(1);

  // Error state
  const [error, setError] = useState(null);

  // Constants for file validations
  const supportedImageTypes = [".jpg", ".jpeg", ".png", ".webp"];
  const maxFileSizes = {
    thumbnail: 100,
    banner: 100,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setUserLoading(true);
      try {
        const storedUserData = getUserData();

        if (storedUserData) {
          console.log("User data from localStorage:", storedUserData);
          setCurrentUser(storedUserData);
        } else {
          const token = Cookies.get("token");
          if (token) {
            const response = await LoginAPI(token);
            console.log("User data from API:", response.data);
            setCurrentUser(response.data);

            const userData = {
              id: response.data.id || response.data.userId,
              organizationId: response.data.organizationId,
              name:
                response.data.name ||
                response.data.firstName + " " + response.data.lastName,
              email: response.data.email,
              role: response.data.role,
            };

            setUserData(userData);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const organizationId =
        currentUser.organizationId ||
        currentUser.organization?.id ||
        currentUser.profile?.organizationId;

      const userId =
        currentUser.id || currentUser.userId || currentUser.user_id;

      console.log("Setting organization data from user:", {
        organizationId: organizationId,
        createdBy: userId,
      });

      if (organizationId || userId) {
        setEventData((prevData) => ({
          ...prevData,
          ...(organizationId !== undefined && { organizationId }),
          ...(userId !== undefined && { createdBy: userId }),
        }));
      } else {
        console.warn(
          "Could not find organizationId or userId in the user data"
        );
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const storedEventData = getEventData();
    if (storedEventData && !eventId) {
      setEventData((prevData) => ({
        ...prevData,
        ...storedEventData,
      }));

      updateStepStatusFromData(storedEventData);

      if (storedEventData.eventId) {
        navigate(`/events/create/${storedEventData.eventId}/${currentStep}`);
      }
    }
  }, []);

  useEffect(() => {
    const fetchEventStatus = async () => {
      if (eventId) {
        try {
          const response = await GetEventStatusAPI(eventId);

          if (response.data) {
            const step8Completed = response.data.step8Completed || false;
            const localTicketsCompleted =
              Array.isArray(eventData.tickets) && eventData.tickets.length > 0;

            setStepStatus((prevStatus) => ({
              ...prevStatus,
              basicInfo: {
                ...prevStatus.basicInfo,
                completed: Boolean(
                  prevStatus.basicInfo.completed || response.data.step1Completed
                ),
              },
              location: {
                ...prevStatus.location,
                completed: Boolean(
                  prevStatus.location.completed || response.data.step2Completed
                ),
              },
              dateTime: {
                ...prevStatus.dateTime,
                completed: Boolean(
                  prevStatus.dateTime.completed || response.data.step3Completed
                ),
              },
              description: {
                ...prevStatus.description,
                completed: Boolean(
                  prevStatus.description.completed || response.data.step4Completed
                ),
              },
              art: {
                ...prevStatus.art,
                completed: Boolean(
                  prevStatus.art.completed || response.data.step5Completed
                ),
              },
              tickets: {
                ...prevStatus.tickets,
                completed: Boolean(
                  prevStatus.tickets.completed ||
                    response.data.step6Completed ||
                    localTicketsCompleted
                ),
              },
              discountCodes: {
                ...prevStatus.discountCodes,
                completed: Boolean(
                  prevStatus.discountCodes.completed ||
                    response.data.step7Completed
                ),
              },
              publish: {
                ...prevStatus.publish,
                completed: Boolean(prevStatus.publish.completed || step8Completed),
                visited:
                  prevStatus.publish.visited ||
                  response.data.step8Viewed ||
                  step8Completed,
              },
            }));
          }
        } catch (error) {
          console.error("Error fetching event status:", error);
        } finally {
        }
      }
    };

    fetchEventStatus();
  }, [eventId, currentStep, eventData.tickets]);

  useEffect(() => {
    if (step) {
      const stepNumber = parseInt(step);
      if (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= 8) {
        if (stepNumber === 8 && !areAllPreviousStepsCompleted()) {
          let firstIncompleteStep = 1;
          if (!stepStatus.basicInfo.completed) firstIncompleteStep = 1;
          else if (!stepStatus.location.completed) firstIncompleteStep = 2;
          else if (!stepStatus.dateTime.completed) firstIncompleteStep = 3;
          else if (!stepStatus.description.completed) firstIncompleteStep = 4;
          else if (!stepStatus.art.completed) firstIncompleteStep = 5;
          else if (!stepStatus.tickets.completed) firstIncompleteStep = 6;
          else if (!stepStatus.discountCodes.completed) firstIncompleteStep = 7;

          alert("Please complete all previous steps before publishing.");

          navigate(`/events/create/${eventId}/${firstIncompleteStep}`);
          setCurrentStep(firstIncompleteStep);
          return;
        }

        setCurrentStep(stepNumber);

        const stepKey = getStepKeyByNumber(stepNumber);
        setStepStatus((prevStatus) => ({
          ...prevStatus,
          [stepKey]: {
            ...prevStatus[stepKey],
            visited: true,
          },
        }));
      } else {
        setCurrentStep(1);
      }
    } else {
      setCurrentStep(1);
    }
  }, [step, stepStatus, eventId, navigate]);

  useEffect(() => {
    const fetchEventData = async () => {
      if (eventId) {
        try {
          setIsLoading((prev) => ({ ...prev, fetchEvent: true }));
          const response = await GetEventAPI(eventId);

          setEventData((prevData) => ({
            ...prevData,
            ...response.data,
            eventType: response.data.private ? "private" : "public",
          }));

          updateStepStatusFromData(response.data);
        } catch (error) {
          console.error("Error fetching event data:", error);
          setError("Failed to load event data. Please try again.");
        } finally {
          setIsLoading((prev) => ({ ...prev, fetchEvent: false }));
        }
      }
    };

    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    const handlePageRefresh = () => {
      const isPageRefresh = !sessionStorage.getItem("eventCreationInProgress");

      if (isPageRefresh) {
        if (!eventId) {
          clearEventData();
          console.log("Starting fresh event creation - cleared old data");
        }
        sessionStorage.setItem("eventCreationInProgress", "true");
      }
    };

    handlePageRefresh();

    return () => {
      if (window.location.pathname.indexOf("/events/create") === -1) {
        sessionStorage.removeItem("eventCreationInProgress");
      }
    };
  }, [eventId]);

  const updateStepStatusFromData = (data) => {
    const newStepStatus = { ...stepStatus };

    if (data.name) {
      newStepStatus.basicInfo = { completed: true, valid: true, visited: true };
    }

    if (data.location) {
      const locationComplete =
        data.location.isToBeAnnounced ||
        (data.location.venue &&
          data.location.street &&
          data.location.city &&
          data.location.state);

      if (locationComplete) {
        newStepStatus.location = {
          completed: true,
          valid: true,
          visited: true,
        };
      }
    }

    if (data.dateTime) {
      const dateTimeComplete =
        data.dateTime.startDate &&
        data.dateTime.startTime &&
        data.dateTime.endDate &&
        data.dateTime.endTime;

      if (dateTimeComplete) {
        newStepStatus.dateTime = {
          completed: true,
          valid: true,
          visited: true,
        };
      }
    }

    if (data.description) {
      newStepStatus.description = {
        completed: true,
        valid: true,
        visited: true,
      };
    }

    if (data.art) {
      if (data.art.thumbnailFile || data.art.bannerFile) {
        newStepStatus.art = { completed: true, valid: true, visited: true };
      }
    }

    if (data.tickets && data.tickets.length > 0) {
      newStepStatus.tickets = { completed: true, valid: true, visited: true };
    }

    if (data.discountCodes && data.discountCodes.length > 0) {
      newStepStatus.discountCodes = {
        completed: true,
        valid: true,
        visited: true,
      };
    }

    setStepStatus(newStepStatus);
  };

  const handleInputChange = (e, fieldName = null) => {
    const field = fieldName || e.target?.name;
    const value =
      e.target?.type === "checkbox" ? e.target.checked : e.target?.value ?? e;

    if (
      field === "location" ||
      field === "dateTime" ||
      field === "art" ||
      field === "tickets" ||
      field === "discountCodes"
    ) {
      setEventData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
      return;
    }

    if (
      field === "locationValid" ||
      field === "dateTimeValid" ||
      field === "descriptionValid" ||
      field === "artValid" ||
      field === "ticketsValid" ||
      field === "discountCodesValid"
    ) {
      const stepName = field.replace("Valid", "");
      setStepStatus((prevStatus) => ({
        ...prevStatus,
        [stepName]: {
          ...prevStatus[stepName],
          valid: value,
        },
      }));
      return;
    }

    setEventData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleStepStatusUpdate = (updatedStepStatus) => {
    setStepStatus(updatedStepStatus);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return validateBasicInfo();
      case 2:
        return validateLocation();
      case 3:
        return validateDateTime();
      case 4:
        return validateDescription();
      case 5:
        return validateArt();
      case 6:
        return validateTickets();
      case 7:
        return validateDiscountCodes();
      case 8:
        return validatePublish();
      default:
        return false;
    }
  };

  const validateBasicInfo = () => {
    return eventData.name.trim() !== "";
  };

  const validateLocation = () => {
    if (eventData.location?.isToBeAnnounced) {
      return true;
    }
    const location = eventData.location || {};
    if (
      !location.venue ||
      !location.street ||
      !location.city ||
      !location.state
    ) {
      return false;
    }
    return true;
  };

  const validateDateTime = () => {
    const dateTime = eventData.dateTime || {};
    if (
      !dateTime.startDate ||
      !dateTime.startTime ||
      !dateTime.endDate ||
      !dateTime.endTime
    ) {
      return false;
    }
    const startDateTime = new Date(
      `${dateTime.startDate}T${dateTime.startTime}`
    );
    const endDateTime = new Date(`${dateTime.endDate}T${dateTime.endTime}`);
    if (endDateTime <= startDateTime) {
      return false;
    }
    return true;
  };

  const validateDescription = () => {
    return eventData.description?.trim() !== "";
  };

  const validateArt = () => {
    const artData = eventData.art || {};
    const isFileValid = (file, supportedTypes, maxSizeMB) => {
      if (!file) return true;
      if (!file.name) {
        console.warn("File object does not have a name property:", file);
        return false;
      }
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      if (!supportedTypes.includes(fileExtension)) {
        return false;
      }
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        return false;
      }
      return true;
    };
    const hasThumbnailError =
      artData.thumbnailFile &&
      !isFileValid(
        artData.thumbnailFile,
        supportedImageTypes,
        maxFileSizes.thumbnail
      );
    const hasBannerError =
      artData.bannerFile &&
      !isFileValid(
        artData.bannerFile,
        supportedImageTypes,
        maxFileSizes.banner
      );
    return !hasThumbnailError && !hasBannerError;
  };

  const validateTickets = () => {
    if (!eventData.tickets || eventData.tickets.length === 0) {
      console.error("Validation Failed: No tickets have been added.");
      return false;
    }
    const invalidTickets = eventData.tickets.filter((ticket) => {
      if (!ticket.name || ticket.name.trim() === "") {
        return true;
      }
      if (ticket.price === null || ticket.price === '' || isNaN(ticket.price) || parseFloat(ticket.price) < 0) {
        return true;
      }
      const isUnlimited = ticket.quantity === "No Limit";
      if (!isUnlimited) {
        if (ticket.quantity === null || ticket.quantity === '' || isNaN(ticket.quantity) || !Number.isInteger(Number(ticket.quantity)) || parseInt(ticket.quantity, 10) <= 0) {
          return true;
        }
      }
      if (ticket.maxPurchaseAmount && (isNaN(ticket.maxPurchaseAmount) || !Number.isInteger(Number(ticket.maxPurchaseAmount)) || parseInt(ticket.maxPurchaseAmount, 10) <= 0)) {
          return true;
      }
      return false;
    });
    const isValid = invalidTickets.length === 0;
    if (!isValid) {
        console.error("Validation Failed: One or more tickets have invalid data.");
    }
    return isValid;
  };

  // src/pages/createEventPage.jsx

// src/pages/createEventPage.jsx

// src/pages/createEventPage.jsx

const validateDiscountCodes = () => {
  if (!eventData.discountCodes || eventData.discountCodes.length === 0) {
    return true;
  }

  console.log("--- Running Discount Code Validation ---");

  const invalidDiscountCodes = eventData.discountCodes.filter((code, index) => {
    console.log(`[${index}] Validating code object:`, code);

    if (!code.code || code.code.trim() === "") {
      console.log(`[${index}] FAILED: Code name is missing.`);
      return true;
    }
    if (!code.type || (code.type !== 'fixed' && code.type !== 'percentage')) {
      console.log(`[${index}] FAILED: Type is invalid.`);
      return true;
    }
    if (code.value === null || code.value === '' || isNaN(parseFloat(code.value)) || parseFloat(code.value) < 0) {
      console.log(`[${index}] FAILED: Value is invalid.`);
      return true;
    }
    if (code.usageLimit && (isNaN(parseInt(code.usageLimit, 10)) || parseInt(code.usageLimit, 10) < 0)) {
      console.log(`[${index}] FAILED: Usage Limit is invalid.`);
      return true;
    }

    console.log(`[${index}] PASSED: All checks for this code are valid.`);
    return false;
  });

  const isStepValid = invalidDiscountCodes.length === 0;
  console.log(`--- Validation Result: ${isStepValid ? 'VALID' : 'INVALID'} ---`);

  return isStepValid;
};

  const validatePublish = () => {
    if (!eventData.name) {
      return false;
    }
    if (!eventData.location.isToBeAnnounced &&
      (!eventData.location.venue || !eventData.location.city || !eventData.location.country)) {
      return false;
    }
    if (!eventData.dateTime.startDate || !eventData.dateTime.startTime ||
      !eventData.dateTime.endDate || !eventData.dateTime.endTime) {
      return false;
    }
    if (!eventData.description) {
      return false;
    }
    if (!eventData.tickets || eventData.tickets.length === 0) {
      return false;
    }
    return true;
  };

  const formatDateTimeForAPI = (dateString, timeString) => {
    if (!dateString || !timeString) return null;
    const paddedTime = timeString.includes(":") ? timeString : `${timeString}:00`;
    const dateTime = new Date(`${dateString} ${paddedTime}`);
    if (Number.isNaN(dateTime.getTime())) return null;
    return dateTime.toISOString();
  };

  const mapStepTicketToApiPayload = (ticket) => {
    const fallbackListingStartTime = new Date(
      Date.now() - 12 * 60 * 60 * 1000
    ).toISOString();
    const eventEndTime = formatDateTimeForAPI(
      eventData.dateTime?.endDate,
      eventData.dateTime?.endTime
    );

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

  const saveTicketsStepToBackend = async (ticketsOverride = null) => {
    if (!eventId) {
      setError("Please create the event first before saving tickets.");
      return false;
    }

    const ticketsToSave = ticketsOverride || eventData.tickets;
    if (!ticketsToSave || ticketsToSave.length === 0) {
      setError("Please add at least one ticket before saving.");
      return false;
    }

    const invalidTickets = ticketsToSave.filter((ticket) => {
      if (!ticket.name || ticket.name.trim() === "") return true;
      if (ticket.price === null || ticket.price === "" || Number.isNaN(Number(ticket.price)) || parseFloat(ticket.price) < 0) return true;
      if (ticket.quantity === "No Limit") return false;
      if (ticket.quantity === null || ticket.quantity === "" || Number.isNaN(Number(ticket.quantity)) || !Number.isInteger(Number(ticket.quantity)) || parseInt(ticket.quantity, 10) <= 0) return true;
      if (ticket.maxPurchaseAmount && (Number.isNaN(Number(ticket.maxPurchaseAmount)) || !Number.isInteger(Number(ticket.maxPurchaseAmount)) || parseInt(ticket.maxPurchaseAmount, 10) <= 0)) return true;
      return false;
    });
    if (invalidTickets.length > 0) {
      setError("Please complete valid ticket details before saving.");
      return false;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setIsLoading((prev) => ({ ...prev, saveTickets: true }));

      // Sync deletions first: if a previously saved ticket is missing from current
      // step rows, delete it in backend so it doesn't reappear on refresh.
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

      // Upsert each row so newly added rows receive backend IDs immediately.
      for (const ticket of ticketsToSave) {
        const payload = mapStepTicketToApiPayload(ticket);
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
      const currentEventData = getEventData();
      saveEventData({
        ...currentEventData,
        tickets: savedTickets,
      });
      setSuccessMessage("Tickets saved successfully.");
      return savedTickets;
    } catch (error) {
      console.error("Error saving tickets:", error);
      setError(
        error.response?.data?.message ||
          "Failed to save tickets. Please try again."
      );
      return false;
    } finally {
      setIsLoading((prev) => ({ ...prev, saveTickets: false }));
    }
  };

  const mapApiDiscountToStepDiscount = (code = {}) => {
    const toDateAndTime = (iso) => {
      if (!iso) return { date: "", time: "" };
      const dt = new Date(iso);
      if (Number.isNaN(dt.getTime())) return { date: "", time: "" };
      return {
        date: dt.toISOString().split("T")[0],
        time: dt.toISOString().split("T")[1].slice(0, 5),
      };
    };

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

  const saveDiscountCodesStepToBackend = async (codesOverride = null) => {
    if (!eventId) {
      setError("Please create the event first before saving discount codes.");
      return false;
    }

    const codesToSave = codesOverride || eventData.discountCodes;
    if (!codesToSave) return false;

    const invalidCodes = codesToSave.filter((code) => {
      if (!code.code || code.code.trim() === "") return true;
      if (!code.type || (code.type !== "fixed" && code.type !== "percentage")) return true;
      if (code.value === null || code.value === "" || Number.isNaN(parseFloat(code.value)) || parseFloat(code.value) < 0) return true;
      if (code.usageLimit && (Number.isNaN(parseInt(code.usageLimit, 10)) || parseInt(code.usageLimit, 10) < 0)) return true;
      return false;
    });
    if (invalidCodes.length > 0) {
      setError("Please complete valid coupon details before saving.");
      return false;
    }

    const formatToISO = (date, time) => {
      if (!date || !time) return null;
      const paddedTime = time.includes(":") ? time : `${time}:00`;
      return new Date(`${date}T${paddedTime}`).toISOString();
    };

    try {
      setError(null);
      setSuccessMessage(null);
      setIsLoading((prev) => ({ ...prev, saveDiscountCodes: true }));
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
      const currentEventData = getEventData();
      saveEventData({
        ...currentEventData,
        discountCodes: mappedSavedCodes,
      });
      setSuccessMessage("Discount codes saved successfully.");
      return mappedSavedCodes;
    } catch (error) {
      console.error("Error saving discount codes:", error);
      setError(
        error.response?.data?.message ||
          "Failed to save discount codes. Please try again."
      );
      return false;
    } finally {
      setIsLoading((prev) => ({ ...prev, saveDiscountCodes: false }));
    }
  };

  const getStepKeyByNumber = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return "basicInfo";
      case 2:
        return "location";
      case 3:
        return "dateTime";
      case 4:
        return "description";
      case 5:
        return "art";
      case 6:
        return "tickets";
      case 7:
        return "discountCodes";
      case 8:
        return "publish";
      default:
        return "basicInfo";
    }
  };

  const handlePublishEvent = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, publishEvent: true }));
      const publishData = preparePublishEventDataForAPI(eventId);
      console.log("Publishing event with data:", publishData);
      const response = await PublishEventAPI(eventId, publishData);
      console.log("Event published successfully:", response);
      const currentEventData = getEventData();
      saveEventData({
        ...currentEventData,
        publishStatus: "published",
        publishedAt: new Date().toISOString(),
      });
      setSuccessMessage("Event published successfully!");
      clearEventData();
      setTimeout(() => {
        navigate("/events");
      }, 1500);
    } catch (error) {
      console.error("Error publishing event:", error);
      setError(
        error.response?.data?.message ||
        "Failed to publish event. Please try again."
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, publishEvent: false }));
    }
  };

  const handleNextStep = async () => {
    const isValid = validateCurrentStep();
    if (currentStep === 1 && !isValid) {
      alert("Please complete the Basic Info step first to create your event.");
      return;
    }
    if (currentStep === 8) {
      await handlePublishEvent();
      return;
    }
    if (isValid) {
      setIsLoading((prev) => ({ ...prev, saveEvent: true }));
    }
    try {
      let updatedEventId = eventId;
      if (currentStep === 1 && !eventId) {
        if (isValid) {
          try {
            const userData = getUserData();
            const basicInfoData = {
              name: eventData.name,
              organizationId:
                eventData.organizationId || userData?.organizationId || 1,
              createdBy: eventData.createdBy || userData?.userId || 1,
              private: eventData.eventType === "private",
            };
            console.log("Creating new event with data:", basicInfoData);
            const response = await CreateEventAPI(basicInfoData);
            console.log("Event creation successful:", response);
            saveEventData(response.data);
            console.log("Event data saved to localStorage:", response.data);
            updatedEventId = response.data.eventId;
            const stepKey = getStepKeyByNumber(currentStep);
            setStepStatus((prevStatus) => ({
              ...prevStatus,
              [stepKey]: {
                completed: true,
                valid: true,
                visited: true,
              },
            }));
            navigate(`/events/create/${updatedEventId}/${currentStep + 1}`);
            setCurrentStep((prevStep) => prevStep + 1);
            return;
          } catch (error) {
            console.error(
              "API Error Details:",
              error.response?.data || error.message
            );
            alert("Failed to create event. Please try again.");
            setIsLoading((prev) => ({ ...prev, saveEvent: false }));
            return;
          }
        } else {
          alert(
            "Please complete the Basic Info step first to create your event."
          );
          return;
        }
      }

      if (eventId) {
        if (isValid) {
          if (currentStep === 2) {
            try {
              const locationData = prepareLocationDataForAPI(
                eventData.location
              );
              const response = await UpdateEventLocationAPI(
                eventId,
                locationData
              );
              console.log("Location update successful:", response);
              const currentEventData = getEventData();
              saveEventData({
                ...currentEventData,
                location: eventData.location,
              });
            } catch (error) {
              console.error("Error updating location:", error);
              setError(
                error.response?.data?.message ||
                "Failed to update location. Please try again."
              );
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          } else if (currentStep === 3) {
            try {
              const isPrivate = eventData.eventType === "private";
              const dateTimeData = prepareDateTimeDataForAPI(
                eventData.dateTime,
                eventId,
                isPrivate
              );
              console.log("Submitting date/time data:", dateTimeData);
              const response = await UpdateEventDateTimeAPI(
                eventId,
                dateTimeData
              );
              console.log("Date/time update successful:", response);
              const currentEventData = getEventData();
              saveEventData({
                ...currentEventData,
                dateTime: eventData.dateTime,
              });
            } catch (error) {
              console.error("Error updating date/time:", error);
              setError(
                error.response?.data?.message ||
                "Failed to update date/time information. Please try again."
              );
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          } else if (currentStep === 4) {
            try {
              const isPrivate = eventData.eventType === "private";
              const descriptionData = prepareDescriptionDataForAPI(
                eventData.description,
                eventId,
                isPrivate
              );
              console.log("Submitting description data:", descriptionData);
              const response = await UpdateEventDescriptionAPI(
                eventId,
                descriptionData
              );
              console.log("Description update successful:", response);
              const currentEventData = getEventData();
              saveEventData({
                ...currentEventData,
                description: response.data.description,
                shortDescription: response.data.shortDescription,
              });
            } catch (error) {
              console.error("Error updating description:", error);
              setError(
                error.response?.data?.message ||
                "Failed to update description. Please try again."
              );
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          } else if (currentStep === 5) {
            try {
              const hasThumbnail = !!eventData.art?.thumbnailFile;
              const hasBanner = !!eventData.art?.bannerFile;
              console.log("Art data to be uploaded:", {
                hasThumbnail,
                hasBanner,
                thumbnailName: eventData.art?.thumbnailName,
                bannerName: eventData.art?.bannerName,
              });
              if (hasThumbnail || hasBanner) {
                const metadata = prepareArtDataForAPI(eventData.art, eventId, "banner");
                const formData = new FormData();
                formData.append("id", metadata.id);
                formData.append("updatedBy", metadata.updatedBy);
                if (hasBanner) {
                  formData.append("bannerFile", eventData.art.bannerFile);
                }
                if (hasThumbnail) {
                  formData.append("thumbnailFile", eventData.art.thumbnailFile);
                }
                for (let [key, val] of formData.entries()) {
                  console.log(`${key}:`, val instanceof File ? val.name : val);
                }
                const response = await UploadEventBannerAPI(eventId, formData);
                console.log("Art upload successful:", response);
                const currentEventData = getEventData();
                saveEventData({
                  ...currentEventData,
                  art: {
                    ...currentEventData.art,
                    ...eventData.art,
                  },
                });
              } else {
                console.log("No art files to upload, skipping API call");
              }
            } catch (error) {
              console.error("Error updating art information:", error);
              setError(
                error.response?.data?.message ||
                "Failed to update image information. Please try again."
              );
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          } else if (currentStep === 6) {
            const didSave = await saveTicketsStepToBackend();
            if (!didSave) {
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
            // Keep backend step-status pipeline in sync for sidebar indicators.
            const ticketsData = prepareTicketsDataForAPI(
              eventData.tickets,
              eventId
            );
            await UpdateEventTicketsAPI(eventId, ticketsData);
          } else if (currentStep === 7) {
            const didSave = await saveDiscountCodesStepToBackend();
            if (!didSave) {
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          }
          const stepKey = getStepKeyByNumber(currentStep);
          setStepStatus((prevStatus) => ({
            ...prevStatus,
            [stepKey]: {
              completed: true,
              valid: true,
              visited: true,
            },
          }));
          try {
            const response = await GetEventStatusAPI(eventId);
            if (response.data) {
              console.log("Updated event status:", response.data);
            }
          } catch (statusError) {
            console.error("Error fetching updated event status:", statusError);
          }
        }
        navigate(`/events/create/${eventId}/${currentStep + 1}`);
        setCurrentStep((prevStep) => prevStep + 1);
      } else {
        alert(
          "Please complete the Basic Info step first to create your event."
        );
      }
    } catch (error) {
      console.error("Error in handleNextStep:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, saveEvent: false }));
    }
  };

  const getStepDataForUpdate = (step) => {
    switch (step) {
      case 1:
        return {
          name: eventData.name,
          private: eventData.eventType === "private",
          organizationId: eventData.organizationId || 0,
          createdBy: eventData.createdBy || 0,
        };
      case 2:
        return {
          location: eventData.location,
        };
      case 3:
        return {
          dateTime: eventData.dateTime,
        };
      case 4:
        return {
          description: eventData.description,
        };
      case 5:
        return {
          art: {
            thumbnailName: eventData.art?.thumbnailName,
            bannerName: eventData.art?.bannerName,
          },
        };
      case 6:
        return {
          tickets: eventData.tickets,
        };
      case 7:
        return {
          discountCodes: eventData.discountCodes,
        };
      case 8:
        return {
          publishStatus: eventData.publishStatus,
        };
      default:
        return {};
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      navigate(`/events/create/${eventId}/${prevStep}`);
      setCurrentStep(prevStep);
    }
  };

  const navigateToStep = (stepNumber) => {
    if (stepNumber === 8) {
      if (!areAllPreviousStepsCompleted()) {
        alert("Please complete all previous steps before publishing.");
        return;
      }
    }
    navigate(`/events/create/${eventId}/${stepNumber}`);
    setCurrentStep(stepNumber);
  };

  const renderCurrentStep = () => {
    if (isLoading.fetchEvent || userLoading) {
      return (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading event data...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            isValid={validateBasicInfo()}
            stepStatus={stepStatus.basicInfo}
          />
        );
      case 2:
        return (
          <LocationStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            isValid={validateLocation()}
            stepStatus={stepStatus.location}
          />
        );
      case 3:
        return (
          <DateTimeStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            isValid={validateDateTime()}
            stepStatus={stepStatus.dateTime}
          />
        );
      case 4:
        return (
          <DescriptionStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            isValid={validateDescription()}
            stepStatus={stepStatus.description}
          />
        );
      case 5:
        return (
          <ArtStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            isValid={validateArt()}
            stepStatus={stepStatus.art}
          />
        );
      case 6:
        return (
          <TicketsStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            onTicketsCommit={saveTicketsStepToBackend}
            isSavingTickets={isLoading.saveTickets}
            isValid={validateTickets()}
            stepStatus={stepStatus.tickets}
          />
        );
      case 7:
        return (
          <DiscountCodesStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            onDiscountCodesCommit={saveDiscountCodesStepToBackend}
            isSavingDiscountCodes={isLoading.saveDiscountCodes}
            isValid={validateDiscountCodes()}
            stepStatus={stepStatus.discountCodes}
            // Pass the API call to fetch tickets as a prop
            fetchAvailableTickets={() => GetEventTicketStructuresAPI(eventId)}
          />
        );
      case 8:
        return (
          <PublishStep
            eventData={eventData}
            handleInputChange={handleInputChange}
            isValid={validatePublish()}
            stepStatus={stepStatus.publish}
            isPublishing={isLoading.publishEvent}
          />
        );
      default:
        return <div>Invalid Step</div>;
    }
  };

  const getCurrentStepName = () => {
    switch (currentStep) {
      case 1:
        return "Basic Info";
      case 2:
        return "Location";
      case 3:
        return "Date & Time";
      case 4:
        return "Description";
      case 5:
        return "Thumbnail and Banner";
      case 6:
        return "Tickets";
      case 7:
        return "Discount Codes";
      case 8:
        return "Publish";
      default:
        return "Create Event";
    }
  };

  const isNextDisabled =
    !validateCurrentStep() ||
    isLoading.saveEvent ||
    isLoading.saveTickets ||
    isLoading.saveDiscountCodes;
  const canPreview = Object.values(stepStatus).some((step) => step.completed);

  return (
    <div className={styles.pageContainer}>
      <EventHeaderNav
        currentStep={getCurrentStepName()}
        eventName={eventData.name || "new event"}
        isDraft={true}
        canPreview={canPreview}
        toggleMobileSidebar={toggleMobileSidebar}
      />
      <div className={styles.content}>
        {isMobileSidebarOpen && (
          <div className={styles.sidebarOverlay} onClick={toggleMobileSidebar}></div>
        )}
        <EventCreationSidebar
          currentStep={currentStep}
          stepStatus={stepStatus}
          navigateToStep={navigateToStep}
          eventId={eventId}
          onStatusUpdate={(updatedStatus) => {
            const mergedStatus = Object.keys(updatedStatus).reduce((acc, key) => {
              const prev = stepStatus[key] || { completed: false, valid: false, visited: false };
              const incoming = updatedStatus[key] || prev;
              acc[key] = {
                ...prev,
                ...incoming,
                // Reflect completion strictly from current status source.
                completed: Boolean(incoming.completed),
              };
              return acc;
            }, {});

            const hasChanges = Object.keys(mergedStatus).some((key) => {
              const prev = stepStatus[key] || {};
              const next = mergedStatus[key] || {};
              return (
                prev.completed !== next.completed ||
                prev.valid !== next.valid ||
                prev.visited !== next.visited
              );
            });
            if (hasChanges) {
              setStepStatus(mergedStatus);
            }
          }}
          isMobileSidebarOpen={isMobileSidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <div className={styles.mainContent}>
          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
              <button
                className={styles.dismissButton}
                onClick={() => setSuccessMessage(null)}
              >
                ✕
              </button>
            </div>
          )}
          <div className={styles.stepContent}>{renderCurrentStep()}</div>
          <div className={styles.navigation}>
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={styles.backButton}
            >
              Back
            </button>
            {currentStep < 8 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className={styles.nextButton}
              >
                {isLoading.saveEvent ? "Saving..." : "Next"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isNextDisabled || isLoading.publishEvent}
                className={`${styles.nextButton} ${styles.publishButton}`}
              >
                {isLoading.publishEvent ? "Publishing..." : "Publish Event"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;