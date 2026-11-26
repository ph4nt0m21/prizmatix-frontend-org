// Refund state as the backend reports it on orders and tickets (see RefundRules in the admin
// backend). One place for the wording so every order list reads the same.

const ORDER_REFUND = {
  REFUNDED: { label: 'Refunded', tone: 'refunded' },
  PARTIALLY_REFUNDED: { label: 'Partly refunded', tone: 'refunded' },
  REFUND_REQUESTED: { label: 'Refund requested', tone: 'pending' },
  REFUND_APPROVED: { label: 'Refund approved', tone: 'approved' },
};

const TICKET_REFUND = {
  REFUNDED: { label: 'Refunded', tone: 'refunded' },
  REQUESTED: { label: 'Refund requested', tone: 'pending' },
  APPROVED: { label: 'Refund approved', tone: 'approved' },
  PROCESSING: { label: 'Refund processing', tone: 'approved' },
  FAILED: { label: 'Refund processing', tone: 'approved' },
};

export const orderRefund = (status) => ORDER_REFUND[status] || null;
export const ticketRefund = (status) => TICKET_REFUND[status] || null;

export const formatRefundMoney = (value) => `$${Number(value || 0).toFixed(2)}`;
