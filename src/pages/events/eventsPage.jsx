import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { GetAllOrganizationEventsAPI, DeleteEventAPI } from '../../services/allApis';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import styles from './eventsPage.module.scss';
import { getUserData } from '../../utils/authUtil';
import { GetEventAPI } from '../../services/allApis';
import { saveEventData } from '../../utils/eventUtil';

/**
 * EventsPage component - Displays all user events with filtering and status options
 * Provides functionalities to view, filter, search, and manage events
 * 
 * @returns {JSX.Element} EventsPage component
 */
const EventsPage = () => {
  const navigate = useNavigate();
  
  // State for events and loading
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters and search
  const [currentFilter, setCurrentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter options
  const filterOptions = ['All', 'Listed', 'Draft', 'Past', 'Paused', 'Archived'];
  
  // Get current user ID
  const userId = Cookies.get('userId');
  
  /**
   * Fetch all events on component mount
   */
  useEffect(() => {
    fetchEvents();
  }, []);
  
  /**
   * Apply filters whenever the filter or search changes
   */
  useEffect(() => {
    applyFilters();
  }, [events, currentFilter, searchQuery]);
  
  // Modified fetchEvents function in eventsPage.jsx
const fetchEvents = async () => {
  try {
    setIsLoading(true);
    
    // Get organizationId from userData using the authUtil function
    const userData = getUserData();
    const organizationId = userData?.organizationId;
    
    if (!organizationId) {
      setError('Organization ID not found. Please login again.');
      setIsLoading(false);
      return;
    }
    
    // Set some default parameters for pagination
    const params = {
      page: 0,
      size: 100,
      sort: 'startDate,desc'
    };
    
    // Pass organizationId to the API call
    const response = await GetAllOrganizationEventsAPI(organizationId, params);
    setEvents(response.data || []);
    console.log("events are ....",events)
    setError(null);
  } catch (error) {
    console.error('Error fetching events:', error);
    setError('Failed to load events. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
  
  /**
   * Apply filters and search to the events
   */
  const applyFilters = () => {
    let filtered = [...events];
    
    // Apply status filter
    if (currentFilter !== 'All') {
      filtered = filtered.filter(event => {
        if (currentFilter === 'Listed') return event.publishStatus === 'published' && new Date(event.dateTime?.endDate) >= new Date();
        if (currentFilter === 'Draft') return event.publishStatus === 'draft';
        if (currentFilter === 'Past') return new Date(event.dateTime?.endDate) < new Date() && event.publishStatus === 'published';
        if (currentFilter === 'Paused') return event.publishStatus === 'paused';
        if (currentFilter === 'Archived') return event.publishStatus === 'archived';
        return true;
      });
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(event => 
        event.name?.toLowerCase().includes(query) || 
        event.location?.city?.toLowerCase().includes(query) ||
        event.location?.country?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query)
      );
    }
    
    setFilteredEvents(filtered);
  };
  
  /**
   * Handle filter button click
   * @param {string} filter - Selected filter value
   */
  const handleFilterClick = (filter) => {
    setCurrentFilter(filter);
  };
  
  /**
   * Handle event search
   * @param {Object} e - Event object
   */
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  /**
   * Navigate to create event page
   */
  const handleCreateEvent = () => {
    navigate('/events/create');
  };
  
/**
 * Navigate to event details page
 * @param {string} eventId - Event ID
 */
const handleViewEvent = (eventId) => {
  // Simply navigate to the event management page with the eventId
  navigate(`/events/manage/${eventId}/overview`);
};
  
  /**
   * Navigate to edit event page
   * @param {string} eventId - Event ID
   * @param {Object} e - Event object (to stop propagation)
   */
  const handleEditEvent = (eventId, e) => {
    e.stopPropagation();
    navigate(`/events/create/${eventId}`);
  };
  
  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @param {Object} e - Event object (to stop propagation)
   */
  const handleDeleteEvent = async (eventId, e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await DeleteEventAPI(eventId, userId);
        
        // Remove the deleted event from the state
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        setError(null);
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('Failed to delete event. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  /**
   * Format ticket sales for display
   * @param {Object} event - Event object
   * @returns {string} Formatted ticket sales
   */
  const formatTicketSales = (event) => {
    // Calculate total tickets sold and available
    const totalSold = event.tickets?.reduce((total, ticket) => total + (ticket.quantitySold || 0), 0) || 0;
    const totalAvailable = event.tickets?.reduce((total, ticket) => total + (ticket.quantity || 0), 0) || 0;
    
    return `${totalSold}/${totalAvailable}`;
  };
  
  /**
   * Calculate and format gross revenue
   * @param {Object} event - Event object
   * @returns {string} Formatted gross revenue
   */
  const calculateGrossRevenue = (event) => {
    // Calculate gross revenue from ticket sales
    const revenue = event.tickets?.reduce((total, ticket) => {
      return total + ((ticket.quantitySold || 0) * (ticket.price || 0));
    }, 0) || 0;
    
    // Format as currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(revenue);
  };
  
  /**
   * Get the event status badge class based on status
   * @param {Object} event - Event object
   * @returns {string} CSS class for status badge
   */
  const getStatusBadgeClass = (event) => {
    if (event.publishStatus === 'draft') return styles.draftBadge;
    if (event.publishStatus === 'archived') return styles.archivedBadge;
    if (event.publishStatus === 'paused') return styles.pausedBadge;
    
    // Check if event is past based on end date
    const isPast = new Date(event.dateTime?.endDate) < new Date();
    if (isPast) return styles.pastBadge;
    
    // Default to live for published events that haven't ended
    return styles.liveBadge;
  };
  
  /**
   * Get the display status text for an event
   * @param {Object} event - Event object
   * @returns {string} Status text to display
   */
  const getStatusText = (event) => {
    if (event.publishStatus === 'draft') return 'Draft';
    if (event.publishStatus === 'archived') return 'Archived';
    if (event.publishStatus === 'paused') return 'Paused';
    
    // Check if event is past based on end date
    const isPast = new Date(event.dateTime?.endDate) < new Date();
    if (isPast) return 'Past';
    
    // Default to live for published events that haven't ended
    return 'Live';
  };
  
  /**
   * Format the event date for display
   * @param {Object} event - Event object
   * @returns {Object} Formatted date details
   */
  const formatEventDate = (event) => {
    if (!event.dateTime?.startDate) {
      return { month: 'JUN', day: '20' }; // Default fallback
    }
    
    const date = new Date(event.dateTime.startDate);
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    
    return { month, day };
  };
  
  // Show loading spinner while fetching events
  if (isLoading && events.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className={styles.eventsPageContainer}>
      <h1 className={styles.pageTitle}>Your Events</h1>
      
      {/* Filters Section */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterTabs}>
          {filterOptions.map(filter => (
            <button
              key={filter}
              className={`${styles.filterTab} ${currentFilter === filter ? styles.activeFilter : ''}`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <div className={styles.searchAndActions}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search events..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button className={styles.searchButton} aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          
          <button className={styles.filterButton} aria-label="Filter">
            <span>Filter</span>
          </button>
          
          <button className={styles.createEventButton} onClick={handleCreateEvent}>
            <span className={styles.plusIcon}>+</span>
            Create Event
          </button>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
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
      
      {/* Events Table */}
      <div className={styles.eventsTable}>
        {/* Table Header */}
        <div className={styles.tableHeader}>
          <div className={styles.eventColumn}>Event</div>
          <div className={styles.statusColumn}>Status</div>
          <div className={styles.soldColumn}>Sold</div>
          <div className={styles.grossColumn}>Gross</div>
          <div className={styles.actionsColumn}></div>
        </div>
        
        {/* Table Body */}
        {filteredEvents.length === 0 ? (
          <div className={styles.noEventsMessage}>
            {searchQuery ? 'No events found matching your search.' : 'No events found. Create your first event!'}
          </div>
        ) : (
          filteredEvents.map(event => {
            const date = formatEventDate(event);
            
            return (
              <div 
                key={event.id} 
                className={styles.eventRow}
                onClick={() => handleViewEvent(event.id)}
              >
                {/* Date Display */}
                <div className={styles.dateDisplay}>
                  <div className={styles.dateMonth}>{date.month}</div>
                  <div className={styles.dateDay}>{date.day}</div>
                </div>
                
                {/* Event Info */}
                <div className={styles.eventInfo}>
                  <div className={styles.eventThumbnail}>
                    {event.art?.thumbnailUrl ? (
                      <img 
                        src={event.art.thumbnailUrl} 
                        alt={event.name} 
                        className={styles.thumbnailImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/80';
                        }}
                      />
                    ) : (
                      <div className={styles.placeholderThumbnail}></div>
                    )}
                  </div>
                  <div className={styles.eventDetails}>
                    <h3 className={styles.eventName}>{event.name}</h3>
                    <p className={styles.eventLocation}>
                      {event.location?.city}{event.location?.city && event.location?.country && ', '}{event.location?.country}
                    </p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className={styles.statusColumn}>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(event)}`}>
                    {getStatusText(event)}
                  </span>
                </div>
                
                {/* Ticket Sales */}
                <div className={styles.soldColumn}>
                  <div className={styles.ticketSales}>
                    <span className={styles.salesText}>{formatTicketSales(event)}</span>
                    {event.publishStatus === 'published' && (
                      <div className={styles.salesProgress}>
                        <div 
                          className={styles.progressBar} 
                          style={{ 
                            width: `${Math.min(
                              (event.tickets?.reduce((total, ticket) => total + (ticket.quantitySold || 0), 0) || 0) / 
                              Math.max((event.tickets?.reduce((total, ticket) => total + (ticket.quantity || 0), 0) || 1), 1) * 100,
                              100
                            )}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Gross Revenue */}
                <div className={styles.grossColumn}>
                  <span className={styles.grossText}>{calculateGrossRevenue(event)}</span>
                </div>
                
                {/* Actions */}
                <div className={styles.actionsColumn}>
                  <button 
                    className={styles.actionsButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle actions menu logic here
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="#6B7280"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventsPage;