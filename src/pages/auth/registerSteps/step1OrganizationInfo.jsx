// src/pages/auth/registerSteps/Step1OrganizationInfo.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/common/button/button';
import { Link } from 'react-router-dom';
import styles from '../authPages.module.scss';

/**
 * Step1OrganizationInfo component - First step of the registration process
 * Collects organization information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.nextStep - Function to proceed to next step
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Step1OrganizationInfo component
 */
const Step1OrganizationInfo = ({ formData, handleChange, nextStep, errors, isLoading }) => {
  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };
  
  return (
    <>
      <h1 className={styles.authTitle}>Create Organization Account</h1>
      <p className={styles.authSubtitle}>Tell us about your organization</p>
      
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.inputLabel}>
            Organization Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="Enter your organization name"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.name && (
            <span className={styles.errorText}>{errors.name}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.inputLabel}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className={`${styles.input} ${styles.textarea} ${errors.description ? styles.inputError : ''}`}
            placeholder="Brief description of your organization"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            rows={3}
          />
          {errors.description && (
            <span className={styles.errorText}>{errors.description}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.inputLabel}>
            Organization Email <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="Enter organization email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.email && (
            <span className={styles.errorText}>{errors.email}</span>
          )}
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="region" className={styles.inputLabel}>
              Region <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="region"
              name="region"
              className={`${styles.input} ${errors.region ? styles.inputError : ''}`}
              placeholder="Enter your region"
              value={formData.region}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.region && (
              <span className={styles.errorText}>{errors.region}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="state" className={styles.inputLabel}>
              State <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              className={`${styles.input} ${errors.state ? styles.inputError : ''}`}
              placeholder="Enter your state"
              value={formData.state}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.state && (
              <span className={styles.errorText}>{errors.state}</span>
            )}
          </div>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          disabled={isLoading}
          className={styles.authButton}
        >
          Continue
        </Button>
      </form>
      
      <div className={styles.authFooter}>
        <p>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </>
  );
};

Step1OrganizationInfo.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool
};

export default Step1OrganizationInfo;