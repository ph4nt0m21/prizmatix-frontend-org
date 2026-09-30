import React, { useState, useEffect } from 'react';
import styles from './filterPanel.module.scss';

const FilterPanel = ({ isOpen, onApplyFilters, currentFilters }) => {
  const [startDate, setStartDate] = useState(currentFilters.startDate || '');
  const [endDate, setEndDate] = useState(currentFilters.endDate || '');

  useEffect(() => {
    setStartDate(currentFilters.startDate || '');
    setEndDate(currentFilters.endDate || '');
  }, [currentFilters, isOpen]);

  const handleApply = () => {
    onApplyFilters({ startDate, endDate });
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onApplyFilters({ startDate: '', endDate: '' });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterRow}>
        <div className={styles.filterField}>
          <label htmlFor="filter-date-from">Order Date</label>
          <div className={styles.dateRange}>
            <input
              type="date"
              id="filter-date-from"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.filterInput}

            />
            <span className={styles.dateSeparator}>to</span>
            <input
              type="date"
              id="filter-date-to"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.filterInput}

            />
          </div>
        </div>
      </div>
      <div className={styles.filterActions}>
        <button type="button" className={styles.clearBtn} onClick={handleClear}>
          Clear
        </button>
        <button type="button" className={styles.applyBtn} onClick={handleApply}>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
