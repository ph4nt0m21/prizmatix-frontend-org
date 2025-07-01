import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './ordersTable.module.scss';
import { FiDownload } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- A new, separate component for the Menu, rendered via a Portal ---
const ActionMenu = ({ menuState, onCsvClick, onPdfClick }) => {
  const menuRef = useRef(null);
  
  // Effect to handle clicking outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        menuState.closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuState]);

  const menuStyle = {
    position: 'fixed',
    right: `${window.innerWidth - menuState.right}px`, // Align to the right edge of the button
    top: menuState.direction === 'down' ? `${menuState.bottom + 4}px` : undefined, // Position below button
    bottom: menuState.direction === 'up' ? `${window.innerHeight - menuState.top + 4}px` : undefined, // Position above button
    zIndex: 1000,
  };

  return createPortal(
    <div ref={menuRef} style={menuStyle} className={styles.actionDropdown}>
      <CSVLink
        data={[menuState.order]}
        headers={menuState.csvHeaders}
        filename={`order-${menuState.order.id}.csv`}
        className={styles.actionLink}
        onClick={onCsvClick}
      >
        Download as CSV
      </CSVLink>
      <button onClick={onPdfClick} className={styles.actionLink}>
        Download as PDF
      </button>
    </div>,
    document.body // Render the menu as a direct child of the <body>
  );
};


const OrdersTable = ({ orders, onOrderSelect }) => {
  const [menuState, setMenuState] = useState({ isOpen: false, order: null, top: 0, bottom: 0, right: 0, direction: 'down' });
  const DROPDOWN_HEIGHT = 90;

  const tableHeaders = ['Order ID', 'Name', 'Mail', 'Mobile No.', 'Order Date', 'Ticket Type', 'Amount', 'Discount'];
  const csvHeaders = tableHeaders.map(h => {
      const key = h.toLowerCase().replace(/ /g, '').replace('no.','phone').replace('mail','email');
      // Manual mapping for nested customer data
      if (['name', 'email', 'phone'].includes(key)) return { label: h, key: `customer.${key}` };
      return { label: h, key: key.replace('id','').replace('code','') }; // Adjust keys to match data structure
  });


  const toggleMenu = (order, e) => {
    e.stopPropagation();

    if (menuState.isOpen && menuState.order.id === order.id) {
      closeMenu();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const direction = spaceBelow < DROPDOWN_HEIGHT ? 'up' : 'down';
    
    setMenuState({
      isOpen: true,
      order: order,
      top: rect.top,
      bottom: rect.bottom,
      right: rect.right,
      direction: direction,
      csvHeaders: csvHeaders // Pass headers to the menu state
    });
  };

  const closeMenu = () => {
    setMenuState({ isOpen: false, order: null, top: 0, bottom: 0, right: 0, direction: 'down' });
  };
  
  const handleDownloadPDF = () => {
    const order = menuState.order;
    const doc = new jsPDF({ orientation: 'landscape' });
    const tableHead = [tableHeaders];
    const tableBody = [[
        order.id, order.customer.name, order.customer.email, order.customer.phone,
        order.orderDate, order.ticketType, `$${order.amount.toFixed(2)}`, order.discountCode || 'N/A'
    ]];
    autoTable(doc, { head: tableHead, body: tableBody });
    doc.save(`order-${order.id}.pdf`);
    closeMenu();
  };

  if (orders.length === 0) {
    return <div className={styles.noResults}>No results found.</div>;
  }

  return (
    <>
      {/* The Portal for the menu will be rendered here when state is set */}
      {menuState.isOpen && 
        <ActionMenu 
          menuState={{...menuState, closeMenu}} 
          onCsvClick={closeMenu} 
          onPdfClick={handleDownloadPDF} 
        />
      }

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              {tableHeaders.map(header => <th key={header}>{header}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} onClick={() => onOrderSelect(order)} className={styles.tableRow}>
                <td><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                <td>{order.id}</td>
                <td>{order.customer.name}</td>
                <td>{order.customer.email}</td>
                <td>{order.customer.phone}</td>
                <td>{order.orderDate}</td>
                <td><span className={styles.ticketType}>{order.ticketType}</span></td>
                <td>$ {order.amount.toFixed(2)}</td>
                <td><span className={styles.discountCode}>{order.discountCode || 'N/A'}</span></td>
                <td className={styles.actionCell}>
                  {/* The button now only sets state, it doesn't render the menu here */}
                  <button className={styles.downloadButton} onClick={(e) => toggleMenu(order, e)}>
                    <FiDownload />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <span>Rows per page: 10</span>
          <span>1 - {orders.length} of {orders.length}</span>
          <div>
            <button>&lt;</button>
            <button>&gt;</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersTable;