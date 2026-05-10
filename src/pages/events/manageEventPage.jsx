import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventHeaderNav from "./components/eventHeaderNav";
import EventManageSidebar from "./components/eventManageSidebar";
import LoadingSpinner from "../../components/common/loadingSpinner/loadingSpinner";
import styles from "./manageEventPage.module.scss";

// Import API and section components
import { GetEventDashboardAPI, GetEventAPI, GetEventStatusAPI } from "../../services/allApis";
import OverviewSection from "./sections/overviewSection";
import OrdersAndAttendeesSection from "./sections/ordersAndAttendeesSection/ordersAndAttendeesSection";
import PayoutSection from "./sections/payoutSection";
import TicketSection from "./sections/ticketSection";
import DiscountSection from "./sections/discountSection";
import { getPublishedEventTimingStatus } from "./eventStatusUtils";
import { isCreationReadyForPublish } from "../../utils/eventUtil";

const isPublishReadyFromEventData = (event = {}, dashboard = {}) => {
  const hasName = Boolean(event?.name && String(event.name).trim().length > 0);
  const hasDescription = Boolean(
    event?.description && String(event.description).trim().length > 0
  );

  const startDate = event?.dateTime?.startDate || event?.startDate;
  const startTime = event?.dateTime?.startTime || event?.startTime;
  const endDate = event?.dateTime?.endDate || event?.endDate;
  const endTime = event?.dateTime?.endTime || event?.endTime;
  const hasDateTime = Boolean(startDate && startTime && endDate && endTime);

  const isTba =
    event?.location?.isToBeAnnounced === true || event?.eventLocationType === "tba";
  const isOnline =
    event?.eventLocationType === "online" ||
    event?.location?.locationType === "online";
  const hasLocation =
    isTba ||
    isOnline ||
    Boolean(
      event?.location?.venue ||
        event?.eventLocationName ||
        (event?.location?.city && (event?.location?.country || event?.country))
    );

  const hasTickets =
    Number(dashboard?.totalTicketCapacity || 0) > 0 ||
    (Array.isArray(event?.tickets) && event.tickets.length > 0);

  return hasName && hasDescription && hasDateTime && hasLocation && hasTickets;
};

const EventManagePage = () => {
  const navigate = useNavigate();
  const { eventId, section } = useParams();

  const [isManageSidebarOpen, setIsManageSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [canPublishFromManage, setCanPublishFromManage] = useState(false);
  const [currentSection, setCurrentSection] = useState("overview");

  const fetchEventData = useCallback(
    async ({ showLoader = true } = {}) => {
      if (!eventId) return;

      try {
        if (showLoader) setIsLoading(true);
        // Fetch dashboard, event details and publish status in parallel.
        const [dashboardRes, eventRes, statusRes] = await Promise.all([
          GetEventDashboardAPI(eventId),
          GetEventAPI(eventId),
          GetEventStatusAPI(eventId),
        ]);

        const isPublished =
          statusRes.data?.step8Completed ?? eventRes.data?.isPublished ?? false;
        const mergedEventData = {
          ...eventRes.data,
          isPublished,
        };
        setDashboardData(dashboardRes.data);
        setEventData(mergedEventData);
        setCanPublishFromManage(
          isCreationReadyForPublish(statusRes.data) ||
            (!isPublished &&
              isPublishReadyFromEventData(mergedEventData, dashboardRes.data))
        );
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

  const eventStatus = eventData?.isPublished
    ? getPublishedEventTimingStatus(eventData)
    : 'DRAFT';

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "overview":
        return <OverviewSection dashboardData={dashboardData} eventData={eventData} />;
      case "ordersAndAttendees":
        return <OrdersAndAttendeesSection eventId={eventId} />;
      case "payout":
        return <PayoutSection eventId={eventId} dashboardData={dashboardData} />;
      case "tickets":
        return <TicketSection onCommitSuccess={() => fetchEventData({ showLoader: false })} />;
      case "discounts":
        return <DiscountSection onCommitSuccess={() => fetchEventData({ showLoader: false })} />;
      default:
        return <OverviewSection dashboardData={dashboardData} eventData={eventData} />;
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
          isPublished={!!eventData?.isPublished}
          eventId={eventId}
          isMobileSidebarOpen={isManageSidebarOpen}
          toggleMobileSidebar={() => setIsManageSidebarOpen(!isManageSidebarOpen)}
        />
        <main className={styles.mainContent}>
          {renderCurrentSection()}
        </main>
      </div>
    </>
  );
};

export default EventManagePage;