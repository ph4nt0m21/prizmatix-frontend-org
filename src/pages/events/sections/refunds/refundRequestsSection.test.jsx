import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import RefundRequestsSection from './refundRequestsSection';
import {
  GetRefundRequestsAPI,
  ApproveRefundRequestAPI,
  DeclineRefundRequestAPI,
} from '../../../../services/allApis';

jest.mock('../../../../services/allApis', () => ({
  GetRefundRequestsAPI: jest.fn(),
  ApproveRefundRequestAPI: jest.fn(),
  DeclineRefundRequestAPI: jest.fn(),
}));
jest.mock('react-toastify', () => ({ toast: { success: jest.fn() } }));

const request = (over = {}) => ({
  id: 5,
  status: 'REQUESTED',
  orderId: 91827,
  customerName: 'Alex R',
  customerEmail: 'alex@example.com',
  reason: 'Unable to attend',
  purchaseDate: '2026-10-10T21:27:00',
  requestedAt: '2026-10-11T00:00:00Z',
  tickets: [{ ticketId: 10, attendeeName: 'Alex', ticketType: 'Early bird', amount: 15 }],
  wholeOrder: false,
  orderTicketCount: 2,
  originalPayment: 33.54,
  ticketValue: 30,
  serviceFee: 3.54,
  alreadyRefunded: null,
  refundAmount: 15,
  blockedReason: null,
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  GetRefundRequestsAPI.mockResolvedValue({ data: [request()] });
  ApproveRefundRequestAPI.mockResolvedValue({});
  DeclineRefundRequestAPI.mockResolvedValue({});
});

test('shows which tickets are refunded and the non-refundable service fee', async () => {
  render(<RefundRequestsSection eventId="201" />);
  expect(await screen.findByText('Alex R')).toBeInTheDocument();
  expect(screen.getByText('1 of 2 tickets')).toBeInTheDocument();
  expect(screen.getByText('Service fee (non-refundable)')).toBeInTheDocument();
  expect(screen.getByText('$3.54')).toBeInTheDocument();
});

test('approves without sending an amount, only after confirming', async () => {
  render(<RefundRequestsSection eventId="201" />);
  fireEvent.click(await screen.findByRole('button', { name: /Approve refund/ }));
  expect(ApproveRefundRequestAPI).not.toHaveBeenCalled();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Approve refund/ }));
  await waitFor(() => expect(ApproveRefundRequestAPI).toHaveBeenCalledWith('201', 5));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('declining needs a reason', async () => {
  render(<RefundRequestsSection eventId="201" />);
  fireEvent.click(await screen.findByRole('button', { name: 'Decline' }));
  const dialog = within(screen.getByRole('dialog'));
  fireEvent.click(dialog.getByRole('button', { name: 'Decline request' }));
  expect(DeclineRefundRequestAPI).not.toHaveBeenCalled();
  fireEvent.change(dialog.getByRole('textbox'), { target: { value: ' Outside our policy ' } });
  fireEvent.click(dialog.getByRole('button', { name: 'Decline request' }));
  await waitFor(() => expect(DeclineRefundRequestAPI).toHaveBeenCalledWith('201', 5, 'Outside our policy'));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('a blocked request can be declined but not approved', async () => {
  GetRefundRequestsAPI.mockResolvedValue({
    data: [request({ blockedReason: 'Alex has already checked in with this ticket.' })],
  });
  render(<RefundRequestsSection eventId="201" />);
  expect(await screen.findByRole('button', { name: /Approve refund/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Decline' })).toBeEnabled();
  expect(screen.getByText(/already checked in/)).toBeInTheDocument();
});

test('keeps the dialog open and shows why the server refused', async () => {
  ApproveRefundRequestAPI.mockRejectedValue({ response: { data: { message: 'The customer has withdrawn this request.' } } });
  render(<RefundRequestsSection eventId="201" />);
  fireEvent.click(await screen.findByRole('button', { name: /Approve refund/ }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Approve refund/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('The customer has withdrawn this request.');
});
