import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { clearStaleSession, useAuthStore } from "../store/authStore";

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    function handleAuthExpired() {
      clearStaleSession();
    }

    window.addEventListener("researchai:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("researchai:auth-expired", handleAuthExpired);
  }, []);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;