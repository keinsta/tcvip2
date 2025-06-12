import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { useEffect } from "react";

const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default PrivateRoute;
