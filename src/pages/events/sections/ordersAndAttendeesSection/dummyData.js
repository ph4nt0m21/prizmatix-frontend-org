export const dummyOrders = [
  {
    id: '#100246',
    customer: {
      name: 'Sarath Babu John',
      email: 'sarathbabujohn333@gmail.com',
    },
    orderDate: '07 May 2025 04:56 PM',
    purchaseDate: '07 May 2025 04:56 PM',
    ticketType: 'Early Bird',
    amount: 250.22,
    discountCode: '#prizmatixx',
    paymentMethod: 'Stripe',
    tickets: [
      { name: 'Early Bird', price: 15.39, quantity: 2 }, // 2 tickets
      { name: 'VIP', price: 0, quantity: 1 },             // 1 ticket
    ],
    // This order now correctly has 3 attendees to match the 3 tickets.
    attendees: [
      { name: 'Sarath Babu John' },
      { name: 'Steve Buchemi' },
      { name: 'Maya Lin' },
    ],
  },
  {
    id: '#100247',
    customer: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    },
    orderDate: '08 May 2025 10:15 AM',
    purchaseDate: '08 May 2025 10:15 AM',
    ticketType: 'General Admission',
    amount: 50.00,
    discountCode: null,
    paymentMethod: 'Stripe',
    tickets: [
      { name: 'General Admission', price: 25.00, quantity: 2 }, // 2 tickets
    ],
    // This order correctly has 2 attendees for 2 tickets.
    attendees: [
      { name: 'Jane Doe' },
      { name: 'John Smith' },
    ],
  },
   {
    id: '#100248',
    customer: {
      name: 'Peter Jones',
      email: 'peter.jones@example.com',
    },
    orderDate: '09 May 2025 01:20 PM',
    purchaseDate: '09 May 2025 01:20 PM',
    ticketType: 'VIP',
    amount: 150.75,
    discountCode: '#VIP25',
    paymentMethod: 'Stripe',
    tickets: [
      { name: 'VIP', price: 75.375, quantity: 2 }, // 2 tickets
    ],
    // This order correctly has 2 attendees for 2 tickets.
    attendees: [
      { name: 'Peter Jones' },
      { name: 'Mary Jane' },
    ],
  },
];

export const dummyAttendees = [
  { id: 'att-001', name: 'Sarath Babu John', email: 'sarathbabujohn333@gmail.com', orderDate: '07 May 2025 04:56 PM', ticketType: 'Early Bird', isCheckedIn: true },
  { id: 'att-002', name: 'Steve Buchemi', email: 'SteveBuchemi13@gmail.com', orderDate: '07 May 2025 04:56 PM', ticketType: 'Early Bird', isCheckedIn: false },
  { id: 'att-003', name: 'Maya Lin', email: 'maya.lin@example.com', orderDate: '07 May 2025 04:57 PM', ticketType: 'Standard', isCheckedIn: true },
  { id: 'att-004', name: 'Carlos Mendez', email: 'carlos.mendez@example.com', orderDate: '07 May 2025 04:58 PM', ticketType: 'VIP', isCheckedIn: false },
  { id: 'att-005', name: 'Jessica Huang', email: 'jessica.huang@example.com', orderDate: '07 May 2025 04:59 PM', ticketType: 'VIP', isCheckedIn: false },
  { id: 'att-006', name: 'Mohammed Khan', email: 'mohammed.khan@example.com', orderDate: '07 May 2025 05:00 PM', ticketType: 'Standard', isCheckedIn: false },
  { id: 'att-007', name: 'Rachel Green', email: 'rachel.green@example.com', orderDate: '07 May 2025 05:01 PM', ticketType: 'VIP', isCheckedIn: false },
  { id: 'att-008', name: 'Henry Morgan', email: 'henry.morgan@example.com', orderDate: '07 May 2025 05:02 PM', ticketType: 'VIP', isCheckedIn: false },
  { id: 'att-009', name: 'Emma Watson', email: 'emma.watson@example.com', orderDate: '07 May 2025 05:03 PM', ticketType: 'Early Bird', isCheckedIn: true },
  { id: 'att-010', name: 'John Doe', email: 'john.doe@example.com', orderDate: '07 May 2025 05:04 PM', ticketType: 'Early Bird', isCheckedIn: false },
  { id: 'att-011', name: 'Lily Adams', email: 'lily.adams@example.com', orderDate: '07 May 2025 05:05 PM', ticketType: 'Standard', isCheckedIn: false },
];