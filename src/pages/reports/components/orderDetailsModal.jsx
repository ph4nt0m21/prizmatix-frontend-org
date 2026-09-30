import React from 'react';
import styles from './orderDetailsModal.module.scss';
import { FiX, FiMoreHorizontal, FiDownload } from 'react-icons/fi';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{order.id}</h3>
          <p>Order Details</p>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4>Purchase Details</h4>
              <div></div>
            </div>
            <div className={styles.detailBlock}>
              <div className={styles.detailItem}>
                <span>Purchase Date</span>
                <strong>{order.purchaseDate}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Payment Method</span>
                <strong>{order.paymentMethod}</strong>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4>Customer</h4>
              <button><FiMoreHorizontal /></button>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Full Name</span>
              <span className={styles.infoValue}>{order.customer.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>E-Mail</span>
              <span className={styles.infoValue}>{order.customer.email}</span>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4>Tickets</h4>
              <button><FiMoreHorizontal /></button>
            </div>
            {order.tickets && order.tickets.map((ticket, index) => (
              <div key={ticket.ticketId || index} className={styles.ticketItem}>
                <div className={styles.ticketInfo}>
                  <span className={styles.ticketName}>{ticket.ticketType}</span>
                </div>
              </div>
            ))}
          </div>

           <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4>Attendees</h4>
              <button><FiMoreHorizontal /></button>
            </div>
            {order.attendees && order.attendees.map((attendee, index) => (
                <div key={index} className={styles.attendeeNameRow}>
                  {attendee.name}
                </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.downloadInvoice}>
            <FiDownload /> Download Invoice
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsModal;