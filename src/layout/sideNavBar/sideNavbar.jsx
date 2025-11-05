import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import styles from './sideNavBar.module.scss';
import { getUserData, clearUserData } from '../../utils/authUtil';
import { clearEventDataOnLogout } from '../../utils/eventUtil';
import { useAuth } from '../../context/authContext';

// Import SVG components
import { ReactComponent as OverviewIcon } from '../../assets/icons/overview-icon.svg';
import { ReactComponent as EventsIcon } from '../../assets/icons/events-icon.svg';
import { ReactComponent as ReportsIcon } from '../../assets/icons/reports-icon.svg';
import { ReactComponent as HelpIcon } from '../../assets/icons/help-icon.svg';
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings-icon.svg';
import { ReactComponent as LogoutIcon } from '../../assets/icons/logout-icon.svg';
import { ReactComponent as CampaignsIcon } from '../../assets/icons/campaigns-icon.svg';

// Import logo
import logoImage from '../../assets/images/small-logo.svg';

// Import the new SettingsOverlay component
import SettingsOverlay from '../../../src/components/settingsOverlay/settingsOverlay';


// NEW: Inline SVG component for the Scanner Icon
const ScannerIcon = (props) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M29.0022 33.0037H18.998C16.7881 33.0037 14.9963 31.212 14.9963 29.002V18.9979C14.9963 16.788 16.7881 14.9962 18.998 14.9962H29.0022C31.2121 14.9962 33.0038 16.788 33.0038 18.9979V29.002C33.0038 31.212 31.2121 33.0037 29.0022 33.0037Z" 
      stroke="currentColor" fill="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
    <path fillRule="evenodd" clipRule="evenodd" d="M22.4584 28.1347L23.5258 27.5735C23.8229 27.4174 24.1781 27.4174 24.4752 27.5735L25.5427 28.1347C25.8868 28.3158 26.303 28.2858 26.6171 28.0567L27.0153 27.7676C27.3294 27.5395 27.4865 27.1523 27.4214 26.7702L27.2174 25.5817C27.1603 25.2505 27.2704 24.9134 27.5105 24.6783L28.3738 23.837C28.652 23.5658 28.752 23.1607 28.6319 22.7915L28.4799 22.3233C28.3598 21.9542 28.0407 21.6851 27.6565 21.629L26.463 21.456C26.1309 21.4079 25.8438 21.1989 25.6947 20.8977L25.1605 19.8163C24.9894 19.4681 24.6343 19.248 24.2461 19.248H23.7539C23.3658 19.248 23.0106 19.4681 22.8395 19.8163L22.3063 20.8977C22.1573 21.1989 21.8701 21.4079 21.538 21.456L20.3445 21.629C19.9603 21.6851 19.6412 21.9542 19.5212 22.3233L19.3691 22.7915C19.249 23.1607 19.3491 23.5658 19.6272 23.837L20.4906 24.6783C20.7307 24.9124 20.8407 25.2505 20.7837 25.5817L20.5796 26.7702C20.5136 27.1533 20.6716 27.5395 20.9858 27.7676L21.3839 28.0567C21.6981 28.2848 22.1142 28.3148 22.4584 28.1347Z" 
      stroke="#36353B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const SideNavBar = ({ isMobileSidebarOpen, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOverlayOpen, setIsSettingsOverlayOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const sideNavRef = useRef(null);


  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     if (isAuthenticated) {
  //       try {
  //         const storedUserData = getUserData();
  //         if (storedUserData) {
  //           setCurrentUser(storedUserData);
  //         } else {
  //           const token = Cookies.get('token');
  //           const response = await LoginAPI(token);
  //           setCurrentUser(response.data);
  //         }
  //       } catch (error) {
  //         console.error('Error fetching user profile:', error);
  //       }
  //     }
  //   };
  //   fetchUserData();
  // }, [isAuthenticated]);

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
  }, [location.pathname]);

  const handleLogout = () => {
    // 1. Call the logout function from the context.
    // This will set isAuthenticated to false.
    logout();

    // 2. Perform any other app-specific cleanup.
    clearEventDataOnLogout();

    // 3. DO NOT NAVIGATE HERE.
    // The ProtectedRoute component will now see that isAuthenticated is false
    // and will automatically handle the redirect to '/login'.
    // navigate('/login'); // <-- This line has been removed.
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleOpenSettings = () => {
    setIsSettingsOverlayOpen(true);
    setIsProfileOpen(false);
  };

  const handleOpenHelpModal = () => {
    setIsHelpModalOpen(true);
  };

  const userRole = currentUser?.role || '';

  // Navigation items
  const navItems = [
  ...(['ORGANIZER', 'ADMINISTRATOR'].includes(userRole)
    ? [
        { id: 'dashboard', path: '/', icon: OverviewIcon, label: 'dashboard' },
      ]
    : [])
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
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className={styles.bottomNav}>    

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