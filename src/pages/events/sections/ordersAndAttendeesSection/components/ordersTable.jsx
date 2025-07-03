import React from 'react';
import styles from './ordersTable.module.scss';
import { FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrdersTable = ({ orders, onOrderSelect }) => {
  const tableHeaders = ['Order ID', 'Name', 'Mail', 'Order Date', 'Ticket Type', 'Amount', 'Discount'];
  
  const handleDownloadDetailsPDF = (order, e) => {
    e.stopPropagation(); 
    const doc = new jsPDF();
    let currentY = 22;

    // Helper function to draw section titles and dividers
    const drawSection = (title, startY) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text(title, 14, startY);
      doc.setDrawColor(229, 231, 235); // line color
      doc.line(14, startY + 2, 196, startY + 2);
      return startY + 12; // Return new Y position
    };
    
    // Helper function to draw key-value pairs
    const drawInfoRow = (label, value, x1, x2, y) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128); // Grey color for label
        doc.text(label, x1, y);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39); // Black color for value
        doc.text(value, x2, y, { align: 'left' });
    };


    // --- 1. PDF Header ---
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(order.id, 14, currentY);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text("Order Details", 14, currentY + 7);
    currentY += 20;

    // --- 2. Purchase Details Section ---
    currentY = drawSection("Purchase Details", currentY);
    drawInfoRow("Purchase Date", order.purchaseDate, 14, 80, currentY);
    drawInfoRow("Payment Method", order.paymentMethod, 110, 150, currentY);
    currentY += 12;
    drawInfoRow("Discount Code", order.discountCode || 'N/A', 14, 80, currentY);
    drawInfoRow("Amount", `$${order.amount.toFixed(2)}`, 110, 150, currentY);
    currentY += 15;


    // --- 3. Customer Section ---
    currentY = drawSection("Customer", currentY);
    drawInfoRow("Full Name", order.customer.name, 14, 80, currentY);
    currentY += 12;
    drawInfoRow("E-Mail", order.customer.email, 14, 80, currentY);
    currentY += 15;


    // --- 4. Tickets Section ---
    currentY = drawSection("Tickets", currentY);
    doc.setFont('helvetica', 'normal');
    order.tickets.forEach(ticket => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text(ticket.name, 14, currentY);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(`$${ticket.price.toFixed(2)}`, 14, currentY + 6);
      doc.text(`x ${ticket.quantity}`, 196, currentY + 3, { align: 'right' });
      
      currentY += 16;
      doc.line(14, currentY - 4, 196, currentY - 4); // Divider
    });
    currentY += 5;
    
    // --- 5. Attendees Section ---
    if(order.attendees && order.attendees.length > 0) {
      currentY = drawSection("Attendees", currentY);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      order.attendees.forEach(attendee => {
        doc.text(attendee.name, 14, currentY);
        currentY += 10;
        doc.line(14, currentY - 4, 196, currentY - 4); // Divider
      });
    }

    doc.save(`order-details-${order.id}.pdf`);
  };

  if (orders.length === 0) {
    return <div className={styles.noResults}>No results found.</div>;
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
              <td>$ {order.amount.toFixed(2)}</td>
              <td><span className={styles.discountCode}>{order.discountCode || 'N/A'}</span></td>
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