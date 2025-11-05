import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './helpSupportModal.module.scss';
import { toast } from 'react-toastify';

// --- SVG Icons ---

const CloseIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M18 6L6 18" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M7.5 15L12.5 10L7.5 5" stroke="#6B21A8" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackArrowIcon = (props) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M15.8337 10.0003H4.16699M4.16699 10.0003L10.0003 15.8337M4.16699 10.0003L10.0003 4.16699" stroke="#344054" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const UploadIcon = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 16.5V3M12 3L16.5 7.5M12 3L7.5 7.5" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12V19.5C21 20.3284 20.3284 21 19.5 21H4.5C3.67157 21 3 20.3284 3 19.5V12" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


// --- FAQ Data ---
const faqs = [
  {
    question: "How do I create an event on Prizmatix?",
    answer: "You can create an event from your organiser dashboard by clicking “Create Event”. Fill in the event details, ticket types, and publish when ready."
  },
  {
    question: "How do I track ticket sales?",
    answer: "You can track ticket sales in real-time from the 'Reports' tab in your event management dashboard. It provides detailed analytics on revenue and attendance."
  },
  {
    question: "How do attendees get their tickets?",
    answer: "Attendees receive their tickets via email immediately after a successful purchase. They can also access them from their Prizmatix account."
  },
  {
    question: "How do I check in attendees at the event?",
    answer: "You can check in attendees using our mobile scanner app, available for organizers. Simply scan the QR code on their ticket."
  },
  {
    question: "What payment methods are supported?",
    answer: "We support a wide range of payment methods, including all major credit and debit cards, net banking, and popular digital wallets."
  }
];


// --- Main Component ---
const HelpSupportModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState('faq'); // 'faq' or 'contact'
  const [openFaq, setOpenFaq] = useState(0); // Index of the open FAQ
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setAttachments(Array.from(event.target.files));
  };

  const handleSendSupportTicket = (e) => {
    e.preventDefault();
    console.log({ subject, message, attachments });
    // Here you would typically call an API to send the support ticket
    toast.success("Your support ticket has been sent!");
    onClose(); // Close modal on success
  };
  
  // Reset state when modal is closed to ensure it opens in the default view
  const handleClose = () => {
    setView('faq');
    setOpenFaq(0);
    setSubject('');
    setMessage('');
    setAttachments([]);
    onClose();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {view === 'faq' ? (
          <>
            <div className={styles.header}>
              <h2>How can we help you today?</h2>
              <button onClick={handleClose} className={styles.closeButton}><CloseIcon /></button>
            </div>
            <div className={styles.faqList}>
              {faqs.map((faq, index) => (
                <div key={index} className={styles.faqItem}>
                  <button className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                    {index + 1}. {faq.question}
                    <ChevronRightIcon className={`${styles.chevron} ${openFaq === index ? styles.open : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.footer}>
              <button className={styles.contactButton} onClick={() => setView('contact')}>
                Still need help? Contact Support
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.header}>
               <button onClick={() => setView('faq')} className={styles.backButton}><BackArrowIcon /></button>
              <h2>Create a Support Ticket</h2>
              <button onClick={handleClose} className={styles.closeButton}><CloseIcon /></button>
            </div>
            <p className={styles.subHeader}>Tell us what went wrong and we'll get back to you soon.</p>
            <form onSubmit={handleSendSupportTicket} className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject Field</label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Early Bird Ticket Issue"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. The great Music Festival 2025"
                  rows="5"
                  required
                />
              </div>
               <div className={styles.formGroup}>
                <label htmlFor="attachments">Attachments</label>
                <div className={styles.attachmentBox} onClick={() => fileInputRef.current.click()}>
                    <UploadIcon />
                    <span>Upload anything related to your concern (.jpg, .pdf, .png)</span>
                    <input
                        type="file"
                        id="attachments"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        style={{ display: 'none' }}
                    />
                </div>
                {attachments.length > 0 && (
                    <div className={styles.fileList}>
                        {attachments.map((file, index) => (
                            <span key={index}>{file.name}</span>
                        ))}
                    </div>
                )}
              </div>
              <div className={styles.footer}>
                <button type="submit" className={styles.sendButton}>Send</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

HelpSupportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default HelpSupportModal;