import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
    const { user, token, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading user data...</div>;
    }

    // If no token or no user, redirect to login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // If specific roles are required and user's role isn't among them 
    if (allowedRoles && user.role && !allowedRoles.includes(user.role.name)) {
        return <Navigate to="/" replace />; // Redirect back home if unauthorized
    }

    return <Outlet />;
}
