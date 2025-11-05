import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventHeaderNav from "./components/eventHeaderNav";
import EventManageSidebar from "./components/eventManageSidebar";
import LoadingSpinner from "../../components/common/loadingSpinner/loadingSpinner";
import styles from "./manageEventPage.module.scss";

// Import API and section components
import { GetEventDashboardAPI, GetEventAPI } from "../../services/allApis";
import OverviewSection from "./sections/overviewSection";
import OrdersAndAttendeesSection from "./sections/ordersAndAttendeesSection/ordersAndAttendeesSection";
import PayoutSection from "./sections/payoutSection";
import TicketSection from "./sections/ticketSection";
import DiscountSection from "./sections/discountSection";

const EventManagePage = () => {
  const navigate = useNavigate();
  const { eventId, section } = useParams();

  const [isManageSidebarOpen, setIsManageSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [currentSection, setCurrentSection] = useState("overview");

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        // Fetch both dashboard and detailed event data in parallel
        const [dashboardRes, eventRes] = await Promise.all([
          GetEventDashboardAPI(eventId),
          GetEventAPI(eventId)
        ]);
        
        setDashboardData(dashboardRes.data);
        setEventData(eventRes.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setError("Failed to load event data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    setCurrentSection(section || "overview");
  }, [section]);

  const navigateToManageSection = (sectionName) => {
    navigate(`/events/manage/${eventId}/${sectionName}`);
    if (window.innerWidth <= 768 && isManageSidebarOpen) {
      setIsManageSidebarOpen(false);
    }
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "overview":
        return <OverviewSection dashboardData={dashboardData} eventData={eventData} />;
      case "ordersAndAttendees":
        return <OrdersAndAttendeesSection eventId={eventId} />;
      case "payout":
        return <PayoutSection dashboardData={dashboardData} />;
      case "tickets":
        return <TicketSection />;
      case "discounts":
        return <DiscountSection />;
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
        toggleMobileSidebar={() => setIsManageSidebarOpen(!isManageSidebarOpen)}
        eventId={eventId}
      />
      <div className={styles.contentWrapper}>
        <EventManageSidebar
          currentSection={currentSection}
          sectionStatus={{}} // sectionStatus can be implemented later
          navigateToSection={navigateToManageSection}
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