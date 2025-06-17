import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { GetAllOrganizationEventsAPI, DeleteEventAPI } from '../../services/allApis';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './eventsPage.module.scss';
import { getUserData } from '../../utils/authUtil';

const EventsPage = () => {
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // MODIFIED: Default filter is 'All Events' to match the new design
  const [currentFilter, setCurrentFilter] = useState('All Events');
  const [searchQuery, setSearchQuery] = useState('');
  
  // MODIFIED: Filter options for the new sidebar
  const filterOptions = ['All Events', 'Live Events', 'Drafts', 'Paused', 'Archive'];
  const userId = Cookies.get('userId');
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [events, currentFilter, searchQuery]);
  
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
      setEvents(response.data || []);
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
    
    // NOTE: Per your request, filtering logic is simplified for now.
    // 'All Events' will be shown. You can add more complex logic here later.
    if (currentFilter !== 'All Events') {
      // Future logic for 'Live Events', 'Drafts', etc. will go here.
      // For now, it will just show all events.
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
    navigate('/events/create/1');
  };
  
  const handleViewEvent = (eventId) => {
    navigate(`/events/manage/${eventId}/overview`);
  };

  // --- HELPER FUNCTIONS MODIFIED FOR NEW DESIGN ---

  const getStatusText = (event) => {
    // Per request, all events will show 'Draft' status for now.
    return 'Draft';
  };

  const getStatusBadgeClass = (event) => {
    // Per request, all events will use the draft badge style.
    return styles.draftBadge;
  };
  
  const formatTicketSales = (event) => {
    // Per request, show a nil value.
    return '00/100';
  };

  const calculateGrossRevenue = (event) => {
    // Per request, show a nil value.
    return '$00.0';
  };
  
  const formatEventDate = (event) => {
    if (!event.dateTime?.startDate) {
      return { month: 'TBD', day: '??' };
    }
    const date = new Date(event.dateTime.startDate);
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };
  
  if (isLoading && events.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className={styles.pageWrapper}>
      {/* NEW: Sidebar for event management */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Manage Event</h2>
        <nav className={styles.filterNav}>
          {filterOptions.map(filter => (
            <button
              key={filter}
              className={`${styles.filterItem} ${currentFilter === filter ? styles.activeFilter : ''}`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
              {/* This count is static for now, can be made dynamic later */}
              <span>{filter === 'All Events' ? 4 : 1}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Your Events</h1>
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
              Create Event
            </button>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.eventsTable}>
          <div className={styles.tableHeader}>
            <div className={styles.eventColumn}>Event</div>
            <div className={styles.statusColumn}>Status</div>
            <div className={styles.soldColumn}>Sold</div>
            <div className={styles.grossColumn}>Gross</div>
            <div className={styles.actionsColumn}></div>
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
                      <img src={event.art?.thumbnailUrl || '/images/placeholder-event.jpg'} alt={event.name} />
                    </div>
                    <div className={styles.eventDetails}>
                      <h3 className={styles.eventName}>{event.name}</h3>
                      <p className={styles.eventLocation}>
                        {event.location?.city}{event.location?.city && ', '}{event.location?.country}
                      </p>
                    </div>
                  </div>
                  
                  <div className={styles.statusCell}>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(event)}`}>
                      {getStatusText(event)}
                    </span>
                  </div>
                  
                  <div className={styles.soldCell}>
                    <span>{formatTicketSales(event)}</span>
                    <div className={styles.salesProgress}>
                      <div className={styles.progressBar}></div>
                    </div>
                  </div>

                  <div className={styles.grossCell}>
                    <span>{calculateGrossRevenue(event)}</span>
                  </div>

                  <div className={styles.actionsCell}>
                    <button className={styles.actionsButton} onClick={(e) => e.stopPropagation()}>
                       <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="#6B7280"/></svg>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.noEventsMessage}>
              No events found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventsPage;