import React, { useEffect, useState } from 'react';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import styles from './attendeesTable.module.scss';
import { FiCheck } from 'react-icons/fi';

const DEFAULT_PAGE_SIZE = 10;

const AttendeesTable = ({ attendees, onToggleCheckIn, mode = 'attendees' }) => {
  const isDonators = mode === 'donators';
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE });

  const getTicketTypeClass = (type) => {
    switch (String(type).toLowerCase()) {
      case 'vip':
        return styles.vip;
      case 'standard':
        return styles.standard;
      case 'early bird':
        return styles.earlyBird;
      case 'first release':
        return styles.firstRelease;
      case 'second release':
        return styles.secondRelease;
      default:
        return styles.earlyBird;
    }
  };

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [sorting]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [attendees?.length, mode]);

  const columns = isDonators
    ? [
        {
          id: 'name',
          accessorFn: (row) => row.name ?? '',
          header: 'Donator',
          enableSorting: true,
          cell: (info) => info.getValue(),
        },
        {
          id: 'donationNote',
          accessorFn: (row) => row.donationNote ?? '',
          header: 'Notes',
          enableSorting: true,
          cell: (info) => info.getValue() || '—',
        },
        {
          id: 'checkIn',
          header: () => null,
          enableSorting: false,
          cell: ({ row }) => {
            const attendee = row.original;
            return attendee.isCheckedIn ? (
              <button
                className={`${styles.checkInButton} ${styles.checkedIn}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCheckIn(attendee.id, true);
                }}
              >
                <FiCheck /> Check In
              </button>
            ) : (
              <button
                className={styles.checkInButton}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCheckIn(attendee.id, false);
                }}
              >
                Check In
              </button>
            );
          },
        },
      ]
    : [
        {
          id: 'name',
          accessorFn: (row) => row.name ?? '',
          header: 'Name',
          enableSorting: true,
          cell: (info) => info.getValue(),
        },
        {
          id: 'ticketType',
          accessorFn: (row) => row.ticketType ?? '',
          header: 'Ticket Type',
          enableSorting: true,
          cell: (info) => {
            const ticketType = info.getValue();
            return (
              <span className={`${styles.ticketType} ${getTicketTypeClass(ticketType)}`}>
                {ticketType}
              </span>
            );
          },
        },
        {
          id: 'checkIn',
          header: () => null,
          enableSorting: false,
          cell: ({ row }) => {
            const attendee = row.original;
            return attendee.isCheckedIn ? (
              <button
                className={`${styles.checkInButton} ${styles.checkedIn}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCheckIn(attendee.id, true);
                }}
              >
                <FiCheck /> Check In
              </button>
            ) : (
              <button
                className={styles.checkInButton}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCheckIn(attendee.id, false);
                }}
              >
                Check In
              </button>
            );
          },
        },
      ];

  const table = useReactTable({
    data: attendees ?? [],
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

  if (!attendees || attendees.length === 0) {
    return (
      <div className={styles.noResults}>
        {isDonators ? 'No donators found.' : 'No attendees found.'}
      </div>
    );
  }

  return (
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

      <div className={styles.pagination} aria-label="Table pagination">
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
          <button type="button" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} style={{ marginLeft: 8 }}>
            &lt;
          </button>
          <button type="button" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} style={{ marginLeft: 8 }}>
            &gt;
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(Math.max(0, table.getPageCount() - 1))}
            disabled={!table.getCanNextPage()}
            style={{ marginLeft: 8 }}
          >
            &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeesTable;
