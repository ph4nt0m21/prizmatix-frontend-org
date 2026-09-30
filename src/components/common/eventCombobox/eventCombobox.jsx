import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './eventCombobox.module.scss';

const EventCombobox = ({
  id,
  events,
  valueId = '',
  onChange,
  disabled = false,
  loading = false,
  placeholder = 'Search or select an event',
  emptyListMessage = 'No events available',
  noMatchMessage = 'No matching events',
}) => {
  const selectedEvent = useMemo(
    () => events.find((e) => String(e.id) === String(valueId)),
    [events, valueId]
  );

  const [query, setQuery] = useState(selectedEvent?.name ?? '');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    setQuery(selectedEvent?.name ?? '');
  }, [valueId, selectedEvent?.name, selectedEvent?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => (e.name || '').toLowerCase().includes(q));
  }, [events, query]);

  useEffect(() => {
    if (highlightIndex >= filtered.length) {
      setHighlightIndex(filtered.length > 0 ? filtered.length - 1 : -1);
    }
  }, [filtered.length, highlightIndex]);

  const commitEvent = useCallback(
    (event) => {
      if (event) {
        onChange(String(event.id));
        setQuery(event.name || '');
      } else {
        onChange('');
        setQuery('');
      }
      setOpen(false);
      setHighlightIndex(-1);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    window.setTimeout(() => {
      setOpen(false);
      setHighlightIndex(-1);
      const t = query.trim();
      if (!t) {
        onChange('');
        setQuery('');
        return;
      }
      const match = events.find((e) => (e.name || '').toLowerCase() === t.toLowerCase());
      if (match) {
        onChange(String(match.id));
        setQuery(match.name || '');
      } else {
        setQuery(selectedEvent?.name ?? '');
      }
    }, 120);
  }, [query, events, onChange, selectedEvent?.name]);

  const handleInputChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    setHighlightIndex(0);
    const exact = events.find((ev) => (ev.name || '').toLowerCase() === v.trim().toLowerCase());
    if (exact) {
      onChange(String(exact.id));
    }
  };

  const handleFocus = () => {
    if (!disabled && !loading && events.length > 0) {
      setOpen(true);
      setHighlightIndex(0);
    }
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      setHighlightIndex(0);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = highlightIndex >= 0 ? highlightIndex : 0;
      if (filtered[idx]) {
        commitEvent(filtered[idx]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery(selectedEvent?.name ?? '');
    }
  };

  const isDisabled = disabled || loading;
  const showList = open && !isDisabled && events.length > 0;

  return (
    <div className={styles.wrap}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        className={styles.input}
        value={loading ? '' : query}
        placeholder={loading ? 'Loading events…' : placeholder}
        disabled={isDisabled}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {showList && (
        <ul id={`${id}-listbox`} role="listbox" className={styles.list}>
          {events.length === 0 ? (
            <li className={styles.emptyHint}>{emptyListMessage}</li>
          ) : filtered.length === 0 ? (
            <li className={styles.emptyHint}>{noMatchMessage}</li>
          ) : (
            filtered.map((ev, idx) => (
              <li
                key={ev.id}
                role="option"
                aria-selected={String(ev.id) === String(valueId)}
                className={`${styles.item} ${idx === highlightIndex ? styles.highlighted : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlightIndex(idx)}
                onClick={() => commitEvent(ev)}
              >
                {ev.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

EventCombobox.propTypes = {
  id: PropTypes.string.isRequired,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  valueId: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  placeholder: PropTypes.string,
  emptyListMessage: PropTypes.string,
  noMatchMessage: PropTypes.string,
};

export default EventCombobox;
