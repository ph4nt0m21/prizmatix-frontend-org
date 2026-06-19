import { parseUtcStorageDateTime } from '../../utils/datetimeUtil';

const normalizeTimeValue = (timeValue) => {
  if (!timeValue) return '';
  if (typeof timeValue === 'string') return timeValue;
  if (timeValue instanceof Date) {
    return `${String(timeValue.getHours()).padStart(2, '0')}:${String(timeValue.getMinutes()).padStart(2, '0')}:${String(timeValue.getSeconds()).padStart(2, '0')}`;
  }
  if (typeof timeValue === 'object') {
    const rawHour = timeValue.hour ?? timeValue.hours ?? 0;
    const rawMinute = timeValue.minute ?? timeValue.minutes ?? 0;
    const rawSecond = timeValue.second ?? timeValue.seconds ?? 0;
    return `${String(rawHour).padStart(2, '0')}:${String(rawMinute).padStart(2, '0')}:${String(rawSecond).padStart(2, '0')}`;
  }
  return '';
};

/** Event end instant from UTC date/time components stored by the API. */
const getEventEndInstant = (event = {}) => {
  const { endDate, endTime, startDate, startTime } = getEffectiveEventDates(event);
  const resolvedEndDate = endDate || startDate;
  const resolvedEndTime = normalizeTimeValue(endTime || startTime) || '23:59:59';
  if (!resolvedEndDate) return null;
  return parseUtcStorageDateTime(resolvedEndDate, resolvedEndTime);
};

export const getPublishedEventTimingStatus = (event = {}, now = new Date()) => {
  const eventEnd = getEventEndInstant(event);
  if (!eventEnd) return 'LIVE';
  return now > eventEnd ? 'PAST' : 'LIVE';
};

/** Prefer nested edit-form dates when present so headers stay in sync while editing. */
export const getEffectiveEventDates = (event = {}) => {
  const dt = event.dateTime || {};
  return {
    startDate: dt.startDate || event.startDate || '',
    startTime: dt.startTime || event.startTime || '',
    endDate: dt.endDate || event.endDate || '',
    endTime: dt.endTime || event.endTime || '',
    timezone: event.timezone || dt.timezone || '',
  };
};

/** Published event whose end date/time has already passed. */
export const isPublishedEventEnded = (event = {}, now = new Date()) => {
  if (!event?.isPublished) {
    return false;
  }
  return getPublishedEventTimingStatus(event, now) === 'PAST';
};

export const ENDED_PUBLISHED_EVENT_SCHEDULE_MESSAGE =
  'This event has ended and can no longer be rescheduled. Duplicate the event from Manage to run it again.';
