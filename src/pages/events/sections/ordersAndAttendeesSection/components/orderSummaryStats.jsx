import React, { useMemo } from 'react';
import { isValid, parse } from 'date-fns';
import styles from './orderSummaryStats.module.scss';

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const OrderSummaryStats = ({ orders }) => {
  const stats = useMemo(() => {
    const list = orders || [];
    const totalOrders = list.length;
    const totalRevenue = list.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const earlyBirdSold = list.filter((o) =>
      String(o.ticketType || '').toLowerCase().includes('early bird')
    ).length;
    const today = new Date();
    const todaysOrders = list.filter((o) => {
      const parsed = parse(String(o.purchaseDate || o.orderDate || ''), 'dd MMM yyyy hh:mm a', new Date());
      return isValid(parsed) && isSameDay(parsed, today);
    }).length;

    return { totalOrders, totalRevenue, earlyBirdSold, todaysOrders };
  }, [orders]);

  if (!orders || orders.length === 0) return null;

  return (
    <div className={styles.statsRow}>
      <div className={styles.statTile}>
        <span className={styles.statLabel}>Total Orders</span>
        <span className={styles.statValue}>{stats.totalOrders}</span>
      </div>
      <div className={styles.statTile}>
        <span className={styles.statLabel}>Total Revenue</span>
        <span className={styles.statValue}>${stats.totalRevenue.toFixed(2)}</span>
      </div>
      <div className={styles.statTile}>
        <span className={styles.statLabel}>Early Bird Sold</span>
        <span className={styles.statValue}>{stats.earlyBirdSold}</span>
      </div>
      <div className={styles.statTile}>
        <span className={styles.statLabel}>Today's Orders</span>
        <span className={styles.statValue}>{stats.todaysOrders}</span>
      </div>
    </div>
  );
};

export default OrderSummaryStats;
