import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Spinner from "./Spinner";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Cargando I-magIA..." fullscreen />;
  // Conserva ?error=... (p. ej. fallo de OAuth) para mostrarlo en la pantalla de login
  if (!user)
    return <Navigate to={`/login${location.search}${location.hash}`} replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
