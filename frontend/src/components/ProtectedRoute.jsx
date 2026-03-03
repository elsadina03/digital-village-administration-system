import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * ProtectedRoute — wraps routes that require authentication (and optionally specific roles).
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>                    // auth only
 *   <Route element={<ProtectedRoute allowedRoles={['Admin Desa','Kepala Desa']} />}>
 */
export default function ProtectedRoute({ allowedRoles }) {
    const { user, token, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100vh", fontFamily: "sans-serif", color: "#555",
            }}>
                Memuat data pengguna…
            </div>
        );
    }

    // Belum login → ke halaman login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Login tapi role tidak diizinkan → ke beranda
    if (allowedRoles && user.role && !allowedRoles.includes(user.role.name)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

