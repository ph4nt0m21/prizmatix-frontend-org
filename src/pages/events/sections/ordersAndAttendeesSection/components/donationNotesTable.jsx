import React, { useEffect, useState } from 'react';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import styles from './attendeesTable.module.scss';

const DEFAULT_PAGE_SIZE = 10;

const DonationNotesTable = ({ notes }) => {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE });

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [sorting]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [notes?.length]);

  const columns = [
    {
      id: 'orderId',
      accessorFn: (row) => row.orderId ?? '',
      header: 'Order ID',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'donator',
      accessorFn: (row) => row.donatorName ?? row.buyerName ?? '',
      header: 'Donator',
      enableSorting: true,
      cell: (info) => info.getValue(),
      meta: { cellClassName: styles.nameCell },
    },
    {
      id: 'email',
      accessorFn: (row) => row.buyerEmail ?? '',
      header: 'Email',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'amount',
      accessorFn: (row) => row.amount ?? 0,
      header: 'Amount',
      enableSorting: true,
      cell: (info) => {
        const amount = Number(info.getValue());
        return `$${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`;
      },
    },
    {
      id: 'note',
      accessorFn: (row) => row.donationNote ?? '',
      header: 'Notes',
      enableSorting: false,
      cell: (info) => {
        const note = info.getValue();
        if (!note) return <span style={{ color: '#9CA3AF' }}>—</span>;
        return (
          <span style={{ whiteSpace: 'pre-wrap', display: 'block', maxWidth: 320 }}>
            {note}
          </span>
        );
      },
    },
    {
      id: 'orderDate',
      accessorFn: (row) => row.orderDate ?? '',
      header: 'Order Date',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
  ];

  const table = useReactTable({
    data: notes ?? [],
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

  if (!notes || notes.length === 0) {
    return <div className={styles.noResults}>No donation notes found.</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <colgroup>
          <col style={{ width: '100px' }} />
          <col style={{ width: '160px' }} />
          <col style={{ width: '200px' }} />
          <col style={{ width: '100px' }} />
          <col style={{ width: '280px' }} />
          <col style={{ width: '160px' }} />
        </colgroup>

        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' ↑',
                    desc: ' ↓',
                  }[header.column.getIsSorted()] || null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={styles.tableRow}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cell.column.columnDef.meta?.cellClassName}
                  data-label={getColumnLabel(cell.column)}
                  style={cell.column.id === 'note' ? { whiteSpace: 'normal' } : undefined}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {totalRows > DEFAULT_PAGE_SIZE && (
        <div className={styles.pagination}>
          <span>
            {pageStart}–{pageEnd} of {totalRows}
          </span>
          <div className={styles.paginationButtons}>
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationNotesTable;
