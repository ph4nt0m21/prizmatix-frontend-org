import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './payoutSection.module.scss';

// Import SVG components
import { ReactComponent as PlusIcon } from '../../../assets/icons/plus-icon.svg';
import { ReactComponent as CardPaymentsIcon } from '../../../assets/icons/card-payments.svg';
// Import the newly created EditIcon SVG
import { ReactComponent as EditIcon } from '../../../assets/icons/edit-icon.svg';

/**
 * PayoutSection component - Displays payout information and history.
 *
 * @param {Object} props Component props
 * @param {string} props.title Section title to display
 * @param {string} props.description Brief description of the section
 * @returns {JSX.Element} PayoutSection component
 */
const PayoutSection = ({ title, description }) => {
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutType, setPayoutType] = useState('full'); // 'full' or 'custom'
  const [customPayoutAmount, setCustomPayoutAmount] = useState('');
  const [fullPayoutAmount, setFullPayoutAmount] = useState(0); // Dummy data for full payout
  const [customAmountStep, setCustomAmountStep] = useState('input'); // 'input' or 'display'

  useEffect(() => {
    // Simulate API call to fetch data
    const fetchPayoutData = async () => {
      // In a real application, you would make an actual API call here.
      // For now, using dummy data.
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setGrossRevenue(6583.25);
      setCurrentBalance(6583.25);
      setFullPayoutAmount(2430.44); // Dummy full payout amount based on image
      setPayoutHistory([]); // No history yet, as per image
    };

    fetchPayoutData();
  }, []);

  const handleRequestPayoutClick = () => {
    setShowPayoutModal(true);
    setPayoutType('full'); // Reset to full amount when modal opens
    setCustomPayoutAmount(''); // Clear custom amount
    setCustomAmountStep('input'); // Reset custom amount step to input
  };

  const handleCloseModal = () => {
    setShowPayoutModal(false);
  };

  const handleContinue = () => {
    if (payoutType === 'full') {
      console.log('Initiating full payout:', fullPayoutAmount);
      // In a real app, send fullPayoutAmount to backend
      setShowPayoutModal(false); // Close modal after action
    } else { // Payout Type is 'custom'
      if (customAmountStep === 'input') {
        setCustomAmountStep('display'); // Move to display/confirm step
      } else { // customAmountStep is 'display'
        console.log('Initiating custom payout:', customPayoutAmount);
        // In a real app, send customPayoutAmount to backend
        setShowPayoutModal(false); // Close modal after action
      }
    }
  };

  const handleBack = () => {
    if (payoutType === 'custom' && customAmountStep === 'display') {
      setCustomAmountStep('input'); // Go back to input screen
    } else {
      setPayoutType('full'); // Go back to the initial selection
      setCustomPayoutAmount(''); // Clear custom amount
      setCustomAmountStep('input'); // Ensure step is reset
    }
  };

  // Validation for custom amount
  const isCustomAmountValid = parseFloat(customPayoutAmount) > 0 && parseFloat(customPayoutAmount) <= currentBalance;

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <button className={styles.requestPayoutButton} onClick={handleRequestPayoutClick}>
          <PlusIcon className={styles.buttonIcon} />
          Request Payout
        </button>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Gross Revenue</h3>
          <p className={styles.cardValue}>${grossRevenue.toFixed(2)}</p>
        </div>
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Current Balance</h3>
          <p className={styles.cardValue}>${currentBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.payoutHistorySection}>
        {payoutHistory.length > 0 && <h3 className={styles.historyTitle}>Payout History</h3>}
        
        {payoutHistory.length === 0 ? (
          <div className={styles.noHistoryPlaceholder}>
            <CardPaymentsIcon className={styles.noHistoryIcon} />
            <p className={styles.noHistoryText}>
              Payout history will appear here once you've made a payout.
            </p>
            <button className={styles.requestPayoutButtonCentered} onClick={handleRequestPayoutClick}>
              <PlusIcon className={styles.buttonIcon} />
              Request Payout
            </button>
          </div>
        ) : (
          <div className={styles.historyList}>
            {/* Render payout history items here */}
            </div>
        )}
      </div>

      {showPayoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Request Payout</h3>
              <button className={styles.modalCloseButton} onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <p className={styles.modalDescription}>
              Choose how you'd like to receive your funds in advance.
            </p>

            {payoutType !== 'custom' || customAmountStep === 'input' ? (
              // Show selection or custom amount input
              <div className={styles.payoutModalBody}>
                {payoutType !== 'custom' ? ( // Show selection if not on custom amount input step
                  <div className={styles.payoutOptions}>
                    <div 
                      className={`${styles.optionCard} ${payoutType === 'full' ? styles.selected : ''}`}
                      onClick={() => setPayoutType('full')}
                    >
                      <label className={styles.radioButton}>
                        <input
                          type="radio"
                          name="payoutOption"
                          value="full"
                          checked={payoutType === 'full'}
                          onChange={() => setPayoutType('full')}
                          className={styles.radioInput}
                        />
                        <span className={styles.radioCustom}></span>
                        <div className={styles.optionDetails}>
                          <span className={styles.optionLabel}>Full Amount</span>
                          <span className={styles.optionDescription}>
                            Receive the entire available amount now.
                          </span>
                        </div>
                      </label>
                      <span className={styles.amountDisplay}>${fullPayoutAmount.toFixed(2)}</span>
                    </div>

                    <div 
                      className={`${styles.optionCard} ${payoutType === 'custom' ? styles.selected : ''}`}
                      onClick={() => setPayoutType('custom')}
                    >
                      <label className={styles.radioButton}>
                        <input
                          type="radio"
                          name="payoutOption"
                          value="custom"
                          checked={payoutType === 'custom'}
                          onChange={() => setPayoutType('custom')}
                          className={styles.radioInput}
                        />
                        <span className={styles.radioCustom}></span>
                        <div className={styles.optionDetails}>
                          <span className={styles.optionLabel}>Custom Amount</span>
                          <span className={styles.optionDescription}>
                            Request a portion of your available balance.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                ) : ( // Show custom amount input
                  <div className={styles.customAmountInputSection}>
                    <h4 className={styles.customAmountPrompt}>Custom Amount</h4>
                    <div className={styles.inputCard}>
                      <p className={styles.inputCardTitle}>Enter Amount</p>
                      <div className={styles.amountInputContainer}>
                        <span className={styles.currencySymbol}>$</span>
                        <input
                          type="number"
                          value={customPayoutAmount}
                          onChange={(e) => setCustomPayoutAmount(parseFloat(e.target.value) || '')}
                          placeholder="0.00"
                          className={styles.amountInput}
                          min="0"
                          max={currentBalance}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : ( // customAmountStep is 'display'
              <div className={styles.customAmountDisplaySection}>
                 <h4 className={styles.customAmountPrompt}>Custom Amount</h4>
                <div className={styles.displayCard}>
                  <p className={styles.displayCardTitle}>Amount</p>
                  <div className={styles.displayAmountContainer}>
                    <span className={styles.finalAmount}>${parseFloat(customPayoutAmount).toFixed(2)}</span>
                    <EditIcon className={styles.editIcon} onClick={() => setCustomAmountStep('input')} />
                  </div>
                  <p className={styles.deliveryTime}>credited within 2 business days</p>
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              {payoutType === 'custom' && ( // Show Back button for custom amount steps
                 <button className={styles.backButton} onClick={handleBack}>
                   Back
                 </button>
              )}
              <button 
                className={styles.cancelButton} 
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button 
                className={styles.continueButton} 
                onClick={handleContinue}
                disabled={payoutType === 'custom' && customAmountStep === 'input' && !isCustomAmountValid}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PayoutSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default PayoutSection;