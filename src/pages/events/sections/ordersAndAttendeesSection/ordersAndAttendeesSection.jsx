import React, { useState, useMemo } from 'react';
import styles from './ordersAndAttendeesSection.module.scss';
import Toolbar from './components/toolbar';
import OrdersTable from './components/ordersTable';
import OrderDetailsModal from './components/orderDetailsModal';
import { dummyOrders, dummyAttendees } from './dummyData';
import { FiTag, FiUsers } from 'react-icons/fi';
import StatsGrid from './components/statsGrid';
import AttendeesTable from './components/attendeesTable';

const OrdersAndAttendeesSection = () => {
  const [activeTab, setActiveTab] = useState('Orders');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Orders
  const [orders] = useState(dummyOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // State for Attendees
  const [attendees, setAttendees] = useState(dummyAttendees);

  // --- NEW: Separate filter states for each tab ---
  const [orderFilters, setOrderFilters] = useState({
    ticketType: 'All',
    startDate: '',
    endDate: '',
  });

  const [attendeeFilters, setAttendeeFilters] = useState({
    ticketType: 'All',
    status: 'All', // 'All', 'Checked In', 'Not Checked In'
    startDate: '',
    endDate: '',
  });

  const ticketTypes = useMemo(() => ['All', ...new Set(dummyOrders.map(order => order.ticketType))], []);

  // --- UPDATED: Filtering logic for both Orders and Attendees ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchMatch =
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());

      const ticketTypeMatch = orderFilters.ticketType === 'All' || order.ticketType === orderFilters.ticketType;
      
      const orderDate = new Date(order.orderDate);
      const startDate = orderFilters.startDate ? new Date(orderFilters.startDate) : null;
      const endDate = orderFilters.endDate ? new Date(orderFilters.endDate) : null;
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);
      const dateMatch = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);

      return searchMatch && ticketTypeMatch && dateMatch;
    });
  }, [searchQuery, orders, orderFilters]);

  const filteredAttendees = useMemo(() => {
    return attendees.filter(attendee => {
      const searchMatch =
        attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchQuery.toLowerCase());

      const ticketTypeMatch = attendeeFilters.ticketType === 'All' || attendee.ticketType === attendeeFilters.ticketType;

      const statusMatch = 
        attendeeFilters.status === 'All' ||
        (attendeeFilters.status === 'Checked In' && attendee.isCheckedIn) ||
        (attendeeFilters.status === 'Not Checked In' && !attendee.isCheckedIn);
      
      const orderDate = new Date(attendee.orderDate);
      const startDate = attendeeFilters.startDate ? new Date(attendeeFilters.startDate) : null;
      const endDate = attendeeFilters.endDate ? new Date(attendeeFilters.endDate) : null;
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);
      const dateMatch = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);

      return searchMatch && ticketTypeMatch && statusMatch && dateMatch;
    });
  }, [searchQuery, attendees, attendeeFilters]);


  // --- Handlers ---
  const handleOrderSelect = (order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);
  
  const handleCheckIn = (attendeeId) => {
    setAttendees(currentAttendees =>
      currentAttendees.map(attendee =>
        attendee.id === attendeeId ? { ...attendee, isCheckedIn: true } : attendee
      )
    );
  };
  
  // --- Calculated values for display ---
  const totalAttendees = attendees.length;
  const checkedInCount = attendees.filter(a => a.isCheckedIn).length;

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
            data={activeTab === 'Orders' ? filteredOrders : filteredAttendees}
            // Pass the correct filter state and setter based on the active tab
            currentFilters={activeTab === 'Orders' ? orderFilters : attendeeFilters}
            onApplyFilters={activeTab === 'Orders' ? setOrderFilters : setAttendeeFilters}
            ticketTypes={ticketTypes}
          />
        </div>
        <div className={styles.mainContent}>
          {activeTab === 'Orders' && (
            <div className={styles.contentCard}>
              <OrdersTable
                orders={filteredOrders}
                onOrderSelect={handleOrderSelect}
              />
            </div>
          )}
          {activeTab === 'Attendees' && (
            <>
              <StatsGrid checkedInCount={checkedInCount} totalCount={totalAttendees} />
              <AttendeesTable attendees={filteredAttendees} onCheckIn={handleCheckIn} />
            </>
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

export default OrdersAndAttendeesSection;