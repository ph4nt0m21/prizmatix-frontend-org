import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiCheck, FiCheckCircle, FiHeart, FiMaximize, FiX } from 'react-icons/fi';
import styles from './scanResultModal.module.scss';

// One QR code belongs to one order, so a scan identifies the order's tickets
// and donations, not a single row. This pop-up lists exactly those items so
// door staff can check them in without hunting through the attendee list.
//
// `items` are the order's rows as they stand now (they update as staff check
// people in). `alreadyCheckedInIds` holds the rows that were already checked
// in when the code was scanned, which is what tells staff the code has been
// used before.
const ScanResultModal = ({
  orderId,
  eventName,
  items,
  alreadyCheckedInIds,
  pendingIds,
  error,
  onCheckIn,
  onUndo,
  onCheckInAll,
  onScanNext,
  onClose,
}) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const total = items.length;
  const remaining = items.filter((item) => !item.isCheckedIn).length;
  const usedBefore = items.filter((item) => alreadyCheckedInIds.has(item.id)).length;
  const allUsedBefore = total > 0 && usedBefore === total;

  let status;
  if (total === 0) {
    status = { tone: 'warning', text: 'This order has no tickets to check in.' };
  } else if (allUsedBefore) {
    status = {
      tone: 'warning',
      text:
        total === 1
          ? 'Already checked in. This code has been used before.'
          : `Already checked in. All ${total} items on this code have been used before.`,
    };
  } else if (remaining === 0) {
    status = { tone: 'success', text: total === 1 ? 'Checked in.' : `All ${total} checked in.` };
  } else if (usedBefore > 0) {
    status = {
      tone: 'warning',
      text: `${usedBefore} of ${total} already checked in before this scan.`,
    };
  } else {
    status = {
      tone: 'info',
      text: total === 1 ? 'Valid. Ready to check in.' : `Valid. ${total} items ready to check in.`,
    };
  }

  const StatusIcon = status.tone === 'success' || status.tone === 'info' ? FiCheckCircle : FiAlertTriangle;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-result-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 id="scan-result-title">Order #{orderId}</h2>
            {eventName && <p className={styles.eventName}>{eventName}</p>}
          </div>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        <div className={`${styles.status} ${styles[status.tone]}`} role="status">
          <StatusIcon size={20} />
          <span>{status.text}</span>
        </div>

        {error && (
          <div className={`${styles.status} ${styles.error}`} role="alert">
            <FiAlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <ul className={styles.items}>
          {items.map((item) => {
            const isPending = pendingIds.has(item.id);
            const wasUsedBefore = alreadyCheckedInIds.has(item.id);
            return (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemMeta}>
                    {item.isDonation ? (
                      <span className={`${styles.badge} ${styles.donationBadge}`}>
                        <FiHeart size={12} /> Donation
                      </span>
                    ) : (
                      <span className={styles.badge}>{item.ticketType}</span>
                    )}
                    {item.isCheckedIn && (
                      <span
                        className={`${styles.badge} ${
                          wasUsedBefore ? styles.usedBadge : styles.checkedBadge
                        }`}
                      >
                        {wasUsedBefore ? 'Already checked in' : 'Checked in'}
                      </span>
                    )}
                  </span>
                  {item.isDonation && item.donationNote && (
                    <span className={styles.note}>“{item.donationNote}”</span>
                  )}
                </div>
                {item.isCheckedIn ? (
                  <button
                    type="button"
                    className={styles.undoButton}
                    onClick={() => onUndo(item.id)}
                    disabled={isPending}
                  >
                    Undo
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.checkInButton}
                    onClick={() => onCheckIn(item.id)}
                    disabled={isPending}
                  >
                    <FiCheck /> {isPending ? 'Checking in…' : 'Check In'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className={styles.footer}>
          {remaining > 1 && (
            <button
              type="button"
              className={styles.checkInAllButton}
              onClick={onCheckInAll}
              disabled={pendingIds.size > 0}
            >
              <FiCheck /> Check in all {remaining}
            </button>
          )}
          <button type="button" className={styles.scanNextButton} onClick={onScanNext}>
            <FiMaximize /> Scan next
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ScanResultModal;
