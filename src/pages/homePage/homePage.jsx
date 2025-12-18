// // import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import Cookies from 'js-cookie';
// // import { LoginAPI } from '../../services/allApis';
// // import styles from './homePage.module.scss';

// // /**
// //  * HomePage component for the main dashboard view
// //  * Uses direct authentication instead of AuthContext
// //  * 
// //  * @returns {JSX.Element} The HomePage component
// //  */
// // const HomePage = () => {
// //   const navigate = useNavigate();
  
// //   // State for user and authentication
// //   const [currentUser, setCurrentUser] = useState(null);
// //   const [isAuthenticated, setIsAuthenticated] = useState(false);
// //   const [isLoading, setIsLoading] = useState(true);
  
// //   // Check authentication status on component mount
// //   useEffect(() => {
// //     checkAuthStatus();
// //   }, []);
  
// //   /**
// //    * Check if the user is authenticated based on token presence
// //    */
// //   const checkAuthStatus = async () => {
// //     setIsLoading(true);
// //     try {
// //       const token = Cookies.get('token');
      
// //       if (token) {
// //         // Token exists, try to fetch user profile
// //         try {
// //           const response = await LoginAPI(token);
// //           setCurrentUser(response.data);
// //           setIsAuthenticated(true);
// //         } catch (error) {
// //           console.error('Error fetching user profile:', error);
// //           // Even if profile fetch fails, if token exists, consider authenticated
// //           setIsAuthenticated(true);
// //         }
// //       } else {
// //         // No token, not authenticated
// //         setCurrentUser(null);
// //         setIsAuthenticated(false);
// //       }
// //     } catch (error) {
// //       console.error('Auth check error:', error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };
  
// //   /**
// //    * Handler for navigating to the event creation page
// //    */
// //   const handleCreateEvent = () => {
// //     if (isAuthenticated) {
// //       navigate('/events/create');
// //     } else {
// //       navigate('/login');
// //     }
// //   };
  
// //   // Display loading indicator while checking authentication
// //   if (isLoading) {
// //     return (
// //       <div className={styles.loadingContainer}>
// //         <div className={styles.loadingSpinner}></div>
// //       </div>
// //     );
// //   }
  
// //   return (
// //     <div className={styles.homePageContainer}>
// //       <div className={styles.homePageContent}>
// //       {/* Promotion Banner */}
// //       <div className={styles.promotionBanner}>
// //         <div className={styles.bannerContent}>
// //           <h2 className={styles.bannerTitle}>Elevate your Ticketing Experience</h2>
// //           <p className={styles.bannerText}>
// //             Welcome to Prizmatix! We're excited to help you list your event. Just follow these steps: provide the event name, date, and a brief description. Include venue details and ticket pricing. Hit submit, and your event will be live!
// //           </p>
// //           <button className={styles.learnMoreButton}>Learn More</button>
// //         </div>
// //       </div>
      
// //       {/* Overview Section */}
// //       <div className={styles.overviewSection}>
// //         <div className={styles.sectionHeader}>
// //           <h2 className={styles.sectionTitle}>Basic Overview</h2>
// //           <div className={styles.sectionActions}>
// //             <button className={styles.actionButton}>
// //               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
// //                 <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8Z" fill="currentColor"/>
// //               </svg>
// //               August
// //             </button>
// //             <button className={styles.actionButton}>
// //               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
// //                 <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor"/>
// //               </svg>
// //               Filter
// //             </button>
// //             <button className={styles.actionButton}>
// //               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
// //                 <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="currentColor"/>
// //               </svg>
// //               Export
// //             </button>
// //           </div>
// //         </div>
        
// //         {/* Empty State */}
// //         <div className={styles.emptyState}>
// //           <div className={styles.emptyStateIcon}>
// //             <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
// //               <rect width="60" height="40" rx="4" fill="#F0F0F0" transform="translate(10 20)"/>
// //               <rect width="40" height="30" rx="4" fill="#FAFAFA" transform="translate(20 25)"/>
// //             </svg>
// //           </div>
// //           <h3 className={styles.emptyStateTitle}>
// //             Welcome {currentUser?.name}! Please create an event to get started.
// //           </h3>
// //           <button 
// //             className={styles.createEventButton}
// //             onClick={handleCreateEvent}
// //           >
// //             Create Event
// //           </button>
// //         </div>
// //       </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default HomePage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import { LoginAPI } from '../../services/allApis';
// import styles from './homePage.module.scss';

// const HomePage = () => {
//   const navigate = useNavigate();

//   const [currentUser, setCurrentUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     setIsLoading(true);
//     try {
//       const token = Cookies.get('token');

//       if (token) {
//         try {
//           const response = await LoginAPI(token);
//           setCurrentUser(response.data);
//           setIsAuthenticated(true);
//         } catch (error) {
//           console.error('Error fetching user profile:', error);
//           setIsAuthenticated(true);
//         }
//       } else {
//         setCurrentUser(null);
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error('Auth check error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCreateEvent = () => {
//     if (isAuthenticated) {
//       navigate('/events/create');
//     } else {
//       navigate('/login');
//     }
//   };

//   // Updated Overview Stats
// const overviewStats = [
//   { label: 'Total Events', value: 1, accent: '#3b82f6' },
//   { label: 'Tickets Sold', value: '121', accent: '#22c55e' },
//   { label: 'Revenue', value: '$24,501.99', accent: '#f59e0b' },
//   { label: 'Active Events', value: 0, accent: '#ec4899' },
// ];

// // Updated Upcoming + All Events (single event only)
// const upcomingEvents = [
//   {
//     date: 'OCT 25',
//     title: `Moksha's "AARANYA..."`,
//   },
// ];

// const allEvents = [
//   {
//     date: 'OCT 25',
//     title: `Moksha's "AARANYA..."`,
//   },
// ];

// // Updated Sales Overview (Monthly)
// const salesTrend = [ { month: 'Jan', value: 0 }, { month: 'Feb', value: 0 }, { month: 'Mar', value: 0 }, { month: 'Apr', value: 0 }, { month: 'May', value: 0 }, { month: 'Jun', value: 0 }, { month: 'Jul', value: 700 }, { month: 'Aug', value: 520 }, { month: 'Sep', value: 640 }, { month: 'Oct', value: 600 }, ];

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
//         {/* Promotion Banner */}
//         {/* Top Welcome Banner */}
// <div className={styles.topBanner}>
//   <div className={styles.bannerLeft}>
//     <h2 className={styles.bannerTitle}>Welcome back</h2>
//     <p className={styles.bannerSubtitle}>Here’s an overview of how your sales are going</p>
//   </div>

//   <div className={styles.bannerActions}>
//     <button className={styles.exportButton}>
//       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//         <path d="M12 16L12 4M12 16L8 12M12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//         <path d="M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//       </svg>
//       Export
//     </button>

//     <button
//       className={styles.createEventTopButton}
//       onClick={handleCreateEvent}
//     >
//       <span>＋</span> Create Event
//     </button>
//   </div>
// </div>

//         Overview card
//         <div className={styles.overviewSection}>
//           <div className={styles.sectionHeader}>
//             <h2 className={styles.sectionTitle}>Basic Overview</h2>
//             <div className={styles.sectionActions}>
//               <button className={styles.actionButton}>
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                   <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8Z" fill="currentColor" />
//                 </svg>
//                 August
//               </button>
//               <button className={styles.actionButton}>
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                   <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor" />
//                 </svg>
//                 Filter
//               </button>
//               <button className={styles.actionButton}>
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                   <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="currentColor" />
//                 </svg>
//                 Export
//               </button>
//             </div>
//           </div>

//           {/* top stat tiles */}
//           <div className={styles.overviewStatsRow}>
//             {overviewStats.map((item, idx) => (
//               <div key={idx} className={styles.statCard}>
//                 <div
//                   className={styles.statIcon}
//                   style={{ backgroundColor: `${item.accent}1a`, color: item.accent }}
//                 >
//                   <span>▢</span>
//                 </div>
//                 <div className={styles.statContent}>
//                   <span className={styles.statLabel}>{item.label}</span>
//                   <span className={styles.statValue}>{item.value}</span>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* main row: list + chart */}
//           <div className={styles.overviewMainRow}>
//             {/* upcoming events */}
//             <div className={styles.eventsCard}>
//               <div className={styles.eventsHeader}>
//                 <div className={styles.eventsTabs}>
//                   <button className={`${styles.eventsTab} ${styles.eventsTabActive}`}>
//                     Up coming events (0)
//                   </button>
//                   <button className={styles.eventsTab}>All Events (1)</button>
//                 </div>
//                 <button className={styles.eventsFilterButton}>Filter</button>
//               </div>
//               <div className={styles.eventsList}>
//                 {upcomingEvents.map((ev, idx) => (
//   <div key={idx} className={styles.eventRow}>

//     <div className={styles.eventDate}>
//       <span className={styles.eventMonth}>{ev.date.split(' ')[0]}</span>
//       <span className={styles.eventDay}>{ev.date.split(' ')[1]}</span>
//     </div>

//     <div className={styles.eventInfo}>
//       <div className={styles.eventTitle}>{ev.title}</div>
//     </div>

//   </div>
// ))}
//               </div>
//             </div>

//             {/* sales overview bars */}
//             <div className={styles.salesCard}>
//               <div className={styles.salesHeader}>
//                 <h3 className={styles.salesTitle}>Sales Overview</h3>
//                 <div className={styles.salesActions}>
//                   <button className={styles.salesActionButton}>Filter</button>
//                   <button className={styles.salesActionButton}>⋯</button>
//                 </div>
//               </div>
//               <div className={styles.salesBody}>
//                 <div className={styles.salesGrid}>
//                   {salesTrend.map((point, idx) => (
//                     <div key={idx} className={styles.salesBarItem}>
//                       <div className={styles.salesBarTrack}>
//                         <div
//                           className={styles.salesBarFill}
//                           style={{ height: `${(point.value / 700) * 100}%` }}
//                         />
//                       </div>
//                       <span className={styles.salesBarLabel}>{point.month}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* empty state with Create Event button */}
          
//         </div>
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

  // analytics tiles
  const overviewStats = [
    {
      label: 'Next Event in',
      value: '12 Days',
      accent: '#0ea5e9',
      sub: 'Noor Festival 18-May',
      icon: 'calendar',
    },
    {
      label: 'Active Events',
      value: '01',
      accent: '#22c55e',
      sub: 'Active for 23 days',
      icon: 'ticket',
    },
    {
      label: 'Total Revenue',
      value: '$ 23,543',
      accent: '#facc15',
      sub: 'Last 30 days 15.8% ↑',
      icon: 'dollar',
    },
    {
      label: 'Total Tickets Sold',
      value: '23,543',
      accent: '#a855f7',
      sub: 'Last 30 days 15.8% ↓',
      icon: 'card',
    },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  // three series for the chart (roughly matches screenshot)
  const series = {
    orders:  [0, 50, 320, 260, 430, 390, 310],
    tickets: [0, 40, 290, 250, 360, 370, 295],
    views:   [0, 480, 560, 470, 520, 500, 540],
  };
  const maxY = 600;

  const [hoverIndex, setHoverIndex] = useState(4);

  // precompute SVG path strings
  const buildPath = (values) => {
    const stepX = 100 / (values.length - 1);
    return values
      .map((v, i) => {
        const x = i * stepX;
        const y = 100 - (v / maxY) * 100;
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  };

  const pathOrders = buildPath(series.orders);
  const pathTickets = buildPath(series.tickets);
  const pathViews = buildPath(series.views);

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
        {/* Top banner */}
        <div className={styles.topBanner}>
          <div className={styles.bannerLeft}>
            <h2 className={styles.bannerTitle}>
              {currentUser ? `Welcome back ${currentUser.name}` : 'Welcome back'}
            </h2>
            <p className={styles.bannerSubtitle}>
              Here is an overview of how your sales are going
            </p>
          </div>

          <div className={styles.bannerActions}>
            <button className={styles.exportButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16L12 4M12 16L8 12M12 16L16 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 20H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
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

        {/* Analytics card */}
        <div className={styles.overviewSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Analytics</h2>
            <div className={styles.sectionActions}>
              <button className={styles.actionButton}>Today</button>
              <button className={styles.actionButton}>Filter</button>
            </div>
          </div>

          {/* top tiles */}
          <div className={styles.overviewStatsRow}>
            {overviewStats.map((item, idx) => (
              <div key={idx} className={styles.analyticsTile}>
                <div className={styles.analyticsIconWrapper}>
                  {item.icon === 'calendar' && (
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      className={styles.analyticsIcon}
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                    </svg>
                  )}
                  {item.icon === 'ticket' && (
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      className={styles.analyticsIcon}
                    >
                      <path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3a2 2 0 0 0-2 2 2 2 0 0 0 2 2v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3a2 2 0 0 0 2-2 2 2 0 0 0-2-2Z" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                    </svg>
                  )}
                  {item.icon === 'dollar' && (
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      className={styles.analyticsIcon}
                    >
                      <path d="M12 1v22" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
                    </svg>
                  )}
                  {item.icon === 'card' && (
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      className={styles.analyticsIcon}
                    >
                      <rect
                        x="2"
                        y="4"
                        width="20"
                        height="16"
                        rx="2"
                        ry="2"
                      />
                      <line x1="2" y1="10" x2="22" y2="10" />
                      <line x1="7" y1="16" x2="9" y2="16" />
                      <line x1="11" y1="16" x2="13" y2="16" />
                    </svg>
                  )}
                </div>

                <div className={styles.analyticsContent}>
                  <div className={styles.analyticsLabel}>{item.label}</div>
                  <div className={styles.analyticsValue}>{item.value}</div>
                  <div className={styles.analyticsSub}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* chart + earnings row */}
          <div className={styles.analyticsMainRow}>
            {/* Sales Overview chart */}
            <div className={styles.salesChartCard}>
              <div className={styles.salesChartHeader}>
                <h3 className={styles.salesTitle}>Sales Overview</h3>
                <div className={styles.salesChartControls}>
                  <select className={styles.salesSelect}>
                    <option>Order v/s Tickets v/s views</option>
                  </select>
                  <button className={styles.salesActionButton}>Filter</button>
                </div>
              </div>

              <div className={styles.salesChartBody}>
                {/* Y axis labels */}
                <div className={styles.salesYAxis}>
                  {[600, 500, 400, 300, 200, 100, 0].map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>

                <div className={styles.salesLinesWrapper}>
                  {/* SVG lines */}
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className={styles.salesSvg}
                  >
                    {/* grid lines */}
                    {[0, 20, 40, 60, 80, 100].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="100"
                        y2={y}
                        className={styles.salesGridLine}
                      />
                    ))}
                    <path
                      d={pathViews}
                      className={styles.pathViews}
                      fill="none"
                    />
                    <path
                      d={pathTickets}
                      className={styles.pathTickets}
                      fill="none"
                    />
                    <path
                      d={pathOrders}
                      className={styles.pathOrders}
                      fill="none"
                    />
                  </svg>

                  {/* vertical hover line */}
                  <div
                    className={styles.salesHoverLine}
                    style={{
                      left: `${(hoverIndex / (months.length - 1)) * 100}%`,
                    }}
                  />

                  {/* dots + month labels */}
                  {months.map((month, index) => {
                    const x = (index / (months.length - 1)) * 100;
                    const toBottom = (val) =>
                      100 - (val / maxY) * 100; // in SVG %
                    return (
                      <div
                        key={month}
                        className={styles.salesPointColumn}
                        style={{ left: `${x}%` }}
                        onMouseEnter={() => setHoverIndex(index)}
                      >
                        <div
                          className={`${styles.salesDot} ${styles.dotViews}`}
                          style={{ bottom: `${toBottom(series.views[index])}%` }}
                        />
                        <div
                          className={`${styles.salesDot} ${styles.dotTickets}`}
                          style={{
                            bottom: `${toBottom(series.tickets[index])}%`,
                          }}
                        />
                        <div
                          className={`${styles.salesDot} ${styles.dotOrders}`}
                          style={{
                            bottom: `${toBottom(series.orders[index])}%`,
                          }}
                        />
                        <span className={styles.salesBarLabel}>{month}</span>
                      </div>
                    );
                  })}

                  {/* legend */}
                  <div className={styles.salesLegend}>
                    <span>
                      <span
                        className={`${styles.legendDot} ${styles.dotOrders}`}
                      ></span>
                      Orders
                    </span>
                    <span>
                      <span
                        className={`${styles.legendDot} ${styles.dotTickets}`}
                      ></span>
                      Tickets sold
                    </span>
                    <span>
                      <span
                        className={`${styles.legendDot} ${styles.dotViews}`}
                      ></span>
                      Views
                    </span>
                  </div>

                  {/* tooltip */}
                  <div
                    className={styles.salesTooltip}
                    style={{
                      left: `${(hoverIndex / (months.length - 1)) * 100}%`,
                    }}
                  >
                    <div className={styles.tooltipInner}>
                      <div className={styles.tooltipDate}>May 02 2025</div>
                      <div className={styles.tooltipSub}>Wednesday</div>
                      <div className={styles.tooltipRow}>
                        <span
                          className={`${styles.legendDot} ${styles.dotOrders}`}
                        ></span>
                        Orders
                      </div>
                      <div className={styles.tooltipRow}>
                        <span
                          className={`${styles.legendDot} ${styles.dotTickets}`}
                        ></span>
                        Tickets sold
                      </div>
                      <div className={styles.tooltipRow}>
                        <span
                          className={`${styles.legendDot} ${styles.dotViews}`}
                        ></span>
                        Page Views
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings card */}
            <div className={styles.earningsCard}>
              <div className={styles.earningsHeader}>
                <h3 className={styles.salesTitle}>Earnings Overview</h3>
                <button className={styles.salesActionButton}>Today ▾</button>
              </div>

              <div className={styles.earningsRow}>
                <div>
                  <div className={styles.earningsLabel}>Total Revenue</div>
                  <div className={styles.earningsSub}>
                    Our platform service fee deducted from total revenue.
                  </div>
                </div>
                <div className={styles.earningsValue}>$ 23,543</div>
              </div>

              <div className={styles.earningsRow}>
                <div>
                  <div className={styles.earningsLabel}>Absorbed Fee</div>
                  <div className={styles.earningsSub}>
                    Gateway fee deducted from total revenue.
                  </div>
                </div>
                <div className={styles.earningsValue}>$ 23,543</div>
              </div>

              <div className={styles.earningsRow}>
                <div>
                  <div className={styles.earningsLabel}>Net Earnings</div>
                  <div className={styles.earningsSub}>
                    Your final payout after all fees.
                  </div>
                </div>
                <div className={styles.earningsValue}>$ 23,543</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
