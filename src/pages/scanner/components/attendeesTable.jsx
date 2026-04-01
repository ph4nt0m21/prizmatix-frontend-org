import React from 'react';
import styles from './attendeesTable.module.scss';
import { FiCheck } from 'react-icons/fi';

const AttendeesTable = ({ attendees, onToggleCheckIn }) => {
  if (attendees.length === 0) {
    return <div className={styles.noResults}>No attendees found.</div>;
  }

  const getTicketTypeClass = (type) => {
    switch (type.toLowerCase()) {
      case 'vip': return styles.vip;
      case 'standard': return styles.standard;
      case 'early bird': return styles.earlyBird;
      case 'first release': return styles.firstRelease;
      case 'second release': return styles.secondRelease;
      default: return styles.earlyBird;
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Ticket Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={attendee.id}>
              <td>{attendee.name}</td>
              <td>
                <span className={`${styles.ticketType} ${getTicketTypeClass(attendee.ticketType)}`}>
                  {attendee.ticketType}
                </span>
              </td>
              <td>
                {attendee.isCheckedIn ? (
                  <button
                    className={`${styles.checkInButton} ${styles.checkedIn}`}
                    onClick={() => onToggleCheckIn(attendee.id, true)}
                  >
                    <FiCheck /> Check In
                  </button>
                ) : (
                  <button
                    className={styles.checkInButton}
                    onClick={() => onToggleCheckIn(attendee.id, false)}
                  >
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
