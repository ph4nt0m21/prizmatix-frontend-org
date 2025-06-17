import React, { useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';

// Import the default styles for the date picker pop-up
import 'react-datepicker/dist/react-datepicker.css';
import styles from './dateTimeStep.module.scss';

// --- Helper Functions to handle data translation within this component ---

const parseDateTimeStrings = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  return new Date(`${dateStr}T${timeStr}`);
};

const formatDateToString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeToString = (date) => {
  if (!date) return '';
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};


// --- Custom Input Components to match the new design ---

const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <div className={styles.inputWithIcon} onClick={onClick} ref={ref}>
      <input 
        type="text" 
        className={styles.formInput} 
        value={value} 
        readOnly
        placeholder={placeholder} 
      />
      <div className={styles.inputIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="#7C3AED"/>
        </svg>
      </div>
    </div>
));

const CustomTimeInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <div className={styles.inputWithIcon} onClick={onClick} ref={ref}>
      <input 
        type="text" 
        className={styles.formInput} 
        value={value} 
        readOnly
        placeholder={placeholder} 
      />
      <div className={styles.inputIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#7C3AED"/>
        </svg>
      </div>
    </div>
));


const DateTimeStep = ({ 
  eventData = {}, 
  handleInputChange = () => {}, 
  isValid = false, 
  stepStatus = { visited: false }
}) => {
  const initialStartDate = parseDateTimeStrings(eventData.dateTime?.startDate, eventData.dateTime?.startTime);
  const initialEndDate = parseDateTimeStrings(eventData.dateTime?.endDate, eventData.dateTime?.endTime);

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const handleDateChange = (newDate, stateUpdater, existingDateTime) => {
    const combinedDate = new Date(newDate);
    if (existingDateTime) {
      combinedDate.setHours(existingDateTime.getHours());
      combinedDate.setMinutes(existingDateTime.getMinutes());
    }
    stateUpdater(combinedDate);
  };

  const handleTimeChange = (newTime, stateUpdater, existingDateTime) => {
    const combinedDate = existingDateTime ? new Date(existingDateTime) : new Date();
    combinedDate.setHours(newTime.getHours());
    combinedDate.setMinutes(newTime.getMinutes());
    stateUpdater(combinedDate);
  };
  
  useEffect(() => {
    const formattedDataForParent = {
      startDate: formatDateToString(startDate),
      startTime: formatTimeToString(startDate),
      endDate: formatDateToString(endDate),
      endTime: formatTimeToString(endDate),
    };
    handleInputChange(formattedDataForParent, 'dateTime');
  }, [startDate, endDate, handleInputChange]);
  
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.stepIcon}>
          <path d="M9 11H7V13H9V11ZM13 11H11V13H13V11ZM17 11H15V13H17V11ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="#7C3AED"/>
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
            {/* Start Date Picker */}
            <div className={styles.formGroup}>
              <label htmlFor="startDate" className={styles.formLabel}>Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => handleDateChange(date, setStartDate, startDate)}
                customInput={<CustomDateInput placeholder="dd-mm-yyyy" />}
                dateFormat="dd-MM-yyyy"
                showPopperArrow={false}
              />
              {stepStatus.visited && !startDate && (
                <div className={styles.fieldError}>Start date is required</div>
              )}
            </div>
            
            {/* Start Time Picker */}
            <div className={styles.formGroup}>
              <label htmlFor="startTime" className={styles.formLabel}>Start Time</label>
              <DatePicker
                selected={startDate}
                onChange={(time) => handleTimeChange(time, setStartDate, startDate)}
                customInput={<CustomTimeInput placeholder="HH:MM" />}
                dateFormat="HH:mm"
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                timeFormat="HH:mm" // FIXED: Add this prop to show 24-hour format in the list
              />
               {stepStatus.visited && !startDate && (
                <div className={styles.fieldError}>Start time is required</div>
              )}
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
            {/* End Date Picker */}
            <div className={styles.formGroup}>
              <label htmlFor="endDate" className={styles.formLabel}>End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => handleDateChange(date, setEndDate, endDate)}
                customInput={<CustomDateInput placeholder="dd-mm-yyyy" />}
                dateFormat="dd-MM-yyyy"
                showPopperArrow={false}
                minDate={startDate}
              />
               {stepStatus.visited && !endDate && (
                <div className={styles.fieldError}>End date is required</div>
              )}
            </div>
            
            {/* End Time Picker */}
            <div className={styles.formGroup}>
              <label htmlFor="endTime" className={styles.formLabel}>End Time</label>
               <DatePicker
                selected={endDate}
                onChange={(time) => handleTimeChange(time, setEndDate, endDate)}
                customInput={<CustomTimeInput placeholder="HH:MM" />}
                dateFormat="HH:mm"
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                timeFormat="HH:mm" // FIXED: Add this prop to show 24-hour format in the list
              />
              {stepStatus.visited && !endDate && (
                <div className={styles.fieldError}>End time is required</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <p className={styles.timezoneInfo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#666666"/>
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
  handleInputChange: PropTypes.func,
  isValid: PropTypes.bool,
  stepStatus: PropTypes.object
};

export default DateTimeStep;