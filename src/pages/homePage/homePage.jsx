// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import { LoginAPI } from '../../services/allApis';
// import styles from './homePage.module.scss';

// /**
//  * HomePage component for the main dashboard view
//  * Uses direct authentication instead of AuthContext
//  * 
//  * @returns {JSX.Element} The HomePage component
//  */
// const HomePage = () => {
//   const navigate = useNavigate();
  
//   // State for user and authentication
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Check authentication status on component mount
//   useEffect(() => {
//     checkAuthStatus();
//   }, []);
  
//   /**
//    * Check if the user is authenticated based on token presence
//    */
//   const checkAuthStatus = async () => {
//     setIsLoading(true);
//     try {
//       const token = Cookies.get('token');
      
//       if (token) {
//         // Token exists, try to fetch user profile
//         try {
//           const response = await LoginAPI(token);
//           setCurrentUser(response.data);
//           setIsAuthenticated(true);
//         } catch (error) {
//           console.error('Error fetching user profile:', error);
//           // Even if profile fetch fails, if token exists, consider authenticated
//           setIsAuthenticated(true);
//         }
//       } else {
//         // No token, not authenticated
//         setCurrentUser(null);
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error('Auth check error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   /**
//    * Handler for navigating to the event creation page
//    */
//   const handleCreateEvent = () => {
//     if (isAuthenticated) {
//       navigate('/events/create');
//     } else {
//       navigate('/login');
//     }
//   };
  
//   // Display loading indicator while checking authentication
//   if (isLoading) {
//     return (
//       <div className={styles.loadingContainer}>
//         <div className={styles.loadingSpinner}></div>
//       </div>
//     );
//   }
  
//   return (
//     <div className={styles.homePageContainer}>
//       <div className={styles.homePageContent}>
//       {/* Promotion Banner */}
//       <div className={styles.promotionBanner}>
//         <div className={styles.bannerContent}>
//           <h2 className={styles.bannerTitle}>Elevate your Ticketing Experience</h2>
//           <p className={styles.bannerText}>
//             Welcome to Prizmatix! We're excited to help you list your event. Just follow these steps: provide the event name, date, and a brief description. Include venue details and ticket pricing. Hit submit, and your event will be live!
//           </p>
//           <button className={styles.learnMoreButton}>Learn More</button>
//         </div>
//       </div>
      
//       {/* Overview Section */}
//       <div className={styles.overviewSection}>
//         <div className={styles.sectionHeader}>
//           <h2 className={styles.sectionTitle}>Basic Overview</h2>
//           <div className={styles.sectionActions}>
//             <button className={styles.actionButton}>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8Z" fill="currentColor"/>
//               </svg>
//               August
//             </button>
//             <button className={styles.actionButton}>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor"/>
//               </svg>
//               Filter
//             </button>
//             <button className={styles.actionButton}>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="currentColor"/>
//               </svg>
//               Export
//             </button>
//           </div>
//         </div>
        
//         {/* Empty State */}
//         <div className={styles.emptyState}>
//           <div className={styles.emptyStateIcon}>
//             <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <rect width="60" height="40" rx="4" fill="#F0F0F0" transform="translate(10 20)"/>
//               <rect width="40" height="30" rx="4" fill="#FAFAFA" transform="translate(20 25)"/>
//             </svg>
//           </div>
//           <h3 className={styles.emptyStateTitle}>
//             Welcome {currentUser?.name}! Please create an event to get started.
//           </h3>
//           <button 
//             className={styles.createEventButton}
//             onClick={handleCreateEvent}
//           >
//             Create Event
//           </button>
//         </div>
//       </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import styles from './homePage.module.scss';

const HomePage = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('token');

      if (token) {
        try {
          const response = await LoginAPI(token);
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setIsAuthenticated(true);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = () => {
    if (isAuthenticated) {
      navigate('/events/create');
    } else {
      navigate('/login');
    }
  };

  // Updated Overview Stats
const overviewStats = [
  { label: 'Total Events', value: 1, accent: '#3b82f6' },
  { label: 'Tickets Sold', value: '121', accent: '#22c55e' },
  { label: 'Revenue', value: '$24,501.99', accent: '#f59e0b' },
  { label: 'Active Events', value: 0, accent: '#ec4899' },
];

// Updated Upcoming + All Events (single event only)
const upcomingEvents = [
  {
    date: 'OCT 25',
    title: `Moksha's "AARANYA..."`,
  },
];

const allEvents = [
  {
    date: 'OCT 25',
    title: `Moksha's "AARANYA..."`,
  },
];

// Updated Sales Overview (Monthly)
const salesTrend = [ { month: 'Jan', value: 0 }, { month: 'Feb', value: 0 }, { month: 'Mar', value: 0 }, { month: 'Apr', value: 0 }, { month: 'May', value: 0 }, { month: 'Jun', value: 0 }, { month: 'Jul', value: 700 }, { month: 'Aug', value: 520 }, { month: 'Sep', value: 640 }, { month: 'Oct', value: 600 }, ];

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.homePageContainer}>
      <div className={styles.homePageContent}>
        {/* Promotion Banner */}
        {/* Top Welcome Banner */}
<div className={styles.topBanner}>
  <div className={styles.bannerLeft}>
    <h2 className={styles.bannerTitle}>Welcome back</h2>
    <p className={styles.bannerSubtitle}>Here’s an overview of how your sales are going</p>
  </div>

  <div className={styles.bannerActions}>
    <button className={styles.exportButton}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 16L12 4M12 16L8 12M12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      Export
    </button>

    <button
      className={styles.createEventTopButton}
      onClick={handleCreateEvent}
    >
      <span>＋</span> Create Event
    </button>
  </div>
</div>

        Overview card
        <div className={styles.overviewSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Basic Overview</h2>
            <div className={styles.sectionActions}>
              <button className={styles.actionButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8Z" fill="currentColor" />
                </svg>
                August
              </button>
              <button className={styles.actionButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor" />
                </svg>
                Filter
              </button>
              <button className={styles.actionButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="currentColor" />
                </svg>
                Export
              </button>
            </div>
          </div>

          {/* top stat tiles */}
          <div className={styles.overviewStatsRow}>
            {overviewStats.map((item, idx) => (
              <div key={idx} className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{ backgroundColor: `${item.accent}1a`, color: item.accent }}
                >
                  <span>▢</span>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>{item.label}</span>
                  <span className={styles.statValue}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* main row: list + chart */}
          <div className={styles.overviewMainRow}>
            {/* upcoming events */}
            <div className={styles.eventsCard}>
              <div className={styles.eventsHeader}>
                <div className={styles.eventsTabs}>
                  <button className={`${styles.eventsTab} ${styles.eventsTabActive}`}>
                    Up coming events (0)
                  </button>
                  <button className={styles.eventsTab}>All Events (1)</button>
                </div>
                <button className={styles.eventsFilterButton}>Filter</button>
              </div>
              <div className={styles.eventsList}>
                {upcomingEvents.map((ev, idx) => (
  <div key={idx} className={styles.eventRow}>

    <div className={styles.eventDate}>
      <span className={styles.eventMonth}>{ev.date.split(' ')[0]}</span>
      <span className={styles.eventDay}>{ev.date.split(' ')[1]}</span>
    </div>

    <div className={styles.eventInfo}>
      <div className={styles.eventTitle}>{ev.title}</div>
    </div>

  </div>
))}
              </div>
            </div>

            {/* sales overview bars */}
            <div className={styles.salesCard}>
              <div className={styles.salesHeader}>
                <h3 className={styles.salesTitle}>Sales Overview</h3>
                <div className={styles.salesActions}>
                  <button className={styles.salesActionButton}>Filter</button>
                  <button className={styles.salesActionButton}>⋯</button>
                </div>
              </div>
              <div className={styles.salesBody}>
                <div className={styles.salesGrid}>
                  {salesTrend.map((point, idx) => (
                    <div key={idx} className={styles.salesBarItem}>
                      <div className={styles.salesBarTrack}>
                        <div
                          className={styles.salesBarFill}
                          style={{ height: `${(point.value / 700) * 100}%` }}
                        />
                      </div>
                      <span className={styles.salesBarLabel}>{point.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* empty state with Create Event button */}
          
        </div>
      </div>
    </div>
  );
};

export default HomePage;