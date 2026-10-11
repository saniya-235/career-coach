import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid h-screen place-items-center text-muted">
        <Spinner size={22} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
