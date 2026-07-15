import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import styles from "./loginPage.module.scss";
import {
  REMEMBERED_LOGIN_EMAIL_KEY,
  getLoginErrorMessage,
  notifyAuthError,
  notifyAuthInfo,
  notifyAuthWarning,
} from "../../utils/authFeedback";

import { ReactComponent as MailIcon } from "../../assets/icons/mail-icon.svg";
import { ReactComponent as LockIcon } from "../../assets/icons/lock-icon.svg";

import eyeIcon from "../../assets/icons/eye-icon.svg";
import eyeOffIcon from "../../assets/icons/eye-off-icon.svg";

import wallpaperBg from "../../assets/images/auth-bg.jpg";
import logoImage from "../../assets/images/logo.svg";
import emojiSparkles from "../../assets/images/emoji-sparkles_.svg";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, currentUser } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getDefaultPath = (user) => {
    const role = (user?.role || "").replace(/^ROLE_/, "");
    return role === "SCANNER" ? "/scanner" : "/";
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_LOGIN_EMAIL_KEY);
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, username: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      const fallback = getDefaultPath(currentUser);
      // Scanners may only use scanner routes; ignore deep-links into organizer pages.
      const role = (currentUser?.role || "").replace(/^ROLE_/, "");
      const destination =
        role === "SCANNER"
          ? "/scanner"
          : from && from !== "/login"
            ? from
            : fallback;
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location, currentUser]);

  useEffect(() => {
    if (location.state?.notice) {
      notifyAuthInfo(location.state.notice);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      notifyAuthWarning("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const data = await login({ username, password }, rememberMe);
      const role = (data?.role || "").replace(/^ROLE_/, "");
      navigate(role === "SCANNER" ? "/scanner" : "/", { replace: true });
    } catch (err) {
      notifyAuthError(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = () => {
    const nextValue = !rememberMe;
    setRememberMe(nextValue);
    if (!nextValue) {
      localStorage.removeItem(REMEMBERED_LOGIN_EMAIL_KEY);
    }
  };

  return (
    <div className={styles.loginPanel}>
      <div className={styles.leftPanel}>
        <img className={styles.wallpaper} alt="Background" src={wallpaperBg} />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <img src={logoImage} alt="Prizmatix Logo" className={styles.logo} />
          </div>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Welcome Back <img src={emojiSparkles} alt="✨" className={styles.sparkleIcon} />
            </h1>
            <p className={styles.welcomeSubtitle}>We're glad to see you again.</p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <MailIcon className={styles.fieldIcon} />
                <input
                  type="email"
                  placeholder="Email"
                  className={styles.input}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <LockIcon className={styles.fieldIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={styles.input}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <img src={eyeIcon} alt="Hide Password" /> : <img src={eyeOffIcon} alt="Show Password" />}
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.rememberLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
                <span>Remember Me</span>
              </label>

              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className={styles.signInButton}
              disabled={isLoading}
            >
              {isLoading ? <div className={styles.spinner}></div> : "Sign In"}
            </button>
          </form>

          <div className={styles.signupPrompt}>
            Don't have an account? <Link to="/register" className={styles.signupLink}>sign up, it's free</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
