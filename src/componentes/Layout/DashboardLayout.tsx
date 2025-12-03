import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar";
import ChatbotWidget from "../ChatbotWidget";
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
        
        {/* Widget  */}
        <ChatbotWidget 
          apiEndpoint="/api/assistant/chat"
          initialMessage="Olá! Sou seu assistente de dashboard. Posso ajudar a analisar métricas, relatórios e dados do sistema."
          primaryColor="#3b82f6"
        />
      </main>
    </div>
  );
}