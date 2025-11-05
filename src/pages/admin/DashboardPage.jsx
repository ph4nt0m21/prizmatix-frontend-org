import React from "react";
import Dashboard from "./Dashboard"; // Changed from ../ to ./
import styles from './dashboardPage.module.scss';

export default function DashboardPage() {
  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Super Admin Dashboard</h1>
      <div className={styles.contentCard}>
        <Dashboard />
      </div>
    </div>
  );
}