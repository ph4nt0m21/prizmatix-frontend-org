import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './recentOrdersModal.module.scss';
import { FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';

const RECENT_ORDERS_LIMIT = 10;

const RecentOrdersModal = ({ isOpen, onClose, orders, onViewAllOrders }) => {
  const [sorting, setSorting] = useState([]);

  const recentOrders = useMemo(
    () => (orders ?? []).slice(0, RECENT_ORDERS_LIMIT),
    [orders]
  );

  const parseOrderIdForSort = (orderId) => {
    const raw = String(orderId ?? '');
    const digits = raw.replace(/[^\d]/g, '');
    const n = parseInt(digits, 10);
    return Number.isNaN(n) ? 0 : n;
  };

  const parseOrderDateForSort = (orderDate) => {
    const t = new Date(orderDate ?? '').getTime();
    return Number.isNaN(t) ? 0 : t;
  };

  const columns = useMemo(
    () => [
      {
        id: 'orderId',
        accessorFn: (row) => row.orderId ?? '',
        header: 'Order ID',
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          parseOrderIdForSort(rowA.original.orderId) - parseOrderIdForSort(rowB.original.orderId),
        cell: ({ row }) => `#${row.original.orderId}`,
      },
      {
        id: 'name',
        accessorFn: (row) => row.name ?? '',
        header: 'Name',
        enableSorting: true,
        cell: ({ row }) => row.original.name,
      },
      {
        id: 'email',
        accessorFn: (row) => row.email ?? '',
        header: 'Email',
        enableSorting: true,
        cell: ({ row }) => row.original.email,
      },
      {
        id: 'ticketType',
        accessorFn: (row) => row.ticketType ?? '',
        header: 'Ticket Type',
        enableSorting: true,
        cell: ({ row }) => row.original.ticketType,
      },
      {
        id: 'orderDate',
        accessorFn: (row) => row.orderDate ?? '',
        header: 'Date',
        enableSorting: true,
        sortingFn: (rowA, rowB) => parseOrderDateForSort(rowA.original.orderDate) - parseOrderDateForSort(rowB.original.orderDate),
        cell: ({ row }) => format(new Date(row.original.orderDate), 'dd MMM yyyy'),
      },
      {
        id: 'amount',
        accessorFn: (row) => row.amount ?? 0,
        header: 'Amount',
        enableSorting: true,
        sortingFn: (rowA, rowB) => (rowA.original.amount ?? 0) - (rowB.original.amount ?? 0),
        cell: ({ row }) =>
          `$${(row.original.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
    ],
    []
  );

  const table = useReactTable({
    data: recentOrders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const getColumnLabel = (column) =>
    typeof column.columnDef.header === 'string' ? column.columnDef.header : '';

  if (!isOpen) {
    return null;
  }

  const handleViewAll = () => {
    onViewAllOrders?.();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Recent 10 Orders</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const isSortable = header.column.getCanSort();
                      const sortingState = header.column.getIsSorted();
                      const sortIndicator = sortingState === 'asc' ? ' ▲' : sortingState === 'desc' ? ' ▼' : '';

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
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} data-label={getColumnLabel(cell.column)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {recentOrders.length > 0 && (
          <div className={styles.footer}>
            <button type="button" className={styles.viewAllLink} onClick={handleViewAll}>
              View all orders &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

RecentOrdersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orders: PropTypes.array,
  onViewAllOrders: PropTypes.func,
};

export default RecentOrdersModal;
