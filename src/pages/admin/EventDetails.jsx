import React, { useState, useEffect } from 'react';
import styles from './eventDetails.module.scss';
import pageStyles from './dashboardPage.module.scss';
import { GetEventOrdersAPI, GetEventAttendeesAPI } from '../../services/allApis';
import { FiTag, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import OrdersTable from './dashboard/OrdersTable';
import AttendeesTable from './dashboard/AttendeesTable';

export default function EventDetails({ eventId, onBack }) {
  const [activeTab, setActiveTab] = useState('Orders');
  const [orders, setOrders] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (activeTab === 'Orders') {
          const response = await GetEventOrdersAPI(eventId);
          const formattedOrders = response.data.map(order => ({
            id: `#${order.orderId}`,
            customer: { name: `${order.buyerFirstName} ${order.buyerLastName}`, email: order.buyerEmail },
            orderDate: format(new Date(order.orderTime), 'dd MMM yyyy'),
            ticketType: order.tickets.length > 0 ? order.tickets[0].ticketType : 'N/A',
            amount: order.totalAmount || 0,
            discount: order.discountCode || '',
          }));
          setOrders(formattedOrders);
        } else {
          const response = await GetEventAttendeesAPI(eventId);
          const formattedAttendees = response.data.map((attendee, index) => ({
            id: attendee.ticketId || `att-${index}`,
            orderId: `#${attendee.orderId || 'N/A'}`,
            name: attendee.attendeeName || 'N/A',
            email: attendee.attendeeEmail || 'N/A',
            mobile: attendee.attendeeMobile || 'N/A',
            orderDate: attendee.orderDate ? format(new Date(attendee.orderDate), 'dd MMM yyyy') : 'N/A',
            ticketType: attendee.ticketType || 'N/A',
            isCheckedIn: false,
          }));
          setAttendees(formattedAttendees);
        }
      } catch (err) {
        setError(`Failed to fetch ${activeTab}.`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [eventId, activeTab]);

  const renderContent = () => {
    if (isLoading) return <div className={pageStyles.loadingContainer}><LoadingSpinner /></div>;
    if (error) return <div>{error}</div>;

    if (activeTab === 'Orders') {
      return <OrdersTable orders={orders} onOrderSelect={() => {}} />;
    }
    return <AttendeesTable attendees={attendees} onCheckIn={() => {}} />;
  };

  return (
    <div>
      <button onClick={onBack} className={styles.backButton}>← Back to Events</button>
      <div className={styles.mainHeader}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === 'Orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('Orders')}
          ><FiTag /> Orders</button>
          <button
            className={`${styles.tabButton} ${activeTab === 'Attendees' ? styles.active : ''}`}
            onClick={() => setActiveTab('Attendees')}
          ><FiUsers /> Attendees</button>
        </div>
      </div>
      <div className={styles.contentCard}>
        {renderContent()}
      </div>
    </div>
  );
}