import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import DescriptionStep from './descriptionStep';

test('Order Confirmation Message card: optional, explained, and saved as the confirmation email message', () => {
  const onChange = jest.fn();
  render(<DescriptionStep eventData={{}} handleInputChange={onChange} />);

  expect(screen.getByRole('heading', { name: 'Order Confirmation Message (optional)' })).toBeInTheDocument();
  expect(screen.getByText(/dedicated section of the order confirmation email/)).toBeInTheDocument();

  const field = screen.getByLabelText('Message from Organiser');
  expect(field).toHaveValue('');
  expect(field).toHaveAttribute('placeholder', 'Enter your message here...');
  expect(screen.queryByText(/The rest of the email remains unchanged/)).not.toBeInTheDocument();

  fireEvent.change(field, { target: { value: 'Doors open at 7pm' } });
  expect(onChange).toHaveBeenCalledWith('Doors open at 7pm', 'confirmationEmailMessage');
  expect(screen.getByText('17/1000')).toBeInTheDocument();
});

test('the (i) shows its note on hover or click, like the other info buttons', () => {
  render(<DescriptionStep eventData={{}} />);
  const info = screen.getByRole('button', { name: 'About the organiser message' });
  const note = /This only adds your message to the standard order confirmation email/;

  fireEvent.mouseEnter(info);
  expect(screen.getByText(note)).toBeInTheDocument();
  fireEvent.mouseDown(document.body);
  expect(screen.queryByText(note)).not.toBeInTheDocument();

  fireEvent.click(info);
  expect(screen.getByText(note)).toBeInTheDocument();
  expect(info).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(info);
  expect(screen.queryByText(note)).not.toBeInTheDocument();

  // Hover then click (and a phone tap, which fires both) keeps it open.
  fireEvent.mouseEnter(info);
  fireEvent.click(info);
  expect(screen.getByText(note)).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByText(note)).not.toBeInTheDocument();
});

test('shows a saved message when editing an event', () => {
  render(<DescriptionStep eventData={{ confirmationEmailMessage: 'Parking on Smith St' }} />);
  expect(screen.getByLabelText('Message from Organiser')).toHaveValue('Parking on Smith St');
});
