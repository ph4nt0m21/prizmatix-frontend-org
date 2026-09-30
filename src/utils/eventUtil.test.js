import { hasPublishableTickets } from './eventUtil';

describe('hasPublishableTickets', () => {
  it('treats donation-only ticket structures as publishable', () => {
    expect(
      hasPublishableTickets(
        {
          ticketStructures: [{ ticketKind: 'DONATION', name: 'Donation' }],
        },
        { totalTicketCapacity: 0 }
      )
    ).toBe(true);
  });

  it('disables publish readiness when no ticket rows remain', () => {
    expect(hasPublishableTickets({}, { totalTicketCapacity: 5 })).toBe(false);
  });
});
