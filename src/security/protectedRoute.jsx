import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

const normalizeRole = (role) => (role || "").replace(/^ROLE_/, "");

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
      // Send scanners to their only usable page; others to home.
      const fallback = role === "SCANNER" ? "/scanner" : "/";
      return <Navigate to={fallback} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
