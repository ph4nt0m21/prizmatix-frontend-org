import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './emailCampaignsPage.module.scss';

// Placeholder for a campaigns icon if you don't have a specific one yet
const CampaignsIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20 6H10V4H20V6ZM20 10H10V8H20V10ZM20 14H10V12H20V14ZM16 18H10V16H16V18ZM4 6H8V4H4V6ZM4 10H8V8H4V10ZM4 14H8V12H4V14ZM4 18H8V16H4V18Z" fill="currentColor"/>
  </svg>
);


/**
 * EmailCampaignsPage component for creating and managing email campaigns.
 * Implements the design from the Figma wireframe.
 */
const EmailCampaignsPage = () => {
  const navigate = useNavigate();

  const [campaignName, setCampaignName] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [recipientType, setRecipientType] = useState('buyersOnly'); // 'buyersOnly' or 'allAttendees'
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeBannerImage, setIncludeBannerImage] = useState(false);
  const [includeLocationDate, setIncludeLocationDate] = useState(false);
  const [sendTime, setSendTime] = useState({ date: '', time: '' });

  const handleSend = () => {
    // Implement send logic here
    console.log('Sending campaign:', {
      campaignName, replyTo, selectedEvent, recipientType, subject, message,
      includeBannerImage, includeLocationDate, sendTime
    });
    alert('Campaign Sent (simulated)!');
    // In a real app, you'd make an API call and handle success/error
  };

  const handleSaveDraft = () => {
    // Implement save draft logic here
    console.log('Saving draft:', { campaignName, subject, message });
    alert('Campaign Draft Saved (simulated)!');
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  // Dummy event data for the select dropdown
  const dummyEvents = [
    { id: '1', name: 'City Music Festival 2022' },
    { id: '2', name: 'Summer Jazz Night' },
    { id: '3', name: 'Tech Conference 2023' },
  ];

  return (
    <div className={styles.emailCampaignsPageContainer}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          <span>Email Campaign</span> &gt; <span>New Campaign</span>
        </div>
        <h1 className={styles.pageTitle}>Email Campaign</h1>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label htmlFor="campaignName" className={styles.label}>Campaign Name</label>
          <input
            type="text"
            id="campaignName"
            className={styles.input}
            placeholder="Enter the official name of your event that will be displayed to attendees"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="replyTo" className={styles.label}>Reply To</label>
          <input
            type="email"
            id="replyTo"
            className={styles.input}
            placeholder="Enter the official name of your event that will be displayed to attendees"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Recipients</h2>
        <div className={styles.formGroup}>
          <label htmlFor="selectEvent" className={styles.label}>Select Event(s)</label>
          <select
            id="selectEvent"
            className={styles.select}
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">Select an Event</option>
            {dummyEvents.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <p className={styles.fieldHint}>Enter the official name of your event that will be displayed to attendees</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Include</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="recipientType"
                value="buyersOnly"
                checked={recipientType === 'buyersOnly'}
                onChange={(e) => setRecipientType(e.target.value)}
                className={styles.radioInput}
              />
              Buyers Only
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="recipientType"
                value="allAttendees"
                checked={recipientType === 'allAttendees'}
                onChange={(e) => setRecipientType(e.target.value)}
                className={styles.radioInput}
              />
              All Buyers and Attendees
            </label>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Content & Design</h2>
        <div className={styles.formGroup}>
          <label htmlFor="subject" className={styles.label}>Subject</label>
          <input
            type="text"
            id="subject"
            className={styles.input}
            placeholder="Enter the official name of your event that will be displayed to attendees"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeBannerImage}
              onChange={(e) => setIncludeBannerImage(e.target.checked)}
              className={styles.checkboxInput}
            />
            Include Event Banner Image
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeLocationDate}
              onChange={(e) => setIncludeLocationDate(e.target.checked)}
              className={styles.checkboxInput}
            />
            Include Event Location and Date
          </label>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>Message</label>
          <div className={styles.richTextEditorPlaceholder}>
            {/* Placeholder for rich text editor toolbar */}
            <div className={styles.toolbar}>
                <button>B</button>
                <button>I</button>
                <button>U</button>
                <button>S</button>
                <button>Link</button>
                <button>Align</button>
                <button>List</button>
                <button>Img</button>
                <button>Code</button>
            </div>
            <textarea
              id="message"
              className={styles.textarea}
              placeholder="Enter your event message"
              rows="8"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <p className={styles.fieldHint}>The event description will be shown on the event details page.</p>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Send</h2>
        <p className={styles.fieldHint}>Enter the official name of your event that will be displayed to attendees</p>
        <div className={styles.sendTimeGroup}>
          <input
            type="date"
            className={styles.dateInput}
            value={sendTime.date}
            onChange={(e) => setSendTime({ ...sendTime, date: e.target.value })}
          />
          <input
            type="time"
            className={styles.timeInput}
            value={sendTime.time}
            onChange={(e) => setSendTime({ ...sendTime, time: e.target.value })}
          />
          <button className={styles.afterButton}>After</button>
        </div>
      </div>

      <div className={styles.footerActions}>
        <button className={styles.backButton} onClick={handleBack}>Back</button>
        <button className={styles.saveDraftButton} onClick={handleSaveDraft}>Save Draft</button>
        <button className={styles.sendButton} onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default EmailCampaignsPage;