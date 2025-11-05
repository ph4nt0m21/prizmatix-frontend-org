import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './overviewSection.module.scss';
import Chart from 'react-apexcharts';
import { format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import RecentOrdersModal from './recentOrdersModal';

const OverviewSection = ({ dashboardData, eventData }) => {
  // --- All hooks are now at the top level, before any returns ---
  const [isOrdersModalOpen, setOrdersModalOpen] = useState(false);
  const [salesTimeframe, setSalesTimeframe] = useState('Monthly');

  const aggregatedSalesData = useMemo(() => {
    // Safely access dashboardData using optional chaining (?.)
    const sales = dashboardData?.salesOverview || [];
    if (sales.length === 0) return { categories: [], data: [] };

    const aggregationMap = new Map();

    sales.forEach(sale => {
      const date = new Date(sale.date);
      let key;

      switch (salesTimeframe) {
        case 'Weekly':
          key = format(startOfWeek(date), 'yyyy-MM-dd');
          break;
        case 'Monthly':
          key = format(startOfMonth(date), 'yyyy-MM-dd');
          break;
        case 'Yearly':
          key = format(startOfYear(date), 'yyyy-MM-dd');
          break;
        case 'Daily':
        default:
          key = sale.date;
          break;
      }
      aggregationMap.set(key, (aggregationMap.get(key) || 0) + sale.amount);
    });
    
    const sortedData = (salesTimeframe === 'Daily'
      ? Array.from(aggregationMap.entries()).sort((a, b) => new Date(a[0]) - new Date(b[0])).slice(-30)
      : Array.from(aggregationMap.entries()).sort((a, b) => new Date(a[0]) - new Date(b[0]))
    );
    
    const categories = sortedData.map(([dateKey]) => {
      const date = new Date(dateKey);
      switch (salesTimeframe) {
        case 'Weekly': return format(date, 'MMM dd');
        case 'Monthly': return format(date, 'MMM yyyy');
        case 'Yearly': return format(date, 'yyyy');
        default: return format(date, 'MMM dd');
      }
    });

    const data = sortedData.map(([, amount]) => parseFloat(amount.toFixed(2)));

    return { categories, data };
  }, [dashboardData?.salesOverview, salesTimeframe]);

  // --- Early return for loading state now happens *after* all hooks ---
  if (!dashboardData || !eventData) {
    return (
      <div className={styles.loadingContainer}>
        <p>Dashboard data is loading...</p>
      </div>
    );
  }
  
  // --- Helper Functions & Constants (can be defined after the early return) ---
  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', weekday: 'short', month: 'short', year: 'numeric' });
  };
  
  let eventStatus = 'Live';
  if (eventData.isPublished) {
    const now = new Date();
    const eventEndDate = eventData.endDate ? new Date(eventData.endDate) : new Date(eventData.startDate);
    eventStatus = eventEndDate < now ? 'Past' : 'Live';
  }
  
  const locationString = [eventData.location?.city, eventData.location?.country].filter(Boolean).join(', ');
  const dateString = formatDate(eventData.startDate);
  const eventMetaString = [locationString, dateString === 'N/A' ? null : dateString].filter(Boolean).join(' · ');


  // --- Chart Configuration ---
  const chartOptions = {
    chart: { type: 'bar', height: 250, toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '45%', distributed: false, borderRadius: 4 } },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: aggregatedSalesData.categories,
      labels: { style: { colors: '#6B7280', fontSize: '12px' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#6B7280', fontSize: '12px' },
        formatter: (val) => `$${val.toFixed(0)}`
      }
    },
    fill: { colors: ['#A78BFA'] },
    grid: { borderColor: '#F3F4F6' },
    tooltip: {
      enabled: true,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex];
        const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        
        return `
          <div style="
            padding: 8px 12px;
            background-color: #FFFFFF;
            color: #111827;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            font-family: inherit;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          ">
            <span>${formattedValue}</span>
          </div>
        `;
      }
    }
  };
  const chartSeries = [{
    name: 'Sales',
    data: aggregatedSalesData.data
  }];

  return (
    <>
      <div className={styles.overviewContainer}>
        {/* Event Info Header */}
        <div className={styles.eventInfoHeader}>
          <div>
            <h2 className={styles.eventName}>{eventData.name} <span className={`${styles.statusBadge} ${styles[eventStatus.toLowerCase()]}`}>{eventStatus}</span></h2>
            <p className={styles.eventMeta}>
              {eventMetaString}
            </p>
          </div>
          <select className={styles.timeframeSelector} defaultValue="All Time">
            <option>All Time</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
           <div className={styles.statCard}>
            <p className={styles.statTitle}>Revenue</p>
            <div className={styles.statValue}>{formatCurrency(dashboardData.revenue)}</div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statTitle}>Tickets Issued</p>
            <div className={styles.statValue}>{dashboardData.totalTicketsIssued} <span className={styles.statTotal}>of {dashboardData.totalTicketCapacity}</span></div>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${(dashboardData.totalTicketsIssued / dashboardData.totalTicketCapacity) * 100}%` }}></div>
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statTitle}>Orders</p>
            <div className={styles.statValue}>{dashboardData.orderCount}</div>
            <div className={styles.statFooter}>
              <button 
                className={styles.breakdownLink}
                onClick={() => setOrdersModalOpen(true)}
              >
                View Recent Orders
              </button>
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statTitle}>Event Views</p>
            <div className={styles.statValue}>{dashboardData.eventViews}</div>
          </div>
        </div>

        {/* Earnings By Ticket Type Card */}
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <h3>Earnings By Ticket Type</h3>
            <select className={styles.timeframeSelector} defaultValue="Daily">
              <option>Daily</option>
            </select>
          </div>
          <div className={styles.ticketTable}>
            <div className={styles.ticketTableHeader}>
              <span>Ticket Type</span><span>Earnings</span>
            </div>
            {dashboardData.earningsByTicketType?.map(ticket => (
              <div key={ticket.ticketType} className={styles.ticketTableRow}>
                <span>{ticket.ticketType}</span>
                <span>{formatCurrency(ticket.totalEarnings)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Overview Card */}
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <h3>Sales Overview</h3>
            <select 
              className={styles.timeframeSelector}
              value={salesTimeframe}
              onChange={(e) => setSalesTimeframe(e.target.value)}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.chartValue}>{formatCurrency(dashboardData.revenue)}</div>
            <Chart options={chartOptions} series={chartSeries} type="bar" height="250" />
          </div>
        </div>
      </div>

      <RecentOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
        orders={dashboardData.recentOrders}
      />
    </>
  );
};

OverviewSection.propTypes = {
  dashboardData: PropTypes.object,
  eventData: PropTypes.object,
};

export default OverviewSection;