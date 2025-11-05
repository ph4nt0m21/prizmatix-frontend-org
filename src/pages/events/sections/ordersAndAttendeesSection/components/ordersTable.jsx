import React, { useState } from 'react';
import styles from './ordersTable.module.scss';
import { FiDownload, FiMail } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReissueOrderEmailAPI } from '../../../../../services/allApis'; // ✅ import new API

const OrdersTable = ({ orders, onOrderSelect }) => {
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  const tableHeaders = ['Order ID', 'Name', 'Mail', 'Order Date', 'Ticket Type', 'Re-Issue Email'];

  const handleDownloadDetailsPDF = (order, e) => {
    e.stopPropagation();
    const doc = new jsPDF();
    // (PDF logic unchanged)
    doc.save(`order-details-${order.id}.pdf`);
  };

  const handleReissueEmail = async (orderId, e) => {
    e.stopPropagation();
    try {
      setLoadingOrderId(orderId);
      const cleanOrderId = orderId.replace('#', ''); // remove # if added in format
      await ReissueOrderEmailAPI(cleanOrderId);
      alert(`Reissue email sent successfully for Order ${orderId}`);
    } catch (error) {
      console.error('Failed to reissue email:', error);
      alert(`Failed to send reissue email for ${orderId}`);
    } finally {
      setLoadingOrderId(null);
    }
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
              <td>
                <button
                  className={styles.reissueButton}
                  onClick={(e) => handleReissueEmail(order.id, e)}
                  disabled={loadingOrderId === order.id}
                >
                  {loadingOrderId === order.id ? 'Sending...' : (
                    <>
                      <FiMail /> Reissue
                    </>
                  )}
                </button>
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
