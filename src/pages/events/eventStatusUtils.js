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
  const eventEnd = toDateFromEventDateTime(event.endDate, event.endTime);
  if (!eventEnd) return 'LIVE';
  return now > eventEnd ? 'PAST' : 'LIVE';
};
