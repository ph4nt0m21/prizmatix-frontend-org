import React, { useState } from 'react';
import styles from './orderDetailsModal.module.scss';
import { FiX, FiDownload, FiMail, FiCopy, FiCheck, FiUser } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReissueOrderEmailAPI } from '../../../../../services/allApis';

const getTicketTypeClass = (type) => {
  switch (String(type).toLowerCase()) {
    case 'vip':
      return styles.vip;
    case 'standard':
      return styles.standard;
    case 'early bird':
    default:
      return styles.earlyBird;
  }
};

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const OrderDetailsModal = ({ order, onClose, onViewAttendee }) => {
  const [isReissuing, setIsReissuing] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  if (!order) return null;

  const quantity = order.tickets?.length || 0;
  const fees = order.feeBreakdown || {};
  const attendeeTickets = (order.tickets || []).filter((t) => !t.donation);
  const donationTickets = (order.tickets || []).filter((t) => t.donation);

  const handleReissueEmail = async () => {
    try {
      setIsReissuing(true);
      const cleanOrderId = String(order.id).replace('#', '');
      await ReissueOrderEmailAPI(cleanOrderId);
      alert(`Reissue email sent for Order ${order.id}`);
    } catch (err) {
      alert(`Failed to send reissue email for ${order.id}`);
    } finally {
      setIsReissuing(false);
    }
  };

  const handleDownloadDetailsPDF = () => {
    const doc = new jsPDF();
    doc.text(`Order Details - ${order.id}`, 10, 10);
    autoTable(doc, {
      startY: 20,
      body: [
        ['Order ID', order.id],
        ['Name', order.customer.name],
        ['Email', order.customer.email],
        ['Order Date', order.orderDate],
        ['Ticket Type', order.ticketType],
      ],
    });
    doc.save(`order-details-${order.id}.pdf`);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(order.customer.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewAttendee = (ticketId) => {
    const targetTicketId = ticketId ?? attendeeTickets[0]?.ticketId;
    if (targetTicketId && onViewAttendee) {
      onViewAttendee(targetTicketId);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h3>Order {order.id}</h3>
            <div className={styles.headerMeta}>
              <span className={`${styles.ticketType} ${getTicketTypeClass(order.ticketType)}`}>
                {order.ticketType}
              </span>
              <span className={styles.headerDate}>{order.purchaseDate}</span>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {/* Customer */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Customer</div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{order.customer.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValueWithAction}>
                {order.customer.email}
                <button className={styles.copyButton} onClick={handleCopyEmail} type="button">
                  {emailCopied ? <FiCheck /> : <FiCopy />} {emailCopied ? 'Copied' : 'Copy'}
                </button>
              </span>
            </div>
          </div>

          {/* Ticket Information */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Ticket Information</div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ticket Type</span>
              <span className={styles.infoValue}>{order.ticketType}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Quantity</span>
              <span className={styles.infoValue}>
                {quantity} {quantity === 1 ? 'Ticket' : 'Tickets'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Order Date</span>
              <span className={styles.infoValue}>{order.purchaseDate}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.paidBadge}>
                <FiCheck /> Paid
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Actions</div>
            <div className={styles.actionsList}>
              <button className={styles.actionButtonPrimary} onClick={handleReissueEmail} disabled={isReissuing}>
                <FiMail /> {isReissuing ? 'Sending…' : 'Reissue Ticket'}
              </button>
              <button className={styles.actionButton} onClick={handleDownloadDetailsPDF}>
                <FiDownload /> Download Ticket (PDF)
              </button>
              <button className={styles.actionButton} onClick={() => handleViewAttendee()}>
                <FiUser /> View Attendee
              </button>
            </div>
          </div>

          {/* Attendees (only surfaced separately when the order has more than one) */}
          {attendeeTickets.length > 1 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Attendees ({attendeeTickets.length})</div>
              <div className={styles.attendeeList}>
                {attendeeTickets.map((ticket, index) => (
                  <button
                    key={ticket.ticketId || index}
                    className={styles.attendeeRow}
                    onClick={() => handleViewAttendee(ticket.ticketId)}
                    type="button"
                  >
                    <span>{ticket.attendeeName || 'N/A'}</span>
                    <span className={styles.attendeeRowTicketType}>{ticket.ticketType}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Donation notes, when this order includes any donation add-ons */}
          {donationTickets.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Donations</div>
              {donationTickets.map((ticket, index) => (
                <div key={ticket.ticketId || index} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{ticket.attendeeName || 'Donor'}</span>
                  <span className={styles.infoValue}>{ticket.donationNote || '—'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Payment Summary */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Payment Summary</div>
            <div className={styles.summaryRow}>
              <span>Ticket</span>
              <span>{formatCurrency(fees.ticketFaceValue)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Service Fee</span>
              <span>{formatCurrency(fees.platformFee)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>GST</span>
              <span>{formatCurrency(fees.gstOnPlatformFee)}</span>
            </div>
            <div className={styles.summaryRowTotal}>
              <span>Total</span>
              <span>{formatCurrency(fees.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsModal;
