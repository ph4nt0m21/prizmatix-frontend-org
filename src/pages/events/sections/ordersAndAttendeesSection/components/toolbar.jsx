import React, { useState } from 'react';
import styles from './toolbar.module.scss';
import { FiSearch, FiUpload, FiPlus, FiFilter } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import FilterModal from './filterModal';

const Toolbar = ({ activeTab, searchQuery, setSearchQuery, data, currentFilters, onApplyFilters, ticketTypes }) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

  const isOrdersTab = activeTab === 'Orders';
  const addButtonText = isOrdersTab ? 'Add Order' : 'Add Attendee';
  // ... (rest of the component logic is unchanged) ...

  return (
    <>
      <div className={styles.toolbar}>
        {/* ... search and action buttons JSX remains the same ... */}
        {searchActive ? (
          <div className={styles.searchContainer}>
             <FiSearch className={styles.searchIcon} />
             <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setSearchActive(false)}
              autoFocus
            />
          </div>
        ) : (
          <div className={styles.actions}>
             <button className={styles.iconButton} onClick={() => setSearchActive(true)}>
              <FiSearch />
            </button>
            <button className={styles.actionButton} onClick={() => setFilterModalOpen(true)}>
              <FiFilter /> Filter
            </button>
            <div className={styles.exportContainer}>
              <button className={styles.actionButton} onClick={() => setExportOpen(!exportOpen)}>
                <FiUpload /> Export
              </button>
              {/* ... export dropdown ... */}
            </div>
             <button className={`${styles.actionButton} ${styles.primary}`}>
              <FiPlus /> {addButtonText}
            </button>
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilters={onApplyFilters}
        currentFilters={currentFilters}
        ticketTypes={ticketTypes}
        // Pass activeTab to the modal so it knows which filters to show
        activeTab={activeTab}
      />
    </>
  );
};

export default Toolbar;