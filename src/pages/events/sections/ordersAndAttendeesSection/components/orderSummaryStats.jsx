import React, { useMemo } from 'react';
import { isValid, parse } from 'date-fns';
import styles from './orderSummaryStats.module.scss';

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const OrderSummaryStats = ({ orders }) => {
  const stats = useMemo(() => {
    const list = orders || [];
    const totalOrders = list.length;
    const today = new Date();
    const todaysOrders = list.filter((o) => {
      const parsed = parse(String(o.purchaseDate || o.orderDate || ''), 'dd MMM yyyy hh:mm a', new Date());
      return isValid(parsed) && isSameDay(parsed, today);
    }).length;

    return { totalOrders, todaysOrders };
  }, [orders]);

  if (!orders || orders.length === 0) return null;

  return (
    <div className={styles.statsRow}>
      <div className={styles.statTile}>
        <span className={styles.statLabel}>Total Orders</span>
        <span className={styles.statValue}>{stats.totalOrders}</span>
      </div>
      <div className={styles.statTile}>
        <span className={styles.statLabel}>Today's Orders</span>
        <span className={styles.statValue}>{stats.todaysOrders}</span>
      </div>
    </div>
  );
};

export default OrderSummaryStats;
