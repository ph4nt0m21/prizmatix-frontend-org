// import React, { useState } from 'react';
// import styles from './ordersTable.module.scss';
// import { FiDownload, FiMail } from 'react-icons/fi';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { ReissueOrderEmailAPI } from '../../../../../services/allApis'; // ✅ import new API

// const OrdersTable = ({ orders, onOrderSelect }) => {
//   const [loadingOrderId, setLoadingOrderId] = useState(null);

//   const tableHeaders = ['Order ID', 'Name', 'Mail', 'Order Date', 'Ticket Type', 'Re-Issue Email'];

//   const handleDownloadDetailsPDF = (order, e) => {
//     e.stopPropagation();
//     const doc = new jsPDF();
//     // (PDF logic unchanged)
//     doc.save(`order-details-${order.id}.pdf`);
//   };

//   const handleReissueEmail = async (orderId, e) => {
//     e.stopPropagation();
//     try {
//       setLoadingOrderId(orderId);
//       const cleanOrderId = orderId.replace('#', ''); // remove # if added in format
//       await ReissueOrderEmailAPI(cleanOrderId);
//       alert(`Reissue email sent successfully for Order ${orderId}`);
//     } catch (error) {
//       console.error('Failed to reissue email:', error);
//       alert(`Failed to send reissue email for ${orderId}`);
//     } finally {
//       setLoadingOrderId(null);
//     }
//   };

//   if (!orders || orders.length === 0) {
//     return <div className={styles.noResults}>No orders found.</div>;
//   }

//   return (
//   <div className={styles.tableWrapper}>
//     <div className={styles.tableCard}>
//       <div className={styles.tableTopBar}>
//         <h3 className={styles.tableTitle}>Orders</h3>
//       </div>

//       <div className={styles.tableScroll}>
//         <table className={styles.table}>
//           <thead>
//             <tr>
//               <th><input type="checkbox" /></th>
//               {tableHeaders.map(header => <th key={header}>{header}</th>)}
//               <th></th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders.map((order) => (
//               <tr
//                 key={order.id}
//                 onClick={() => onOrderSelect(order)}
//                 className={styles.tableRow}
//               >
//                 <td>
//                   <input
//                     type="checkbox"
//                     onClick={(e) => e.stopPropagation()}
//                     className={styles.rowCheckbox}
//                   />
//                 </td>

//                 <td className={styles.boldCell}>#{order.id}</td>
//                 <td>{order.customer.name}</td>
//                 <td className={styles.mutedText}>{order.customer.email}</td>
//                 <td>{order.orderDate}</td>

//                 <td>
//                   <span className={styles.tagType}>{order.ticketType}</span>
//                 </td>

//                 <td>
//                   <button
//                     className={styles.reissueButton}
//                     onClick={(e) => handleReissueEmail(order.id, e)}
//                     disabled={loadingOrderId === order.id}
//                   >
//                     {loadingOrderId === order.id ? "Sending..." : <><FiMail /> Reissue</>}
//                   </button>
//                 </td>

//                 <td className={styles.actionCell}>
//                   <button
//                     className={styles.iconButton}
//                     onClick={(e) => handleDownloadDetailsPDF(order, e)}
//                     title="Download Order Summary"
//                   >
//                     <FiDownload />
//                   </button>
//                 </td>

//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className={styles.paginationBar}>
//         <div className={styles.rowsInfo}>Rows per page: 10</div>
//         <div className={styles.rangeInfo}>
//           1–{orders.length} of {orders.length}
//         </div>
//         <div className={styles.pageButtons}>
//           <button>&lt;</button>
//           <button>&gt;</button>
//         </div>
//       </div>
//     </div>
//   </div>
// );
// };

// export default OrdersTable;


import React, { useEffect, useState } from 'react';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { isValid, parse } from 'date-fns';
import styles from './ordersTable.module.scss';
import { FiDownload, FiMail } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReissueOrderEmailAPI } from '../../../../../services/allApis';

const OrdersTable = ({ orders, onOrderSelect }) => {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [sorting]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [orders?.length]);

  const handleDownloadDetailsPDF = (order, e) => {
    e.stopPropagation();
    const doc = new jsPDF();
    doc.text(`Order Details - ${order.id}`, 10, 10);
    autoTable(doc, {
      startY: 20,
      body: [
        ['Order ID', order.id],
        ['Name', order.customer.name],
        ['Email', order.customer.email],
        ['Order Date', order.orderDate],
        ['Ticket Type', order.ticketType],
      ],
    });
    doc.save(`order-details-${order.id}.pdf`);
  };

  const handleReissueEmail = async (orderId, e) => {
    e.stopPropagation();
    try {
      setLoadingOrderId(orderId);
      const cleanOrderId = orderId.replace('#', '');
      await ReissueOrderEmailAPI(cleanOrderId);
      alert(`Reissue email sent for Order ${orderId}`);
    } catch (err) {
      alert(`Failed to send reissue email for ${orderId}`);
    } finally {
      setLoadingOrderId(null);
    }
  };

  const parseOrderIdForSort = (id) => {
    const raw = String(id ?? '');
    const digits = raw.replace(/[^\d]/g, '');
    const n = parseInt(digits, 10);
    return Number.isNaN(n) ? 0 : n;
  };

  const parseOrderDateForSort = (orderDate) => {
    // orderDate is formatted like: "dd MMM yyyy hh:mm a"
    const parsed = parse(String(orderDate ?? ''), 'dd MMM yyyy hh:mm a', new Date());
    if (!isValid(parsed)) return 0;
    return parsed.getTime();
  };

  const columns = [
    {
      id: 'orderId',
      accessorFn: (row) => row.id,
      header: 'ORDER ID',
      enableSorting: true,
      sortingFn: (rowA, rowB) => parseOrderIdForSort(rowA.original.id) - parseOrderIdForSort(rowB.original.id),
      cell: ({ row }) => <span className={styles.orderIdCell}>#{row.original.id}</span>,
    },
    {
      id: 'name',
      accessorFn: (row) => row.customer?.name ?? '',
      header: 'NAME',
      enableSorting: true,
      cell: ({ row }) => row.original.customer?.name,
      meta: { cellClassName: styles.nameCell },
    },
    {
      id: 'email',
      accessorFn: (row) => row.customer?.email ?? '',
      header: 'MAIL',
      enableSorting: true,
      cell: ({ row }) => row.original.customer?.email,
      meta: { cellClassName: styles.emailCell },
    },
    {
      id: 'orderDate',
      accessorFn: (row) => row.orderDate ?? '',
      header: 'ORDER DATE',
      enableSorting: true,
      sortingFn: (rowA, rowB) =>
        parseOrderDateForSort(rowA.original.orderDate) - parseOrderDateForSort(rowB.original.orderDate),
      cell: ({ row }) => row.original.orderDate,
      meta: { cellClassName: styles.dateCell },
    },
    {
      id: 'ticketType',
      accessorFn: (row) => row.ticketType ?? '',
      header: 'TICKET TYPE',
      enableSorting: true,
      cell: ({ row }) => <span className={styles.ticketType}>{row.original.ticketType}</span>,
    },
    {
      id: 'reissue',
      header: 'RE-ISSUE EMAIL',
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className={styles.reissueButton}
          type="button"
          onClick={(e) => handleReissueEmail(row.original.id, e)}
          disabled={loadingOrderId === row.original.id}
        >
          {loadingOrderId === row.original.id ? (
            'Sending…'
          ) : (
            <>
              <FiMail /> Reissue
            </>
          )}
        </button>
      ),
    },
    {
      id: 'download',
      header: () => null,
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className={styles.iconButton}
          type="button"
          title="Download"
          onClick={(e) => handleDownloadDetailsPDF(row.original, e)}
        >
          <FiDownload />
        </button>
      ),
    },
  ];

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

  if (!orders || orders.length === 0) {
    return <div className={styles.noResults}>No orders found.</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <colgroup>
  <col style={{ width: '110px' }} />      {/* order id */}
  <col style={{ width: '160px' }} />      {/* name */}
  <col style={{ width: '260px' }} />      {/* mail */}
  <col style={{ width: '180px' }} />      {/* order date */}
  <col style={{ width: '140px' }} />      {/* ticket type */}
  <col style={{ width: '160px' }} />      {/* reissue btn */}
  <col style={{ width: '60px' }} />       {/* icon */}
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
            <tr key={row.id} className={styles.tableRow} onClick={() => onOrderSelect(row.original)}>
              {row.getVisibleCells().map((cell) => {
                const cellClassName = cell.column.columnDef.meta?.cellClassName;
                return (
                  <td key={cell.id} className={cellClassName}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <span>Rows per page: 10</span>
        <span>
          {pageStart} - {pageEnd} of {totalRows}
        </span>
        <div>
          <button type="button" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            &lt;
          </button>
          <button type="button" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
