import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import styles from './sideNavBar.module.scss';
import { getUserData, clearUserData } from '../../utils/authUtil';

// Import SVG components
import { ReactComponent as OverviewIcon } from '../../assets/icons/overview-icon.svg';
import { ReactComponent as EventsIcon } from '../../assets/icons/events-icon.svg';
import { ReactComponent as ReportsIcon } from '../../assets/icons/reports-icon.svg';
import { ReactComponent as NotificationsIcon } from '../../assets/icons/notifications-icon.svg';
import { ReactComponent as HelpIcon } from '../../assets/icons/help-icon.svg';
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings-icon.svg';
import { ReactComponent as LogoutIcon } from '../../assets/icons/logout-icon.svg';
import { clearEventDataOnLogout } from '../../utils/eventUtil';

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  
  // Check authentication directly using cookie
  const isAuthenticated = !!Cookies.get('token');
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          // First try to get user data from localStorage
          const storedUserData = getUserData();
          
          if (storedUserData) {
            setCurrentUser(storedUserData);
          } else {
            // If not in localStorage, fetch from API
            const token = Cookies.get('token');
            const response = await LoginAPI(token);
            setCurrentUser(response.data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserData();
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    Cookies.remove('token');
    clearUserData();
    setCurrentUser(null);
    setIsProfileOpen(false);
    // Clear event data
    clearEventDataOnLogout();
    navigate('/login');
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
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
  ];

  // Get user initials for profile icon
  const getUserInitials = () => {
    if (currentUser?.name) {
      const nameParts = currentUser.name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return currentUser.name.substring(0, 2).toUpperCase();
    }
    return 'Sa';
  };

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
          <div className={styles.profileContainer} ref={profileDropdownRef}>
            <button 
              className={styles.profileLink} 
              onClick={toggleProfileDropdown}
              aria-label="Toggle Profile Menu"
            >
              <div className={styles.profileIcon}>
                {getUserInitials()}
              </div>
            </button>
            
            {isProfileOpen && (
              <div className={styles.profileDropdown}>
                <div className={styles.profileInfo}>
                  <div className={styles.profileAvatar}>
                    {getUserInitials()}
                  </div>
                  <div className={styles.profileDetails}>
                    <div className={styles.profileName}>{currentUser?.name || 'Sarath Babu John'}</div>
                    <div className={styles.profileEmail}>{currentUser?.email || 'sarathbabujohn333@gmail.com'}</div>
                  </div>
                </div>
                
                <div className={styles.dropdownDivider}></div>
                
                <NavLink to="/settings" className={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}>
                  <SettingsIcon className={styles.dropdownIcon} />
                  <span>Settings</span>
                </NavLink>
                
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <LogoutIcon className={styles.dropdownIcon} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default SideNavBar;