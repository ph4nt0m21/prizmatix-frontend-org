import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { LoginAPI } from "../../services/allApis";
import Header from "../../layout/header/header";
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
    eventType: "public", // Default to public
    showHostProfile: true,
    organizationId: null, // Will be set from user context
    createdBy: null, // Will be set from user context
    category: "", // Category field
    searchTags: [], // Search tags array

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
    publishStatus: "draft", // 'draft', 'published', 'archived'
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
    // Check if all previous steps (1-7) are completed
    return (
      stepStatus.basicInfo.completed &&
      stepStatus.location.completed &&
      stepStatus.dateTime.completed &&
      stepStatus.description.completed &&
      stepStatus.art.completed &&
      stepStatus.tickets.completed
    );
  };

  // Current step state (default to 1 if not specified)
  const [currentStep, setCurrentStep] = useState(1);

  // Error state
  const [error, setError] = useState(null);

  // Constants for file validations
  const supportedImageTypes = [".jpg", ".png", ".webp"];
  const maxFileSizes = {
    thumbnail: 10, // 10MB
    banner: 10, // 10MB
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setUserLoading(true);
      try {
        // First try to get user data from localStorage
        const storedUserData = getUserData();

        if (storedUserData) {
          console.log("User data from localStorage:", storedUserData);
          setCurrentUser(storedUserData);
        } else {
          // If not in localStorage, fetch from API
          const token = Cookies.get("token");
          if (token) {
            const response = await LoginAPI(token);
            console.log("User data from API:", response.data);
            setCurrentUser(response.data);

            // Also update localStorage for future use
            const userData = {
              id: response.data.id || response.data.userId,
              organizationId: response.data.organizationId,
              name:
                response.data.name ||
                response.data.firstName + " " + response.data.lastName,
              email: response.data.email,
              role: response.data.role,
            };

            // Use the utility to store the data
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

  // Set user info when user data is loaded
  useEffect(() => {
    if (currentUser) {
      // Extract the correct fields, checking multiple possible locations
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

      // Only update if we have actual values
      if (organizationId || userId) {
        setEventData((prevData) => ({
          ...prevData,
          // Only update fields that have values
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

  // Add this function to handle fetching event data
  useEffect(() => {
    // Check for event data in localStorage on initial load
    const storedEventData = getEventData();
    if (storedEventData && !eventId) {
      setEventData((prevData) => ({
        ...prevData,
        ...storedEventData,
      }));

      // Update step status based on stored data
      updateStepStatusFromData(storedEventData);

      // Navigate to the event if ID is available
      if (storedEventData.eventId) {
        navigate(`/events/create/${storedEventData.eventId}/${currentStep}`);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch event status after successful API calls
    const fetchEventStatus = async () => {
      if (eventId) {
        try {
          const response = await GetEventStatusAPI(eventId);

          if (response.data) {
            // Create a new step status object based on API response
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
                completed: response.data.step8Completed || false,
              },
            };

            // Update step status based on API response
            setStepStatus(apiStepStatus);
          }
        } catch (error) {
          console.error("Error fetching event status:", error);
        }
      }
    };

    fetchEventStatus();
  }, [eventId, currentStep]); // Fetch status when eventId or currentStep changes

  // Parse step parameter and update current step
  useEffect(() => {
    if (step) {
      const stepNumber = parseInt(step);
      if (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= 8) {
        // Special case for step 8 (publish)
        if (stepNumber === 8 && !areAllPreviousStepsCompleted()) {
          // Redirect to the first incomplete step
          let firstIncompleteStep = 1;
          if (!stepStatus.basicInfo.completed) firstIncompleteStep = 1;
          else if (!stepStatus.location.completed) firstIncompleteStep = 2;
          else if (!stepStatus.dateTime.completed) firstIncompleteStep = 3;
          else if (!stepStatus.description.completed) firstIncompleteStep = 4;
          else if (!stepStatus.art.completed) firstIncompleteStep = 5;
          else if (!stepStatus.tickets.completed) firstIncompleteStep = 6;
          else if (!stepStatus.discountCodes.completed) firstIncompleteStep = 7;

          // Alert the user
          alert("Please complete all previous steps before publishing.");

          // Redirect to the first incomplete step
          navigate(`/events/create/${eventId}/${firstIncompleteStep}`);
          setCurrentStep(firstIncompleteStep);
          return;
        }

        setCurrentStep(stepNumber);

        // Mark the current step as visited
        const stepKey = getStepKeyByNumber(stepNumber);
        setStepStatus((prevStatus) => ({
          ...prevStatus,
          [stepKey]: {
            ...prevStatus[stepKey],
            visited: true,
          },
        }));
      } else {
        setCurrentStep(1); // Default to step 1 if invalid step parameter
      }
    } else {
      setCurrentStep(1); // Default to step 1 if no step parameter
    }
  }, [step, stepStatus]);

  // Fetch event data if eventId is provided
  useEffect(() => {
    const fetchEventData = async () => {
      if (eventId) {
        try {
          setIsLoading((prev) => ({ ...prev, fetchEvent: true }));
          const response = await GetEventAPI(eventId);

          // Update event data
          setEventData((prevData) => ({
            ...prevData,
            ...response.data,
            // Convert private boolean back to eventType string
            eventType: response.data.private ? "private" : "public",
          }));

          // Update step status based on fetched data
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
    // Run this only once when the component mounts
    const handlePageRefresh = () => {
      // Check if this is a fresh page load rather than a navigation within the app
      const isPageRefresh = !sessionStorage.getItem("eventCreationInProgress");

      if (isPageRefresh) {
        // This is a page refresh, not an in-app navigation

        // For a brand new event creation (no eventId in URL)
        if (!eventId) {
          // Clear any existing draft data to start fresh
          clearEventData();
          console.log("Starting fresh event creation - cleared old data");
        }

        // Mark that we're now in an event creation process
        sessionStorage.setItem("eventCreationInProgress", "true");
      }
    };

    handlePageRefresh();

    // Clean up on component unmount
    return () => {
      // If we're navigating away from the event creation process entirely,
      // clear the session marker
      if (window.location.pathname.indexOf("/events/create") === -1) {
        sessionStorage.removeItem("eventCreationInProgress");
      }
    };
  }, [eventId]); // Only run on initial mount and when eventId changes

  /**
   * Update step status based on event data
   * @param {Object} data - Event data
   */
  const updateStepStatusFromData = (data) => {
    // This is a simplified implementation
    const newStepStatus = { ...stepStatus };

    // Check if basic info is complete
    if (data.name) {
      newStepStatus.basicInfo = { completed: true, valid: true, visited: true };
    }

    // Check if location is complete
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

    // Check if date/time is complete
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

    // Check if description is complete
    if (data.description) {
      newStepStatus.description = {
        completed: true,
        valid: true,
        visited: true,
      };
    }

    // Check if art is complete
    if (data.art) {
      // Art step is optional, so mark as complete if visited
      if (data.art.thumbnailFile || data.art.bannerFile) {
        newStepStatus.art = { completed: true, valid: true, visited: true };
      }
    }

    // Check if tickets are complete
    if (data.tickets && data.tickets.length > 0) {
      newStepStatus.tickets = { completed: true, valid: true, visited: true };
    }

    // Check if discount codes are complete
    if (data.discountCodes && data.discountCodes.length > 0) {
      newStepStatus.discountCodes = {
        completed: true,
        valid: true,
        visited: true,
      };
    }

    setStepStatus(newStepStatus);
  };

  /**
   * Handle input changes for the current step
   * @param {Object} e - Event object or direct value object
   * @param {string} fieldName - Optional field name if not from event
   */
  const handleInputChange = (e, fieldName = null) => {
    const field = fieldName || e.target?.name;
    const value =
      e.target?.type === "checkbox" ? e.target.checked : e.target?.value ?? e;

    // Special case handlers
    if (
      field === "location" ||
      field === "dateTime" ||
      field === "art" ||
      field === "tickets" ||
      field === "discountCodes" ||
      field === "searchTags"
    ) {
      setEventData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
      return;
    }

    // Handle validation flags for steps
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

    // Standard field handling
    setEventData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleStepStatusUpdate = (updatedStepStatus) => {
    setStepStatus(updatedStepStatus);
  };

  /**
   * Validate the current step
   * @returns {boolean} Is the current step valid
   */
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return validateBasicInfo();
      case 2: // Location
        return validateLocation();
      case 3: // Date & Time
        return validateDateTime();
      case 4: // Description
        return validateDescription();
      case 5: // Art
        return validateArt();
      case 6: // Tickets
        return validateTickets();
      case 7: // Discount Codes
        return validateDiscountCodes();
      case 8: // Publish
        return validatePublish();
      default:
        return false;
    }
  };

  /**
   * Validate the Basic Info step
   * @returns {boolean} Is the Basic Info step valid
   */
  const validateBasicInfo = () => {
    // Check if name is filled and category is selected
    return eventData.name.trim() !== "" && eventData.category.trim() !== "";
  };

  /**
   * Validate the Location step
   * @returns {boolean} Is the Location step valid
   */
  const validateLocation = () => {
    // If location is to be announced, it's always valid
    if (eventData.location?.isToBeAnnounced) {
      return true;
    }

    // Check required fields
    const location = eventData.location || {};

    // These fields are required if location is not TBA
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

  /**
   * Validate the Date & Time step
   * @returns {boolean} Is the Date & Time step valid
   */
  const validateDateTime = () => {
    const dateTime = eventData.dateTime || {};

    // Check if required fields are filled
    if (
      !dateTime.startDate ||
      !dateTime.startTime ||
      !dateTime.endDate ||
      !dateTime.endTime
    ) {
      return false;
    }

    // Check if end date/time is after start date/time
    const startDateTime = new Date(
      `${dateTime.startDate}T${dateTime.startTime}`
    );
    const endDateTime = new Date(`${dateTime.endDate}T${dateTime.endTime}`);

    if (endDateTime <= startDateTime) {
      return false;
    }

    return true;
  };

  /**
   * Validate the Description step
   * @returns {boolean} Is the Description step valid
   */
  const validateDescription = () => {
    // Check if description is filled
    return eventData.description?.trim() !== "";
  };

  /**
   * Validate the Art step
   * @returns {boolean} Is the Art step valid
   */
  const validateArt = () => {
    // Art uploads are optional but if files are uploaded, they must be valid
    const artData = eventData.art || {};

    // Helper function to validate a file
    const isFileValid = (file, supportedTypes, maxSizeMB) => {
      // Return true if file is empty (no validation needed)
      if (!file) return true;

      // Make sure the file has a name property before trying to use split()
      if (!file.name) {
        console.warn("File object does not have a name property:", file);
        return false;
      }

      // Check file type
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      if (!supportedTypes.includes(fileExtension)) {
        return false;
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        return false;
      }

      return true;
    };

    // Check for validation errors in uploaded files
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

    // Return true if there are no errors
    return !hasThumbnailError && !hasBannerError;
  };

  /**
   * Validate the Tickets step
   * @returns {boolean} Is the Tickets step valid
   */
  const validateTickets = () => {
    // Check if there is at least one ticket
    if (!eventData.tickets || eventData.tickets.length === 0) {
      return false;
    }

    // Check if all tickets have required fields
    const invalidTickets = eventData.tickets.filter((ticket) => {
      // Basic required fields validation
      if (!ticket.name || ticket.name.trim() === "") {
        return true; // Invalid
      }

      // Price validation
      if (!ticket.price) {
        return true; // Invalid
      }

      // Price must be a valid positive number
      if (isNaN(ticket.price) || parseFloat(ticket.price) < 0) {
        return true; // Invalid
      }

      // Quantity validation - if not "No Limit", must be a positive number
      if (ticket.quantity !== "No Limit") {
        if (
          !ticket.quantity ||
          isNaN(ticket.quantity) ||
          parseInt(ticket.quantity) <= 0
        ) {
          return true; // Invalid
        }
      }

      // If purchase limit is enabled, it must have a value
      if (
        ticket.enableMaxPurchase &&
        (!ticket.purchaseLimit || parseInt(ticket.purchaseLimit) <= 0)
      ) {
        return true; // Invalid
      }

      return false; // Valid ticket
    });

    return invalidTickets.length === 0;
  };

  /**
   * Validate the Discount Codes step
   * @returns {boolean} Is the Discount Codes step valid
   */
  const validateDiscountCodes = () => {
    // Discount codes are optional, so it's always valid if empty
    if (!eventData.discountCodes || eventData.discountCodes.length === 0) {
      return true;
    }

    // Check if all discount codes have required fields
    const invalidDiscountCodes = eventData.discountCodes.filter((code) => {
      // Basic required fields validation
      if (!code.code || code.code.trim() === "") {
        return true; // Invalid
      }

      // Discount percentage validation
      if (
        !code.discountPercentage ||
        isNaN(code.discountPercentage) ||
        parseFloat(code.discountPercentage) < 0 ||
        parseFloat(code.discountPercentage) > 100
      ) {
        return true; // Invalid
      }

      // Max discount amount validation
      if (
        !code.maxDiscountAmount ||
        isNaN(code.maxDiscountAmount) ||
        parseFloat(code.maxDiscountAmount) < 0
      ) {
        return true; // Invalid
      }

      // Min discount amount validation
      if (
        !code.minDiscountAmount ||
        isNaN(code.minDiscountAmount) ||
        parseFloat(code.minDiscountAmount) < 0
      ) {
        return true; // Invalid
      }

      // Quantity validation
      if (
        !code.quantity ||
        isNaN(code.quantity) ||
        parseInt(code.quantity) <= 0
      ) {
        return true; // Invalid
      }

      return false; // Valid discount code
    });

    return invalidDiscountCodes.length === 0;
  };

  /**
   * Validate the Publish step
   * @returns {boolean} Is the Publish step valid
   */
  const validatePublish = () => {
    // Check if all required event information is available

    // Basic Info validation
    if (!eventData.name || !eventData.category) {
      return false;
    }

    // // Location validation - either TBA or has location details
    // if (!eventData.location.isToBeAnnounced &&
    //     (!eventData.location.venue || !eventData.location.city || !eventData.location.country)) {
    //   return false;
    // }

    // // Date/Time validation
    // if (!eventData.dateTime.startDate || !eventData.dateTime.startTime ||
    //     !eventData.dateTime.endDate || !eventData.dateTime.endTime) {
    //   return false;
    // }

    // // Description validation
    // if (!eventData.description) {
    //   return false;
    // }

    // // Tickets validation - at least one ticket is required
    // if (!eventData.tickets || eventData.tickets.length === 0) {
    //   return false;
    // }

    // All required steps are valid
    return true;
  };

  /**
   * Get the step key by step number
   * @param {number} stepNumber - Step number
   * @returns {string} Step key
   */
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

  /**
   * Handle publishing the event
   */
  const handlePublishEvent = async () => {
    try {
      // Set loading state
      setIsLoading((prev) => ({ ...prev, publishEvent: true }));

      // Prepare the publish data for API using the utility function
      const publishData = preparePublishEventDataForAPI(eventId);

      console.log("Publishing event with data:", publishData);

      // Make API call to publish the event
      const response = await PublishEventAPI(eventId, publishData);
      console.log("Event published successfully:", response);

      // Update saved event data
      const currentEventData = getEventData();
      saveEventData({
        ...currentEventData,
        publishStatus: "published",
        publishedAt: new Date().toISOString(),
      });

      // Set success message (optional)
      setSuccessMessage("Event published successfully!");

      clearEventData();

      // Redirect to the events page after a short delay
      setTimeout(() => {
        navigate("/events"); // Changed from /events/${eventId} to /events
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

  /**
   * Handle next step navigation
   */
  const handleNextStep = async () => {
    // Validate current step
    const isValid = validateCurrentStep();

    // Special case for the first step (BasicInfo) - Must be completed to proceed
    if (currentStep === 1 && !isValid) {
      alert("Please complete the Basic Info step first to create your event.");
      return;
    }

    // Special case for the last step (publish)
    if (currentStep === 8) {
      await handlePublishEvent();
      return;
    }

    // Set loading state if the step is valid
    if (isValid) {
      setIsLoading((prev) => ({ ...prev, saveEvent: true }));
    }

    try {
      // Default eventId value
      let updatedEventId = eventId;

      // Special case for BasicInfo step - create new event
      if (currentStep === 1 && !eventId) {
        if (isValid) {
          try {
            // Get user data for organization and user IDs
            const userData = getUserData();

            // Prepare data according to the required schema
            const basicInfoData = {
              name: eventData.name,
              organizationId:
                eventData.organizationId || userData?.organizationId || 1,
              createdBy: eventData.createdBy || userData?.userId || 1,
              private: eventData.eventType === "private",
            };

            console.log("Creating new event with data:", basicInfoData);

            // Make the actual API call
            const response = await CreateEventAPI(basicInfoData);
            console.log("Event creation successful:", response);

            // Save the event data to localStorage
            saveEventData(response.data);
            console.log("Event data saved to localStorage:", response.data);

            // Get the new event ID from the response
            updatedEventId = response.data.eventId;

            // Mark this step as completed
            const stepKey = getStepKeyByNumber(currentStep);
            setStepStatus((prevStatus) => ({
              ...prevStatus,
              [stepKey]: {
                completed: true,
                valid: true,
                visited: true,
              },
            }));

            // Navigate to the next step with the actual event ID
            navigate(`/events/create/${updatedEventId}/${currentStep + 1}`);
            setCurrentStep((prevStep) => prevStep + 1);

            // Return early since we've already navigated
            return;
          } catch (error) {
            console.error(
              "API Error Details:",
              error.response?.data || error.message
            );
            alert("Failed to create event. Please try again.");

            // Reset loading state in case of error
            setIsLoading((prev) => ({ ...prev, saveEvent: false }));
            return;
          }
        } else {
          // If step is not valid, show alert and return
          alert(
            "Please complete the Basic Info step first to create your event."
          );
          return;
        }
      }

      // For steps after BasicInfo that require an eventId
      if (eventId) {
        if (isValid) {
          // Handle location step submission
          if (currentStep === 2) {
            try {
              // Prepare location data for API submission
              const locationData = prepareLocationDataForAPI(
                eventData.location
              );

              // Make API call to update location
              const response = await UpdateEventLocationAPI(
                eventId,
                locationData
              );
              console.log("Location update successful:", response);

              // Update the saved event data with the new location info
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

              // Reset loading state in case of error
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          }

          // Handle date/time step submission
          else if (currentStep === 3) {
            try {
              // Determine if the event is private based on event type
              const isPrivate = eventData.eventType === "private";

              // Prepare date/time data for API submission
              const dateTimeData = prepareDateTimeDataForAPI(
                eventData.dateTime,
                eventId,
                isPrivate
              );

              console.log("Submitting date/time data:", dateTimeData);

              // Make API call to update date/time
              const response = await UpdateEventDateTimeAPI(
                eventId,
                dateTimeData
              );
              console.log("Date/time update successful:", response);

              // Update the saved event data with the new date/time info
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

              // Reset loading state in case of error
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          }

          // Handle description step submission
          else if (currentStep === 4) {
            try {
              // Determine if the event is private based on event type
              const isPrivate = eventData.eventType === "private";

              // Prepare description data for API submission
              const descriptionData = prepareDescriptionDataForAPI(
                eventData.description,
                eventId,
                isPrivate
              );

              console.log("Submitting description data:", descriptionData);

              // Make API call to update description
              const response = await UpdateEventDescriptionAPI(
                eventId,
                descriptionData
              );
              console.log("Description update successful:", response);

              // Update the saved event data with the new description info
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

              // Reset loading state in case of error
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          }

          // Handle art step submission
          else if (currentStep === 5) {
            try {
              // Check if there are any files selected
              const hasThumbnail = eventData.art?.thumbnailFile !== null;
              const hasBanner = eventData.art?.bannerFile !== null;

              console.log("Art data to be uploaded:", {
                hasThumbnail,
                hasBanner,
                thumbnailName: eventData.art?.thumbnailName,
                bannerName: eventData.art?.bannerName,
              });

              // Prepare the JSON payload for the API
              if (hasBanner) {
                const bannerData = prepareArtDataForAPI(
                  eventData.art,
                  eventId,
                  "banner"
                );

                console.log("Sending banner data:", bannerData);

                // Make API call to update banner info
                const bannerResponse = await UploadEventBannerAPI(
                  eventId,
                  bannerData
                );
                console.log("Banner update successful:", bannerResponse);

                // Update the saved event data with the new art info
                const currentEventData = getEventData();
                saveEventData({
                  ...currentEventData,
                  art: {
                    ...currentEventData.art,
                    ...eventData.art,
                  },
                });
              }

              // Handle thumbnail similarly if needed
              if (hasThumbnail) {
                const thumbnailData = prepareArtDataForAPI(
                  eventData.art,
                  eventId,
                  "thumbnail"
                );

                console.log("Sending thumbnail data:", thumbnailData);

                // Make API call to update thumbnail info
                const thumbnailResponse = await UploadEventBannerAPI(
                  eventId,
                  thumbnailData
                );
                console.log("Thumbnail update successful:", thumbnailResponse);
              }

              // If no files to upload, still proceed
              if (!hasThumbnail && !hasBanner) {
                console.log("No art files to upload, skipping API call");
              }
            } catch (error) {
              console.error("Error updating art information:", error);
              setError(
                error.response?.data?.message ||
                  "Failed to update image information. Please try again."
              );

              // Reset loading state in case of error
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          }

          // Handle tickets step submission
          else if (currentStep === 6) {
            try {
              // Prepare tickets data for API submission
              const ticketsData = prepareTicketsDataForAPI(
                eventData.tickets,
                eventId
              );

              console.log("Submitting tickets data:", ticketsData);

              // Make API call to update tickets
              const response = await UpdateEventTicketsAPI(
                eventId,
                ticketsData
              );
              console.log("Tickets update successful:", response);

              // Update the saved event data with the new tickets info
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

              // Reset loading state in case of error
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          }

          // Handle discount codes step submission
          else if (currentStep === 7) {
            // Check if all previous steps are completed
            if (!areAllPreviousStepsCompleted()) {
              // This is the step before publish (step 7 is discount codes)
              alert(
                "Please complete all previous steps before proceeding to publish."
              );

              // Reset loading state
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }

            try {
              // Prepare discount codes data for API submission
              const discountCodesData = prepareDiscountCodesDataForAPI(
                eventData.discountCodes,
                eventId
              );

              console.log("Submitting discount codes data:", discountCodesData);

              // Make API call to update discount codes
              const response = await UpdateEventDiscountCodesAPI(
                eventId,
                discountCodesData
              );
              console.log("Discount codes update successful:", response);

              // Update the saved event data with the new discount codes info
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

              // Reset loading state in case of error
              setIsLoading((prev) => ({ ...prev, saveEvent: false }));
              return;
            }
          }

          // Mark current step as completed
          const stepKey = getStepKeyByNumber(currentStep);
          setStepStatus((prevStatus) => ({
            ...prevStatus,
            [stepKey]: {
              completed: true,
              valid: true,
              visited: true,
            },
          }));

          // Fetch updated event status after successful API call
          try {
            const response = await GetEventStatusAPI(eventId);
            if (response.data) {
              console.log("Updated event status:", response.data);
            }
          } catch (statusError) {
            console.error("Error fetching updated event status:", statusError);
          }
        }

        // For steps after BasicInfo, always navigate to next step
        navigate(`/events/create/${eventId}/${currentStep + 1}`);
        setCurrentStep((prevStep) => prevStep + 1);
      } else {
        // No eventId and not on step 1 - should not happen, but handle anyway
        alert(
          "Please complete the Basic Info step first to create your event."
        );
      }
    } catch (error) {
      // General error handler
      console.error("Error in handleNextStep:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      // Always reset loading state
      setIsLoading((prev) => ({ ...prev, saveEvent: false }));
    }
  };

  /**
   * Get data for the current step to update
   * @param {number} step - Current step
   * @returns {Object} Data for update
   */
  const getStepDataForUpdate = (step) => {
    switch (step) {
      case 1: // Basic Info
        return {
          name: eventData.name,
          private: eventData.eventType === "private",
          organizationId: eventData.organizationId || 0,
          createdBy: eventData.createdBy || 0,
        };
      case 2: // Location
        return {
          location: eventData.location,
        };
      case 3: // Date & Time
        return {
          dateTime: eventData.dateTime,
        };
      case 4: // Description
        return {
          description: eventData.description,
        };
      case 5: // Art
        // Handle file uploads separately
        return {
          art: {
            thumbnailName: eventData.art?.thumbnailName,
            bannerName: eventData.art?.bannerName,
          },
        };
      case 6: // Tickets
        return {
          tickets: eventData.tickets,
        };
      case 7: // Discount Codes
        return {
          discountCodes: eventData.discountCodes,
        };
      case 8: // Publish
        return {
          publishStatus: eventData.publishStatus,
        };
      default:
        return {};
    }
  };

  /**
   * Navigate to the previous step
   */
  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      navigate(`/events/create/${eventId}/${prevStep}`);
      setCurrentStep(prevStep);
    }
  };

  /**
   * Navigate to a specific step directly
   * @param {number} stepNumber - Step to navigate to
   */
  const navigateToStep = (stepNumber) => {
    // Special case for the publish step (step 8)
    if (stepNumber === 8) {
      // Check if all previous steps are completed
      if (!areAllPreviousStepsCompleted()) {
        // Show alert to user
        alert("Please complete all previous steps before publishing.");
        return;
      }
    }

    // Navigate to the selected step
    navigate(`/events/create/${eventId}/${stepNumber}`);
    setCurrentStep(stepNumber);
  };

  /**
   * Render the current step
   * @returns {JSX.Element} Current step component
   */
  const renderCurrentStep = () => {
    // Check if event data is loading
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

  // Get current step name for header
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

  // Determine if the Next button should be disabled
  const isNextDisabled = !validateCurrentStep() || isLoading.saveEvent;

  // Determine if the Preview button should be available
  const canPreview = Object.values(stepStatus).some((step) => step.completed);

  return (
    <div className={styles.pageContainer}>
      {/* Main Header - reused from the main layout */}
      <Header />

      {/* Event-specific sub-header with breadcrumbs and actions */}
      <EventHeaderNav
        currentStep={getCurrentStepName()}
        eventName={eventData.name || "NORR Festival 2022"}
        isDraft={true}
        canPreview={canPreview}
      />

      <div className={styles.content}>
        <EventCreationSidebar
          currentStep={currentStep}
          stepStatus={stepStatus}
          navigateToStep={navigateToStep}
          eventId={eventId}
          onStatusUpdate={(updatedStatus) => {
            // Only update if there are actual changes to prevent unnecessary re-renders
            const hasChanges = Object.keys(updatedStatus).some(
              (key) =>
                updatedStatus[key].completed !== stepStatus[key].completed
            );

            if (hasChanges) {
              setStepStatus(updatedStatus);
            }
          }}
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
                // Remove the disabled attribute to make it always clickable
                // disabled={isNextDisabled}
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

      {/* Footer div with specific styling */}
      <div className={styles.footer}>© 2025 Event Tickets Platform</div>
    </div>
  );
};

export default CreateEventPage;
