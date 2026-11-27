import React, { useEffect, useState } from 'react';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { FiChevronRight, FiCheck } from 'react-icons/fi';
import styles from './attendeesTable.module.scss';

const DEFAULT_PAGE_SIZE = 10;

const getInitial = (name) => (name ? name.trim().charAt(0).toUpperCase() : '?');

const AttendeesTable = ({ attendees, onAttendeeSelect }) => {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE });

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

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [sorting]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [attendees?.length]);

  const columns = [
    {
      id: 'name',
      accessorFn: (row) => row.name ?? '',
      header: 'Name',
      enableSorting: true,
      cell: (info) => (
        <div className={styles.nameWithAvatar}>
          <span className={styles.avatarWrapper}>
            <span className={styles.avatar}>{getInitial(info.getValue())}</span>
            {info.row.original.isCheckedIn && (
              <span className={styles.checkedInDot} title="Checked in">
                <FiCheck />
              </span>
            )}
          </span>
          <div className={styles.nameEmail}>
            <span className={styles.nameText}>{info.getValue()}</span>
            <span className={styles.emailText}>{info.row.original.email}</span>
          </div>
        </div>
      ),
      meta: { cellClassName: styles.nameCell },
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
      id: 'arrow',
      header: '',
      enableSorting: false,
      cell: () => <FiChevronRight className={styles.arrowIcon} />,
      meta: { cellClassName: styles.arrowCell },
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
    return <div className={styles.noResults}>No attendees found.</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.colName} />
          <col className={styles.colTicket} />
          <col className={styles.colArrow} />
        </colgroup>

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
            <tr
              key={row.id}
              className={styles.tableRow}
              onClick={() => onAttendeeSelect && onAttendeeSelect(row.original)}
            >
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
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{ marginLeft: 8 }}
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{ marginLeft: 8 }}
          >
            &gt;
          </button>
          <button type="button" onClick={() => table.setPageIndex(Math.max(0, table.getPageCount() - 1))} disabled={!table.getCanNextPage()} style={{ marginLeft: 8 }}>
            &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeesTable;
