import React, { useEffect, useState } from "react";
import { GetAllOrganizationEventsAPI, GetEventStatusAPI, GetEventDashboardAPI } from "../../services/allApis";
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from "./eventList.module.scss";
import pageStyles from './dashboardPage.module.scss';

export default function EventList({ orgId, onSelectEvent, onBack }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = { page: 0, size: 100, sort: 'startDate,desc' };
        const response = await GetAllOrganizationEventsAPI(orgId, params);
        const initialEvents = response.data || [];

        const eventsWithDetails = await Promise.all(
          initialEvents.map(async (event) => {
            try {
              const statusResponse = await GetEventStatusAPI(event.id);
              const isPublished = statusResponse.data?.step8Completed || false;

              let status = 'Draft';
              if (isPublished) {
                const now = new Date();
                const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
                status = eventEndDate < now ? 'Past' : 'Live';
              }

              const dashboardResponse = await GetEventDashboardAPI(event.id);
              return {
                ...event,
                status,
                totalTicketsIssued: dashboardResponse.data?.totalTicketsIssued || 0,
                totalTicketCapacity: dashboardResponse.data?.totalTicketCapacity || 0,
                revenue: dashboardResponse.data?.revenue || 0,
              };
            } catch (error) {
              console.error(`Failed to get details for event ${event.id}:`, error);
              return { ...event, status: 'Draft', totalTicketsIssued: 0, totalTicketCapacity: 0, revenue: 0 };
            }
          })
        );
        setEvents(eventsWithDetails);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [orgId]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Live': return styles.liveBadge;
      case 'Draft': return styles.draftBadge;
      case 'Past': return styles.pastBadge;
      default: return '';
    }
  };
  
  const formatEventDate = (event) => {
    if (!event.startDate) return { month: 'TBD', day: '??' };
    const date = new Date(event.startDate);
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  if (loading) return <div className={pageStyles.loadingContainer}><LoadingSpinner size="large"/></div>;

  return (
    <div>
      <button onClick={onBack} className={styles.backButton}>← Back to Organizations</button>
      <h2 className={styles.listHeader}>Events for Organization #{orgId}</h2>
      
      <div className={styles.eventsTable}>
        <div className={styles.tableHeader}>
          <div>Event</div>
          <div>Status</div>
          <div>Sold</div>
          <div>Gross</div>
        </div>

        {events.length === 0 ? <p>No events found.</p> : events.map((event) => {
          const date = formatEventDate(event);
          const sold = event.totalTicketsIssued || 0;
          const total = event.totalTicketCapacity || 0;
          const revenue = (event.revenue || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          return (
            <div key={event.id} onClick={() => onSelectEvent(event.id)} className={styles.eventRow}>
              <div className={styles.eventInfoCell}>
                <div className={styles.dateBlock}>
                  <span className={styles.dateMonth}>{date.month}</span>
                  <span className={styles.dateDay}>{date.day}</span>
                </div>
                <div className={styles.eventDetails}>
                  <h3 className={styles.eventName}>{event.name}</h3>
                  <p className={styles.eventLocation}>{event.location?.city || 'Online'}</p>
                </div>
              </div>
              <div className={styles.statusCell}>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(event.status)}`}>{event.status}</span>
              </div>
              <div className={styles.soldCell}>
                <span>{total > 0 ? `${sold}/${total}`: `${sold}/-`}</span>
                <div className={styles.salesProgress}>
                  <div className={styles.progressBar} style={{ width: total > 0 ? `${(sold/total)*100}%` : '0%' }}></div>
                </div>
              </div>
              <div className={styles.grossCell}>
                <span>{revenue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}