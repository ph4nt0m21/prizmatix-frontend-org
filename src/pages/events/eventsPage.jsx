import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { GetAllOrganizationEventsAPI, DeleteEventAPI, GetEventStatusAPI, GetEventDashboardAPI } from '../../services/allApis';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import EventHeaderNav from '../../pages/events/components/eventHeaderNav'; // Adjust path if necessary
import styles from './eventsPage.module.scss';
import { getUserData } from '../../utils/authUtil';

const EventsPage = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentFilter, setCurrentFilter] = useState('All Events');
  const [searchQuery, setSearchQuery] = useState('');

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const filterOptions = ['All Events', 'Live Events', 'Drafts', 'Past'];
  const userId = Cookies.get('userId');

  const liveCount = events.filter(event => event.status === 'Live').length;
  const draftCount = events.filter(event => event.status === 'Draft').length;
  const pastCount = events.filter(event => event.status === 'Past').length;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, currentFilter, searchQuery]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest(`.${styles.actionsMenuContainer}`)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const userData = getUserData();
      const organizationId = userData?.organizationId;

      if (!organizationId) {
        setError('Organization ID not found. Please login again.');
        setIsLoading(false);
        return;
      }

      const params = { page: 0, size: 100, sort: 'startDate,desc' };
      const response = await GetAllOrganizationEventsAPI(organizationId, params);
      const initialEvents = response.data || [];

      const eventsWithStatusAndSales = await Promise.all(
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
            const totalTicketsIssued = dashboardResponse.data?.totalTicketsIssued || 0;
            const totalTicketCapacity = dashboardResponse.data?.totalTicketCapacity || 0;
            const revenue = dashboardResponse.data?.revenue || 0;

            return {
              ...event,
              status,
              totalTicketsIssued,
              totalTicketCapacity,
              revenue,
            };
          } catch (statusError) {
            console.error(`Failed to get status or dashboard for event ${event.id}:`, statusError);
            return { ...event, status: 'Draft', totalTicketsIssued: 0, totalTicketCapacity: 0, revenue: 0 };
          }
        })
      );

      setEvents(eventsWithStatusAndSales);
      setError(null);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (currentFilter === 'Live Events') {
      filtered = filtered.filter(event => event.status === 'Live');
    } else if (currentFilter === 'Drafts') {
      filtered = filtered.filter(event => event.status === 'Draft');
    } else if (currentFilter === 'Past') {
      filtered = filtered.filter(event => event.status === 'Past');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  };

  const handleFilterClick = (filter) => {
    setCurrentFilter(filter);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateEvent = () => {
    navigate('/events/create/');
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/manage/${eventId}/overview`);
  };

  const handleToggleMenu = (e, eventId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === eventId ? null : eventId);
  };

  const handleEditEvent = (e, eventId) => {
    e.stopPropagation();
    navigate(`/events/edit-page/${eventId}/1`);
  };

  const handleDeleteClick = (e, event) => {
    e.stopPropagation();
    setEventToDelete(event);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const currentUserId = getUserData()?.id || userId;
      if (!currentUserId) {
        setError("User ID not found. Cannot delete event.");
        setShowDeleteConfirm(false);
        return;
      }
      await DeleteEventAPI(eventToDelete.id, currentUserId);
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventToDelete.id));
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError(err.response?.data?.message || 'Failed to delete the event.');
      setShowDeleteConfirm(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Live': return styles.liveBadge;
      case 'Draft': return styles.draftBadge;
      case 'Past': return styles.pastBadge;
      default: return '';
    }
  };

  const formatTicketSales = (event) => {
    const sold = event.totalTicketsIssued || 0;
    const total = event.totalTicketCapacity || 0;
    if (total === 0) return `${sold}/-`;
    return `${sold}/${total}`;
  };

  const calculateGrossRevenue = (event) => {
    const revenue = event.revenue || 0;
    return revenue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatEventDate = (event) => {
    if (!event.startDate) return { month: 'TBD', day: '??' };
    const date = new Date(event.startDate);
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  if (isLoading && events.length === 0) {
    return <div className={styles.loadingContainer}><LoadingSpinner size="large" /></div>;
  }

  return (
    <>
      <EventHeaderNav>
        <div className={styles.pageTitle}>
          <h1>Your Events</h1>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search"
              className={styles.searchInput}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24"><path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/></svg>
          </div>
          <button className={styles.createEventButton} onClick={handleCreateEvent}>
            + Create Event
          </button>
        </div>
      </EventHeaderNav>
      <div className={styles.pageWrapper}>
        <aside className={styles.sidebarInnerCard}>
          <h2 className={styles.sidebarTitle}>Manage Event</h2>
          <nav className={styles.filterNav}>
            {filterOptions.map(filter => {
              let count;
              switch (filter) {
                case 'All Events': count = events.length; break;
                case 'Live Events': count = liveCount; break;
                case 'Drafts': count = draftCount; break;
                case 'Past': count = pastCount; break;
                default: count = 0;
              }
              return (
                <button
                  key={filter}
                  className={`${styles.filterItem} ${currentFilter === filter ? styles.activeFilter : ''}`}
                  onClick={() => handleFilterClick(filter)}
                >
                  {filter}
                  <span>{count}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className={styles.mainContent}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.eventsTable}>
            <div className={styles.tableHeader}>
              <div>Event</div>
              <div>Status</div>
              <div>Sold</div>
              <div>Gross</div>
              <div></div>
            </div>

            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => {
                const date = formatEventDate(event);
                return (
                  <div key={event.id} className={styles.eventRow} onClick={() => handleViewEvent(event.id)}>
                    <div className={styles.eventInfoCell}>
                      <div className={styles.dateBlock}>
                        <span className={styles.dateMonth}>{date.month}</span>
                        <span className={styles.dateDay}>{date.day}</span>
                      </div>
                      <div className={styles.eventThumbnail}>
                        <img 
                          src={event.bannerImage || `https://placehold.co/144x112/e5e7eb/6b7280?text=${encodeURIComponent(event.name)}`} 
                          alt={event.name} 
                        />
                      </div>
                      <div className={styles.eventDetails}>
                        <h3 className={styles.eventName}>{event.name}</h3>
                        <p className={styles.eventLocation}>
                          {event.location?.city}{event.location?.city && ', '}{event.location?.country}
                        </p>
                      </div>
                    </div>

                    <div className={styles.statusCell}>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(event.status)}`}>
                        {event.status}
                      </span>
                    </div>

                    <div className={styles.soldCell}>
                      <span>{formatTicketSales(event)}</span>
                      <div className={styles.salesProgress}>
                        <div
                          className={styles.progressBar}
                          style={{
                            width: `${
                              event.totalTicketCapacity > 0
                                ? (event.totalTicketsIssued / event.totalTicketCapacity) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className={styles.grossCell}>
                      <span>{calculateGrossRevenue(event)}</span>
                    </div>

                    <div className={styles.actionsCell}>
                      <div className={styles.actionsMenuContainer}>
                        <button className={styles.actionsButton} onClick={(e) => handleToggleMenu(e, event.id)}>
                          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="#6B7280"/></svg>
                        </button>

                        {openMenuId === event.id && (
                          <div className={styles.actionsMenu}>
                            <button onClick={(e) => handleEditEvent(e, event.id)}>Edit</button>
                            <button onClick={(e) => handleDeleteClick(e, event)} className={styles.deleteAction}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noEventsMessage}>
                No events found for the selected filter.
              </div>
            )}
          </div>
        </main>
        {showDeleteConfirm && (
          <div className={styles.deleteModalOverlay}>
            <div className={styles.deleteModal}>
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete the event "{eventToDelete?.name}"? This action cannot be undone.</p>
              <div className={styles.deleteModalActions}>
                <button onClick={() => setShowDeleteConfirm(false)} className={styles.cancelButton}>Cancel</button>
                <button onClick={confirmDeleteEvent} className={styles.confirmDeleteButton}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EventsPage;