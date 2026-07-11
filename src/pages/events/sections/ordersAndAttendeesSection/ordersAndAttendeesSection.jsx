import React, { useState, useMemo, useEffect } from 'react';
import styles from './ordersAndAttendeesSection.module.scss';
import Toolbar from './components/toolbar';
import OrdersTable from './components/ordersTable';
import OrderDetailsModal from './components/orderDetailsModal';
import { GetEventOrdersAPI, GetEventAttendeesAPI, GetEventDonationNotesAPI } from '../../../../services/allApis';
import { FiTag, FiUsers, FiFileText } from 'react-icons/fi';
import AttendeesTable from './components/attendeesTable';
import DonationNotesTable from './components/donationNotesTable';
import { format } from 'date-fns';

const OrdersAndAttendeesSection = ({ eventId }) => {
  const [activeTab, setActiveTab] = useState('Orders');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [donationNoteSearchQuery, setDonationNoteSearchQuery] = useState('');

  const [orders, setOrders] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [donationNotes, setDonationNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [attendeeFilters, setAttendeeFilters] = useState({
    ticketType: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
  });
  const [orderFilters, setOrderFilters] = useState({
    ticketType: 'All',
    startDate: '',
    endDate: '',
  });

  // Always fetch attendees on mount (for stats + tab later)
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const response = await GetEventAttendeesAPI(eventId);
        const formattedAttendees = response.data.map((attendee, index) => ({
          id: attendee.ticketId || `att-${index}`,
          orderId: `#${attendee.orderId || 'N/A'}`,
          name: attendee.attendeeName || 'N/A',
          email: attendee.attendeeEmail || 'N/A',
          mobile: attendee.attendeeMobile || 'N/A',
          orderDate: attendee.orderDate ? format(new Date(attendee.orderDate), 'dd MMM yyyy hh:mm a') : 'N/A',
          ticketType: attendee.ticketType || 'N/A',
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

  useEffect(() => {
    const fetchDonationNotes = async () => {
      try {
        const response = await GetEventDonationNotesAPI(eventId);
        const formatted = (response.data || []).map((row, index) => ({
          id: row.ticketId || `dn-${index}`,
          orderId: `#${row.orderId || 'N/A'}`,
          buyerName: `${row.buyerFirstName || ''} ${row.buyerLastName || ''}`.trim() || 'N/A',
          donatorName: row.donatorName || `${row.buyerFirstName || ''} ${row.buyerLastName || ''}`.trim() || 'N/A',
          buyerEmail: row.buyerEmail || 'N/A',
          amount: row.amount != null ? Number(row.amount) : 0,
          donationNote: row.donationNote || '',
          ticketType: row.ticketType || 'Donation',
          orderDate: row.orderTime ? format(new Date(row.orderTime), 'dd MMM yyyy hh:mm a') : 'N/A',
        }));
        setDonationNotes(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    if (eventId) {
      fetchDonationNotes();
    }
  }, [eventId]);

  // Fetch orders only when Orders tab is active
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
          amount: order.totalAmount || 0,
          discount: order.discountCode || '',
          attendees: order.tickets
            .filter((t) => !t.donation)
            .map((t) => ({
              name: t.attendeeName,
              donationNote: t.donationNote,
              ticketType: t.ticketType,
            })),
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
      const q = attendeeSearchQuery.toLowerCase();
      const searchMatch = !q ||
        (attendee.name && attendee.name.toLowerCase().includes(q)) ||
        (attendee.email && attendee.email.toLowerCase().includes(q)) ||
        (attendee.orderId && attendee.orderId.toLowerCase().includes(q));

      const ticketTypeMatch =
        attendeeFilters.ticketType === 'All' || attendee.ticketType === attendeeFilters.ticketType;

      const statusMatch =
        attendeeFilters.status === 'All' ||
        (attendeeFilters.status === 'Checked In' && attendee.isCheckedIn) ||
        (attendeeFilters.status === 'Not Checked In' && !attendee.isCheckedIn);

      let dateMatch = true;
      if (attendeeFilters.startDate || attendeeFilters.endDate) {
        const orderDate = new Date(attendee.orderDate);
        if (attendeeFilters.startDate) {
          dateMatch = dateMatch && orderDate >= new Date(attendeeFilters.startDate);
        }
        if (attendeeFilters.endDate) {
          const endDate = new Date(attendeeFilters.endDate);
          endDate.setHours(23, 59, 59, 999);
          dateMatch = dateMatch && orderDate <= endDate;
        }
      }

      return searchMatch && ticketTypeMatch && statusMatch && dateMatch;
    });
  }, [attendeeSearchQuery, attendees, attendeeFilters]);

  const filteredDonationNotes = useMemo(() => {
    const q = donationNoteSearchQuery.toLowerCase();
    if (!q) return donationNotes;
    return donationNotes.filter((row) =>
      (row.orderId && row.orderId.toLowerCase().includes(q)) ||
      (row.donatorName && row.donatorName.toLowerCase().includes(q)) ||
      (row.buyerName && row.buyerName.toLowerCase().includes(q)) ||
      (row.buyerEmail && row.buyerEmail.toLowerCase().includes(q)) ||
      (row.donationNote && row.donationNote.toLowerCase().includes(q))
    );
  }, [donationNoteSearchQuery, donationNotes]);

  const handleOrderSelect = (order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);

  const handleCheckIn = (attendeeId) => {
    setAttendees(currentAttendees =>
      currentAttendees.map(attendee =>
        attendee.id === attendeeId ? { ...attendee, isCheckedIn: true } : attendee
      )
    );
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const q = orderSearchQuery.toLowerCase();
      const searchMatch = !q ||
        (order.id && order.id.toLowerCase().includes(q)) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(q)) ||
        (order.customer?.email && order.customer.email.toLowerCase().includes(q));

      const ticketTypeMatch =
        orderFilters.ticketType === 'All' || order.ticketType === orderFilters.ticketType;

      let dateMatch = true;
      if (orderFilters.startDate || orderFilters.endDate) {
        const orderDate = new Date(order.orderDate);
        if (orderFilters.startDate) {
          dateMatch = dateMatch && orderDate >= new Date(orderFilters.startDate);
        }
        if (orderFilters.endDate) {
          const endDate = new Date(orderFilters.endDate);
          endDate.setHours(23, 59, 59, 999);
          dateMatch = dateMatch && orderDate <= endDate;
        }
      }

      return searchMatch && ticketTypeMatch && dateMatch;
    });
  }, [orderSearchQuery, orders, orderFilters]);

  const ticketTypes = useMemo(() => {
    const source = activeTab === 'Orders' ? orders : attendees;
    const types = [...new Set(source.map(item => item.ticketType).filter(Boolean))];
    return ['All', ...types];
  }, [orders, attendees, activeTab]);

  const totalAttendees = attendees.length;
  const totalDonationNotes = donationNotes.length;

  const toolbarSearchQuery =
    activeTab === 'Orders'
      ? orderSearchQuery
      : activeTab === 'Attendees'
        ? attendeeSearchQuery
        : donationNoteSearchQuery;

  const setToolbarSearchQuery =
    activeTab === 'Orders'
      ? setOrderSearchQuery
      : activeTab === 'Attendees'
        ? setAttendeeSearchQuery
        : setDonationNoteSearchQuery;

  const toolbarData =
    activeTab === 'Orders'
      ? filteredOrders
      : activeTab === 'Attendees'
        ? filteredAttendees
        : filteredDonationNotes;

  const renderContent = () => {
    if (isLoading && activeTab === 'Orders') return <div className={styles.placeholder}><p>Loading Orders...</p></div>;
    if (error) return <div className={styles.placeholder}><p>{error}</p></div>;

    if (activeTab === 'Orders') {
      return (
        <div className={styles.contentCard}>
          <OrdersTable orders={filteredOrders} onOrderSelect={handleOrderSelect} />
        </div>
      );
    }

    if (activeTab === 'Attendees') {
      return (
        <AttendeesTable attendees={filteredAttendees} onCheckIn={handleCheckIn} />
      );
    }

    if (activeTab === 'Donation Notes') {
      return <DonationNotesTable notes={filteredDonationNotes} />;
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
              <FiUsers /> Attendees ({totalAttendees})
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'Donation Notes' ? styles.active : ''}`}
              onClick={() => setActiveTab('Donation Notes')}
            >
              <FiFileText /> Donation Notes ({totalDonationNotes})
            </button>
          </div>
          <div className={styles.toolbarContainer}>
            <Toolbar
              activeTab={activeTab}
              searchQuery={toolbarSearchQuery}
              setSearchQuery={setToolbarSearchQuery}
              data={toolbarData}
              currentFilters={activeTab === 'Orders' ? orderFilters : attendeeFilters}
              onApplyFilters={activeTab === 'Orders' ? setOrderFilters : setAttendeeFilters}
              ticketTypes={ticketTypes}
            />
          </div>
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
