import React, { useState, useEffect } from 'react';
import styles from './filterModal.module.scss';
import { FiX } from 'react-icons/fi';

const FilterModal = ({ isOpen, onClose, onApplyFilters, currentFilters, ticketTypes, activeTab }) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  // Reset local state if the modal is reopened with different filters
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [isOpen, currentFilters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };
  
  const handleClear = () => {
    // Reset to the appropriate default shape based on the tab
    const defaultFilters = activeTab === 'Orders'
      ? { ticketType: 'All', startDate: '', endDate: '' }
      : { ticketType: 'All', status: 'All', startDate: '', endDate: '' };
    
    onApplyFilters(defaultFilters);
    onClose();
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h4>Filter {activeTab}</h4>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>
        <div className={styles.content}>
          <div className={styles.filterGroup}>
            <label htmlFor="ticketType">Ticket Type</label>
            <select
              id="ticketType"
              name="ticketType"
              value={localFilters.ticketType}
              onChange={handleInputChange}
            >
              {ticketTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* NEW: Conditionally render the Status filter for Attendees tab */}
          {activeTab === 'Attendees' && (
            <div className={styles.filterGroup}>
              <label htmlFor="status">Check-in Status</label>
              <select
                id="status"
                name="status"
                value={localFilters.status || 'All'}
                onChange={handleInputChange}
              >
                <option value="All">All</option>
                <option value="Checked In">Checked In</option>
                <option value="Not Checked In">Not Checked In</option>
              </select>
            </div>
          )}

          <div className={styles.filterGroup}>
            <label htmlFor="startDate">Order Date Range</label>
            <div className={styles.dateRange}>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={localFilters.startDate}
                onChange={handleInputChange}
              />
              <span>to</span>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={localFilters.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.clearButton} onClick={handleClear}>Clear Filters</button>
          <button className={styles.applyButton} onClick={handleApply}>Apply Filters</button>
        </div>
      </div>
    </>
  );
};

export default FilterModal;