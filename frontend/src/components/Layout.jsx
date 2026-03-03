import { Outlet } from "react-router-dom";
import { useState, useContext } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./layout.css";
import { AuthContext } from "../context/AuthContext";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useContext(AuthContext);

  // If no user logged in → public view (no sidebar, public topbar)
  const isPublic = !user;

  return (
    <div className={`shell ${collapsed ? "is-collapsed" : ""}`}>
      {!isPublic && <Sidebar collapsed={collapsed} />}

      <div className="main">
        <Topbar
          collapsed={collapsed}
          isPublic={isPublic}
          onToggleSidebar={() => setCollapsed((v) => !v)}
        />
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}