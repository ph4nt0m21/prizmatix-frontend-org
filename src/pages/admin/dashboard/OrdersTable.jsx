import React from 'react';
import styles from './ordersTable.module.scss';
import { FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrdersTable = ({ orders, onOrderSelect }) => {
  // Use headers that can be populated from the provided data
  const tableHeaders = ['Order ID', 'Name', 'Mail', 'Order Date', 'Ticket Type', 'Amount', 'Discount'];
  
  const handleDownloadDetailsPDF = (order, e) => {
    e.stopPropagation(); 
    const doc = new jsPDF();
    // ... PDF generation logic remains the same
    doc.save(`order-details-${order.id}.pdf`);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!orders || orders.length === 0) {
    return <div className={styles.noResults}>No orders found.</div>;
  }

  return (
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
              <td>{order.orderDate}</td>
              <td><span className={styles.ticketType}>{order.ticketType}</span></td>
              <td>{formatAmount(order.amount)}</td>
              <td>
                {order.discount && (
                  <span className={styles.discountCode}>{order.discount}</span>
                )}
              </td>
              <td className={styles.actionCell}>
                <button className={styles.downloadButton} onClick={(e) => handleDownloadDetailsPDF(order, e)} title="Download Details">
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
  );
};

export default OrdersTable;