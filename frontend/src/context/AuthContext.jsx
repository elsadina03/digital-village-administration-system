import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    // Initialize axios defaults
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    useEffect(() => {
        async function fetchUser() {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get("http://127.0.0.1:8000/api/user");
                setUser(res.data);
            } catch (error) {
                console.error("Failed to fetch user", error);
                // If token is invalid/expired
                logout();
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
        // Optional: Call logout endpoint on backend if needed
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
