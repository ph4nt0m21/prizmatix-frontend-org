import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiZap, FiCheck, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import styles from './payoutAccountPage.module.scss';
import LoadingSpinner from '../../components/common/loadingSpinner/loadingSpinner';
import {
  GetPayoutAccountStatusAPI,
  CreatePayoutAccountOnboardingLinkAPI,
} from '../../services/allApis';

// view: 'loading' | 'not_started' | 'redirecting' | 'checking' | 'ready' | 'action_required' | 'error'
const PayoutAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [view, setView] = useState('loading');
  const [accountStatus, setAccountStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const returnStatus = queryParams.get('status'); // "return" | "refresh" | null
    fetchStatus(returnStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveView = (dto) => {
    switch (dto.status) {
      case 'NOT_STARTED':
        setView('not_started');
        break;
      case 'ONBOARDING_INCOMPLETE':
      case 'ACTION_REQUIRED':
      case 'RESTRICTED':
        setView('action_required');
        break;
      case 'PENDING_VERIFICATION':
        setView('checking');
        break;
      case 'READY':
        setView('ready');
        break;
      default:
        setView('not_started');
    }
  };

  const fetchStatus = async (returnStatus) => {
    try {
      const res = await GetPayoutAccountStatusAPI();
      const dto = res.data.data;
      setAccountStatus(dto);

      if (returnStatus === 'return' || returnStatus === 'refresh') {
        // Never treat arriving at the return URL as success by itself — always show
        // the checking state briefly, then settle on the backend's real answer.
        setView('checking');
        navigate('/payout-account', { replace: true });
        setTimeout(() => resolveView(dto), 1200);
      } else {
        resolveView(dto);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "We couldn't load your payout account right now.");
      setView('error');
    }
  };

  const handleStartSetup = async () => {
    setActionLoading(true);
    setView('redirecting');
    try {
      const res = await CreatePayoutAccountOnboardingLinkAPI();
      window.location.href = res.data.data.url;
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Could not start setup. Please try again.');
      setView('error');
      setActionLoading(false);
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'RESTRICTED': return styles.statusRestricted;
      case 'ONBOARDING_INCOMPLETE':
      case 'ACTION_REQUIRED': return styles.statusActionRequired;
      default: return styles.statusActionRequired;
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'RESTRICTED': return 'Payout Account Restricted';
      case 'ONBOARDING_INCOMPLETE': return 'Setup Incomplete';
      default: return 'Action Required';
    }
  };

  const renderContent = () => {
    if (view === 'loading') {
      return <LoadingSpinner size="large" />;
    }

    if (view === 'error') {
      return (
        <div className={styles.stateBlock}>
          <div className={`${styles.iconCircle} ${styles.iconCircleError}`}><FiAlertTriangle /></div>
          <p className={styles.stateMessage}>{errorMessage}</p>
          <button className={styles.primaryButton} onClick={() => fetchStatus(null)}>Try Again</button>
        </div>
      );
    }

    if (view === 'not_started') {
      return (
        <>
          <h1 className={styles.heading}>Set up your payout account</h1>
          <p className={styles.subheading}>
            Set up your payout account to securely receive earnings from your Prizmatix events.
          </p>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}><FiLock /></span>
              <div>
                <strong>Safe &amp; Secure</strong>
                <p>Your verification and banking information is securely handled by Stripe.</p>
              </div>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}><FiZap /></span>
              <div>
                <strong>Quick Setup</strong>
                <p>You'll be securely redirected to Stripe to verify your details and add your payout account.</p>
              </div>
            </div>
          </div>
          <button className={styles.primaryButton} onClick={handleStartSetup} disabled={actionLoading}>
            Set Up Payout Account
          </button>
        </>
      );
    }

    if (view === 'redirecting') {
      return (
        <div className={styles.stateBlock}>
          <LoadingSpinner size="large" />
          <h2 className={styles.stateTitle}>Redirecting you securely to Stripe…</h2>
          <p className={styles.stateMessage}>Stripe will securely collect the information required to activate your payout account.</p>
        </div>
      );
    }

    if (view === 'checking') {
      return (
        <div className={styles.stateBlock}>
          <LoadingSpinner size="large" />
          <h2 className={styles.stateTitle}>Welcome back!</h2>
          <p className={styles.stateMessage}>We're checking your payout account status with Stripe. This may take a few seconds.</p>
        </div>
      );
    }

    if (view === 'ready') {
      return (
        <div className={styles.stateBlock}>
          <div className={`${styles.iconCircle} ${styles.iconCircleReady}`}><FiCheck /></div>
          <h2 className={styles.stateTitle}>Payout Account is Ready</h2>
          <p className={styles.stateMessage}>Your account is verified and ready to receive payouts.</p>
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span>Verification</span>
              <span className={styles.summaryValueGood}>Complete</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Payouts</span>
              <span className={styles.summaryValueGood}>Enabled</span>
            </div>
          </div>
        </div>
      );
    }

    // action_required (covers ONBOARDING_INCOMPLETE / ACTION_REQUIRED / RESTRICTED)
    return (
      <div className={styles.stateBlock}>
        <div className={`${styles.iconCircle} ${styles.iconCircleWarn}`}><FiAlertTriangle /></div>
        <span className={`${styles.statusBadge} ${statusBadgeClass(accountStatus?.status)}`}>
          {statusLabel(accountStatus?.status)}
        </span>
        <h2 className={styles.stateTitle}>
          {accountStatus?.status === 'ONBOARDING_INCOMPLETE' ? 'Finish setting up your payout account' : 'Action Required'}
        </h2>
        <p className={styles.stateMessage}>
          {accountStatus?.disabledReasonSimplified
            || 'We need some additional information before your payout account can be enabled.'}
        </p>
        <button className={styles.primaryButton} onClick={handleStartSetup} disabled={actionLoading}>
          Continue Setup <FiArrowRight />
        </button>
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        {renderContent()}
        <p className={styles.poweredBy}>Securely powered by <strong>Stripe</strong></p>
      </div>
    </div>
  );
};

export default PayoutAccountPage;
