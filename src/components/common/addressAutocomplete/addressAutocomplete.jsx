import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import {
  isGeoapifyConfigured,
  mapGeoapifyFeatureToLocation,
} from '../../../utils/geoapifyUtil';
import styles from './addressAutocomplete.module.scss';

const AddressAutocomplete = ({ initialValue = '', onSelect, disabled = false }) => {
  const containerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GEOAPIFY_API_KEY?.trim();
    if (!apiKey || !containerRef.current) {
      return undefined;
    }

    const container = containerRef.current;
    container.innerHTML = '';

    const autocomplete = new GeocoderAutocomplete(container, apiKey, {
      placeholder: 'Search for a venue or address…',
      lang: 'en',
      limit: 6,
      debounceDelay: 300,
      countryCodes: ['nz'],
      addDetails: true,
    });

    autocompleteRef.current = autocomplete;

    if (initialValue) {
      autocomplete.setValue(initialValue);
    }

    const handleSelect = (feature) => {
      if (!feature) return;
      onSelectRef.current?.(mapGeoapifyFeatureToLocation(feature));
    };

    autocomplete.on('select', handleSelect);

    return () => {
      autocomplete.off('select', handleSelect);
      autocompleteRef.current = null;
      container.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;

    const nextValue = initialValue || '';
    if (autocomplete.getValue() !== nextValue) {
      autocomplete.setValue(nextValue);
    }
  }, [initialValue]);

  useEffect(() => {
    const input = containerRef.current?.querySelector('.geoapify-autocomplete-input');
    if (input) {
      input.disabled = disabled;
    }
  }, [disabled]);

  if (!isGeoapifyConfigured()) {
    return (
      <div className={styles.missingKey}>
        Address search is unavailable. Add <code>REACT_APP_GEOAPIFY_API_KEY</code> to your
        environment, or enter the address manually below.
      </div>
    );
  }

  return <div className={styles.wrapper} ref={containerRef} />;
};

AddressAutocomplete.propTypes = {
  initialValue: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default AddressAutocomplete;
