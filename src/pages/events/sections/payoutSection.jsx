import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './payoutSection.module.scss';

// Import SVG components
import { ReactComponent as PlusIcon } from '../../../assets/icons/plus-icon.svg';
import { ReactComponent as CardPaymentsIcon } from '../../../assets/icons/card-payments.svg';
import { ReactComponent as EditIcon } from '../../../assets/icons/edit-icon.svg';

/**
 * PayoutSection component - Displays payout information and history.
 *
 * @param {Object} props Component props
 * @param {Object} props.dashboardData Data object containing revenue and other metrics.
 * @returns {JSX.Element} PayoutSection component
 */
const PayoutSection = ({ dashboardData }) => {
  // Derive revenue and balance from props
  const grossRevenue = dashboardData?.revenue ?? 0;
  const currentBalance = grossRevenue * 0.25; // Calculate 25% of revenue

  const [payoutHistory, setPayoutHistory] = useState([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutType, setPayoutType] = useState('full'); // 'full' or 'custom'
  const [customPayoutAmount, setCustomPayoutAmount] = useState('');
  const [fullPayoutAmount, setFullPayoutAmount] = useState(0);
  // The 'display' step is now the last step
  const [payoutStep, setPayoutStep] = useState('selection'); // 'selection', 'input', or 'display'

  useEffect(() => {
    setFullPayoutAmount(currentBalance);
    setPayoutHistory([]);
  }, [currentBalance]);

  const handleRequestPayoutClick = () => {
    setShowPayoutModal(true);
    setPayoutType('full');
    setCustomPayoutAmount('');
    setPayoutStep('selection');
  };

  const handleCloseModal = () => {
    setShowPayoutModal(false);
  };

  const handleContinue = () => {
    switch (payoutStep) {
      case 'selection':
        if (payoutType === 'full') {
          setPayoutStep('display');
        } else {
          setPayoutStep('input');
        }
        break;
      case 'input':
        setPayoutStep('display');
        break;
      case 'display':
        const amount = payoutType === 'full' ? fullPayoutAmount : customPayoutAmount;
        console.log(`Sending payout request for ${payoutType} amount: $${amount}`);
        // In a real app, you would make an API call here.
        setShowPayoutModal(false);
        // Optionally, you could show a success notification here.
        break;
      default:
        handleCloseModal();
    }
  };

  const handleBack = () => {
    switch (payoutStep) {
      case 'display':
        if (payoutType === 'custom') {
          setPayoutStep('input');
        } else {
          setPayoutStep('selection');
        }
        break;
      case 'input':
        setPayoutStep('selection');
        break;
      default:
        break;
    }
  };

  // Validation
  const isCustomAmountValid = parseFloat(customPayoutAmount) > 0 && parseFloat(customPayoutAmount) <= currentBalance;
  
  // Determine button text based on the current step
  const continueButtonText = payoutStep === 'display' ? 'Send Request' : 'Continue';

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Payouts</h2>
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
          <h3 className={styles.cardTitle}>Payout Balance</h3>
          <p className={styles.cardValue}>${currentBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.payoutHistorySection}>
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

            <div className={styles.payoutModalBody}>
              {/* Step 1: Selection */}
              {payoutStep === 'selection' && (
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
              )}

              {/* Step 2: Custom Amount Input */}
              {payoutStep === 'input' && (
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

              {/* Step 3: Confirmation Display (Final Step) */}
              {payoutStep === 'display' && (
                <div className={styles.customAmountDisplaySection}>
                  <h4 className={styles.customAmountPrompt}>
                    {payoutType === 'full' ? 'Full Amount' : 'Custom Amount'}
                  </h4>
                  <div className={styles.displayCard}>
                    <p className={styles.displayCardTitle}>Amount to Request</p>
                    <div className={styles.displayAmountContainer}>
                      <span className={styles.finalAmount}>
                        ${(payoutType === 'full' ? fullPayoutAmount : parseFloat(customPayoutAmount)).toFixed(2)}
                      </span>
                      {payoutType === 'custom' && (
                         <EditIcon className={styles.editIcon} onClick={() => setPayoutStep('input')} />
                      )}
                    </div>
                    <p className={styles.deliveryTime}>Request will be processed within 2 business days</p>
                  </div>
                </div>
              )}
              
            </div>

            <div className={styles.modalActions}>
              {payoutStep !== 'selection' && (
                 <button className={styles.backButton} onClick={handleBack}>
                   Back
                 </button>
              )}
              <button className={styles.cancelButton} onClick={handleCloseModal}>
                Cancel
              </button>
              <button
                className={styles.continueButton}
                onClick={handleContinue}
                disabled={payoutStep === 'input' && !isCustomAmountValid}
              >
                {continueButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PayoutSection.propTypes = {
  dashboardData: PropTypes.object,
};

export default PayoutSection;