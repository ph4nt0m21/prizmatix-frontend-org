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


import React, { useState } from 'react';
import styles from './ordersTable.module.scss';
import { FiDownload, FiMail } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReissueOrderEmailAPI } from '../../../services/allApis';

const OrdersTable = ({ orders, onOrderSelect }) => {
  const [loadingOrderId, setLoadingOrderId] = useState(null);

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

  if (!orders || orders.length === 0) {
    return <div className={styles.noResults}>No orders found.</div>;
  }

  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
        <colgroup>
  <col style={{ width: '50px' }} />       {/* checkbox */}
  <col style={{ width: '110px' }} />      {/* order id */}
  <col style={{ width: '160px' }} />      {/* name */}
  <col style={{ width: '260px' }} />      {/* mail */}
  <col style={{ width: '180px' }} />      {/* order date */}
  <col style={{ width: '140px' }} />      {/* ticket type */}
  <col style={{ width: '160px' }} />      {/* reissue btn */}
  <col style={{ width: '60px' }} />       {/* icon */}
</colgroup>
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>ORDER ID</th>
            <th>NAME</th>
            <th>MAIL</th>
            <th>ORDER DATE</th>
            <th>TICKET TYPE</th>
            <th>RE-ISSUE EMAIL</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className={styles.tableRow} onClick={() => onOrderSelect(order)}>
              <td>
                <input
                  type="checkbox"
                  className={styles.rowCheckbox}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>

              <td className={styles.orderIdCell}>#{order.id}</td>

              <td className={styles.nameCell}>{order.customer.name}</td>

              <td className={styles.emailCell}>{order.customer.email}</td>

              <td className={styles.dateCell}>{order.orderDate}</td>

              <td>
                <span className={styles.ticketType}>{order.ticketType}</span>
              </td>

              <td>
                <button
                  className={styles.reissueButton}
                  onClick={(e) => handleReissueEmail(order.id, e)}
                  disabled={loadingOrderId === order.id}
                >
                  {loadingOrderId === order.id ? 'Sending…' : <><FiMail /> Reissue</>}
                </button>
              </td>

              <td className={styles.actionCell}>
                <button
                  className={styles.iconButton}
                  title="Download"
                  onClick={(e) => handleDownloadDetailsPDF(order, e)}
                >
                  <FiDownload />
                </button>
              </td>

            </tr>
          ))}
        </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <span>Rows per page: 10</span>
        <span>1 - {orders.length} of {orders.length}</span>
        <div>
          <button>&lt;</button>
          <button>&gt;</button>
        </div>
      </div>
    </>
  );
};

export default OrdersTable;
