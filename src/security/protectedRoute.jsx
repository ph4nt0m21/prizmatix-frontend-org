import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import styles from "./protectedRoute.module.scss";

const normalizeRole = (role) => (role || "").replace(/^ROLE_/, "");

// Every role that has at least one page in the console. Keep in sync with App.js.
const ORGANIZER_ROLES = ["ORGANIZER", "SUPER_ADMIN", "ADMINISTRATOR"];
const CONSOLE_ROLES = [...ORGANIZER_ROLES, "SCANNER"];

/**
 * Shown when an account signs in but has no role the console recognises. Redirecting it
 * to "/" instead (as before) looped forever, because "/" is itself role-gated — the
 * organiser saw a blank page while technically logged in.
 */
const NoConsoleAccess = ({ email }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={styles.noAccess} role="alert">
      <h2>This account can't open the organiser console</h2>
      <p>
        {email ? <strong>{email}</strong> : "This account"} signed in, but it doesn't have
        organiser access. Please contact Prizmatix support so we can fix your account.
      </p>
      <button type="button" className={styles.signOutButton} onClick={signOut}>
        Sign out
      </button>
    </div>
  );
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length) {
    const role = normalizeRole(currentUser?.role);
    const allowed = allowedRoles.map(normalizeRole);
    if (!allowed.includes(role)) {
      if (!CONSOLE_ROLES.includes(role)) {
        console.error("Signed-in account has no console role:", currentUser?.role);
        return <NoConsoleAccess email={currentUser?.email} />;
      }
      // Send scanners to their only usable page; others to home.
      const fallback = role === "SCANNER" ? "/scanner" : "/";
      return <Navigate to={fallback} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
