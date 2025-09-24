import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './reportsPage.module.scss';
import { FiTag, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';

import { GetEventOrdersAPI, GetEventAttendeesAPI } from '../../services/allApis';

import Toolbar from './components/toolbar';
import OrdersTable from './components/ordersTable';
import AttendeesTable from './components/attendeesTable';
import StatsGrid from './components/statsGrid';
import OrderDetailsModal from './components/orderDetailsModal';

const ReportsPage = () => {
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState('Orders');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [orders, setOrders] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    ticketType: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    // This logic would be replaced with a global API call in a real app
    const fetchEventSpecificData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let response;
        if (activeTab === 'Orders') {
          response = await GetEventOrdersAPI(eventId);
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
        } else {
          response = await GetEventAttendeesAPI(eventId);
          const formattedAttendees = response.data.map((attendee, index) => ({
            id: attendee.ticketId || `att-${index}`,
            name: attendee.attendeeName,
            ticketType: attendee.ticketType,
            isCheckedIn: false,
          }));
          setAttendees(formattedAttendees);
        }
      } catch (err) {
        setError(`Failed to fetch ${activeTab.toLowerCase()}. Please try again later.`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventSpecificData();
    } else {
        // Handle global data fetching if needed
        setError("Event ID is missing from the URL.");
        setIsLoading(false);
    }
  }, [activeTab, eventId]);

  const filteredData = useMemo(() => {
    if (activeTab === 'Orders') {
      return orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return attendees.filter(attendee => {
      const searchMatch = attendee.name.toLowerCase().includes(searchQuery.toLowerCase());
      const ticketTypeMatch = filters.ticketType === 'All' || attendee.ticketType === filters.ticketType;
      const statusMatch =
        filters.status === 'All' ||
        (filters.status === 'Checked In' && attendee.isCheckedIn) ||
        (filters.status === 'Not Checked In' && !attendee.isCheckedIn);
      return searchMatch && ticketTypeMatch && statusMatch;
    });
  }, [searchQuery, orders, attendees, filters, activeTab]);

  const handleOrderSelect = (order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);
  const handleCheckIn = (attendeeId) => {
    setAttendees(current => current.map(att => att.id === attendeeId ? { ...att, isCheckedIn: true } : att));
  };

  const totalAttendees = attendees.length;
  const checkedInCount = attendees.filter(a => a.isCheckedIn).length;
  const ticketTypes = ['All', ...new Set(attendees.map(a => a.ticketType))];

  const renderContent = () => {
    if (isLoading) return <div className={styles.placeholder}><p>Loading data...</p></div>;
    if (error) return <div className={styles.placeholder}><p>{error}</p></div>;
    if (activeTab === 'Orders') {
      return (
        <div className={styles.contentCard}>
          <OrdersTable orders={filteredData} onOrderSelect={handleOrderSelect} />
        </div>
      );
    }
    if (activeTab === 'Attendees') {
      return (
        <>
          <StatsGrid checkedInCount={checkedInCount} totalCount={totalAttendees} />
          <AttendeesTable attendees={filteredData} onCheckIn={handleCheckIn} />
        </>
      );
    }
  };

  return (
    <>
      <div className={styles.reportsContainer}>
        <div className={styles.mainHeader}>
          <h1>Reports</h1>
          <Toolbar
            activeTab={activeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            data={filteredData}
            currentFilters={filters}
            onApplyFilters={setFilters}
            ticketTypes={ticketTypes}
          />
        </div>

        {/* NEW: Tabs are now in their own scrollable container */}
        <div className={styles.tabsContainer}>
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

        <div className={styles.mainContent}>
          {renderContent()}
        </div>
      </div>
      
      <OrderDetailsModal
        order={selectedOrder}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ReportsPage;