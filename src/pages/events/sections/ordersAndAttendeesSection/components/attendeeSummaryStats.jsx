import React, { useMemo } from 'react';
import styles from './attendeeSummaryStats.module.scss';

const AttendeeSummaryStats = ({ attendees }) => {
  const stats = useMemo(() => {
    const list = attendees || [];
    const totalAttendees = list.length;
    const earlyBird = list.filter((a) =>
      String(a.ticketType || '').toLowerCase().includes('early bird')
    ).length;
    const checkedIn = list.filter((a) => a.isCheckedIn).length;

    return { totalAttendees, earlyBird, checkedIn };
  }, [attendees]);

  if (!attendees || attendees.length === 0) return null;

  return (
    <div className={styles.statsRow}>
      <div className={styles.statTile}>
        <span className={styles.statLabel}>Total Attendees</span>
        <span className={styles.statValue}>{stats.totalAttendees}</span>
      </div>
      <div className={styles.statTile}>
        <span className={styles.statLabel}>Early Bird</span>
        <span className={styles.statValue}>{stats.earlyBird}</span>
      </div>
      <div className={styles.statTile}>
        <span className={styles.statLabel}>Checked In</span>
        <span className={styles.statValue}>{stats.checkedIn}</span>
      </div>
    </div>
  );
};

export default AttendeeSummaryStats;
