import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import styles from './sideNavBar.module.scss';
import { getUserData, clearUserData } from '../../utils/authUtil';
import { clearEventDataOnLogout } from '../../utils/eventUtil';

// Import SVG components
import { ReactComponent as OverviewIcon } from '../../assets/icons/overview-icon.svg';
import { ReactComponent as EventsIcon } from '../../assets/icons/events-icon.svg';
import { ReactComponent as ReportsIcon } from '../../assets/icons/reports-icon.svg';
import { ReactComponent as HelpIcon } from '../../assets/icons/help-icon.svg';
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings-icon.svg';
import { ReactComponent as LogoutIcon } from '../../assets/icons/logout-icon.svg';
import { ReactComponent as CampaignsIcon } from '../../assets/icons/campaigns-icon.svg'; // Campaigns icon

// Import logo
import logoImage from '../../assets/images/small-logo.svg';

// Import the new SettingsOverlay component
import SettingsOverlay from '../../../src/components/settingsOverlay/settingsOverlay';

/**
 * SideNavBar component provides the main navigation for the application.
 * It is now responsive, hiding on mobile by default and appearing as an overlay.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isMobileSidebarOpen - State to control sidebar visibility on mobile
 * @param {Function} props.toggleMobileSidebar - Function to toggle sidebar visibility
 * @returns {JSX.Element} SideNavBar component
 */
const SideNavBar = ({ isMobileSidebarOpen, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // NEW: State for Settings Overlay
  const [isSettingsOverlayOpen, setIsSettingsOverlayOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const sideNavRef = useRef(null);

  const isAuthenticated = !!Cookies.get('token');

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const storedUserData = getUserData();
          if (storedUserData) {
            setCurrentUser(storedUserData);
          } else {
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (window.innerWidth <= 768 && sideNavRef.current && !sideNavRef.current.contains(event.target) && isMobileSidebarOpen) {
        toggleMobileSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileSidebarOpen, toggleMobileSidebar]);

  useEffect(() => {
    if (isMobileSidebarOpen && window.innerWidth <= 768) {
      toggleMobileSidebar();
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    Cookies.remove('token');
    clearUserData();
    setCurrentUser(null);
    setIsProfileOpen(false);
    clearEventDataOnLogout();
    navigate('/login');
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // NEW: Handle opening the settings overlay
  const handleOpenSettings = () => {
    setIsSettingsOverlayOpen(true);
    setIsProfileOpen(false); // Close profile dropdown when settings opens
  };

  // Navigation items
  const navItems = [
    { id: 'overview', path: '/', icon: OverviewIcon, label: 'Overview' },
    { id: 'events', path: '/events', icon: EventsIcon, label: 'Events' },
    { id: 'reports', path: '/reports', icon: ReportsIcon, label: 'Reports' },
    { id: 'campaigns', path: '/campaigns', icon: CampaignsIcon, label: 'Campaigns' }
  ];

  // Bottom navigation items
  const bottomItems = [
    { id: 'help', path: '/help', icon: HelpIcon, label: 'Help & Support' },
  ];

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
    <>
      <nav ref={sideNavRef} className={`${styles.sideNav} ${isMobileSidebarOpen ? styles.open : ''}`}>
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
                  <span className={styles.navLabel}>{item.label}</span>
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
                <span className={styles.navLabel}>{item.label}</span>
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

                  {/* Changed NavLink to button/div with onClick */}
                  <button className={styles.dropdownItem} onClick={handleOpenSettings}>
                    <SettingsIcon className={styles.dropdownIcon} />
                    <span>Settings</span>
                  </button>

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

      {/* NEW: Render Settings Overlay */}
      <SettingsOverlay
        isOpen={isSettingsOverlayOpen}
        onClose={() => setIsSettingsOverlayOpen(false)}
      />
    </>
  );
};

SideNavBar.propTypes = {
  isMobileSidebarOpen: PropTypes.bool.isRequired,
  toggleMobileSidebar: PropTypes.func.isRequired,
};

export default SideNavBar;