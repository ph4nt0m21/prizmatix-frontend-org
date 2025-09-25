import React, { useState, useMemo, useEffect } from 'react';
import styles from './ordersAndAttendeesSection.module.scss';
import Toolbar from './components/toolbar';
import OrdersTable from './components/ordersTable';
import OrderDetailsModal from './components/orderDetailsModal';
import { GetEventOrdersAPI, GetEventAttendeesAPI } from '../../../../services/allApis';
import { FiTag, FiUsers } from 'react-icons/fi';
import StatsGrid from './components/statsGrid';
import AttendeesTable from './components/attendeesTable';
import { format } from 'date-fns';

const OrdersAndAttendeesSection = ({ eventId }) => {
  const [activeTab, setActiveTab] = useState('Orders');
  const [searchQuery, setSearchQuery] = useState('');

  const [orders, setOrders] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [attendeeFilters, setAttendeeFilters] = useState({
    ticketType: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
  });

  // ✅ Always fetch attendees on mount (for stats + tab later)
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const response = await GetEventAttendeesAPI(eventId);
        const formattedAttendees = response.data.map((attendee, index) => ({
          id: attendee.ticketId || `att-${index}`,
          name: attendee.attendeeName,
          ticketType: attendee.ticketType,
          isCheckedIn: false,
        }));
        setAttendees(formattedAttendees);
      } catch (err) {
        setError('Failed to fetch attendees. Please try again later.');
        console.error(err);
      }
    };

    if (eventId) {
      fetchAttendees();
    }
  }, [eventId]);

  // ✅ Fetch orders only when Orders tab is active
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await GetEventOrdersAPI(eventId);
        const formattedOrders = response.data.map(order => ({
          id: `#${order.orderId}`,
          customer: { name: `${order.buyerFirstName} ${order.buyerLastName}`, email: order.buyerEmail },
          orderDate: format(new Date(order.orderTime), 'dd MMM yyyy hh:mm a'),
          purchaseDate: format(new Date(order.orderTime), 'dd MMM yyyy hh:mm a'),
          ticketType: order.tickets.length > 0 ? order.tickets[0].ticketType : 'N/A',
          attendees: order.tickets.map(t => ({ name: t.attendeeName })),
          paymentMethod: 'Stripe',
          tickets: order.tickets,
        }));
        setOrders(formattedOrders);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'Orders' && eventId) {
      setIsLoading(true);
      setError(null);
      fetchOrders();
    }
  }, [activeTab, eventId]);

  const filteredAttendees = useMemo(() => {
    return attendees.filter(attendee => {
      const searchMatch =
        attendee.name && attendee.name.toLowerCase().includes(searchQuery.toLowerCase());

      const ticketTypeMatch =
        attendeeFilters.ticketType === 'All' || attendee.ticketType === attendeeFilters.ticketType;

      const statusMatch =
        attendeeFilters.status === 'All' ||
        (attendeeFilters.status === 'Checked In' && attendee.isCheckedIn) ||
        (attendeeFilters.status === 'Not Checked In' && !attendee.isCheckedIn);

      return searchMatch && ticketTypeMatch && statusMatch;
    });
  }, [searchQuery, attendees, attendeeFilters]);

  const handleOrderSelect = (order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);

  const handleCheckIn = (attendeeId) => {
    setAttendees(currentAttendees =>
      currentAttendees.map(attendee =>
        attendee.id === attendeeId ? { ...attendee, isCheckedIn: true } : attendee
      )
    );
  };

  // ✅ Stats are always available now
  const totalAttendees = attendees.length;
  const checkedInCount = attendees.filter(a => a.isCheckedIn).length;

  const renderContent = () => {
    if (isLoading) return <div className={styles.loadingContainer}><p>Loading...</p></div>;
    if (error) return <div className={styles.errorContainer}><p>{error}</p></div>;

    if (activeTab === 'Orders') {
      return (
        <div className={styles.contentCard}>
          <OrdersTable orders={orders} onOrderSelect={handleOrderSelect} />
        </div>
      );
    }

    if (activeTab === 'Attendees') {
      return (
        <>
          <StatsGrid checkedInCount={checkedInCount} totalCount={totalAttendees} />
          <AttendeesTable attendees={filteredAttendees} onCheckIn={handleCheckIn} />
        </>
      );
    }
  };

  return (
    <>
      <div className={styles.sectionContainer}>
        <div className={styles.mainHeader}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${activeTab === 'Orders' ? styles.active : ''}`}
              onClick={() => setActiveTab('Orders')}
            >
              <FiTag /> Orders
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'Attendees' ? styles.active : ''}`}
              onClick={() => setActiveTab('Attendees')}
            >
              <FiUsers /> Attendees ({checkedInCount}/{totalAttendees})
            </button>
          </div>
          <Toolbar
            activeTab={activeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            data={activeTab === 'Orders' ? orders : filteredAttendees}
            currentFilters={attendeeFilters}
            onApplyFilters={setAttendeeFilters}
          />
        </div>
        <div className={styles.mainContent}>
          {renderContent()}
        </div>
      </div>

      <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />
    </>
  );
};

export default OrdersAndAttendeesSection;
