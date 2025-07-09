import React from 'react';
import styles from './ordersTable.module.scss';
import { FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrdersTable = ({ orders, onOrderSelect }) => {
  const tableHeaders = ['Order ID', 'Name', 'Mail', 'Order Date', 'Ticket Type'];
  
  const handleDownloadDetailsPDF = (order, e) => {
    e.stopPropagation(); 
    const doc = new jsPDF();
    let lastY = 15;

    // --- PDF Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(order.id, 14, lastY + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(107, 114, 128);
    doc.text("Order Details", 14, lastY + 14);
    lastY += 30;

    const addSectionHeader = (title) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(17, 24, 39);
        doc.text(title, 14, lastY);
        doc.setDrawColor(229, 231, 235);
        doc.line(14, lastY + 2, 196, lastY + 2);
        lastY += 12;
    };
    
    const drawInfoRow = (label, value, x1, x2, y) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(label, x1, y);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(value, x2, y, { align: 'left' });
    };

    // --- Purchase Details Section ---
    addSectionHeader("Purchase Details");
    drawInfoRow("Purchase Date", order.purchaseDate, 14, 80, lastY);
    drawInfoRow("Payment Method", order.paymentMethod, 110, 150, lastY);
    lastY += 15;

    // --- Customer Section ---
    addSectionHeader("Customer");
    drawInfoRow("Full Name", order.customer.name, 14, 80, lastY);
    lastY += 12;
    drawInfoRow("E-Mail", order.customer.email, 14, 80, lastY);
    lastY += 15;

    // --- Tickets Section ---
    addSectionHeader("Tickets");
    autoTable(doc, {
        startY: lastY,
        theme: 'plain',
        body: order.tickets.map(ticket => [
            { content: ticket.ticketType, styles: { fontStyle: 'bold' } },
            { content: `x 1`, styles: { halign: 'right' } } // Assuming 1 ticket per entry for now
        ]),
        styles: { fontSize: 11, cellPadding: 2 }
    });
    lastY = doc.lastAutoTable.finalY + 5;
    
    // --- Attendees Section ---
    if(order.attendees && order.attendees.length > 0) {
      addSectionHeader("Attendees");
      autoTable(doc, {
          startY: lastY,
          theme: 'plain',
          body: order.attendees.map(a => [a.name]),
          styles: { fontSize: 11, cellPadding: 2, fontStyle: 'bold' },
      });
    }

    doc.save(`order-details-${order.id}.pdf`);
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
              <td className={styles.actionCell}>
                <button className={styles.downloadButton} onClick={(e) => handleDownloadDetailsPDF(order, e)}>
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