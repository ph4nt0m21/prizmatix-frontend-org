const toDateFromEventDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;

  if (timeValue instanceof Date) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(
      timeValue.getHours(),
      timeValue.getMinutes(),
      timeValue.getSeconds(),
      timeValue.getMilliseconds()
    );
    return date;
  }

  if (typeof timeValue === 'object' && timeValue !== null) {
    const rawHour = timeValue.hour ?? timeValue.hours ?? 0;
    const rawMinute = timeValue.minute ?? timeValue.minutes ?? 0;
    const rawSecond = timeValue.second ?? timeValue.seconds ?? 0;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(Number(rawHour) || 0, Number(rawMinute) || 0, Number(rawSecond) || 0, 0);
    return date;
  }

  const dateTimeString = timeValue ? `${dateValue}T${timeValue}` : `${dateValue}T23:59:59`;
  const parsed = new Date(dateTimeString);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const fallbackDate = new Date(dateValue);
  if (Number.isNaN(fallbackDate.getTime())) return null;
  fallbackDate.setHours(23, 59, 59, 999);
  return fallbackDate;
};

export const getPublishedEventTimingStatus = (event = {}, now = new Date()) => {
  const { endDate, endTime } = getEffectiveEventDates(event);
  const eventEnd = toDateFromEventDateTime(endDate, endTime);
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
