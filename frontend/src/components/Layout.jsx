import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./layout.css";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isAuthenticated = () => localStorage.getItem("isAuth") === "true";
  // treat root and berita routes as public when not authenticated
  const publicPaths = ["/", "/berita", "/penduduk", "/struktur-organisasi"];
  const isPublicDashboard =
    !isAuthenticated() &&
    publicPaths.some((p) =>
      p === "/" ? location.pathname === "/" : location.pathname.startsWith(p)
    );

  return (
    <div className={`shell ${collapsed ? "is-collapsed" : ""}`}>
      {!isPublicDashboard && <Sidebar collapsed={collapsed} />}

      <div className="main">
        <Topbar
          collapsed={collapsed}
          isPublic={isPublicDashboard}
          onToggleSidebar={() => setCollapsed((v) => !v)}
        />
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}