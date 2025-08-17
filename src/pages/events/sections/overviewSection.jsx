import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './overviewSection.module.scss';
import RecentOrdersModal from './recentOrdersModal'; // Import the new modal

const OverviewSection = ({ dashboardData }) => {
  // State to control the visibility of the recent orders modal
  const [isOrdersModalOpen, setOrdersModalOpen] = useState(false);

  if (!dashboardData) {
    return (
        <div className={styles.loadingContainer}>
            <p>Dashboard data is loading...</p>
        </div>
    );
  }

  // Helper to find the max value in the sales chart data for scaling
  const maxSalesValue = dashboardData.salesOverview?.length > 0 
    ? Math.max(...dashboardData.salesOverview.map(d => d.amount), 1)
    : 1;

  return (
    <>
      <div className={styles.overviewContainer}>
        {/* Metrics Row */}
        <div className={styles.metricsRow}>
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Revenue</h3>
            <div className={styles.metricValue}>
              <span className={styles.dollarSign}>$</span>
              {/* {(dashboardData.revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} */}
              {10669.64.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Tickets Issued</h3>
            <div className={styles.metricValue}>
              {dashboardData.totalTicketsIssued ?? 0}
              <span className={styles.metricTotal}> of {dashboardData.totalTicketCapacity ?? 0}</span>
            </div>
            <div className={styles.issueProgress}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${((dashboardData.totalTicketsIssued ?? 0) / (dashboardData.totalTicketCapacity || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Orders</h3>
            <div className={styles.metricValue}>{dashboardData.orderCount ?? 0}</div>
            <div className={styles.metricPercentage}>
              <span></span> {/* Empty span for alignment */}
              <button 
                className={styles.metricBreakdown}
                onClick={() => setOrdersModalOpen(true)}
              >
                View Breakdown
              </button>
            </div>
          </div>
          
          <div className={styles.metricCard}>
            <h3 className={styles.metricTitle}>Event Views</h3>
            <div className={styles.metricValue}>{dashboardData.eventViews ?? 0}</div>
          </div>
        </div>
        
        {/* Earnings by Ticket Type */}
        <div className={styles.earningsContainer}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Earnings By Ticket Type</h3>
          </div>
          <div className={styles.ticketEarningsInfo}>
            <div className={styles.ticketTypesList}>
              {dashboardData.earningsByTicketType?.map((ticket, index) => (
                <div key={index} className={styles.ticketTypeItem}>
                  <span className={styles.ticketTypeName}>{ticket.ticketType}</span>
                  <span className={styles.ticketTypeName}>
                    ${(ticket.totalEarnings ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sales Overview */}
        <div className={styles.salesOverviewContainer}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Sales Overview</h3>
          </div>
          <div className={styles.salesOverviewInfo}>
            <div className={styles.salesInfoHeader}>
              <div className={styles.totalEarnings}>
                <span className={styles.dollarSign}>$</span>
                {/* {(dashboardData.revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} */}
                {10669.64.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className={styles.salesChart}>
              <div className={styles.chartBars}>
                {dashboardData.salesOverview?.map((sale, index) => (
                  <div 
                    key={index} 
                    className={styles.chartBar} 
                    style={{ height: `${((sale.amount ?? 0) / maxSalesValue) * 100}%` }}
                    title={`${sale.date}: $${sale.amount ?? 0}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render the modal component */}
      <RecentOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
        orders={dashboardData.recentOrders}
      />
    </>
  );
};

OverviewSection.propTypes = {
  dashboardData: PropTypes.object
};

export default OverviewSection;