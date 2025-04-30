import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import styles from './sideNavBar.module.scss';

// Import SVG components
import { ReactComponent as OverviewIcon } from '../../assets/icons/overview-icon.svg';
import { ReactComponent as EventsIcon } from '../../assets/icons/events-icon.svg';
import { ReactComponent as ReportsIcon } from '../../assets/icons/reports-icon.svg';
import { ReactComponent as NotificationsIcon } from '../../assets/icons/notifications-icon.svg';
import { ReactComponent as HelpIcon } from '../../assets/icons/help-icon.svg';
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings-icon.svg';

// Import logo
import logoImage from '../../assets/images/small-logo.svg';

/**
 * SideNavBar component provides the main navigation for the application
 * 
 * @returns {JSX.Element} SideNavBar component
 */
const SideNavBar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Check authentication directly using cookie
  const isAuthenticated = !!Cookies.get('token');
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const token = Cookies.get('token');
          const response = await LoginAPI(token);
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserData();
  }, [isAuthenticated]);
  
  // Handle logout
  const handleLogout = () => {
    Cookies.remove('token');
    setCurrentUser(null);
    navigate('/login');
  };
  
  // Navigation items with their respective routes and icons
  const navItems = [
    { id: 'overview', path: '/', icon: OverviewIcon, label: 'Overview' }, 
    { id: 'events', path: '/events', icon: EventsIcon, label: 'Events' },
    { id: 'reports', path: '/reports', icon: ReportsIcon, label: 'Reports' },
    { id: 'notifications', path: '/notifications', icon: NotificationsIcon, label: 'Notifications' }
  ];

  // Bottom navigation items
  const bottomItems = [
    { id: 'help', path: '/help', icon: HelpIcon, label: 'Help & Support' },
    { id: 'settings', path: '/settings', icon: SettingsIcon, label: 'Account Settings' }
  ];

  return (
    <nav className={styles.sideNav}>
      <div className={styles.logo}>
        <NavLink to="/" className={styles.logoLink}>
          <img 
            src={logoImage}
            alt="App Logo"
            className={styles.logoImage}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="%237C3AED" /><text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="16">P</text></svg>';
            }}
          />
        </NavLink>
      </div>
      
      <ul className={styles.navList}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <li key={item.id} className={styles.navItem}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                title={item.label}
              >
                <div className={styles.iconWrapper}>
                  <IconComponent className={styles.icon} />
                </div>
                <span className={styles.navLabel}></span>
              </NavLink>
            </li>
          );
        })}
      </ul>
      
      <div className={styles.bottomNav}>
        {bottomItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink 
              key={item.id}
              to={item.path} 
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
              title={item.label}
            >
              <div className={styles.iconWrapper}>
                <IconComponent className={styles.icon} />
              </div>
              <span className={styles.navLabel}></span>
            </NavLink>
          );
        })}
        
        {isAuthenticated && (
          <NavLink to="/profile" className={styles.profileLink} title="Profile">
            <div className={styles.profileIcon}>
              {currentUser?.name ? currentUser.name.substring(0, 2) : 'Sa'}
            </div>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default SideNavBar;