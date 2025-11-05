import React from 'react';
import styles from './attendeesTable.module.scss';
import { FiCheck } from 'react-icons/fi';

const AttendeesTable = ({ attendees, onCheckIn }) => {
  if (attendees.length === 0) {
    return <div className={styles.noResults}>No attendees found.</div>;
  }

  const getTicketTypeClass = (type) => {
    switch(String(type).toLowerCase()){
      case 'vip': return styles.vip;
      case 'standard': return styles.standard;
      case 'early bird':
      default: return styles.earlyBird;
    }
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>#</th>
            <th>Name</th>
            <th>Mail</th>
            <th>Mobile No.</th>
            <th>Order Date</th>
            <th>Ticket Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={attendee.id}>
              <td><input type="checkbox" /></td>
              <td>{attendee.orderId}</td>
              <td>{attendee.name}</td>
              <td>{attendee.email}</td>
              <td>{attendee.mobile}</td>
              <td>{attendee.orderDate}</td>
              <td><span className={`${styles.ticketType} ${getTicketTypeClass(attendee.ticketType)}`}>{attendee.ticketType}</span></td>
              <td>
                {attendee.isCheckedIn ? (
                  <span className={styles.checkedInStatus}>
                    <FiCheck /> Checked In
                  </span>
                ) : (
                  <button className={styles.checkInButton} onClick={() => onCheckIn(attendee.id)}>
                    Check In
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendeesTable;