export const dummyOrders = [
  {
    id: '#100246',
    customer: {
      name: 'Sarath Babu John',
      email: 'sarathbabujohn333@gmail.com',
      phone: '+64-280-555-27',
    },
    orderDate: '07 May 2025 04:56 PM',
    purchaseDate: '07 May 2025 04:56 PM',
    ticketType: 'Early Bird',
    amount: 250.22,
    discountCode: '#prizmatixx',
    paymentMethod: 'Credit Card',
    tickets: [
      { name: 'Early Bird', price: 15.39, quantity: 2 },
      { name: 'VIP', price: 0, quantity: 1 },
    ],
    attendees: [
      { name: 'Sarath Babu John', email: 'sarathbabujohn@gmail.com', phone: '+64 28055521312' },
      { name: 'Sarath Babu John', email: 'sarathbabujohn@gmail.com', phone: '+64 28055521312' },
    ],
  },
  {
    id: '#100247',
    customer: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1-202-555-0182',
    },
    orderDate: '08 May 2025 10:15 AM',
    purchaseDate: '08 May 2025 10:15 AM',
    ticketType: 'General Admission',
    amount: 50.00,
    discountCode: null,
    paymentMethod: 'PayPal',
    tickets: [
      { name: 'General Admission', price: 25.00, quantity: 2 },
    ],
    attendees: [
      { name: 'Jane Doe', email: 'jane.doe@example.com', phone: '+1-202-555-0182' },
      { name: 'John Smith', email: 'john.smith@example.com', phone: '+1-202-555-0199' },
    ],
  },
   {
    id: '#100248',
    customer: {
      name: 'Peter Jones',
      email: 'peter.jones@example.com',
      phone: '+44-20-7946-0958',
    },
    orderDate: '09 May 2025 01:20 PM',
    purchaseDate: '09 May 2025 01:20 PM',
    ticketType: 'VIP',
    amount: 150.75,
    discountCode: '#VIP25',
    paymentMethod: 'Credit Card',
    tickets: [
      { name: 'VIP', price: 75.375, quantity: 2 },
    ],
    attendees: [
      { name: 'Peter Jones', email: 'peter.jones@example.com', phone: '+44-20-7946-0958' },
      { name: 'Mary Jane', email: 'mary.jane@example.com', phone: '+44-20-7946-0959' },
    ],
  },
];

export const dummyAttendees = [
  { id: 'att-001', name: 'Sarath Babu John', email: 'sarathbabujohn333@gmail.com', phone: '+64-280-555-27', orderDate: '07 May 2025 04:56 PM', ticketType: 'Early Bird', isCheckedIn: true },
  { id: 'att-002', name: 'Steve Buchemi', email: 'SteveBuchemi13@gmail.com', phone: '+64-280-555-27', orderDate: '07 May 2025 04:56 PM', ticketType: 'Early Bird', isCheckedIn: false },
  { id: 'att-003', name: 'Maya Lin', email: 'maya.lin@example.com', phone: '+64-280-555-28', orderDate: '07 May 2025 04:57 PM', ticketType: 'Standard', isCheckedIn: true },
  { id: 'att-004', name: 'Carlos Mendez', email: 'carlos.mendez@example.com', phone: '+64-280-555-29', orderDate: '07 May 2025 04:58 PM', ticketType: 'VIP', isCheckedIn: false },
  { id: 'att-005', name: 'Jessica Huang', email: 'jessica.huang@example.com', phone: '+64-280-555-30', orderDate: '07 May 2025 04:59 PM', ticketType: 'VIP', isCheckedIn: false },
  { id: 'att-006', name: 'Mohammed Khan', email: 'mohammed.khan@example.com', phone: '+64-280-555-31', orderDate: '07 May 2025 05:00 PM', ticketType: 'Standard', isCheckedIn: false },
  { id: 'att-007', name: 'Rachel Green', email: 'rachel.green@example.com', phone: '+64-280-555-32', orderDate: '07 May 2025 05:01 PM', ticketType: 'VIP', isCheckedIn: false },
  { id: 'att-008', name: 'Henry Morgan', email: 'henry.morgan@example.com', phone: '+64-280-555-33', orderDate: '07 May 2025 05:02 PM', ticketType: 'VIP', isCheckedIn: false },
  { id: 'att-009', name: 'Emma Watson', email: 'emma.watson@example.com', phone: '+64-280-555-34', orderDate: '07 May 2025 05:03 PM', ticketType: 'Early Bird', isCheckedIn: true },
  { id: 'att-010', name: 'John Doe', email: 'john.doe@example.com', phone: '+64-280-555-35', orderDate: '07 May 2025 05:04 PM', ticketType: 'Early Bird', isCheckedIn: false },
  { id: 'att-011', name: 'Lily Adams', email: 'lily.adams@example.com', phone: '+64-280-555-36', orderDate: '07 May 2025 05:05 PM', ticketType: 'Standard', isCheckedIn: false },
];