import { Outlet, useLocation } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./layout.css";
import { AuthContext } from "../context/AuthContext";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // If no user logged in → public view (no sidebar, public topbar)
  const isPublic = !user;

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  return (
    <div className={`shell ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      {!isPublic && (
        <>
          <Sidebar collapsed={collapsed} />
          {mobileOpen && (
            <div
              className="sidebar-backdrop"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
          )}
        </>
      )}

      <div className="main">
        <Topbar
          collapsed={collapsed}
          isPublic={isPublic}
          onToggleSidebar={handleToggleSidebar}
        />
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}