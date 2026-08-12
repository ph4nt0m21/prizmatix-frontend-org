import React, { useState, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './overviewSection.module.scss';
import Chart from 'react-apexcharts';
import { format, startOfWeek, startOfMonth, startOfYear, isValid } from 'date-fns';
import { FiInfo } from 'react-icons/fi';
import RecentOrdersModal from './recentOrdersModal';
import { getPublishedEventTimingStatus } from '../eventStatusUtils';

const toFeeAmount = (value) => {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const buildAbsorbedFeeBreakdown = (data = {}) => {
  const buyerFees = toFeeAmount(data.buyerAbsorbedFees ?? data.totalBookingFee ?? data.absorbedFee);
  const afterpayFees = toFeeAmount(data.afterpayFees);
  const internationalCardFees = toFeeAmount(data.internationalCardFees);
  return {
    buyerFees,
    afterpayFees,
    internationalCardFees,
    total: buyerFees + afterpayFees + internationalCardFees,
  };
};

const OverviewSection = ({ dashboardData, eventData, onViewAllOrders }) => {
  // --- All hooks are now at the top level, before any returns ---
  const [isOrdersModalOpen, setOrdersModalOpen] = useState(false);
  const [salesTimeframe, setSalesTimeframe] = useState('Monthly');
  const [isAbsorbedInfoOpen, setAbsorbedInfoOpen] = useState(false);
  const absorbedInfoRef = useRef(null);

  useEffect(() => {
    if (!isAbsorbedInfoOpen) return undefined;
    const handlePointerDown = (event) => {
      if (absorbedInfoRef.current && !absorbedInfoRef.current.contains(event.target)) {
        setAbsorbedInfoOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setAbsorbedInfoOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAbsorbedInfoOpen]);

  const absorbedFees = useMemo(
    () => buildAbsorbedFeeBreakdown(dashboardData || {}),
    [dashboardData]
  );

  const aggregatedSalesData = useMemo(() => {
    // Safely access dashboardData using optional chaining (?.)
    const sales = dashboardData?.salesOverview || [];
    if (sales.length === 0) return { categories: [], data: [] };

    const aggregationMap = new Map();

    sales.forEach((sale) => {
      const date = new Date(sale.date);
      if (!isValid(date)) return;

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
          key = format(date, 'yyyy-MM-dd');
          break;
      }
      aggregationMap.set(key, (aggregationMap.get(key) || 0) + sale.amount);
    });

    const sortedData = Array.from(aggregationMap.entries()).sort(
      (a, b) => new Date(a[0]) - new Date(b[0])
    );

    const categories = sortedData.map(([dateKey]) => {
      const date = new Date(dateKey);
      switch (salesTimeframe) {
        case 'Weekly':
          return format(date, 'MMM d');
        case 'Monthly':
          return format(date, 'MMM yyyy');
        case 'Yearly':
          return format(date, 'yyyy');
        case 'Daily':
          return format(date, 'MMM d');
        default:
          return format(date, 'MMM d');
      }
    });

    const data = sortedData.map(([, amount]) => parseFloat(amount.toFixed(2)));

    return { categories, data };
  }, [dashboardData?.salesOverview, salesTimeframe]);

  const salesChartHeight = salesTimeframe === 'Daily' ? 340 : 250;

  const chartOptions = useMemo(() => {
    const isDaily = salesTimeframe === 'Daily';
    return {
      chart: { type: 'bar', height: salesChartHeight, toolbar: { show: false } },
      plotOptions: {
        bar: {
          columnWidth: isDaily ? '55%' : '45%',
          distributed: false,
          borderRadius: 4,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      xaxis: {
        categories: aggregatedSalesData.categories,
        labels: {
          style: { colors: '#6B7280', fontSize: isDaily ? '10px' : '12px' },
          ...(isDaily
            ? {
                rotate: -45,
                rotateAlways: true,
                hideOverlappingLabels: false,
                trim: false,
              }
            : {}),
        },
      },
      yaxis: {
        labels: {
          style: { colors: '#6B7280', fontSize: '12px' },
          formatter: (val) => `$${val.toFixed(0)}`,
        },
      },
      fill: { colors: ['#A78BFA'] },
      grid: {
        borderColor: '#F3F4F6',
        padding: { bottom: isDaily ? 12 : 0, left: 4, right: 8 },
      },
      tooltip: {
        enabled: true,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const value = series[seriesIndex][dataPointIndex];
          const formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(value);
          const label = w.globals?.categoryLabels?.[dataPointIndex] ?? '';
          const title = label
            ? `<div style="font-size:12px;color:#6B7280;margin-bottom:6px">${label}</div>`
            : '';
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
            ${title}
            <span>${formattedValue}</span>
          </div>
        `;
        },
      },
    };
  }, [aggregatedSalesData, salesTimeframe]);

  const chartSeries = useMemo(
    () => [{ name: 'Sales', data: aggregatedSalesData.data }],
    [aggregatedSalesData.data]
  );

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
  
  const eventStatus = eventData.isPublished
    ? getPublishedEventTimingStatus(eventData)
    : 'DRAFT';
  
  const locationString = [eventData.location?.city, eventData.location?.country].filter(Boolean).join(', ');
  const dateString = formatDate(eventData.startDate);
  const eventMetaString = [locationString, dateString === 'N/A' ? null : dateString].filter(Boolean).join(' · ');

  return (
    <>
      <div className={styles.overviewContainer}>
        {/* Event Info Header */}
        <div className={styles.eventInfoHeader}>
          <div>
            <h2 className={styles.eventName}>
              {eventData.name}{' '}
              <span className={`${styles.statusBadge} ${styles[eventStatus.toLowerCase()]}`}>
                {eventStatus}
              </span>
            </h2>
            <p className={styles.eventMeta}>{eventMetaString}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statTitle}>Available Payout</p>
            <div className={styles.statValue}>
              {formatCurrency(dashboardData.availablePayout ?? dashboardData.revenue)}
            </div>
            <p className={styles.statHint}>Current balance available to withdraw</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statTitle}>Tickets Issued</p>
            <div className={styles.statValue}>
              {dashboardData.totalTicketsIssued}
              {dashboardData.totalTicketCapacity > 0 && (
                <span className={styles.statTotal}> of {dashboardData.totalTicketCapacity}</span>
              )}
            </div>
            {dashboardData.totalTicketCapacity > 0 && (
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${Math.min(
                      100,
                      (dashboardData.totalTicketsIssued / dashboardData.totalTicketCapacity) * 100
                    )}%`,
                  }}
                ></div>
              </div>
            )}
          </div>
          <div className={styles.statCard}>
            <p className={styles.statTitle}>Orders</p>
            <div className={styles.statValue}>{dashboardData.orderCount}</div>
            <div className={styles.statFooter}>
              <button
                className={styles.breakdownLink}
                onClick={() => setOrdersModalOpen(true)}
              >
                Show recent 10 orders
              </button>
            </div>
          </div>
        </div>

        {/* Middle row: Earnings by ticket type + Earnings overview */}
        <div className={styles.detailGrid}>
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3>Earnings By Ticket Type</h3>
            </div>
            <div className={styles.ticketTable}>
              <div className={styles.ticketTableHeader}>
                <span>Ticket Type</span>
                <span>Earnings</span>
              </div>
              {dashboardData.earningsByTicketType?.map((ticket) => (
                <div key={ticket.ticketType} className={styles.ticketTableRow}>
                  <span>{ticket.ticketType}</span>
                  <span>{formatCurrency(ticket.totalEarnings)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.earningsOverviewCard}>
            <div className={styles.cardHeader}>
              <h3>Earnings Overview</h3>
            </div>

            <div className={styles.earningsRow}>
              <div>
                <div className={styles.earningsLabel}>Gross Ticket Sales</div>
                <div className={styles.earningsSub}>
                  Total ticket and donation sales before organiser deductions.
                </div>
              </div>
              <div className={styles.earningsValue}>
                {formatCurrency(dashboardData.grossTicketSales)}
              </div>
            </div>

            <div className={styles.earningsRow}>
              <div>
                <div className={styles.earningsLabelRow}>
                  <div className={styles.earningsLabel}>Absorbed Fees</div>
                  <div className={styles.infoButtonWrap} ref={absorbedInfoRef}>
                    <button
                      type="button"
                      className={styles.infoButton}
                      aria-label="Absorbed fees breakdown"
                      aria-expanded={isAbsorbedInfoOpen}
                      onClick={() => setAbsorbedInfoOpen((open) => !open)}
                      onMouseEnter={() => setAbsorbedInfoOpen(true)}
                    >
                      <FiInfo aria-hidden="true" />
                    </button>
                    {isAbsorbedInfoOpen && (
                      <div className={styles.infoPopover} role="dialog" aria-label="Fee breakdown">
                        <div className={styles.infoPopoverTitle}>Fee breakdown</div>
                        <div className={styles.infoPopoverRow}>
                          <span>
                            Prizmatix / gateway fees
                            <em> (ticket buyer)</em>
                          </span>
                          <strong>{formatCurrency(absorbedFees.buyerFees)}</strong>
                        </div>
                        <div className={styles.infoPopoverRow}>
                          <span>
                            Afterpay fees
                            <em> (organiser)</em>
                          </span>
                          <strong>{formatCurrency(absorbedFees.afterpayFees)}</strong>
                        </div>
                        <div className={styles.infoPopoverRow}>
                          <span>
                            International card fees
                            <em> (organiser)</em>
                          </span>
                          <strong>{formatCurrency(absorbedFees.internationalCardFees)}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.earningsSub}>
                  Total of buyer-paid fees and Afterpay / international fees deducted from organiser payout.
                </div>
              </div>
              <div className={styles.earningsValue}>
                {formatCurrency(absorbedFees.total)}
              </div>
            </div>

            <div className={styles.earningsRow}>
              <div>
                <div className={styles.earningsLabel}>Available Payout</div>
                <div className={styles.earningsSub}>
                  Net sales after organiser deductions, minus amounts already paid out.
                </div>
              </div>
              <div className={styles.earningsValue}>
                {formatCurrency(dashboardData.availablePayout ?? dashboardData.revenue)}
              </div>
            </div>
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
            <div className={styles.chartValue}>
              {formatCurrency(dashboardData.availablePayout ?? dashboardData.revenue)}
            </div>
            <Chart options={chartOptions} series={chartSeries} type="bar" height={salesChartHeight} />
          </div>
        </div>
      </div>

      <RecentOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
        orders={dashboardData.recentOrders}
        onViewAllOrders={onViewAllOrders}
      />
    </>
  );
};

OverviewSection.propTypes = {
  dashboardData: PropTypes.object,
  eventData: PropTypes.object,
  onViewAllOrders: PropTypes.func,
};

export default OverviewSection;