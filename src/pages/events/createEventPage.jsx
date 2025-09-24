import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
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
  UpdateEventTicketsAPI,
  UpdateEventDiscountCodesAPI,
  PublishEventAPI,
  GetEventStatusAPI,
  GetEventTicketStructuresAPI, // IMPORTED
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
  prepareDiscountCodesDataForAPI,
  preparePublishEventDataForAPI,
} from "../../utils/eventUtil";

/**
 * CreateEventPage component for the multi-step event creation process
 * Manages the overall state of the event creation flow and renders the appropriate step
 */
const CreateEventPage = () => {
  const navigate = useNavigate();
  const { eventId, step } = useParams();
  const { toggleMobileSidebar, isMobileSidebarOpen } = useOutletContext();

  // Loading state
  const [isLoading, setIsLoading] = useState({
    saveEvent: false,
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

            const apiStepStatus = {
              basicInfo: {
                ...stepStatus.basicInfo,
                completed: response.data.step1Completed || false,
              },
              location: {
                ...stepStatus.location,
                completed: response.data.step2Completed || false,
              },
              dateTime: {
                ...stepStatus.dateTime,
                completed: response.data.step3Completed || false,
              },
              description: {
                ...stepStatus.description,
                completed: response.data.step4Completed || false,
              },
              art: {
                ...stepStatus.art,
                completed: response.data.step5Completed || false,
              },
              tickets: {
                ...stepStatus.tickets,
                completed: response.data.step6Completed || false,
              },
              discountCodes: {
                ...stepStatus.discountCodes,
                completed: response.data.step7Completed || false,
              },
              publish: {
                ...stepStatus.publish,
                completed: step8Completed,
                visited: response.data.step8Viewed || step8Completed,
              },
            };

            setStepStatus(apiStepStatus);
          }
        } catch (error) {
          console.error("Error fetching event status:", error);
        } finally {
        }
      }
    };

    fetchEventStatus();
  }, [eventId, currentStep]);

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
      if (ticket.quantity === null || ticket.quantity === '' || isNaN(ticket.quantity) || !Number.isInteger(Number(ticket.quantity)) || parseInt(ticket.quantity, 10) <= 0) {
          return true;
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
            try {
              const ticketsData = prepareTicketsDataForAPI(
                eventData.tickets,
                eventId
              );
              console.log("Submitting tickets data:", ticketsData);
              const response = await UpdateEventTicketsAPI(
                eventId,
                ticketsData
              );
              console.log("Tickets update successful:", response);
              const currentEventData = getEventData();
              saveEventData({
                ...currentEventData,
                tickets: eventData.tickets,
              });
            } catch (error) {
              console.error("Error updating tickets:", error);
              setError(
                error.response?.data?.message ||
                "Failed to update ticket information. Please try again."
              );
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          } else if (currentStep === 7) {
            try {
              const discountCodesData = prepareDiscountCodesDataForAPI(
                eventData.discountCodes,
                eventId
              );
              console.log("Submitting discount codes data:", discountCodesData);
              const response = await UpdateEventDiscountCodesAPI(
                eventId,
                discountCodesData
              );
              console.log("Discount codes update successful:", response);
              const currentEventData = getEventData();
              saveEventData({
                ...currentEventData,
                discountCodes: eventData.discountCodes,
              });
            } catch (error) {
              console.error("Error updating discount codes:", error);
              setError(
                error.response?.data?.message ||
                "Failed to update discount codes information. Please try again."
              );
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
            isValid={validateTickets()}
            stepStatus={stepStatus.tickets}
          />
        );
      case 7:
        return (
          <DiscountCodesStep
            eventData={eventData}
            handleInputChange={handleInputChange}
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

  const isNextDisabled = !validateCurrentStep() || isLoading.saveEvent;
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
        <EventCreationSidebar
          currentStep={currentStep}
          stepStatus={stepStatus}
          navigateToStep={navigateToStep}
          eventId={eventId}
          onStatusUpdate={(updatedStatus) => {
            const hasChanges = Object.keys(updatedStatus).some(
              (key) =>
                updatedStatus[key].completed !== stepStatus[key].completed
            );
            if (hasChanges) {
              setStepStatus(updatedStatus);
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
      <div className={styles.footer}>© 2025 Event Tickets Platform</div>
    </div>
  );
};

export default CreateEventPage;