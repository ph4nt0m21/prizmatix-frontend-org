import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { LoginAPI } from '../../services/allApis';
import styles from './sideNavBar.module.scss';

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
    { id: 'home', path: '/', icon: '🏠', label: 'Home' }, 
    { id: 'events', path: '/events', icon: '📅', label: 'Events' },
    { id: 'analytics', path: '/analytics', icon: '📊', label: 'Analytics' },
    { id: 'notifications', path: '/notifications', icon: '🔔', label: 'Notifications' }
  ];

  return (
    <nav className={styles.sideNav}>
      <div className={styles.logo}>
        <NavLink to="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            {/* Replace with your actual logo */}
            <span className={styles.triangleLogo}>▼</span>
          </div>
        </NavLink>
      </div>
      
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.id} className={styles.navItem}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
              title={item.label}
            >
              <span className={styles.icon}>{item.icon}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      
      <div className={styles.bottomNav}>
        <NavLink to="/help" className={styles.navLink} title="Help">
          <span className={styles.icon}>💬</span>
        </NavLink>
        <NavLink to="/settings" className={styles.navLink} title="Settings">
          <span className={styles.icon}>⚙️</span>
        </NavLink>
        
        {isAuthenticated && (
          <>
            <NavLink to="/profile" className={styles.navLink} title="Profile">
              <div className={styles.profileIcon}>{currentUser?.name ? currentUser.name.substring(0, 2) : 'Us'}</div>
            </NavLink>
            
            <button 
              onClick={handleLogout} 
              className={`${styles.navLink} ${styles.logoutButton}`}
              title="Logout"
            >
              <span className={styles.icon}>🚪</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default SideNavBar;