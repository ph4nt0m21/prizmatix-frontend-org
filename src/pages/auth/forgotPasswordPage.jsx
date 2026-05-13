import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import {
  ForgotPasswordInitiateAPI,
  ForgotPasswordVerifyOtpAPI,
  ForgotPasswordResetAPI,
  ForgotPasswordResendOtpAPI,
} from "../../services/allApis";

import styles from "./loginPage.module.scss";
import fpStyles from "./forgotPasswordPage.module.scss";

import { ReactComponent as MailIcon } from "../../assets/icons/mail-icon.svg";
import { ReactComponent as LockIcon } from "../../assets/icons/lock-icon.svg";
import { ReactComponent as ArrowIcon } from "../../assets/icons/arrow-icon.svg";

import eyeIcon from "../../assets/icons/eye-icon.svg";
import eyeOffIcon from "../../assets/icons/eye-off-icon.svg";

import wallpaperBg from "../../assets/images/auth-bg.jpg";
import logoImage from "../../assets/images/logo.svg";

const STEPS = {
  EMAIL: "email",
  OTP: "otp",
  PASSWORD: "password",
};

/** Same neutral copy whether or not the email exists (security UX). */
const NEUTRAL_EMAIL_SENT =
  "If an account exists with this email, we've sent a 6-digit code. It expires in about 10 minutes.";

function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const msg = err.response?.data?.message;
  return typeof msg === "string" && msg.trim() ? msg.trim() : fallback;
}

/**
 * Forgot password — multi-step flow aligned with backend:
 * initiate → verify OTP → reset password → login.
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoBanner, setInfoBanner] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const showError = (message, type = "error") => {
    setError({ message, type });
    setTimeout(() => setError(null), 6000);
  };

  const handleBack = () => {
    setError(null);
    if (step === STEPS.OTP) {
      setStep(STEPS.EMAIL);
      setOtp("");
      setInfoBanner("");
    } else if (step === STEPS.PASSWORD) {
      setStep(STEPS.OTP);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showError("Please enter your email address", "warning");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      showError("Please enter a valid email address", "warning");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await ForgotPasswordInitiateAPI({ email: email.trim() });
      setInfoBanner(NEUTRAL_EMAIL_SENT);
      setStep(STEPS.OTP);
    } catch (err) {
      console.error("Forgot password initiate:", err);
      showError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      showError("Enter the 6-digit code from your email.", "warning");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await ForgotPasswordVerifyOtpAPI({
        email: email.trim(),
        otp: code,
      });
      setInfoBanner("");
      setStep(STEPS.PASSWORD);
    } catch (err) {
      console.error("Verify OTP:", err);
      showError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setResendLoading(true);
    try {
      await ForgotPasswordResendOtpAPI({ email: email.trim() });
      toast.info(NEUTRAL_EMAIL_SENT, { autoClose: 6000 });
    } catch (err) {
      console.error("Resend OTP:", err);
      showError(getApiErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      showError("Please enter a new password", "warning");
      return;
    }
    if (newPassword.length < 8) {
      showError("Password must be at least 8 characters long", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Passwords do not match", "warning");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await ForgotPasswordResetAPI({
        email: email.trim(),
        newPassword,
      });
      toast.success(
        "Password updated. Sign in with your email and new password.",
        { autoClose: 5000 }
      );
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Reset password:", err);
      showError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const renderErrorMessage = () => {
    if (!error) return null;
    const className = `${styles.errorMessage} ${
      error.type === "warning" ? styles.warningMessage : ""
    }`;
    return <div className={className}>{error.message}</div>;
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
          {step === STEPS.EMAIL ? (
            <Link to="/login" className={styles.backButton} aria-label="Return to Login">
              <ArrowIcon className={styles.backIcon} />
              <span className={styles.backButtonText}>Return to Login</span>
            </Link>
          ) : (
            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
              aria-label="Go back"
            >
              <ArrowIcon className={styles.backIcon} />
              <span className={styles.backButtonText}>Back</span>
            </button>
          )}
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

          {renderErrorMessage()}

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
                className={styles.signInButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.spinner} />
                ) : (
                  "Send reset code"
                )}
              </button>
            </form>
          )}

          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOtp} className={styles.form}>
              <p className={fpStyles.emailHint}>
                Code sent to <strong>{email.trim()}</strong>
              </p>
              <div className={styles.inputGroup}>
                <div className={styles.inputField}>
                  <MailIcon className={styles.fieldIcon} />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6-digit code"
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
                className={styles.signInButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.spinner} />
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
              <div className={styles.inputGroup}>
                <div className={styles.inputField}>
                  <LockIcon className={styles.fieldIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="New password"
                    className={styles.input}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <img src={showPassword ? eyeOffIcon : eyeIcon} alt="" />
                  </button>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <div className={styles.inputField}>
                  <LockIcon className={styles.fieldIcon} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    className={styles.input}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    <img
                      src={showConfirmPassword ? eyeOffIcon : eyeIcon}
                      alt=""
                    />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className={styles.signInButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.spinner} />
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
