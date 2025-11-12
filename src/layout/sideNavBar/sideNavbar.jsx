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

// Keep these as SVG components (used in profile dropdown / settings)
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings-icon.svg';
import { ReactComponent as LogoutIcon } from '../../assets/icons/logout-icon.svg';

// Logo
import logoImage from '../../assets/images/small-logo.svg';

// Overlay / Modal components
import SettingsOverlay from '../../../src/components/settingsOverlay/settingsOverlay';
import HelpSupportModal from '../../components/helpSupportModal/helpSupportModal';

// Inline scanner icon (unchanged)
const ScannerIcon = (props) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M29.0021 33.0037H18.9979C16.788 33.0037 14.9963 31.212 14.9963 29.0021V18.9979C14.9963 16.788 16.788 14.9962 18.9979 14.9962H29.0021C31.212 14.9962 33.0038 16.788 33.0038 18.9979V29.0021C33.0038 31.212 31.212 33.0037 29.0021 33.0037Z" fill="#D1C9DE" stroke="#D1C9DE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M22.4584 28.1347L23.5258 27.5735C23.8229 27.4174 24.1781 27.4174 24.4752 27.5735L25.5426 28.1347C25.8868 28.3158 26.303 28.2858 26.6171 28.0567L27.0153 27.7676C27.3294 27.5395 27.4865 27.1523 27.4214 26.7701L27.2173 25.5817C27.1603 25.2505 27.2704 24.9134 27.5105 24.6783L28.3738 23.8369C28.6519 23.5658 28.752 23.1606 28.6319 22.7915L28.4799 22.3233C28.3598 21.9541 28.0407 21.685 27.6565 21.629L26.463 21.4559C26.1309 21.4079 25.8438 21.1988 25.6947 20.8977L25.1605 19.8163C24.9894 19.4681 24.6343 19.248 24.2461 19.248H23.7539C23.3657 19.248 23.0106 19.4681 22.8395 19.8163L22.3063 20.8977C22.1572 21.1988 21.8701 21.4079 21.538 21.4559L20.3445 21.629C19.9603 21.685 19.6412 21.9541 19.5211 22.3233L19.3691 22.7915C19.249 23.1606 19.3491 23.5658 19.6272 23.8369L20.4905 24.6783C20.7306 24.9124 20.8407 25.2505 20.7837 25.5817L20.5796 26.7701C20.5136 27.1533 20.6716 27.5395 20.9857 27.7676L21.3839 28.0567C21.698 28.2848 22.1142 28.3148 22.4584 28.1347Z" stroke="#36353B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

);

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
      ? [{ id: 'scanner', path: '/scanner', label: 'Scanner', iconComponent: ScannerIcon }]
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
