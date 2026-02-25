import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./layout.css";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`shell ${collapsed ? "is-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} />

      <div className="main">
        <Topbar collapsed={collapsed} onToggleSidebar={() => setCollapsed((v) => !v)} />
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}