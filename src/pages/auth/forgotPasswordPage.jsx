import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import {
  ForgotPasswordInitiateAPI,
  ForgotPasswordVerifyOtpAPI,
  ForgotPasswordResetAPI,
  ForgotPasswordResendOtpAPI,
} from "../../services/allApis";
import {
  getApiErrorMessage,
  notifyAuthError,
  notifyAuthInfo,
  notifyAuthSuccess,
  notifyAuthWarning,
} from "../../utils/authFeedback";

import styles from "./loginPage.module.scss";
import fpStyles from "./forgotPasswordPage.module.scss";

import { ReactComponent as MailIcon } from "../../assets/icons/mail-icon.svg";
import { ReactComponent as ArrowIcon } from "../../assets/icons/arrow-icon.svg";

import wallpaperBg from "../../assets/images/auth-bg.jpg";
import logoImage from "../../assets/images/logo.svg";

const STEPS = {
  EMAIL: "email",
  OTP: "otp",
  PASSWORD: "password",
};

const NEUTRAL_EMAIL_SENT =
  "If an account exists with this email, we've sent a 6-digit code. It expires in about 10 minutes.";

const INITIAL_PASSWORD_VALIDATION = {
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false,
};

function RequirementCheck({ met, label }) {
  return (
    <div className={fpStyles.requirementItem}>
      <svg
        className={`${fpStyles.checkIcon} ${met ? fpStyles.validIcon : ""}`}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
        <path
          d="M5 8L7 10L11 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={met ? fpStyles.validText : ""}>{label}</span>
    </div>
  );
}

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [infoBanner, setInfoBanner] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [passwordFieldFocused, setPasswordFieldFocused] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(INITIAL_PASSWORD_VALIDATION);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    setPasswordValidation({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    });

    if (confirmPassword) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(false);
    }
  }, [newPassword, confirmPassword]);

  const isPasswordFormValid =
    passwordValidation.length &&
    passwordValidation.uppercase &&
    passwordValidation.lowercase &&
    passwordValidation.number &&
    passwordValidation.special &&
    passwordsMatch;

  const showFeedback = (message, type = "error") => {
    if (type === "warning") {
      notifyAuthWarning(message);
      return;
    }
    if (type === "info") {
      notifyAuthInfo(message);
      return;
    }
    notifyAuthError(message);
  };

  const getForgotPasswordErrorMessage = (err) => {
    const msg = getApiErrorMessage(err);
    const status = err.response?.status;
    if (
      status === 401 &&
      (/authorization header/i.test(msg) || /malformed jwt/i.test(msg))
    ) {
      return "Password reset is not available right now. Please try again later or contact support.";
    }
    return msg;
  };

  const handleBack = () => {
    if (step === STEPS.OTP) {
      setStep(STEPS.EMAIL);
      setOtp("");
      setInfoBanner("");
    } else if (step === STEPS.PASSWORD) {
      setStep(STEPS.OTP);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordFieldFocused(false);
      setConfirmPasswordTouched(false);
    }
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showFeedback("Please enter your email address", "warning");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      showFeedback("Please enter a valid email address", "warning");
      return;
    }

    setIsLoading(true);
    try {
      await ForgotPasswordInitiateAPI({ email: email.trim() });
      setInfoBanner(NEUTRAL_EMAIL_SENT);
      setStep(STEPS.OTP);
    } catch (err) {
      console.error("Forgot password initiate:", err);
      showFeedback(getForgotPasswordErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      showFeedback("Enter the 6-digit code from your email.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      await ForgotPasswordVerifyOtpAPI({
        email: email.trim(),
        otp: code,
      });
      setInfoBanner("");
      setStep(STEPS.PASSWORD);
    } catch (err) {
      console.error("Verify OTP:", err);
      showFeedback(getForgotPasswordErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setResendLoading(true);
    try {
      await ForgotPasswordResendOtpAPI({ email: email.trim() });
      notifyAuthInfo(NEUTRAL_EMAIL_SENT);
    } catch (err) {
      console.error("Resend OTP:", err);
      showFeedback(getForgotPasswordErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordFormValid) {
      showFeedback("Please meet all password requirements and confirm your password.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      await ForgotPasswordResetAPI({
        email: email.trim(),
        newPassword,
      });
      notifyAuthSuccess("Password updated. Sign in with your email and new password.");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Reset password:", err);
      showFeedback(getForgotPasswordErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const titleSubtitle = () => {
    if (step === STEPS.EMAIL) {
      return {
        title: "Forgot password?",
        subtitle:
          "Enter your account email. If an account exists, we'll email you a code to reset your password.",
      };
    }
    if (step === STEPS.OTP) {
      return {
        title: "Enter verification code",
        subtitle:
          "We've sent a 6-digit code to your email. It is valid for about 10 minutes.",
      };
    }
    return {
      title: "Choose a new password",
      subtitle: "Use a strong password you have not used elsewhere.",
    };
  };

  const { title, subtitle } = titleSubtitle();

  return (
    <div className={styles.loginPanel}>
      <div className={styles.leftPanel}>
        <img className={styles.wallpaper} alt="" src={wallpaperBg} />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.header}>
          <button
            type="button"
            className={fpStyles.backButton}
            onClick={step === STEPS.EMAIL ? () => navigate("/login") : handleBack}
            aria-label={step === STEPS.EMAIL ? "Return to login" : "Go back"}
          >
            <ArrowIcon className={fpStyles.backIcon} />
          </button>
          <div className={styles.logoContainer}>
            <img src={logoImage} alt="Prizmatix Logo" className={styles.logo} />
          </div>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>{title}</h1>
            <p className={styles.welcomeSubtitle}>{subtitle}</p>
          </div>

          {infoBanner && step === STEPS.OTP && (
            <div className={fpStyles.neutralBanner} role="status">
              {infoBanner}
            </div>
          )}

          {step === STEPS.EMAIL && (
            <form onSubmit={handleInitiate} className={styles.form}>
              <div className={styles.inputGroup}>
                <div className={styles.inputField}>
                  <MailIcon className={styles.fieldIcon} />
                  <input
                    type="email"
                    placeholder="Email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>
              <button
                type="submit"
                className={fpStyles.signInButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={fpStyles.spinner} />
                ) : (
                  "Send reset code"
                )}
              </button>
            </form>
          )}

          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOtp} className={styles.form}>
              <p className={fpStyles.emailHint}>
                Enter the 6-digit numeric code sent to <strong>{email.trim()}</strong>
              </p>
              <div className={styles.inputGroup}>
                <div className={styles.inputField}>
                  <MailIcon className={styles.fieldIcon} />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    placeholder="6-digit numeric code"
                    className={`${styles.input} ${fpStyles.otpInput}`}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button
                type="submit"
                className={fpStyles.signInButton}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <div className={fpStyles.spinner} />
                ) : (
                  "Verify code"
                )}
              </button>
              <div className={fpStyles.resendRow}>
                <span>Did not receive a code?</span>
                <button
                  type="button"
                  className={fpStyles.resendButton}
                  onClick={handleResend}
                  disabled={resendLoading || isLoading}
                >
                  {resendLoading ? "Sending…" : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {step === STEPS.PASSWORD && (
            <form onSubmit={handleResetPassword} className={styles.form}>
              <div className={fpStyles.formGroup}>
                <label htmlFor="newPassword" className={fpStyles.inputLabel}>
                  New password
                </label>
                <div className={fpStyles.inputWithIcon}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter your password"
                    className={fpStyles.passwordInput}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setPasswordFieldFocused(true)}
                    onBlur={() => {
                      if (!newPassword) {
                        setPasswordFieldFocused(false);
                      }
                    }}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={fpStyles.iconButton}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12,4.5C7,4.5,2.73,7.61,1,12c1.73,4.39,6,7.5,11,7.5s9.27-3.11,11-7.5C21.27,7.61,17,4.5,12,4.5z M12,17 c-2.76,0-5-2.24-5-5s2.24-5,5-5s5,2.24,5,5S14.76,17,12,17z M12,9c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S13.66,9,12,9z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12,7c2.76,0,5,2.24,5,5c0,0.65-0.13,1.26-0.36,1.83l2.92,2.92c1.51-1.26,2.7-2.89,3.43-4.75 c-1.73-4.39-6-7.5-11-7.5c-1.4,0-2.74,0.25-3.98,0.7l2.16,2.16C10.74,7.13,11.35,7,12,7z M2,4.27l2.28,2.28l0.46,0.46 C3.08,8.3,1.78,10.02,1,12c1.73,4.39,6,7.5,11,7.5c1.55,0,3.03-0.3,4.38-0.84l0.42,0.42L19.73,22L21,20.73L3.27,3L2,4.27z M7.53,9.8l1.55,1.55c-0.05,0.21-0.08,0.43-0.08,0.65c0,1.66,1.34,3,3,3c0.22,0,0.44-0.03,0.65-0.08l1.55,1.55 c-0.67,0.33-1.41,0.53-2.2,0.53c-2.76,0-5-2.24-5-5C7,11.21,7.2,10.47,7.53,9.8z M11.84,9.02l3.15,3.15l0.02-0.16 c0-1.66-1.34-3-3-3L11.84,9.02z" />
                      </svg>
                    )}
                  </button>
                </div>

                {passwordFieldFocused && (
                  <div className={fpStyles.passwordRequirements}>
                    <RequirementCheck met={passwordValidation.length} label="Must be at least 8 characters" />
                    <RequirementCheck met={passwordValidation.lowercase} label="One lowercase character" />
                    <RequirementCheck met={passwordValidation.uppercase} label="One uppercase character" />
                    <RequirementCheck met={passwordValidation.special} label="One special character" />
                    <RequirementCheck met={passwordValidation.number} label="One number" />
                  </div>
                )}
              </div>

              <div className={fpStyles.formGroup}>
                <label htmlFor="confirmPassword" className={fpStyles.inputLabel}>
                  Re-enter password
                </label>
                <div className={fpStyles.inputWithIcon}>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Enter your password"
                    className={fpStyles.passwordInput}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmPasswordTouched(true);
                    }}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  {confirmPasswordTouched && passwordsMatch && (
                    <span className={fpStyles.validationIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className={fpStyles.matchIcon}>
                        <path fill="#7c3aed" d="M9,16.17L4.83,12l-1.42,1.41L9,19 21,7l-1.41-1.41L9,16.17z" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={fpStyles.signInButton}
                disabled={isLoading || !isPasswordFormValid}
              >
                {isLoading ? (
                  <div className={fpStyles.spinner} />
                ) : (
                  "Reset password"
                )}
              </button>
            </form>
          )}

          <div className={styles.signupPrompt}>
            Remember your password?{" "}
            <Link to="/login" className={styles.signupLink}>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
