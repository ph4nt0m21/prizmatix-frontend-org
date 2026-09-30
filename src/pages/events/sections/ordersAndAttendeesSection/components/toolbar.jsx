import React, { useState, useEffect } from 'react';
import styles from './toolbar.module.scss';
import { FiSearch, FiUpload, FiFilter } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import FilterModal from './filterModal';

const Toolbar = ({ activeTab, searchQuery, setSearchQuery, data, currentFilters, onApplyFilters, ticketTypes }) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

  useEffect(() => {
    if (!exportOpen) return undefined;
    const handlePointerDown = (e) => {
      if (!e.target.closest(`.${styles.exportContainer}`)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [exportOpen]);

  const isOrdersTab = activeTab === 'Orders';
  const isDonationNotesTab = activeTab === 'Donation Notes';


  const searchPlaceholder = '';

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    const tableHead = isOrdersTab
      ? [['Order ID', 'Name', 'Mail', 'Order Date', 'Ticket Type']]
      : isDonationNotesTab
        ? [['Order ID', 'Donator', 'Email', 'Amount', 'Notes', 'Order Date']]
        : [['Name', 'Ticket Type', 'Status']];

    const tableBody = isOrdersTab
      ? data.map(order => [
        order.id, order.customer.name, order.customer.email,
        order.orderDate, order.ticketType
      ])
      : isDonationNotesTab
        ? data.map(row => [
          row.orderId,
          row.donatorName || row.buyerName,
          row.buyerEmail,
          row.amount != null ? `$${Number(row.amount).toFixed(2)}` : '',
          row.donationNote || '',
          row.orderDate,
        ])
        : data.map(attendee => [
          attendee.name,
          attendee.ticketType,
          attendee.isCheckedIn ? 'Checked In' : 'Not Checked In'
        ]);

    autoTable(doc, { head: tableHead, body: tableBody });
    doc.save(
      isOrdersTab
        ? 'orders.pdf'
        : isDonationNotesTab
          ? 'donation-notes.pdf'
          : 'attendees.pdf'
    );
    setExportOpen(false);
  };

  const csvHeaders = isOrdersTab
    ? [
      { label: "Order ID", key: "id" },
      { label: "Name", key: "customer.name" },
      { label: "Mail", key: "customer.email" },
      { label: "Order Date", key: "orderDate" },
      { label: "Ticket Type", key: "ticketType" },
    ]
    : isDonationNotesTab
      ? [
        { label: "Order ID", key: "orderId" },
        { label: "Donator", key: "donatorName" },
        { label: "Email", key: "buyerEmail" },
        { label: "Amount", key: "amount" },
        { label: "Notes", key: "donationNote" },
        { label: "Order Date", key: "orderDate" },
      ]
      : [
        { label: "Name", key: "name" },
        { label: "Ticket Type", key: "ticketType" },
        { label: "Status", key: "isCheckedIn" }
      ];

  return (
    <>
      <div className={styles.toolbar}>
        {searchActive ? (
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"

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
            <button
              className={styles.actionButton}
              onClick={() => setFilterModalOpen(true)}
              style={isDonationNotesTab ? { display: 'none' } : undefined}
            >
              <FiFilter /> Filter
            </button>
            <div className={styles.exportContainer}>
              <button className={styles.actionButton} onClick={() => setExportOpen(!exportOpen)}>
                <FiUpload /> Export
              </button>
              {exportOpen && (
                <div className={styles.exportDropdown}>
                  <CSVLink
                    data={data}
                    headers={csvHeaders}
                    filename={
                      isOrdersTab
                        ? 'orders.csv'
                        : isDonationNotesTab
                          ? 'donation-notes.csv'
                          : 'attendees.csv'
                    }
                    className={styles.exportLink}
                    onClick={() => setExportOpen(false)}
                  >
                    Export as CSV
                  </CSVLink>
                  <button onClick={handleExportPDF} className={styles.exportLink}>Export as PDF</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilters={onApplyFilters}
        currentFilters={currentFilters}
        ticketTypes={ticketTypes}
        activeTab={activeTab}
      />
    </>
  );
};

export default Toolbar;