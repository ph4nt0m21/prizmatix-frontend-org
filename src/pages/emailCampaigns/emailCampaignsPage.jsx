import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { toast } from 'react-toastify';

import {
  GetAllOrganizationEventsAPI,
  GetEventAPI,
  CreateEmailCampaignAPI,
  SendEmailCampaignAPI
} from '../../services/allApis';
import { getUserData } from '../../utils/authUtil';
import styles from './emailCampaignsPage.module.scss';

const DECORATORS = [
  "@AddToCalendar",
  "@EventName",
  "@OrganiserName",
  "@OrganiserLogo",
  "@FirstName",
  "@LastName",
  "@OrderNumber"
];

const EmailCampaignsPage = () => {
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [campaignName, setCampaignName] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeBanner, setIncludeBanner] = useState(true);
  const [includeLocationDate, setIncludeLocationDate] = useState(true);
  const [sendOption, setSendOption] = useState('now');
  const [scheduledAt, setScheduledAt] = useState(new Date());
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);

  // decorator suggestion states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);

  // Load events for organization
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userData = getUserData();
        const orgId = userData?.organizationId;
        if (!orgId) {
          toast.error('Organization ID not found');
          return;
        }
        const res = await GetAllOrganizationEventsAPI(orgId);
        setEvents(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load events');
      }
    };
    fetchEvents();
  }, []);

  const eventOptions = events.map(e => ({ value: e.id, label: e.name }));

  const handleBack = () => navigate(-1);

  const handleSaveDraft = async () => {
    try {
      for (const eventId of selectedEvents) {
        const payload = {
          campaignName,
          subject,
          message,
          includeEventBanner: selectedEvents.length === 1 ? includeBanner : false,
          includeEventLocationAndDate: selectedEvents.length === 1 ? includeLocationDate : false,
          sendType: sendOption,
          scheduledAt: sendOption === 'at' ? scheduledAt.toISOString() : null,
          event: { id: parseInt(eventId, 10) },
          sent: false
        };
        await CreateEmailCampaignAPI(payload);
      }
      toast.success('Draft(s) saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error saving draft.');
    }
  };

  const handleSend = async () => {
    try {
      for (const eventId of selectedEvents) {
        const payload = {
          campaignName,
          subject,
          message,
          includeEventBanner: selectedEvents.length === 1 ? includeBanner : false,
          includeEventLocationAndDate: selectedEvents.length === 1 ? includeLocationDate : false,
          sendType: sendOption,
          scheduledAt: sendOption === 'at' ? scheduledAt.toISOString() : null,
          event: { id: parseInt(eventId, 10) },
          sent: true
        };

        const res = await CreateEmailCampaignAPI(payload);
        await SendEmailCampaignAPI(res.data.id);
      }
      toast.success('Campaign(s) sent!');
    } catch (err) {
      console.error(err);
      toast.error('Error sending campaign.');
    }
  };

  const handleOpenPreview = async () => {
    if (selectedEvents.length === 1) {
      try {
        const res = await GetEventAPI(selectedEvents[0]);
        setEventDetails(res.data);
      } catch (err) {
        console.error(err);
        setEventDetails(null);
      }
    }
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setEventDetails(null);
  };

  // -----------------------
  // Subject decorator logic
  // -----------------------
  const handleSubjectKeyDown = (e) => {
    const pos = e.target.selectionStart;
    setCursorPosition(pos);
    if (e.key === '@') {
      const rect = e.target.getBoundingClientRect();
      setSuggestionPosition({ top: rect.bottom + window.scrollY, left: rect.left + 10 });
      setShowSuggestions(true);
    }
  };

  const insertDecoratorInSubject = (decorator) => {
    const before = subject.substring(0, cursorPosition);
    const after = subject.substring(cursorPosition);
    const newValue = before + decorator + after;
    setSubject(newValue);
    setShowSuggestions(false);
  };

  // -----------------------
  // Message decorator logic
  // -----------------------
const handleQuillKeyDown = (evt) => {
  if (evt.key === '@') {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();
    if (!editor) return;

    const range = editor.getSelection();
    if (!range) return;

    const bounds = editor.getBounds(range.index);
    const container = quillRef.current.container?.getBoundingClientRect();
    if (!bounds || !container) return;

    setSuggestionPosition({
      top: container.top + bounds.top + 30,
      left: container.left + bounds.left
    });
    setCursorPosition(range.index);
    setShowSuggestions(true);
  }
};


  const insertDecoratorInMessage = (decorator) => {
    const editor = quillRef.current.getEditor();
    editor.insertText(cursorPosition, decorator + ' ');
    setShowSuggestions(false);
  };

  return (
    <div className={styles.emailCampaignsPageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumbs}>
          <span>Email Campaign</span> <span className={styles.breadcrumbDivider}>›</span> <span>New Campaign</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} onClick={handleOpenPreview}>Preview</button>
          <button className={styles.secondaryButton}>Send Test Mail</button>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Email Campaign</h1>

      {/* Campaign Info */}
      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label>Campaign Name</label>
          <input
            type="text"
            placeholder="Enter campaign name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>
      </div>

      {/* Recipients */}
      <div className={styles.formSection}>
        <h2>Recipients</h2>
        <div className={styles.formGroup}>
          <label>Select Event(s)</label>
          <Select
            isMulti
            options={eventOptions}
            value={eventOptions.filter(opt => selectedEvents.includes(opt.value.toString()))}
            onChange={(selected) => setSelectedEvents(selected.map(opt => opt.value.toString()))}
            className={styles.multiSelect}
            classNamePrefix="select"
            placeholder="Choose one or more events"
          />
        </div>
      </div>

      {/* Content & Design */}
      <div className={styles.formSection}>
        <h2>Content & Design</h2>
        <div className={styles.formGroup}>
          <label>Subject</label>
          <input
            type="text"
            placeholder="Enter subject line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={handleSubjectKeyDown}
          />
        </div>

        {selectedEvents.length === 1 && (
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeBanner}
                onChange={(e) => setIncludeBanner(e.target.checked)}
              />
              Include Event Banner Image
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeLocationDate}
                onChange={(e) => setIncludeLocationDate(e.target.checked)}
              />
              Include Event Location and Date
            </label>
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Message</label>
          <div onKeyDown={handleQuillKeyDown}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={message}
              onChange={setMessage}
              placeholder="Type your email content here..."
              className={styles.richTextEditor}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
          </div>
        </div>
      </div>

      {/* Send */}
      <div className={styles.formSection}>
        <h2>Send</h2>
        <div className={styles.toggleGroup}>
          {['now', 'at'].map(option => (
            <button
              key={option}
              type="button"
              className={`${styles.toggleButton} ${sendOption === option ? styles.active : ''}`}
              onClick={() => setSendOption(option)}
            >
              {option === 'now' ? 'Send Now' : 'Schedule (At)'}
            </button>
          ))}
        </div>

        {sendOption === 'at' && (
          <div className={styles.dateTimePickerWrapper}>
            <label>Choose Date & Time</label>
            <DatePicker
              selected={scheduledAt}
              onChange={(date) => setScheduledAt(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className={styles.dateTimeInput}
              placeholderText="Select date and time"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footerActions}>
        <button className={styles.secondaryButton} onClick={handleBack}>Back</button>
        <button className={styles.secondaryButton} onClick={handleSaveDraft}>Save Draft</button>
        <button className={styles.primaryButton} onClick={handleSend}>Send</button>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className={styles.previewOverlay}>
          <div className={styles.previewModal}>
            <h2>Preview</h2>
            <h3>{subject}</h3>
            {selectedEvents.length === 1 && eventDetails && includeBanner && (
              <img src={eventDetails.bannerImage} alt="Event Banner" className={styles.previewBanner} />
            )}
            <div
              className={styles.previewMessage}
              dangerouslySetInnerHTML={{ __html: message }}
            />
            {selectedEvents.length === 1 && eventDetails && includeLocationDate && (
              <p className={styles.previewEventInfo}>
                📍 {eventDetails.eventLocationName} | 🗓 {eventDetails.startDate}
              </p>
            )}
            <div className={styles.previewActions}>
              <button className={styles.secondaryButton} onClick={handleClosePreview}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <ul
          className={styles.suggestionsList}
          style={{ top: suggestionPosition.top, left: suggestionPosition.left }}
        >
          {DECORATORS.map(d => (
            <li
              key={d}
              onClick={() =>
                subject ? insertDecoratorInSubject(d) : insertDecoratorInMessage(d)
              }
            >
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmailCampaignsPage;
