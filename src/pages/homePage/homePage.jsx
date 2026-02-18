import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Chart from 'react-apexcharts';
import styles from './homePage.module.scss';
import { GetOrganizationOverviewAPI } from '../../services/allApis';

// SVG Icons for analytics tiles
const CalendarIcon = () => (
  <svg className={styles.analyticsIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ActiveEventsIcon = () => (
  <svg className={styles.analyticsIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11a9 9 0 0 1 9 9" />
    <path d="M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1" />
  </svg>
);

const RevenueIcon = () => (
  <svg className={styles.analyticsIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const TicketsSoldIcon = () => (
  <svg className={styles.analyticsIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

const GRANULARITY_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const HomePage = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [overviewData, setOverviewData] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(null);
  const [granularity, setGranularity] = useState('MONTHLY');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setOverviewLoading(false);
      return;
    }
    let cancelled = false;
    setOverviewLoading(true);
    setOverviewError(null);
    const params = granularity ? { granularity } : {};
    GetOrganizationOverviewAPI(params)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data?.data ?? null;
        setOverviewData(data);
        setOverviewError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Organization overview fetch error:', err);
        setOverviewError(err?.response?.data?.message || 'Failed to load overview');
        setOverviewData(null);
      })
      .finally(() => {
        if (!cancelled) setOverviewLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, granularity]);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('token');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = () => {
    if (isAuthenticated) {
      navigate('/events/create');
    } else {
      navigate('/login');
    }
  };

  const overviewStats = useMemo(() => {
    if (!overviewData) {
      return [
        { label: 'Next Event in', value: '—', accent: '#FECACA', icon: <CalendarIcon />, sub: 'No upcoming event' },
        { label: 'Active Events', value: '0', accent: '#BFDBFE', icon: <ActiveEventsIcon />, sub: 'Upcoming events' },
        { label: 'Total Revenue', value: formatCurrency(0), accent: '#FDE68A', icon: <RevenueIcon />, sub: 'All time' },
        { label: 'Total Tickets Sold', value: '0', accent: '#A7F3D0', icon: <TicketsSoldIcon />, sub: 'All time' },
      ];
    }
    const nextDays = overviewData.daysUntilNextEvent;
    const nextLabel = nextDays === null ? '—' : nextDays === 0 ? 'Today' : nextDays === 1 ? '1 Day' : `${nextDays} Days`;
    const nextSub = overviewData.nextEventName || 'No upcoming event';
    const activeCount = overviewData.activeEvents?.length ?? 0;
    return [
      { label: 'Next Event in', value: nextLabel, accent: '#FECACA', icon: <CalendarIcon />, sub: nextSub },
      { label: 'Active Events', value: String(activeCount), accent: '#BFDBFE', icon: <ActiveEventsIcon />, sub: 'Upcoming events' },
      { label: 'Total Revenue', value: formatCurrency(overviewData.totalRevenue), accent: '#FDE68A', icon: <RevenueIcon />, sub: 'All time' },
      { label: 'Total Tickets Sold', value: String(overviewData.totalTicketsSold ?? 0), accent: '#A7F3D0', icon: <TicketsSoldIcon />, sub: 'All time' },
    ];
  }, [overviewData]);

  const chartData = useMemo(() => {
    const sales = overviewData?.salesOverview ?? [];
    if (sales.length === 0) {
      return { categories: [], orders: [], ticketsSold: [] };
    }
    return {
      categories: sales.map((p) => p.periodLabel),
      orders: sales.map((p) => p.orders ?? 0),
      ticketsSold: sales.map((p) => p.ticketsSold ?? 0),
    };
  }, [overviewData?.salesOverview]);

  const chartOptions = useMemo(
    () => ({
      chart: { type: 'bar', height: 280, toolbar: { show: false } },
      plotOptions: {
        bar: { columnWidth: '55%', borderRadius: 4, horizontal: false },
      },
      dataLabels: { enabled: false },
      legend: { show: true, position: 'top' },
      xaxis: {
        categories: chartData.categories,
        labels: { style: { colors: '#6B7280', fontSize: '12px' }, maxWidth: 120 },
      },
      yaxis: {
        labels: { style: { colors: '#6B7280', fontSize: '12px' } },
      },
      colors: ['#3b82f6', '#ec4899'],
      grid: { borderColor: '#F3F4F6' },
      tooltip: {
        shared: true,
        intersect: false,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const period = w.globals.labels[dataPointIndex] || '';
          const orders = series[0]?.[dataPointIndex] ?? 0;
          const tickets = series[1]?.[dataPointIndex] ?? 0;
          return (
            '<div class="chart-tooltip-custom">' +
              '<div class="chart-tooltip-title">' + period + '</div>' +
              '<div class="chart-tooltip-row">' +
                '<span class="chart-tooltip-dot" style="background:#3b82f6"></span>' +
                '<span class="chart-tooltip-label">Orders</span>' +
                '<span class="chart-tooltip-value">' + orders.toLocaleString() + '</span>' +
              '</div>' +
              '<div class="chart-tooltip-row">' +
                '<span class="chart-tooltip-dot" style="background:#ec4899"></span>' +
                '<span class="chart-tooltip-label">Tickets sold</span>' +
                '<span class="chart-tooltip-value">' + tickets.toLocaleString() + '</span>' +
              '</div>' +
            '</div>'
          );
        },
      },
    }),
    [chartData.categories]
  );

  const chartSeries = useMemo(
    () => [
      { name: 'Orders', data: chartData.orders },
      { name: 'Tickets Sold', data: chartData.ticketsSold },
    ],
    [chartData.orders, chartData.ticketsSold]
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.homePageContainer}>
      <div className={styles.homePageContent}>
        <div className={styles.topBanner}>
          <div className={styles.bannerLeft}>
            <h2 className={styles.bannerTitle}>
              {currentUser ? `Welcome back ${currentUser.name}` : 'Welcome back'}
            </h2>
            <p className={styles.bannerSubtitle}>
              Here is an overview of how your sales are going
            </p>
          </div>
          <div className={styles.bannerActions}>
            <button className={styles.exportButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16L12 4M12 16L8 12M12 16L16 12" />
                <path d="M4 20H20" />
              </svg>
              Export
            </button>
            <button className={styles.createEventTopButton} onClick={handleCreateEvent}>
              + Create Event
            </button>
          </div>
        </div>

        <div className={styles.overviewSection}>
          <div className={styles.analyticsContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Organization Overview</h2>
            </div>

            {overviewError && (
              <div className={styles.overviewError}>
                {overviewError}
              </div>
            )}

            {overviewLoading ? (
              <div className={styles.overviewLoading}>Loading overview…</div>
            ) : (
              <div className={styles.overviewStatsRow}>
                {overviewStats.map((item, idx) => (
                  <div key={idx} className={styles.analyticsTile}>
                    <div className={styles.analyticsContent}>
                      <div className={styles.analyticsLabel}>{item.label}</div>
                      <div className={styles.analyticsValue}>{item.value}</div>
                      <div className={styles.analyticsSub}>{item.sub}</div>
                    </div>
                    <div className={styles.analyticsIconWrapper} style={{ backgroundColor: item.accent }}>
                      {item.icon}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.analyticsMainRow}>
            <div className={styles.salesChartCard}>
              <div className={styles.salesChartHeader}>
                <h3 className={styles.salesTitle}>Sales Overview</h3>
                <div className={styles.salesChartControls}>
                  <select
                    className={styles.salesSelect}
                    value={granularity}
                    onChange={(e) => setGranularity(e.target.value)}
                  >
                    {GRANULARITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {overviewLoading ? (
                <div className={styles.chartPlaceholder}>Loading chart…</div>
              ) : !overviewData || chartData.categories.length === 0 ? (
                <div className={styles.chartPlaceholder}>
                  {!overviewData ? 'No overview data.' : 'No sales data for this range.'}
                </div>
              ) : (
                <>
                  <div className={styles.chartWrapper}>
                    <Chart options={chartOptions} series={chartSeries} type="bar" height={280} />
                  </div>
                  <div className={styles.salesLegend}>
                    <div className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ backgroundColor: '#3b82f6' }}></span> Orders
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ backgroundColor: '#ec4899' }}></span> Tickets sold
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.earningsCard}>
              <div className={styles.earningsHeader}>
                <h3 className={styles.salesTitle}>Earnings Overview</h3>
              </div>
              <div className={styles.earningsRow}>
                <div>
                  <div className={styles.earningsLabel}>Total Revenue</div>
                  <div className={styles.earningsSub}>
                    Our platform service fee deducted from total revenue.
                  </div>
                </div>
                <div className={styles.earningsValue}>
                  {overviewData ? formatCurrency(overviewData.totalRevenue) : '—'}
                </div>
              </div>
              <div className={styles.earningsRow}>
                <div>
                  <div className={styles.earningsLabel}>Absorbed Fee</div>
                  <div className={styles.earningsSub}>
                    Gateway fee deducted from total revenue.
                  </div>
                </div>
                <div className={styles.earningsValue}>
                  {overviewData != null && overviewData.totalBookingFee != null
                    ? formatCurrency(overviewData.totalBookingFee)
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
