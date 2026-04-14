import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './recentOrdersModal.module.scss';
import { FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';

const DEFAULT_PAGE_SIZE = 10;

const RecentOrdersModal = ({ isOpen, onClose, orders }) => {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE });

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [sorting]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [orders?.length]);

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
    data: orders ?? [],
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalRows = table.getPrePaginationRowModel().rows.length;
  const pageStart = totalRows === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const pageEnd = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRows);
  const getColumnLabel = (column) =>
    typeof column.columnDef.header === 'string' ? column.columnDef.header : '';

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Recent Orders</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>
        <div className={styles.content}>
          {/* NEW: Added a container for horizontal scrolling */}
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

          <div className={styles.pagination} aria-label="Recent orders pagination">
            <div className={styles.rowsPerPage}>
              <span>Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
                }
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <span>
              {pageStart} - {pageEnd} of {totalRows}
            </span>
            <div>
              <button type="button" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                &lt;&lt;
              </button>
              <button type="button" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                &lt;
              </button>
              <button type="button" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                &gt;
              </button>
              <button type="button" onClick={() => table.setPageIndex(Math.max(0, table.getPageCount() - 1))} disabled={!table.getCanNextPage()}>
                &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

RecentOrdersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orders: PropTypes.array,
};

export default RecentOrdersModal;