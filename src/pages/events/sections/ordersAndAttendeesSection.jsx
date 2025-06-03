import React from 'react';
import PropTypes from 'prop-types';
import styles from './ordersAndAttendeesSection.module.scss';

/**
 * OrdersAndAttendeesSection component - Manage orders and attendees
 * Shows information about event orders and registered attendees
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data containing orders info
 * @returns {JSX.Element} OrdersAndAttendeesSection component
 */
const OrdersAndAttendeesSection = ({ eventData }) => {
  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Orders & Attendees</h2>
        <p className={styles.sectionDescription}>
          Manage orders and view information about attendees for your event.
        </p>
      </div>
      
      <div className={styles.contentCard}>
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Total Orders</h3>
            <div className={styles.statValue}>{eventData.orders.count}</div>
          </div>
          
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Tickets Sold</h3>
            <div className={styles.statValue}>
              {eventData.tickets.issued} <span className={styles.statSubtext}>of {eventData.tickets.total}</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Check-ins</h3>
            <div className={styles.statValue}>0 <span className={styles.statSubtext}>of {eventData.tickets.issued}</span></div>
          </div>
        </div>
        
        {/* Placeholder content - in a real implementation, this would show orders */}
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#E5E7EB"/>
            </svg>
          </div>
          <h3 className={styles.placeholderTitle}>Orders & Attendees</h3>
          <p className={styles.placeholderText}>
            This section will display all orders and attendee information for your event.
          </p>
          <button className={styles.placeholderButton}>Coming Soon</button>
        </div>
      </div>
    </div>
  );
};

OrdersAndAttendeesSection.propTypes = {
  eventData: PropTypes.object.isRequired
};

export default OrdersAndAttendeesSection;