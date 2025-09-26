import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />
      
      <main className={`flex-1 bg-gray-50 min-h-screen transition-all duration-300 ${
        collapsed ? 'ml-20' : 'ml-64'
      }`}>
        <Outlet />
      </main>
    </div>
  );
}