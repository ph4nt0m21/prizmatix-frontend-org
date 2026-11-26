import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FiX } from 'react-icons/fi';
import styles from './refundRequestsSection.module.scss';
import {
  GetRefundRequestsAPI,
  ApproveRefundRequestAPI,
  DeclineRefundRequestAPI,
} from '../../../../services/allApis';
import { formatRefundMoney } from '../../../../utils/refundUtil';

const FILTERS = [
  { key: 'PENDING', label: 'Pending', statuses: ['REQUESTED'] },
  { key: 'APPROVED', label: 'Approved', statuses: ['APPROVED', 'PROCESSING', 'FAILED'] },
  { key: 'REFUNDED', label: 'Refunded', statuses: ['REFUNDED'] },
  { key: 'CLOSED', label: 'Declined', statuses: ['DECLINED', 'WITHDRAWN'] },
];

const STATUS = {
  REQUESTED: { label: 'Pending', tone: 'pending' },
  APPROVED: { label: 'Approved', tone: 'approved' },
  PROCESSING: { label: 'Processing', tone: 'approved' },
  FAILED: { label: 'Processing', tone: 'approved' },
  REFUNDED: { label: 'Refunded', tone: 'refunded' },
  DECLINED: { label: 'Declined', tone: 'closed' },
  WITHDRAWN: { label: 'Withdrawn', tone: 'closed' },
};

const EMPTY = {
  PENDING: 'No refund requests are waiting for you.',
  APPROVED: 'No approved refunds are waiting to be processed.',
  REFUNDED: 'No refunds have been made for this event.',
  CLOSED: 'No requests have been declined or withdrawn.',
};

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const RefundRequestsSection = ({ eventId }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState('PENDING');
  // { type: 'approve' | 'decline', request }
  const [dialog, setDialog] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [dialogError, setDialogError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await GetRefundRequestsAPI(eventId);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setLoadError(errorMessage(err, 'Could not load refund requests.'));
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) load();
  }, [eventId, load]);

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.key, requests.filter((r) => f.statuses.includes(r.status)).length])),
    [requests]
  );
  const visible = useMemo(() => {
    const active = FILTERS.find((f) => f.key === filter);
    return requests.filter((r) => active.statuses.includes(r.status));
  }, [requests, filter]);

  const openDialog = (type, request) => {
    setDialog({ type, request });
    setDeclineReason('');
    setDialogError(null);
  };

  const closeDialog = () => {
    if (!isSubmitting) setDialog(null);
  };

  const submit = async () => {
    const { type, request } = dialog;
    if (type === 'decline' && !declineReason.trim()) {
      setDialogError('Tell the customer why their request is declined.');
      return;
    }
    setIsSubmitting(true);
    setDialogError(null);
    try {
      if (type === 'approve') {
        await ApproveRefundRequestAPI(eventId, request.id);
        toast.success('Refund approved. Prizmatix will now process it.');
      } else {
        await DeclineRefundRequestAPI(eventId, request.id, declineReason.trim());
        toast.success('Refund request declined. The customer has been emailed.');
      }
      setDialog(null);
      load();
    } catch (err) {
      setDialogError(errorMessage(err, 'Something went wrong. Please try again.'));
      // It may have been withdrawn or decided elsewhere; show what it is now.
      load();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRequest = (r) => {
    const status = STATUS[r.status] || { label: r.status, tone: 'closed' };
    return (
      <li key={r.id} className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h4 className={styles.cardTitle}>{r.customerName || r.customerEmail}</h4>
            <p className={styles.muted}>
              {r.customerEmail} · Order #{r.orderId}
            </p>
          </div>
          <span className={`${styles.status} ${styles[status.tone]}`}>{status.label}</span>
        </div>

        <div className={styles.cardBody}>
          <dl className={styles.facts}>
            <dt>Refunding</dt>
            <dd>
              {r.wholeOrder ? 'Whole order' : `${r.tickets.length} of ${r.orderTicketCount} tickets`}
              <ul className={styles.tickets}>
                {r.tickets.map((t) => (
                  <li key={t.ticketId}>
                    {t.attendeeName ? `${t.attendeeName} · ` : ''}
                    {t.ticketType} · {formatRefundMoney(t.amount)}
                  </li>
                ))}
              </ul>
            </dd>
            <dt>Reason</dt>
            <dd className={styles.reason}>{r.reason}</dd>
            <dt>Purchased</dt>
            <dd>{formatDate(r.purchaseDate)}</dd>
            <dt>Requested</dt>
            <dd>{formatDate(r.requestedAt)}</dd>
            {r.refundPolicy && (
              <>
                <dt>Refund policy</dt>
                <dd>{r.refundPolicy}</dd>
              </>
            )}
            {r.decidedAt && r.status !== 'REQUESTED' && (
              <>
                <dt>{r.status === 'WITHDRAWN' ? 'Withdrawn' : 'Decided'}</dt>
                <dd>{formatDate(r.decidedAt)}</dd>
              </>
            )}
            {r.declineReason && (
              <>
                <dt>Your reason</dt>
                <dd className={styles.reason}>{r.declineReason}</dd>
              </>
            )}
            {r.refundedAt && (
              <>
                <dt>Refunded</dt>
                <dd>{formatDate(r.refundedAt)}</dd>
              </>
            )}
          </dl>

          <div className={styles.money}>
            <div className={styles.moneyRow}>
              <span>Original payment</span>
              <span>{formatRefundMoney(r.originalPayment)}</span>
            </div>
            <div className={styles.moneyRow}>
              <span>Ticket value</span>
              <span>{formatRefundMoney(r.ticketValue)}</span>
            </div>
            <div className={styles.moneyRow}>
              <span>Service fee (non-refundable)</span>
              <span>{formatRefundMoney(r.serviceFee)}</span>
            </div>
            {Number(r.alreadyRefunded) > 0 && (
              <div className={styles.moneyRow}>
                <span>Already refunded</span>
                <span>{formatRefundMoney(r.alreadyRefunded)}</span>
              </div>
            )}
            <div className={styles.moneyTotal}>
              <span>Refund amount</span>
              <span>{formatRefundMoney(r.refundAmount)}</span>
            </div>
          </div>
        </div>

        {r.status === 'REQUESTED' && (
          <>
            {r.blockedReason && <p className={styles.blocked}>Can't be approved: {r.blockedReason}</p>}
            <div className={styles.actions}>
              <button type="button" className={styles.declineButton} onClick={() => openDialog('decline', r)}>
                Decline
              </button>
              <button
                type="button"
                className={styles.approveButton}
                onClick={() => openDialog('approve', r)}
                disabled={!!r.blockedReason}
              >
                Approve refund · {formatRefundMoney(r.refundAmount)}
              </button>
            </div>
          </>
        )}
      </li>
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>Refund Requests</h3>
        <p className={styles.muted}>
          Only ticket value is refunded. After you approve, Prizmatix sends the refund to the customer.
        </p>
      </div>

      <div className={styles.filters} role="group" aria-label="Filter refund requests">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            className={`${styles.filter} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className={styles.placeholder}>Loading refund requests…</p>
      ) : loadError ? (
        <p className={styles.placeholder} role="alert">
          {loadError}{' '}
          <button type="button" className={styles.linkButton} onClick={load}>
            Try again
          </button>
        </p>
      ) : visible.length === 0 ? (
        <p className={styles.placeholder}>{EMPTY[filter]}</p>
      ) : (
        <ul className={styles.list}>{visible.map(renderRequest)}</ul>
      )}

      {dialog && (
        <div className={styles.overlay} onClick={closeDialog}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h4 id="refund-dialog-title">
                {dialog.type === 'approve'
                  ? `Approve ${formatRefundMoney(dialog.request.refundAmount)} refund?`
                  : 'Decline refund request?'}
              </h4>
              <button type="button" className={styles.closeButton} aria-label="Close" onClick={closeDialog}>
                <FiX />
              </button>
            </div>

            {dialog.type === 'approve' ? (
              <p className={styles.modalText}>
                {dialog.request.customerName || dialog.request.customerEmail} will be refunded{' '}
                {formatRefundMoney(dialog.request.refundAmount)} for{' '}
                {dialog.request.wholeOrder
                  ? `their whole order (#${dialog.request.orderId})`
                  : `${dialog.request.tickets.length} of ${dialog.request.orderTicketCount} tickets in order #${dialog.request.orderId}`}
                . This can't be undone here.
              </p>
            ) : (
              <label className={styles.field}>
                <span>Reason (sent to the customer)</span>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={declineReason}
                  disabled={isSubmitting}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
              </label>
            )}

            {dialogError && (
              <p className={styles.errorText} role="alert">
                {dialogError}
              </p>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={closeDialog} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                type="button"
                className={dialog.type === 'approve' ? styles.approveButton : styles.dangerButton}
                onClick={submit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving…'
                  : dialog.type === 'approve'
                    ? `Approve refund · ${formatRefundMoney(dialog.request.refundAmount)}`
                    : 'Decline request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundRequestsSection;
