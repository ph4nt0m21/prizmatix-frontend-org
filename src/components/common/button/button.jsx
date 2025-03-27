import React from 'react';
import PropTypes from 'prop-types';
import styles from './button.module.scss';

/**
 * Reusable Button component with multiple variants
 * @param {Object} props Component props
 * @param {string} [props.variant='primary'] Button variant (primary, secondary, outline, text)
 * @param {string} [props.size='medium'] Button size (small, medium, large)
 * @param {boolean} [props.fullWidth=false] Whether button should take full width
 * @param {string} [props.icon] Optional icon name
 * @param {boolean} [props.isLoading=false] Loading state
 * @param {boolean} [props.disabled=false] Disabled state
 * @param {Function} props.onClick Click handler
 * @param {string} [props.className] Additional CSS class
 * @param {React.ReactNode} props.children Button content
 * @returns {JSX.Element} Button component
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  children,
  ...rest
}) => {
  // Combine CSS classes
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ');

  // Render icon if provided
  const renderIcon = () => {
    if (!icon) return null;
    return <span className={`${styles.icon} ${styles[`icon-${icon}`]}`} aria-hidden="true"></span>;
  };

  // Handle click with error prevention
  const handleClick = (e) => {
    try {
      if (!disabled && !isLoading && onClick) {
        onClick(e);
      }
    } catch (error) {
      console.error('Button click error:', error);
    }
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || isLoading}
      type={rest.type || 'button'}
      {...rest}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true"></span>}
      {renderIcon()}
      <span className={styles.content}>{children}</span>
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  icon: PropTypes.string,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default Button;