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
  const [fullPayoutAmount, setFullPayoutAmount] = useState(0);
  const [payoutStep, setPayoutStep] = useState('selection'); // 'selection', 'input', 'display', or 'account_details'
  const [accountDetails, setAccountDetails] = useState({
    accountNo: '',
    street: '',
    streetNo: '',
  });

  useEffect(() => {
    // Simulate API call to fetch data
    const fetchPayoutData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setGrossRevenue(6583.25);
      setCurrentBalance(6583.25);
      setFullPayoutAmount(2430.44);
      setPayoutHistory([]);
    };

    fetchPayoutData();
  }, []);

  const handleRequestPayoutClick = () => {
    setShowPayoutModal(true);
    setPayoutType('full');
    setCustomPayoutAmount('');
    setPayoutStep('selection');
    setAccountDetails({ accountNo: '', street: '', streetNo: '' }); // Reset account details
  };

  const handleCloseModal = () => {
    setShowPayoutModal(false);
  };

  const handleAccountDetailsChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails(prev => ({ ...prev, [name]: value }));
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
        setPayoutStep('account_details'); // Proceed to account details form
        break;
      case 'account_details':
        const amount = payoutType === 'full' ? fullPayoutAmount : customPayoutAmount;
        console.log(`Initiating ${payoutType} payout:`, amount);
        console.log('With Account Details:', accountDetails);
        // In a real app, send 'amount' and 'accountDetails' to the backend
        setShowPayoutModal(false);
        break;
      default:
        handleCloseModal();
    }
  };

  const handleBack = () => {
    switch (payoutStep) {
      case 'account_details':
        setPayoutStep('display');
        break;
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

  // Validations
  const isCustomAmountValid = parseFloat(customPayoutAmount) > 0 && parseFloat(customPayoutAmount) <= currentBalance;
  const isAccountDetailsValid =
    accountDetails.accountNo.trim() !== '' &&
    accountDetails.street.trim() !== '' &&
    accountDetails.streetNo.trim() !== '';

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
              <h3 className={styles.modalTitle}>
                {payoutStep === 'account_details' ? 'Account Missing for Payout' : 'Request Payout'}
              </h3>
              <button className={styles.modalCloseButton} onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            {payoutStep !== 'account_details' && (
                <p className={styles.modalDescription}>
                    Choose how you'd like to receive your funds in advance.
                </p>
            )}

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

              {/* Step 3: Confirmation Display */}
              {payoutStep === 'display' && (
                <div className={styles.customAmountDisplaySection}>
                  <h4 className={styles.customAmountPrompt}>
                    {payoutType === 'full' ? 'Full Amount' : 'Custom Amount'}
                  </h4>
                  <div className={styles.displayCard}>
                    <p className={styles.displayCardTitle}>Amount</p>
                    <div className={styles.displayAmountContainer}>
                      <span className={styles.finalAmount}>
                        ${(payoutType === 'full' ? fullPayoutAmount : parseFloat(customPayoutAmount)).toFixed(2)}
                      </span>
                      {payoutType === 'custom' && (
                         <EditIcon className={styles.editIcon} onClick={() => setPayoutStep('input')} />
                      )}
                    </div>
                    <p className={styles.deliveryTime}>credited within 2 business days</p>
                  </div>
                </div>
              )}

              {/* Step 4: Account Details */}
              {payoutStep === 'account_details' && (
                <div className={styles.customAmountInputSection}>
                    <p className={styles.modalDescription} style={{textAlign: 'left', width: '100%', marginBottom: '24px'}}>Add an Account for this and future payouts</p>
                    <div style={{ marginBottom: '16px', width: '100%' }}>
                        <p className={styles.cardTitle} style={{ marginBottom: '8px', textAlign: 'left' }}>Account No.</p>
                        <div className={styles.amountInputContainer}>
                        <input
                            type="text"
                            name="accountNo"
                            value={accountDetails.accountNo}
                            onChange={handleAccountDetailsChange}
                            placeholder="e.g., 1234567890"
                            className={styles.amountInput}
                        />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                        <div style={{ flex: 1 }}>
                        <p className={styles.cardTitle} style={{ marginBottom: '8px', textAlign: 'left' }}>Street</p>
                        <div className={styles.amountInputContainer}>
                            <input
                            type="text"
                            name="street"
                            value={accountDetails.street}
                            onChange={handleAccountDetailsChange}
                            placeholder="e.g., Festival Ave"
                            className={styles.amountInput}
                            />
                        </div>
                        </div>
                        <div style={{ flex: 1 }}>
                        <p className={styles.cardTitle} style={{ marginBottom: '8px', textAlign: 'left' }}>Street No.</p>
                        <div className={styles.amountInputContainer}>
                            <input
                            type="text"
                            name="streetNo"
                            value={accountDetails.streetNo}
                            onChange={handleAccountDetailsChange}
                            placeholder="e.g., 123"
                            className={styles.amountInput}
                            />
                        </div>
                        </div>
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
                disabled={
                  (payoutStep === 'input' && !isCustomAmountValid) ||
                  (payoutStep === 'account_details' && !isAccountDetailsValid)
                }
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