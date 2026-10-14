// ordersAndAttendeesSection/components/StatsGrid.jsx

import React from 'react';
import styles from './statsGrid.module.scss';

const StatCard = ({ title, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // 2 * pi * radius
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={styles.statCard}>
      <div className={styles.progressCircle}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className={styles.background} />
          <circle
            cx="50"
            cy="50"
            r="45"
            className={styles.foreground}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke={color}
          />
        </svg>
      </div>
      <div className={styles.statInfo}>
        <h3 className={styles.statTitle}>{title}</h3>
        <div className={styles.statValue}>
          {count} <span className={styles.statSubtext}>/ {total}</span>
        </div>
      </div>
    </div>
  );
};

const StatsGrid = ({ checkedInCount, totalCount }) => {
  const yetToCheckInCount = totalCount - checkedInCount;
  
  return (
    <div className={styles.statsGrid}>
      <StatCard title="Checked In" count={checkedInCount} total={totalCount} color="#7C3AED" />
      <StatCard title="Yet to Check In" count={yetToCheckInCount} total={totalCount} color="#D1D5DB" />
    </div>
  );
};

export default StatsGrid;