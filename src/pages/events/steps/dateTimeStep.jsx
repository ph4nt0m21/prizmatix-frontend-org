import React, { useState, useEffect, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';

// Import the default styles for the date picker pop-up
import 'react-datepicker/dist/react-datepicker.css';
import styles from './dateTimeStep.module.scss';

// --- Helper Functions ---

const parseDateTimeStrings = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  return new Date(`${dateStr}T${timeStr}`);
};

const formatDateForParent = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeForParent = (date) => {
  if (!date) return '';
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatDateForDisplay = (date) => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTimeForDisplay = (date) => {
  if (!date) return '';
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// --- Custom Input Components ---

const CustomDateInput = forwardRef(({ value, onClick, onChange, onFocus, onBlur, placeholder }, ref) => (
    <div className={styles.inputWithIcon} ref={ref}>
        <input
            type="text"
            className={styles.formInput}
            value={value}
            onClick={onClick}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
        />
        <div className={styles.inputIcon} onClick={onClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="#7C3AED" />
            </svg>
        </div>
    </div>
));

const CustomTimeInput = forwardRef(({ value, onClick, onChange, onFocus, onBlur, placeholder }, ref) => (
    <div className={styles.inputWithIcon} ref={ref}>
        <input
            type="text"
            className={styles.formInput}
            value={value}
            onClick={onClick}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
        />
        <div className={styles.inputIcon} onClick={onClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#7C3AED" />
            </svg>
        </div>
    </div>
));


const DateTimeStep = ({
  eventData = {},
  handleInputChange = () => { }
}) => {
  const initialStartDate = parseDateTimeStrings(eventData.dateTime?.startDate, eventData.dateTime?.startTime);
  const initialEndDate = parseDateTimeStrings(eventData.dateTime?.endDate, eventData.dateTime?.endTime);

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const [startDateStr, setStartDateStr] = useState(formatDateForDisplay(initialStartDate));
  const [startTimeStr, setStartTimeStr] = useState(formatTimeForDisplay(initialStartDate));
  const [endDateStr, setEndDateStr] = useState(formatDateForDisplay(initialEndDate));
  const [endTimeStr, setEndTimeStr] = useState(formatTimeForDisplay(initialEndDate));
  
  // ✅ NEW: Using useRef for synchronous focus tracking
  const isStartDateFocused = useRef(false);
  const isStartTimeFocused = useRef(false);
  const isEndDateFocused = useRef(false);
  const isEndTimeFocused = useRef(false);

  // --- START DATE & TIME HANDLERS ---

  const handleStartDateSelect = (date) => {
    if (isStartDateFocused.current) return; // ✅ Guard clause now checks the ref
    let newStartDate = date ? new Date(date) : null;
    if (newStartDate && startDate) {
      newStartDate.setHours(startDate.getHours(), startDate.getMinutes());
    }
    setStartDate(newStartDate);
    setStartDateStr(formatDateForDisplay(newStartDate));
    if (newStartDate) setStartTimeStr(formatTimeForDisplay(newStartDate));
  };

  const handleStartDateBlur = () => {
    isStartDateFocused.current = false; // Update ref on blur
    const parts = startDateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (parts) {
      const [_, day, month, year] = parts;
      const parsedDate = new Date(`${year}-${month}-${day}T00:00:00Z`); // Use UTC to prevent timezone offset issues
      if (parsedDate && !isNaN(parsedDate) && parsedDate.getUTCDate() === parseInt(day, 10)) {
        handleStartDateSelect(parsedDate);
        return;
      }
    }
    setStartDateStr(formatDateForDisplay(startDate));
  };

  const handleStartTimeSelect = (time) => {
    if (isStartTimeFocused.current) return; // ✅ Guard clause now checks the ref
    if (!time || !startDate) return;
    const newStartDate = new Date(startDate);
    newStartDate.setHours(time.getHours(), time.getMinutes());
    setStartDate(newStartDate);
    setStartTimeStr(formatTimeForDisplay(newStartDate));
  };

  const handleStartTimeBlur = () => {
    isStartTimeFocused.current = false; // Update ref on blur
    if (!startDate) return;
    const parts = startTimeStr.match(/^(\d{1,2}):(\d{1,2})$/);
    if (parts) {
      const [_, hours, minutes] = parts;
      if (parseInt(hours, 10) < 24 && parseInt(minutes, 10) < 60) {
        const newTime = new Date();
        newTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        handleStartTimeSelect(newTime);
        return;
      }
    }
    setStartTimeStr(formatTimeForDisplay(startDate));
  };

  // --- END DATE & TIME HANDLERS ---
  
  const handleEndDateSelect = (date) => {
    if (isEndDateFocused.current) return; // ✅ Guard clause now checks the ref
    let newEndDate = date ? new Date(date) : null;
    if (newEndDate && endDate) {
      newEndDate.setHours(endDate.getHours(), endDate.getMinutes());
    }
    setEndDate(newEndDate);
    setEndDateStr(formatDateForDisplay(newEndDate));
    if (newEndDate) setEndTimeStr(formatTimeForDisplay(newEndDate));
  };

  const handleEndDateBlur = () => {
    isEndDateFocused.current = false; // Update ref on blur
    const parts = endDateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (parts) {
      const [_, day, month, year] = parts;
      const parsedDate = new Date(`${year}-${month}-${day}T00:00:00Z`); // Use UTC to prevent timezone offset issues
      if (parsedDate && !isNaN(parsedDate) && parsedDate.getUTCDate() === parseInt(day, 10)) {
        handleEndDateSelect(parsedDate);
        return;
      }
    }
    setEndDateStr(formatDateForDisplay(endDate));
  };

  const handleEndTimeSelect = (time) => {
    if (isEndTimeFocused.current) return; // ✅ Guard clause now checks the ref
    if (!time || !endDate) return;
    const newEndDate = new Date(endDate);
    newEndDate.setHours(time.getHours(), time.getMinutes());
    setEndDate(newEndDate);
    setEndTimeStr(formatTimeForDisplay(newEndDate));
  };

  const handleEndTimeBlur = () => {
    isEndTimeFocused.current = false; // Update ref on blur
    if (!endDate) return;
    const parts = endTimeStr.match(/^(\d{1,2}):(\d{1,2})$/);
    if (parts) {
      const [_, hours, minutes] = parts;
      if (parseInt(hours, 10) < 24 && parseInt(minutes, 10) < 60) {
        const newTime = new Date();
        newTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        handleEndTimeSelect(newTime);
        return;
      }
    }
    setEndTimeStr(formatTimeForDisplay(endDate));
  };

  // --- Effects ---

  useEffect(() => {
    const formattedDataForParent = {
      startDate: formatDateForParent(startDate),
      startTime: formatTimeForParent(startDate),
      endDate: formatDateForParent(endDate),
      endTime: formatTimeForParent(endDate),
    };
    handleInputChange(formattedDataForParent, 'dateTime');
  }, [startDate, endDate, handleInputChange]);

  useEffect(() => {
    if (!startDate) {
      setEndDate(null);
      setEndDateStr('');
      setEndTimeStr('');
    } else if (endDate && endDate < startDate) {
      setEndDate(null);
      setEndDateStr('');
      setEndTimeStr('');
    }
  }, [startDate, endDate]);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M9 11H7V13H9V11ZM13 11H11V13H13V11ZM17 11H15V13H17V11ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="#7C3AED" />
        </svg>
        <h2 className={styles.stepTitle}>Date of the event</h2>
      </div>

      <div className={styles.formSection}>
        {/* Event Start Details */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Event Start Details</label>
          <p className={styles.formDescription}>
            The start date and time of your event that will appear on the event page
          </p>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate" className={styles.formLabel}>Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateSelect}
                customInput={
                  <CustomDateInput
                    placeholder="dd-mm-yyyy"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    onFocus={() => { isStartDateFocused.current = true; }}
                    onBlur={handleStartDateBlur}
                  />
                }
                dateFormat="dd-MM-yyyy"
                showPopperArrow={false}
                minDate={new Date()}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="startTime" className={styles.formLabel}>Start Time</label>
              <DatePicker
                selected={startDate}
                onChange={handleStartTimeSelect}
                customInput={
                  <CustomTimeInput
                    placeholder="HH:MM"
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    onFocus={() => { isStartTimeFocused.current = true; }}
                    onBlur={handleStartTimeBlur}
                  />
                }
                disabled={!startDate}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeFormat="HH:mm"
                dateFormat="HH:mm"
              />
            </div>
          </div>
        </div>

        {/* Event End Details */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Event End Details</label>
          <p className={styles.formDescription}>
            The end date and time of your event that will appear on the event page
          </p>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="endDate" className={styles.formLabel}>End Date</label>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateSelect}
                customInput={
                  <CustomDateInput
                    placeholder="dd-mm-yyyy"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    onFocus={() => { isEndDateFocused.current = true; }}
                    onBlur={handleEndDateBlur}
                  />
                }
                disabled={!startDate}
                minDate={startDate || new Date()}
                dateFormat="dd-MM-yyyy"
                showPopperArrow={false}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="endTime" className={styles.formLabel}>End Time</label>
              <DatePicker
                selected={endDate}
                onChange={handleEndTimeSelect}
                customInput={
                  <CustomTimeInput
                    placeholder="HH:MM"
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    onFocus={() => { isEndTimeFocused.current = true; }}
                    onBlur={handleEndTimeBlur}
                  />
                }
                disabled={!endDate}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeFormat="HH:mm"
                dateFormat="HH:mm"
              />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <p className={styles.timezoneInfo}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#666666" />
            </svg>
            All times are in your local timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>
      </div>
    </div>
  );
};

DateTimeStep.propTypes = {
  eventData: PropTypes.object,
  handleInputChange: PropTypes.func
};

export default DateTimeStep;