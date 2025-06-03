import React from 'react';
import PropTypes from 'prop-types';
import styles from './overviewSection.module.scss';

/**
 * OverviewSection component - Display overview metrics for event management
 * Shows revenue, tickets issued, orders, and event views with charts
 * 
 * @param {Object} props Component props
 * @param {Object} props.eventData Event data containing metrics
 * @returns {JSX.Element} OverviewSection component
 */
const OverviewSection = ({ eventData }) => {
  return (
    <div className={styles.overviewContainer}>
      {/* Revenue, Tickets, Orders, and Views Cards */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3 className={styles.metricTitle}>Revenue</h3>
          <div className={styles.metricValue}>
            <span className={styles.dollarSign}>$</span>
            {eventData.earnings.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={styles.metricPercentage}>
            <span className={styles.percentBadge}>{eventData.earnings.percentageChange}%</span>
            <span className={styles.metricBreakdown}>View Breakdown</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3 className={styles.metricTitle}>Tickets Issued</h3>
          <div className={styles.metricValue}>
            {eventData.tickets.issued}
            <span className={styles.metricTotal}> of {eventData.tickets.total}</span>
          </div>
          <div className={styles.issueProgress}>
            <div 
              className={styles.progressBar} 
              style={{ width: `${(eventData.tickets.issued / eventData.tickets.total) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3 className={styles.metricTitle}>Orders</h3>
          <div className={styles.metricValue}>
            {eventData.orders.count}
          </div>
          <div className={styles.metricPercentage}>
            <span className={styles.percentBadge}>{eventData.orders.percentageChange}%</span>
            <span className={styles.metricBreakdown}>View Breakdown</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3 className={styles.metricTitle}>Event Views</h3>
          <div className={styles.metricValue}>
            {eventData.views.count}
          </div>
          <div className={styles.metricPercentage}>
            <span className={styles.percentBadge}>{eventData.views.percentageChange}%</span>
            <span className={styles.metricBreakdown}>View Breakdown</span>
          </div>
        </div>
      </div>
      
      {/* Earnings by Ticket Type */}
      <div className={styles.earningsContainer}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Earnings By Ticket Type</h3>
          <div className={styles.sectionControls}>
            <select className={styles.periodSelect}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
        
        <div className={styles.ticketEarningsInfo}>
          <p className={styles.salesInfo}>
            Your average sales for the past {eventData.salesData.timeframe} is ${eventData.salesData.dailyRevenue.toFixed(2)}
          </p>
          
          <div className={styles.ticketTypesList}>
            {eventData.ticketTypes.map((ticket, index) => (
              <div key={index} className={styles.ticketTypeItem}>
                <span className={styles.ticketTypeName}>{ticket.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Event Reports Link */}
      <div className={styles.reportsLink}>
        <button className={styles.reportButton}>Event Reports</button>
      </div>
      
      {/* Sales Overview */}
      <div className={styles.salesOverviewContainer}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Sales Overview</h3>
          <div className={styles.sectionControls}>
            <select className={styles.periodSelect}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
        
        <div className={styles.salesOverviewInfo}>
          <div className={styles.salesInfoHeader}>
            <div className={styles.totalEarnings}>
              <span className={styles.dollarSign}>$</span>
              {eventData.earnings.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            <div className={styles.salesMetrics}>
              <div className={styles.salesMetric}>
                <span className={styles.metricLabel}>Sales</span>
                <span className={styles.percentBadge}>{eventData.earnings.percentageChange}%</span>
              </div>
              <div className={styles.salesMetric}>
                <span className={styles.metricLabel}>Ticket Buyers</span>
                <span className={styles.percentBadge}>{eventData.tickets.percentageChange}%</span>
              </div>
            </div>
          </div>
          
          {/* Chart Placeholder */}
          <div className={styles.salesChart}>
            <div className={styles.chartBars}>
              {[0.3, 0.7, 0.9, 0.6, 0.5, 0.2, 0.3, 0.8, 0.9, 0.7].map((height, index) => (
                <div 
                  key={index} 
                  className={styles.chartBar} 
                  style={{ height: `${height * 100}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

OverviewSection.propTypes = {
  eventData: PropTypes.object.isRequired
};

export default OverviewSection;