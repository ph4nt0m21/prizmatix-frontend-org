import React from 'react';
import PropTypes from 'prop-types';
import styles from './recentOrdersModal.module.scss';
import { FiX } from 'react-icons/fi';
import { format } from 'date-fns';

const RecentOrdersModal = ({ isOpen, onClose, orders }) => {
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
                <tr>
                  <th>Order ID</th>
                  <th>Name</th>
                  <th>Email</th> {/* ADDED */}
                  <th>Ticket Type</th> {/* ADDED */}
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order) => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{order.name}</td>
                    <td>{order.email}</td> {/* ADDED */}
                    <td>{order.ticketType}</td> {/* ADDED */}
                    <td>{format(new Date(order.orderDate), 'dd MMM yyyy')}</td>
                    <td>${(order.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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