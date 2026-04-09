import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import styles from './payoutSection.module.scss';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';

import { ReactComponent as PlusIcon } from '../../../assets/icons/plus-icon.svg';
import { ReactComponent as CardPaymentsIcon } from '../../../assets/icons/card-payments.svg';
import { ReactComponent as EditIcon } from '../../../assets/icons/edit-icon.svg';
import {
  GetPayoutEligibilityAPI,
  GetPayoutRequestsAPI,
  CreatePayoutRequestAPI,
} from '../../../services/allApis';

// PayoutType: "FULL" | "CUSTOM" | "ADVANCE"
// PayoutStatus: "PENDING" | "CANCELLED" | "PAID"

const PAYOUT_TYPE_LABEL = {
  FULL: 'Full payment (25%)',
  CUSTOM: 'Custom amount',
  ADVANCE: 'Advance payment',
};

const PAYOUT_STATUS_LABEL = {
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  PAID: 'Paid',
};

const formatCurrency = (value) =>
  typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00';

const PayoutSection = ({ eventId, dashboardData, tableOnly = false }) => {
  const [eligibility, setEligibility] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutType, setPayoutType] = useState('full');
  const [customPayoutAmount, setCustomPayoutAmount] = useState('');
  const [payoutStep, setPayoutStep] = useState('selection');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchPayoutData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setError(null);
      const [eligibilityRes, requestsRes] = await Promise.all([
        GetPayoutEligibilityAPI(eventId),
        GetPayoutRequestsAPI(eventId),
      ]);
      const elig = eligibilityRes.data?.data ?? eligibilityRes.data;
      const reqList = requestsRes.data?.data ?? requestsRes.data ?? [];
      setEligibility(elig);
      setRequests(Array.isArray(reqList) ? reqList : []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 401 ? 'Unauthorized. Please sign in again.' : 'Failed to load payout data.');
      setError(message);
      setEligibility(null);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchPayoutData();
  }, [fetchPayoutData]);

  const totalRevenue = eligibility?.totalEventRevenue ?? dashboardData?.revenue ?? 0;
  const alreadyPaidOut = eligibility?.alreadyPaidOut ?? 0;
  const remainingPayoutable = eligibility?.remainingPayoutable ?? 0;
  const eventFinished = eligibility?.eventFinished ?? false;

  const fullAmount = Math.min(totalRevenue * 0.25, remainingPayoutable);
  const canRequestNew = remainingPayoutable > 0.01;

  const handleRequestPayoutClick = () => {
    setShowPayoutModal(true);
    setPayoutType('full');
    setCustomPayoutAmount('');
    setPayoutStep('selection');
    setSubmitError(null);
  };

  const handleCloseModal = () => {
    setShowPayoutModal(false);
    setSubmitError(null);
  };

  const handleContinue = () => {
    switch (payoutStep) {
      case 'selection':
        if (payoutType === 'full') {
          setPayoutStep('display');
        } else {
          setPayoutStep('input');
        }
        break;
      case 'input':
        setPayoutStep('display');
        break;
      case 'display':
        submitPayoutRequest();
        break;
      default:
        handleCloseModal();
    }
  };

  const submitPayoutRequest = async () => {
    const amount = payoutType === 'full' ? fullAmount : parseFloat(customPayoutAmount);
    if (!eventId || amount <= 0) return;

    const effectivePayoutType =
      !eventFinished ? 'ADVANCE' : payoutType === 'full' ? 'FULL' : 'CUSTOM';

    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await CreatePayoutRequestAPI({
        eventId: Number(eventId),
        amount,
        payoutType: effectivePayoutType,
      });
      setSuccessMessage('Payout request submitted successfully.');
      setTimeout(() => setSuccessMessage(null), 5000);
      handleCloseModal();
      fetchPayoutData();
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to submit payout request. Please try again.';
      setSubmitError(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBack = () => {
    switch (payoutStep) {
      case 'display':
        setPayoutStep(payoutType === 'custom' ? 'input' : 'selection');
        break;
      case 'input':
        setPayoutStep('selection');
        break;
      default:
        break;
    }
  };

  const isCustomAmountValid =
    parseFloat(customPayoutAmount) > 0 &&
    parseFloat(customPayoutAmount) <= remainingPayoutable;

  const continueButtonText =
    payoutStep === 'display' ? (submitLoading ? 'Sending…' : 'Send request') : 'Continue';

  const [payoutSorting, setPayoutSorting] = useState([]);
  const [payoutPagination, setPayoutPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    setPayoutPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [payoutSorting]);

  useEffect(() => {
    setPayoutPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [requests?.length]);

  const parseRequestedAtForSort = (requestedAt) => {
    const t = new Date(requestedAt ?? '').getTime();
    return Number.isNaN(t) ? 0 : t;
  };

  const payoutColumns = [
    {
      id: 'amount',
      accessorFn: (row) => row.amount ?? 0,
      header: 'Amount',
      enableSorting: true,
      sortingFn: (rowA, rowB) =>
        parseFloat(rowA.original.amount ?? 0) - parseFloat(rowB.original.amount ?? 0),
      cell: ({ row }) => formatCurrency(row.original.amount),
      meta: { cellClassName: styles.amountCell },
    },
    {
      id: 'type',
      accessorFn: (row) => row.payoutType ?? '',
      header: 'Type',
      enableSorting: true,
      cell: ({ row }) => PAYOUT_TYPE_LABEL[row.original.payoutType] ?? row.original.payoutType,
    },
    {
      id: 'status',
      accessorFn: (row) => row.status ?? '',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => (
        <span
          className={
            row.original.status === 'PAID'
              ? styles.statusPAID
              : row.original.status === 'CANCELLED'
              ? styles.statusCANCELLED
              : styles.statusPENDING
          }
        >
          {PAYOUT_STATUS_LABEL[row.original.status] ?? row.original.status}
        </span>
      ),
    },
    {
      id: 'requestedAt',
      accessorFn: (row) => row.requestedAt ?? '',
      header: 'Requested',
      enableSorting: true,
      sortingFn: (rowA, rowB) =>
        parseRequestedAtForSort(rowA.original.requestedAt) - parseRequestedAtForSort(rowB.original.requestedAt),
      cell: ({ row }) =>
        row.original.requestedAt ? format(new Date(row.original.requestedAt), 'dd MMM yyyy, HH:mm') : '—',
      meta: { cellClassName: styles.dateCell },
    },
  ];

  const payoutTable = useReactTable({
    data: requests ?? [],
    columns: payoutColumns,
    state: { sorting: payoutSorting, pagination: payoutPagination },
    onSortingChange: setPayoutSorting,
    onPaginationChange: setPayoutPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const payoutTotalRows = payoutTable.getPrePaginationRowModel().rows.length;
  const payoutPageStart =
    payoutTotalRows === 0 ? 0 : payoutPagination.pageIndex * payoutPagination.pageSize + 1;
  const payoutPageEnd = Math.min((payoutPagination.pageIndex + 1) * payoutPagination.pageSize, payoutTotalRows);
  const getColumnLabel = (column) =>
    typeof column.columnDef.header === 'string' ? column.columnDef.header : '';

  const PayoutRequestsTable = () => (
    <div className={styles.tableWrapper}>
      <table className={styles.payoutTable}>
        <thead>
          {payoutTable.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSortable = header.column.getCanSort();
                const sortingState = header.column.getIsSorted();
                const sortIndicator =
                  sortingState === 'asc' ? ' ▲' : sortingState === 'desc' ? ' ▼' : '';

                return (
                  <th
                    key={header.id}
                    style={{ cursor: isSortable ? 'pointer' : 'default' }}
                    onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable ? sortIndicator : null}
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {payoutTable.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const cellClassName = cell.column.columnDef.meta?.cellClassName;
                return (
                  <td key={cell.id} className={cellClassName} data-label={getColumnLabel(cell.column)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.payoutPagination} aria-label="Payout table pagination">
        <div className={styles.rowsPerPage}>
          <span>Rows per page:</span>
          <select
            value={payoutPagination.pageSize}
            onChange={(e) =>
              setPayoutPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
            }
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <span>
          {payoutPageStart} - {payoutPageEnd} of {payoutTotalRows}
        </span>
        <div>
          <button
            type="button"
            onClick={() => payoutTable.setPageIndex(0)}
            disabled={!payoutTable.getCanPreviousPage()}
          >
            &lt;&lt;
          </button>
          <button
            type="button"
            onClick={() => payoutTable.previousPage()}
            disabled={!payoutTable.getCanPreviousPage()}
            style={{ marginLeft: 8 }}
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={() => payoutTable.nextPage()}
            disabled={!payoutTable.getCanNextPage()}
            style={{ marginLeft: 8 }}
          >
            &gt;
          </button>
          <button
            type="button"
            onClick={() => payoutTable.setPageIndex(Math.max(0, payoutTable.getPageCount() - 1))}
            disabled={!payoutTable.getCanNextPage()}
            style={{ marginLeft: 8 }}
          >
            &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    if (tableOnly) {
      return <div className={styles.loadingState}>Loading payout data…</div>;
    }
    return (
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Payout request</h2>
        </div>
        <div className={styles.loadingState}>Loading payout data…</div>
      </div>
    );
  }

  if (error) {
    if (tableOnly) {
      return <div className={styles.errorState}>{error}</div>;
    }
    return (
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Payout request</h2>
        </div>
        <div className={styles.errorState}>{error}</div>
      </div>
    );
  }

  if (tableOnly) {
    return (
      <div className={styles.payoutHistorySection} style={{ marginTop: 0, border: 'none', padding: 0 }}>
        <h3 className={styles.historyTitle} style={{ textAlign: 'center', marginBottom: '24px' }}>Payout requests</h3>
        {requests.length === 0 ? (
          <div className={styles.noHistoryPlaceholder}>
            <CardPaymentsIcon className={styles.noHistoryIcon} />
            <p className={styles.noHistoryText}>No payout requests found for this event.</p>
          </div>
        ) : (
          <PayoutRequestsTable />
        )}
      </div>
    );
  }

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Payout request</h2>
        {canRequestNew && (
          <button className={styles.requestPayoutButton} onClick={handleRequestPayoutClick}>
            <PlusIcon className={styles.buttonIcon} />
            Request Payout
          </button>
        )}
      </div>

      {successMessage && (
        <div className={styles.successMessage} role="alert">
          {successMessage}
        </div>
      )}

      <div className={styles.contentGrid}>
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Total event revenue</h3>
          <p className={styles.cardValue}>{formatCurrency(totalRevenue)}</p>
        </div>
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Already paid out</h3>
          <p className={styles.cardValue}>{formatCurrency(alreadyPaidOut)}</p>
        </div>
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Remaining</h3>
          <p className={styles.cardValue}>{formatCurrency(remainingPayoutable)}</p>
        </div>
      </div>

      {!canRequestNew && (
        <div className={styles.noPayoutMessage}>
          No payout is available for this event. Remaining amount is {formatCurrency(remainingPayoutable)}.
        </div>
      )}

      <div className={styles.payoutHistorySection}>
        <h3 className={styles.historyTitle}>Payout requests</h3>
        {requests.length === 0 ? (
          <div className={styles.noHistoryPlaceholder}>
            <CardPaymentsIcon className={styles.noHistoryIcon} />
            <p className={styles.noHistoryText}>
              Payout requests will appear here once you submit one.
            </p>
            {canRequestNew && (
              <button
                className={styles.requestPayoutButtonCentered}
                onClick={handleRequestPayoutClick}
              >
                <PlusIcon className={styles.buttonIcon} />
                Request Payout
              </button>
            )}
          </div>
        ) : (
          <PayoutRequestsTable />
        )}
      </div>

      {showPayoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Request Payout</h3>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={handleCloseModal}
                disabled={submitLoading}
              >
                &times;
              </button>
            </div>
            <p className={styles.modalDescription}>
              {!eventFinished
                ? 'This is an advance payment (event has not ended yet).'
                : 'Choose how you’d like to request your funds.'}
            </p>

            <div className={styles.payoutModalBody}>
              {payoutStep === 'selection' && (
                <div className={styles.payoutOptions}>
                  <div
                    className={`${styles.optionCard} ${payoutType === 'full' ? styles.selected : ''}`}
                    onClick={() => setPayoutType('full')}
                  >
                    <label className={styles.radioButton}>
                      <input
                        type="radio"
                        name="payoutOption"
                        value="full"
                        checked={payoutType === 'full'}
                        onChange={() => setPayoutType('full')}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioCustom} />
                      <div className={styles.optionDetails}>
                        <span className={styles.optionLabel}>
                          Full payment (25% of revenue)
                        </span>
                        <span className={styles.optionDescription}>
                          Request 25% of total event revenue (capped by remaining).
                        </span>
                      </div>
                    </label>
                    <span className={styles.amountDisplay}>
                      {formatCurrency(fullAmount)}
                    </span>
                  </div>
                  <div
                    className={`${styles.optionCard} ${payoutType === 'custom' ? styles.selected : ''}`}
                    onClick={() => setPayoutType('custom')}
                  >
                    <label className={styles.radioButton}>
                      <input
                        type="radio"
                        name="payoutOption"
                        value="custom"
                        checked={payoutType === 'custom'}
                        onChange={() => setPayoutType('custom')}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioCustom} />
                      <div className={styles.optionDetails}>
                        <span className={styles.optionLabel}>Custom amount</span>
                        <span className={styles.optionDescription}>
                          Request an amount up to {formatCurrency(remainingPayoutable)}.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {payoutStep === 'input' && (
                <div className={styles.customAmountInputSection}>
                  <h4 className={styles.customAmountPrompt}>Custom amount</h4>
                  <div className={styles.inputCard}>
                    <p className={styles.inputCardTitle}>Enter amount (max {formatCurrency(remainingPayoutable)})</p>
                    <div className={styles.amountInputContainer}>
                      <span className={styles.currencySymbol}>$</span>
                      <input
                        type="number"
                        value={customPayoutAmount}
                        onChange={(e) =>
                          setCustomPayoutAmount(
                            e.target.value === '' ? '' : parseFloat(e.target.value) || ''
                          )}
                        placeholder="0.00"
                        className={styles.amountInput}
                        min="0"
                        max={remainingPayoutable}
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              )}

              {payoutStep === 'display' && (
                <div className={styles.customAmountDisplaySection}>
                  <h4 className={styles.customAmountPrompt}>
                    {payoutType === 'full' ? 'Full payment (25%)' : 'Custom amount'}
                  </h4>
                  <div className={styles.displayCard}>
                    <p className={styles.displayCardTitle}>Amount to request</p>
                    <div className={styles.displayAmountContainer}>
                      <span className={styles.finalAmount}>
                        {formatCurrency(
                          payoutType === 'full'
                            ? fullAmount
                            : parseFloat(customPayoutAmount) || 0
                        )}
                      </span>
                      {payoutType === 'custom' && (
                        <EditIcon
                          className={styles.editIcon}
                          onClick={() => setPayoutStep('input')}
                        />
                      )}
                    </div>
                    <p className={styles.deliveryTime}>
                      Request will be processed within 2 business days.
                    </p>
                  </div>
                </div>
              )}

              {submitError && (
                <div className={styles.submitError} role="alert">
                  {submitError}
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              {payoutStep !== 'selection' && (
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={handleBack}
                  disabled={submitLoading}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCloseModal}
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.continueButton}
                onClick={handleContinue}
                disabled={
                  (payoutStep === 'input' && !isCustomAmountValid) || submitLoading
                }
              >
                {continueButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PayoutSection.propTypes = {
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  dashboardData: PropTypes.object,
  tableOnly: PropTypes.bool,
};

export default PayoutSection;
