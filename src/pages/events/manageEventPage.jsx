import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import EventHeaderNav from "./components/eventHeaderNav";
import EventManageSidebar from "./components/eventManageSidebar";
import LoadingSpinner from "../../components/common/loadingSpinner/loadingSpinner";
import styles from "./manageEventPage.module.scss";

// Import API and section components
import {
  GetEventDashboardAPI,
  GetEventAPI,
  GetEventStatusAPI,
  DeleteEventAPI,
  DuplicateEventAPI,
  GetEventTicketStructuresAPI,
} from "../../services/allApis";
import { getUserData } from "../../utils/authUtil";
import OverviewSection from "./sections/overviewSection";
import OrdersAndAttendeesSection from "./sections/ordersAndAttendeesSection/ordersAndAttendeesSection";
import PayoutSection from "./sections/payoutSection";
import TicketSection from "./sections/ticketSection";
import DiscountSection from "./sections/discountSection";
import { getPublishedEventTimingStatus } from "./eventStatusUtils";
import { getManagePublishGate } from "../../utils/eventUtil";

const EventManagePage = () => {
  const navigate = useNavigate();
  const { eventId, section } = useParams();

  const [isManageSidebarOpen, setIsManageSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [eventStatusFromApi, setEventStatusFromApi] = useState(null);
  const [currentSection, setCurrentSection] = useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const publishGate = useMemo(
    () =>
      getManagePublishGate({
        statusData: eventStatusFromApi,
        eventData,
        dashboardData,
        isPublished: !!eventData?.isPublished,
      }),
    [eventStatusFromApi, eventData, dashboardData]
  );

  const canPublishFromManage = publishGate.canPublish;

  const fetchEventData = useCallback(
    async ({ showLoader = true } = {}) => {
      if (!eventId) return;

      try {
        if (showLoader) setIsLoading(true);
        // Fetch dashboard, event details, publish status, and ticket structures in parallel.
        const [dashboardRes, eventRes, statusRes, ticketsRes] = await Promise.all([
          GetEventDashboardAPI(eventId),
          GetEventAPI(eventId),
          GetEventStatusAPI(eventId),
          GetEventTicketStructuresAPI(eventId),
        ]);

        const isPublished =
          statusRes.data?.step8Completed ?? eventRes.data?.isPublished ?? false;
        const ticketStructures = Array.isArray(ticketsRes?.data)
          ? ticketsRes.data.filter((ticket) => ticket?.isDeleted !== true)
          : [];
        const mergedEventData = {
          ...eventRes.data,
          tickets: ticketStructures,
          ticketStructures,
          isPublished,
        };
        setDashboardData(dashboardRes.data);
        setEventData(mergedEventData);
        setEventStatusFromApi(statusRes.data ?? null);
        setError(null);
      } catch (fetchError) {
        console.error("Error fetching event data:", fetchError);
        setError("Failed to load event data. Please try again.");
      } finally {
        if (showLoader) setIsLoading(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  useEffect(() => {
    setCurrentSection(section || "overview");
  }, [section]);

  const navigateToManageSection = (sectionName) => {
    navigate(`/events/manage/${eventId}/${sectionName}`);
    if (window.innerWidth <= 768 && isManageSidebarOpen) {
      setIsManageSidebarOpen(false);
    }
  };

  const navigateToEventEditPage = () => {
    navigate(`/events/edit-page/${eventId}/1`);
  };

  const navigateToPublishStep = () => {
    if (!eventId || !canPublishFromManage) return;
    navigate(`/events/create/${eventId}/8`);
    if (window.innerWidth <= 768 && isManageSidebarOpen) {
      setIsManageSidebarOpen(false);
    }
  };

  const duplicateEvent = async () => {
    if (!eventId) return;

    try {
      setIsDuplicating(true);
      const response = await DuplicateEventAPI(eventId);
      const newEventId = response.data?.eventId;

      if (!newEventId) {
        throw new Error("Duplicate event ID missing from response.");
      }

      toast.success("Event duplicated successfully.");
      const targetStep = eventStatus === "PAST" ? 3 : 8;
      navigate(`/events/create/${newEventId}/${targetStep}`);
    } catch (duplicateError) {
      console.error("Failed to duplicate event:", duplicateError);
      toast.error(
        duplicateError.response?.data?.message || "Failed to duplicate the event."
      );
    } finally {
      setIsDuplicating(false);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventId) return;

    const currentUserId = getUserData()?.id || Cookies.get("userId");
    if (!currentUserId) {
      toast.error("User ID not found. Cannot delete event.");
      setShowDeleteConfirm(false);
      return;
    }

    try {
      setIsDeleting(true);
      await DeleteEventAPI(eventId, currentUserId);
      toast.success("Event moved to Deleted. You can restore it within 30 days.");
      setShowDeleteConfirm(false);
      navigate("/events");
    } catch (deleteError) {
      console.error("Failed to delete event:", deleteError);
      toast.error(
        deleteError.response?.data?.message || "Failed to delete the event."
      );
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const eventStatus = eventData?.isPublished
    ? getPublishedEventTimingStatus(eventData)
    : 'DRAFT';

  const goToOrdersAndAttendees = () => navigateToManageSection("ordersAndAttendees");

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "overview":
        return (
          <OverviewSection
            dashboardData={dashboardData}
            eventData={eventData}
            onViewAllOrders={goToOrdersAndAttendees}
          />
        );
      case "ordersAndAttendees":
        return <OrdersAndAttendeesSection eventId={eventId} />;
      case "payout":
        return <PayoutSection eventId={eventId} dashboardData={dashboardData} />;
      case "tickets":
        return <TicketSection onCommitSuccess={() => fetchEventData({ showLoader: false })} />;
      case "discounts":
        return <DiscountSection onCommitSuccess={() => fetchEventData({ showLoader: false })} />;
      default:
        return (
          <OverviewSection
            dashboardData={dashboardData}
            eventData={eventData}
            onViewAllOrders={goToOrdersAndAttendees}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainerFullPage}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
     return <div className={styles.errorMessage}>{error}</div>
  }

  return (
    <>
      <EventHeaderNav
        eventName={eventData?.name || ''}
        isDraft={!eventData?.isPublished}
        eventStatus={eventStatus}
        toggleMobileSidebar={() => setIsManageSidebarOpen(!isManageSidebarOpen)}
        eventId={eventId}
        eventSlug={eventData?.slug}
        showActions={true}
      />
      <div className={styles.contentWrapper}>
        {isManageSidebarOpen && (
          <div className={styles.sidebarOverlay} onClick={() => setIsManageSidebarOpen(false)}></div>
        )}
        <EventManageSidebar
          currentSection={currentSection}
          sectionStatus={{}} // sectionStatus can be implemented later
          navigateToSection={navigateToManageSection}
          navigateToEventEditPage={navigateToEventEditPage}
          navigateToPublishStep={navigateToPublishStep}
          canPublish={canPublishFromManage}
          publishBlockers={publishGate.blockers}
          isPublished={!!eventData?.isPublished}
          eventId={eventId}
          onDeleteClick={() => setShowDeleteConfirm(true)}
          onDuplicateClick={duplicateEvent}
          isDuplicating={isDuplicating}
          isMobileSidebarOpen={isManageSidebarOpen}
          toggleMobileSidebar={() => setIsManageSidebarOpen(!isManageSidebarOpen)}
        />
        <main className={styles.mainContent}>
          {renderCurrentSection()}
        </main>
      </div>
      {showDeleteConfirm && (
        <div className={styles.deleteModalOverlay}>
          <div className={styles.deleteModal}>
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the event &quot;{eventData?.name}&quot;?
              It will move to Deleted for 30 days and can be restored during that time.
              After 30 days it will be permanently removed from your lists.
            </p>
            <div className={styles.deleteModalActions}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className={styles.cancelButton}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvent}
                className={styles.confirmDeleteButton}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventManagePage;