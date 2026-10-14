import React from 'react';
import styles from './orderDetailsModal.module.scss';
import { FiX, FiCheck } from 'react-icons/fi';

const AttendeeDetailsModal = ({ attendee, onClose, onCheckIn, onCheckOut }) => {
  if (!attendee) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{attendee.name}</h3>
          <p>Attendee Details</p>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4>Attendee</h4>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Full Name</span>
              <span className={styles.infoValue}>{attendee.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>E-Mail</span>
              <span className={styles.infoValue}>{attendee.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Order</span>
              <span className={styles.infoValue}>{attendee.orderId}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Order Date</span>
              <span className={styles.infoValue}>{attendee.orderDate}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ticket Type</span>
              <span className={styles.infoValue}>{attendee.ticketType}</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          {attendee.isCheckedIn ? (
            <button className={styles.downloadInvoice} onClick={() => onCheckOut(attendee.ticketId)}>
              <FiCheck /> Checked In — Undo
            </button>
          ) : (
            <button className={styles.downloadInvoice} onClick={() => onCheckIn(attendee.ticketId)}>
              Check In
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AttendeeDetailsModal;
