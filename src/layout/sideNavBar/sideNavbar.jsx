import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import styles from './sideNavBar.module.scss';
import { getUserData, clearUserData } from '../../utils/authUtil';
import { clearEventDataOnLogout } from '../../utils/eventUtil';
import { useAuth } from '../../context/authContext';

// ---------------- ICON IMPORTS (3 states per item) ----------------
// Overview Icons
import OverviewDefault from '../../assets/icons/Overview-Default.svg';
import OverviewHover from '../../assets/icons/Overview-Hover.svg';
import OverviewActive from '../../assets/icons/Overview-Active.svg';

// Events Icons
import EventsDefault from '../../assets/icons/Events-default.svg';
import EventsHover from '../../assets/icons/Events-hover.svg';
import EventsActive from '../../assets/icons/Events-active.svg';

// Reports Icons (added 3-state files)
import ReportsDefault from '../../assets/icons/Reports-Default.svg';
import ReportsHover from '../../assets/icons/Reports-Hover.svg';
import ReportsActive from '../../assets/icons/Reports-Active.svg';

// Campaigns Icons (added 3-state files)
import CampaignsDefault from '../../assets/icons/Campaigns-Default.svg';
import CampaignsHover from '../../assets/icons/Campaigns-Hover.svg';
import CampaignsActive from '../../assets/icons/Campaigns-Active.svg';

// Help Icons (for bottom action) (added 3-state files)
import HelpDefault from '../../assets/icons/Help-default.svg';
import HelpHover from '../../assets/icons/Help-Hover.svg';
import HelpActive from '../../assets/icons/Help-Active.svg';

// Scanner Icons (3 states)
import ScannerDefault from '../../assets/icons/Scanner-Default.svg';
import ScannerHover from '../../assets/icons/Scanner-Hover.svg';
import ScannerActive from '../../assets/icons/Scanner-Active.svg';

// Keep these as SVG components (used in profile dropdown / settings)
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings-icon.svg';
import { ReactComponent as LogoutIcon } from '../../assets/icons/logout-icon.svg';

// Logo
import logoImage from '../../assets/images/small-logo.svg';

// Overlay / Modal components
import SettingsOverlay from '../../../src/components/settingsOverlay/settingsOverlay';
import HelpSupportModal from '../../components/helpSupportModal/helpSupportModal';

import { ReactComponent as ProfileIcon } from '../../assets/icons/profile-gradient.svg';

const SideNavBar = ({ isMobileSidebarOpen, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();

  const [hoveredItem, setHoveredItem] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOverlayOpen, setIsSettingsOverlayOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const sideNavRef = useRef(null);

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
    logout();
    clearEventDataOnLogout();
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

  // ---------------- Navigation items with 3-state icon support ----------------
  const navItems = [
    ...(['ORGANIZER', 'SUPER_ADMIN'].includes(userRole)
      ? [
          {
            id: 'overview',
            path: '/',
            label: 'Overview',
            defaultIcon: OverviewDefault,
            hoverIcon: OverviewHover,
            activeIcon: OverviewActive,
          },
          {
            id: 'events',
            path: '/events',
            label: 'Events',
            defaultIcon: EventsDefault,
            hoverIcon: EventsHover,
            activeIcon: EventsActive,
          },
          {
            id: 'reports',
            path: '/reports/87',
            label: 'Reports',
            defaultIcon: ReportsDefault,
            hoverIcon: ReportsHover,
            activeIcon: ReportsActive,
          },
          {
            id: 'campaigns',
            path: '/campaigns',
            label: 'Campaigns',
            defaultIcon: CampaignsDefault,
            hoverIcon: CampaignsHover,
            activeIcon: CampaignsActive,
          },
        ]
      : []),
    ...(['ORGANIZER', 'SCANNER'].includes(userRole)
      ? [{
          id: 'scanner',
          path: '/scanner',
          label: 'Scanner',
          defaultIcon: ScannerDefault,
          hoverIcon: ScannerHover,
          activeIcon: ScannerActive,
        }]
      : []),
  ];

  // Bottom items (help) — action based; hover supported
  const bottomItems = [
    ...(['ORGANIZER', 'SUPER_ADMIN'].includes(userRole)
      ? [
          {
            id: 'help',
            label: 'Help & Support',
            action: () => setIsHelpModalOpen(true),
            defaultIcon: HelpDefault,
            hoverIcon: HelpHover,
            activeIcon: HelpActive, // not used as route active, but available if needed
          },
        ]
      : []),
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

  // Helper to choose icon src for image-based icons.
  const chooseIconSrc = ({ defaultIcon, hoverIcon, activeIcon, id, isActive }) => {
    if (isActive && activeIcon) return activeIcon;
    if (hoveredItem === id && hoverIcon) return hoverIcon;
    return defaultIcon;
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
          {navItems.map((item) => (
            <li
              key={item.id}
              className={styles.navItem}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
                title={item.label}
              >
                {({ isActive }) => (
                  <div className={styles.iconWrapper}>
                    {item.defaultIcon ? (
                      <img
                        src={chooseIconSrc({ ...item, id: item.id, isActive })}
                        alt={item.label}
                        className={styles.iconImage}
                      />
                    ) : item.iconComponent ? (
                      <item.iconComponent className={styles.icon} />
                    ) : null}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={styles.bottomNav}>
          {bottomItems.map((item) => {
            // If the item has an 'action' function, render a button and support hover state.
            if (item.action) {
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={styles.navLink} // Re-use style for consistency
                  title={item.label}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                    {item.defaultIcon ? (
                      <img
                        src={chooseIconSrc({ ...item, id: item.id, isActive: isHelpModalOpen })}
                        alt={item.label}
                        className={styles.iconImage}
                      />
                    ) : (
                      <HelpDefault className={styles.icon} />
                    )}
                </button>
              );
            }

            // Otherwise render NavLink if bottom item is route-based (not used currently)
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
                title={item.label}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {({ isActive }) => (
                  <div className={styles.iconWrapper}>
                    {item.defaultIcon ? (
                      <img
                        src={chooseIconSrc({ ...item, id: item.id, isActive })}
                        alt={item.label}
                        className={styles.iconImage}
                      />
                    ) : null}
                  </div>
                )}
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
  <ProfileIcon className={styles.profileSvg} />
  <span className={styles.profileInitials}>
    {getUserInitials()}
  </span>
</div>


              </button>

              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileAvatar}>
  <ProfileIcon className={styles.profileAvatarSvg} />
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
      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
};

SideNavBar.propTypes = {
  isMobileSidebarOpen: PropTypes.bool.isRequired,
  toggleMobileSidebar: PropTypes.func.isRequired,
};

export default SideNavBar;
