/** Default display / organizer timezone for Prizmatix NZ events. */
export const DEFAULT_EVENT_TIMEZONE = 'Pacific/Auckland';

export const resolveEventTimezone = (timezone) => {
  if (timezone && timezone !== 'UTC' && timezone !== 'Etc/UTC') {
    return timezone;
  }
  return DEFAULT_EVENT_TIMEZONE;
};

/** Event editor default: stored event TZ, else organizer browser TZ for new events. */
export const resolveFormEventTimezone = (timezone) => {
  if (timezone && timezone !== 'UTC' && timezone !== 'Etc/UTC') {
    return timezone;
  }
  if (typeof Intl !== 'undefined') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_EVENT_TIMEZONE;
  }
  return DEFAULT_EVENT_TIMEZONE;
};

export const normalizeTimeParts = (timeStr) => {
  const parts = String(timeStr ?? '').trim().split(':');
  return {
    hours: (parts[0] ?? '00').padStart(2, '0'),
    minutes: (parts[1] ?? '00').padStart(2, '0'),
    seconds: (parts[2] ?? '00').padStart(2, '0'),
  };
};

/** HH:mm in 24-hour format from a raw time string. */
export const formatTime24 = (timeStr) => {
  if (!timeStr) return '';
  const { hours, minutes } = normalizeTimeParts(timeStr);
  return `${hours}:${minutes}`;
};

/** Parse UTC date + time components stored by the event API into a Date (instant). */
export const parseUtcStorageDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const { hours, minutes, seconds } = normalizeTimeParts(timeStr);
  const parsed = new Date(`${dateStr}T${hours}:${minutes}:${seconds}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const utcStorageComponentsToInstant = (dateStr, timeStr) => {
  const parsed = parseUtcStorageDateTime(dateStr, timeStr);
  return parsed ? parsed.toISOString() : null;
};

const getZonedParts = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? '0';
  return {
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10),
    day: parseInt(get('day'), 10),
    hour: parseInt(get('hour'), 10),
    minute: parseInt(get('minute'), 10),
    second: parseInt(get('second'), 10),
  };
};

const parseDateParts = (dateStr) => {
  const [year, month, day] = String(dateStr).split('-').map((value) => parseInt(value, 10));
  return { year, month, day };
};

/**
 * Convert a wall-clock date + time in a specific timezone to a UTC ISO instant string.
 * Used for ticket sale windows and discount validity (Instant storage on the API).
 */
export const localWallClockToInstant = (dateStr, timeStr, timezone) => {
  if (!dateStr || !timeStr) return null;

  const timeZone = resolveEventTimezone(timezone);
  const { year, month, day } = parseDateParts(dateStr);
  const { hours, minutes, seconds } = normalizeTimeParts(timeStr);
  const desired = {
    year,
    month,
    day,
    hour: parseInt(hours, 10),
    minute: parseInt(minutes, 10),
    second: parseInt(seconds, 10),
  };

  let utcMs = Date.UTC(year, month - 1, day, desired.hour, desired.minute, desired.second);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const zoned = getZonedParts(new Date(utcMs), timeZone);
    const desiredMs = Date.UTC(
      desired.year,
      desired.month - 1,
      desired.day,
      desired.hour,
      desired.minute,
      desired.second
    );
    const actualMs = Date.UTC(
      zoned.year,
      zoned.month - 1,
      zoned.day,
      zoned.hour,
      zoned.minute,
      zoned.second
    );
    const delta = desiredMs - actualMs;
    if (delta === 0) break;
    utcMs += delta;
  }

  const result = new Date(utcMs);
  return Number.isNaN(result.getTime()) ? null : result.toISOString();
};

/** Convert a UTC ISO instant to wall-clock date + time in the given timezone (for forms). */
export const instantToLocalWallClock = (iso, timezone) => {
  if (!iso) return { date: '', time: '' };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { date: '', time: '' };

  const timeZone = resolveEventTimezone(timezone);
  const zoned = getZonedParts(date, timeZone);
  return {
    date: `${zoned.year}-${String(zoned.month).padStart(2, '0')}-${String(zoned.day).padStart(2, '0')}`,
    time: `${String(zoned.hour).padStart(2, '0')}:${String(zoned.minute).padStart(2, '0')}`,
  };
};

/** Convert UTC storage components to organizer-local wall clock for datetime step forms. */
export const utcStorageToLocalWallClock = (dateStr, timeStr, timezone) => {
  const instant = utcStorageComponentsToInstant(dateStr, timeStr);
  if (!instant) return { date: '', time: '' };
  return instantToLocalWallClock(instant, timezone);
};

/** Convert organizer-local wall clock to UTC date + time components for event API storage. */
export const localWallClockToUtcStorage = (dateStr, timeStr, timezone) => {
  const instant = localWallClockToInstant(dateStr, timeStr, timezone);
  if (!instant) return { date: null, time: null };
  return {
    date: instant.substring(0, 10),
    time: instant.substring(11, 19),
  };
};

export const normalizeUtcStorageTime = (timeValue) => {
  if (!timeValue) return '';
  if (typeof timeValue === 'string') {
    const trimmed = timeValue.trim();
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      const parts = trimmed.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${(parts[2] ?? '00').padStart(2, '0')}`;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return `${String(parsed.getUTCHours()).padStart(2, '0')}:${String(parsed.getUTCMinutes()).padStart(2, '0')}:${String(parsed.getUTCSeconds()).padStart(2, '0')}`;
    }
    return trimmed.slice(0, 8);
  }
  if (typeof timeValue === 'object' && timeValue !== null) {
    return `${String(timeValue.hour ?? 0).padStart(2, '0')}:${String(timeValue.minute ?? 0).padStart(2, '0')}:${String(timeValue.second ?? 0).padStart(2, '0')}`;
  }
  return '';
};

export const formatInstantTime24 = (date, timeZone) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date);

/** Customer-facing event time — 24-hour HH:mm, UTC storage converted to event/platform TZ. */
export const formatEventTimeForDisplay = (dateStr, timeStr, timezone) => {
  if (!timeStr) return '';

  const displayTimezone = resolveEventTimezone(timezone);

  if (dateStr) {
    const utcInstant = parseUtcStorageDateTime(dateStr, timeStr);
    if (utcInstant) {
      return formatInstantTime24(utcInstant, displayTimezone);
    }
  }

  return formatTime24(timeStr);
};

export const formatEventDateForDisplay = (dateStr, timeStr, timezone) => {
  if (!dateStr) return '';

  const displayTimezone = resolveEventTimezone(timezone);
  const instant = timeStr
    ? parseUtcStorageDateTime(dateStr, timeStr)
    : parseUtcStorageDateTime(dateStr, '12:00:00');

  if (!instant) {
    return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: displayTimezone,
    });
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: displayTimezone,
  }).format(instant);
};

const sameCalendarDayInTimezone = (startDate, startTime, endDate, endTime, timezone) => {
  const startInstant = utcStorageComponentsToInstant(startDate, startTime);
  const endInstant = utcStorageComponentsToInstant(endDate, endTime);
  if (!startInstant || !endInstant) return false;

  const displayTimezone = resolveEventTimezone(timezone);
  const startParts = getZonedParts(new Date(startInstant), displayTimezone);
  const endParts = getZonedParts(new Date(endInstant), displayTimezone);
  return (
    startParts.year === endParts.year &&
    startParts.month === endParts.month &&
    startParts.day === endParts.day
  );
};

/** Customer-facing schedule: start + end in event timezone, 24-hour times. */
export const formatEventScheduleForDisplay = ({
  startDate,
  startTime,
  endDate,
  endTime,
  timezone,
} = {}) => {
  if (!startDate || !startTime) return 'Date and time not set';

  const displayTimezone = resolveEventTimezone(timezone);
  const startDateLabel = formatEventDateForDisplay(startDate, startTime, displayTimezone);
  const startTimeLabel = formatEventTimeForDisplay(startDate, startTime, displayTimezone);

  if (!endDate || !endTime) {
    return `${startDateLabel}, ${startTimeLabel}`;
  }

  const endTimeLabel = formatEventTimeForDisplay(endDate, endTime, displayTimezone);
  if (sameCalendarDayInTimezone(startDate, startTime, endDate, endTime, displayTimezone)) {
    return `${startDateLabel}, ${startTimeLabel} – ${endTimeLabel}`;
  }

  const endDateLabel = formatEventDateForDisplay(endDate, endTime, displayTimezone);
  return `${startDateLabel}, ${startTimeLabel} – ${endDateLabel}, ${endTimeLabel}`;
};


/** Map API event datetime (UTC components) to form-friendly local wall clock. */
export const mapApiDateTimeToFormDateTime = (dateTimePayload = {}, fallback = {}) => {
  const timezone = resolveEventTimezone(
    dateTimePayload.timezone || dateTimePayload.timeZone || fallback.timezone
  );

  const utcStartDate = dateTimePayload.startDate || fallback.startDate || '';
  const utcStartTime = normalizeUtcStorageTime(
    dateTimePayload.startTime || fallback.startTime
  );
  const utcEndDate = dateTimePayload.endDate || fallback.endDate || '';
  const utcEndTime = normalizeUtcStorageTime(
    dateTimePayload.endTime || fallback.endTime
  );

  const start = utcStorageToLocalWallClock(utcStartDate, utcStartTime, timezone);
  const end = utcStorageToLocalWallClock(utcEndDate, utcEndTime, timezone);

  return {
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    timezone,
  };
};

export const formatEventScheduleFromFormDateTime = (dateTime = {}) => {
  const timezone = resolveEventTimezone(dateTime.timezone);
  const startUtc = localWallClockToUtcStorage(
    dateTime.startDate,
    dateTime.startTime,
    timezone
  );
  const endUtc = localWallClockToUtcStorage(
    dateTime.endDate,
    dateTime.endTime,
    timezone
  );

  return formatEventScheduleForDisplay({
    startDate: startUtc.date || dateTime.startDate,
    startTime: startUtc.time || dateTime.startTime,
    endDate: endUtc.date || dateTime.endDate,
    endTime: endUtc.time || dateTime.endTime,
    timezone,
  });
};

/** Fallback discount/ticket end instant from form-local event datetime. */
export const eventEndInstantFromFormDateTime = (dateTime = {}) => {
  const timezone = resolveEventTimezone(dateTime.timezone);
  return (
    localWallClockToInstant(dateTime.endDate, dateTime.endTime, timezone) ||
    localWallClockToInstant(dateTime.startDate, dateTime.startTime, timezone)
  );
};

export const isInstantInPast = (iso) => {
  if (!iso) return false;
  const date = new Date(iso);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
};
