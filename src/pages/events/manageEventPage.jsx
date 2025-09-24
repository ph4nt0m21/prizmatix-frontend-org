import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import EventHeaderNav from "./components/eventHeaderNav";
import EventManageSidebar from "./components/eventManageSidebar";
import LoadingSpinner from "../../components/common/loadingSpinner/loadingSpinner";
import styles from "./manageEventPage.module.scss";

// Import API and section components
import { GetEventDashboardAPI } from "../../services/allApis";
import OverviewSection from "./sections/overviewSection";
import OrdersAndAttendeesSection from "./sections/ordersAndAttendeesSection/ordersAndAttendeesSection";
import PayoutSection from "./sections/payoutSection";
import PromotionsSection from "./sections/promotionsSection";
import TicketSection from "./sections/ticketSection";
import DiscountSection from "./sections/discountSection";

const EventManagePage = () => {
  const navigate = useNavigate();
  const { eventId, section } = useParams();
  // We still get global context, but will use its toggleMobileSidebar for the main header's action
  const { toggleMobileSidebar: toggleGlobalSidebar } = useOutletContext(); // Renamed to avoid conflict

  // NEW: Local state for this page's sidebar visibility
  const [isManageSidebarOpen, setIsManageSidebarOpen] = useState(false);

  // NEW: Local toggle function for this page's sidebar
  const toggleManageSidebar = () => {
    setIsManageSidebarOpen(!isManageSidebarOpen);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);

  const [eventData, setEventData] = useState({
    name: "Event Dashboard",
    status: "Live",
  });

  const [currentSection, setCurrentSection] = useState("overview");

  const [sectionStatus, setSectionStatus] = useState({
    overview: { completed: true, valid: true, visited: true },
    ordersAndAttendees: { completed: true, valid: true, visited: false },
    payout: { completed: true, valid: true, visited: false },
    promotions: { completed: true, valid: true, visited: false },
    tickets: { completed: false, valid: true, visited: false },
    discounts: { completed: false, valid: true, visited: false },
  });

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const response = await GetEventDashboardAPI(eventId);
        setDashboardData(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching event dashboard data:", error);
        setError("Failed to load event data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  useEffect(() => {
    if (section) {
      setCurrentSection(section);
    } else {
      setCurrentSection("overview");
    }
  }, [section]);

  const navigateToManageSection = (sectionName) => {
    navigate(`/events/manage/${eventId}/${sectionName}`);
    setCurrentSection(sectionName);
    // Close this page's mobile sidebar after navigation
    if (window.innerWidth <= 768 && isManageSidebarOpen) {
      toggleManageSidebar();
    }
  };

  const renderCurrentSection = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading event data...</p>
        </div>
      );
    }

    if (error) {
       return <div className={styles.errorMessage}>{error}</div>
    }

    switch (currentSection) {
      case "overview":
        return <OverviewSection dashboardData={dashboardData} />;
      case "ordersAndAttendees":
        return <OrdersAndAttendeesSection eventId={eventId} />;
      case "payout":
        return <PayoutSection />;
      case "promotions":
        return <PromotionsSection />;
      case "tickets":
        return <TicketSection />;
      case "discounts":
        return <DiscountSection />;
      default:
        return <OverviewSection dashboardData={dashboardData} />;
    }
  };

  return (
    <>
      {/* EventHeaderNav will now use the local toggleManageSidebar */}
      <EventHeaderNav
        currentStep={currentSection === "overview" ? "Overview" : currentSection}
        eventName={eventData.name}
        isDraft={eventData.status !== "Live"}
        toggleMobileSidebar={toggleManageSidebar} // Pass the local toggle function
        eventId={eventId}
      />
      <div className={styles.content}>
        {/* EventManageSidebar will use the local isManageSidebarOpen and toggleManageSidebar */}
        <EventManageSidebar
          currentSection={currentSection}
          sectionStatus={sectionStatus}
          navigateToSection={navigateToManageSection}
          navigateToEventEditPage={() =>
            navigate(`/events/edit-page/${eventId}`)
          }
          eventId={eventId}
          isMobileSidebarOpen={isManageSidebarOpen} // Pass local state
          toggleMobileSidebar={toggleManageSidebar} // Pass local toggle function
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
          {error && !isLoading && (
            <div className={styles.errorMessage}>
              {error}
              <button
                className={styles.dismissButton}
                onClick={() => setError(null)}
              >
                ✕
              </button>
            </div>
          )}
          <div className={styles.sectionContent}>{renderCurrentSection()}</div>
        </div>
      </div>
      <div className={styles.footer}>© 2025 Event Tickets Platform</div>
    </>
  );
};

export default EventManagePage;