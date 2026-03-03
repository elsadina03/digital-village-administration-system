import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

// ─── Role constants ──────────────────────────────────────────────────────────
export const ROLES = {
    ADMIN:      "Admin Desa",
    KEPDES:     "Kepala Desa",
    SEKRETARIS: "Sekretaris Desa",
    BENDAHARA:  "Bendahara",
    WARGA:      "Warga",
};

// Admin-level: full access to everything
export const ADMIN_ROLES   = [ROLES.ADMIN, ROLES.KEPDES];
// Staff-level: depends on context
export const STAFF_ROLES   = [ROLES.ADMIN, ROLES.KEPDES, ROLES.SEKRETARIS, ROLES.BENDAHARA];

export function AuthProvider({ children }) {
    const [user, setUser]     = useState(null);
    const [token, setToken]   = useState(() => localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);
    const [skipFetch, setSkipFetch] = useState(false);

    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    useEffect(() => {
        async function fetchUser() {
            if (!token) { 
                setLoading(false); 
                return; 
            }
            
            // Skip fetch if user already set (from login)
            if (skipFetch) {
                setLoading(false);
                setSkipFetch(false);
                return;
            }
            
            try {
                const res = await axios.get("http://127.0.0.1:8000/api/user");
                setUser(res.data);
            } catch {
                logout();
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);
        setSkipFetch(true); // Skip the useEffect fetch since we already have user data
        setLoading(false);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    };

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
    }, []);

    // ─── Role helpers ───────────────────────────────────────────────────────
    const getRoleName = () => user?.role?.name ?? null;

    /** true jika role user ada di dalam array `roles` */
    const hasRole = useCallback((...roles) => {
        const name = user?.role?.name;
        return !!name && roles.flat().includes(name);
    }, [user]);

    /** Admin Desa atau Kepala Desa → full CRUD di semua modul */
    const isAdmin = () => hasRole(ROLES.ADMIN, ROLES.KEPDES);

    /** Bisa mengelola data surat/pengaduan (+ Sekretaris) */
    const canProcessLetters = () => hasRole(ROLES.ADMIN, ROLES.KEPDES, ROLES.SEKRETARIS);

    /** Akses ke menu Keuangan Desa */
    const canAccessFinance  = () => hasRole(ROLES.ADMIN, ROLES.KEPDES, ROLES.BENDAHARA);

    /** Akses ke Program & Kegiatan */
    const canAccessProgram  = () => hasRole(ROLES.ADMIN, ROLES.KEPDES, ROLES.SEKRETARIS);

    /** Akses ke manajemen Penduduk */
    const canAccessCitizens = () => hasRole(ROLES.ADMIN, ROLES.KEPDES, ROLES.SEKRETARIS);

    return (
        <AuthContext.Provider value={{
            user, token, loading,
            login, logout,
            getRoleName, hasRole,
            isAdmin, canProcessLetters,
            canAccessFinance, canAccessProgram, canAccessCitizens,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

