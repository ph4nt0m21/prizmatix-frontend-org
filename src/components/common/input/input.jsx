import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './input.module.scss';

/**
 * Reusable Input component
 * @param {Object} props Component props
 * @param {string} props.id Input id
 * @param {string} props.name Input name
 * @param {string} [props.type='text'] Input type
 * @param {string} [props.label] Input label
 * @param {string} [props.placeholder] Input placeholder
 * @param {string} [props.value] Input value
 * @param {Function} props.onChange Change handler
 * @param {Function} [props.onBlur] Blur handler
 * @param {string} [props.error] Error message
 * @param {boolean} [props.required=false] Whether input is required
 * @param {boolean} [props.disabled=false] Whether input is disabled
 * @param {string} [props.className] Additional CSS class
 * @returns {JSX.Element} Input component
 */
const Input = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Container classes
  const containerClasses = [
    styles.inputContainer,
    error ? styles.hasError : '',
    disabled ? styles.disabled : '',
    isFocused ? styles.focused : '',
    className
  ].filter(Boolean).join(' ');
  
  // Handle input change with error handling
  const handleChange = (e) => {
    try {
      if (onChange) {
        onChange(e);
      }
    } catch (error) {
      console.error('Input change error:', error);
    }
  };
  
  // Handle input blur with error handling
  const handleBlur = (e) => {
    setIsFocused(false);
    try {
      if (onBlur) {
        onBlur(e);
      }
    } catch (error) {
      console.error('Input blur error:', error);
    }
  };
  
  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={styles.input}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          {...rest}
        />
      </div>
      
      {error && (
        <div id={`${id}-error`} className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

Input.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default Input;