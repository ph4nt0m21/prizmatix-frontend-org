import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './reportsPage.module.scss';
import { FiTag, FiUsers, FiDollarSign, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';

import { GetEventOrdersAPI, GetEventAttendeesAPI, GetAllOrganizationEventsAPI } from '../../services/allApis';
import { getUserData } from '../../utils/authUtil';

import Toolbar from './components/toolbar';
import FilterPanel from './components/filterPanel';
import OrdersTable from './components/ordersTable';
import AttendeesTable from './components/attendeesTable';
import OrderDetailsModal from './components/orderDetailsModal';
import PayoutSection from '../events/sections/payoutSection';

const ReportsPage = () => {
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState('Orders');
  const [searchQuery, setSearchQuery] = useState('');

  const [orders, setOrders] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    ticketType: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
    eventId: '',
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userData = getUserData();
        const orgId = userData?.organizationId;
        if (orgId) {
          const res = await GetAllOrganizationEventsAPI(orgId);
          const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
          setEvents(list);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchEventSpecificData = async (targetEventId) => {
      setIsLoading(true);
      setError(null);
      try {
        let response;
        if (activeTab === 'Orders') {
          response = await GetEventOrdersAPI(targetEventId);
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
          response = await GetEventAttendeesAPI(targetEventId);
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

    const targetEventId = filters.eventId || eventId;
    if (targetEventId) {
      fetchEventSpecificData(targetEventId);
    } else {
      setError("Please select an event or ensure Event ID is in the URL.");
      setIsLoading(false);
    }
  }, [activeTab, eventId, filters.eventId]);

  const filteredData = useMemo(() => {
    if (activeTab === 'Orders') {
      let result = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filters.startDate || filters.endDate) {
        result = result.filter(order => {
          const orderDate = new Date(order.orderDate);
          if (filters.startDate && orderDate < new Date(filters.startDate)) return false;
          if (filters.endDate && orderDate > new Date(filters.endDate + 'T23:59:59')) return false;
          return true;
        });
      }
      return result;
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
      return <OrdersTable orders={filteredData} onOrderSelect={handleOrderSelect} />;
    }
    if (activeTab === 'Attendees') {
      return (
        <AttendeesTable attendees={filteredData} onCheckIn={handleCheckIn} />
      );
    }
  };

  return (
    <>
      <div className={styles.reportsContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.mainHeader}>Reports</h1>
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabButton} ${activeTab === 'Orders' ? styles.active : ''}`}
              onClick={() => { setActiveTab('Orders'); setSearchQuery(''); }}
            >
              <FiTag /> Orders
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'Attendees' ? styles.active : ''}`}
              onClick={() => { setActiveTab('Attendees'); setSearchQuery(''); }}
            >
              <FiUsers /> Attendees {activeTab === 'Attendees' && `(${totalAttendees})`}
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'Payout' ? styles.active : ''}`}
              onClick={() => { setActiveTab('Payout'); setSearchQuery(''); }}
            >
              <FiDollarSign /> Payout
            </button>
          </div>
        </div>

        <div className={styles.mainContent}>
          {(activeTab === 'Orders' || activeTab === 'Attendees') && (
            <div className={styles.contentCard}>
              <div className={styles.toolbarRow}>
                <Toolbar
                  activeTab={activeTab}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  data={filteredData}
                  currentFilters={filters}
                  onApplyFilters={setFilters}
                  ticketTypes={ticketTypes}
                  isFilterPanelOpen={isFilterPanelOpen}
                  onFilterToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                />
              </div>
              {activeTab === 'Orders' && (
                <FilterPanel
                  isOpen={isFilterPanelOpen}
                  onApplyFilters={(f) => setFilters(prev => ({ ...prev, ...f }))}
                  currentFilters={filters}
                  events={events}
                />
              )}
              {activeTab === 'Attendees' && (
                <FilterPanel
                  isOpen={isFilterPanelOpen}
                  onApplyFilters={(f) => setFilters(prev => ({ ...prev, ...f }))}
                  currentFilters={filters}
                  events={events}
                />
              )}
              <div className={styles.tableSection}>
                {renderContent()}
              </div>
            </div>
          )}
          {activeTab === 'Payout' && (
            <div className={styles.tableSection}>
              <PayoutSection eventId={filters.eventId || eventId} tableOnly={true} />
            </div>
          )}
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