import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../dashbar"; 
import "../../paginas/dashboard.css";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}