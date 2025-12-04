import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaTasks,
  FaMoneyBillWave,
  FaCog,
  FaRobot,
  FaSignOutAlt,
  FaList,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";
import { useDashConect } from "../conect/dashconect";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userName?: string;    
  userEmail?: string;  
}

export default function Sidebar({ 
  collapsed, 
  onToggle,
  userName,
  userEmail 
}: SidebarProps) {
  const location = useLocation();
  const { logout } = useDashConect(); 

  const menuItems = [
    { path: "/dashboard", icon: FaHome, label: "Dashboard" },
    { path: "/acoes", icon: FaList, label: "Ações" },
    { path: "/tarefas", icon: FaTasks, label: "Gestão de Tarefas" },
    { path: "/financeiro", icon: FaMoneyBillWave, label: "Financeiro" },
    { path: "/configuracoes", icon: FaCog, label: "Configurações" },
    { path: "/assistente", icon: FaRobot, label: "Assistente de IA" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col justify-between transition-all duration-300 shadow-xl fixed left-0 top-0 h-full z-50 overflow-hidden ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Cabeçalho com informações do usuário */}
      <div className="border-b border-white/20 pb-4 pt-6">
        <div className="flex items-center gap-3 p-4">
          <div className="relative">
            <FaUserCircle className="text-3xl flex-shrink-0 min-w-8 text-white/90" />
            {userName && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-blue-700"></div>
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm truncate">
                {userName || "Vereador"}
              </span>
              <span className="text-white/80 text-xs truncate">
                {userEmail || "Sistema de Gestão"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Botão de toggle */}
      <button
        className="fixed top-1/2 bg-blue-600 hover:bg-blue-500 text-white border-2 border-white/70 rounded-lg w-7 h-7 flex items-center justify-center transition-all duration-300 text-xs font-bold z-60 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
        style={{ 
          left: collapsed ? '70px' : '240px', 
          transform: 'translateY(-50%) translateX(-50%)' 
        }}
        onClick={onToggle}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* Menu principal */}
      <div className="flex flex-col mt-2 px-2 flex-1 overflow-y-auto">
        {!collapsed && (
          <span className="text-white/70 text-xs uppercase tracking-wide px-4 py-2 font-semibold">
            Menu principal
          </span>
        )}
        
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 border min-h-11 ${
                active 
                  ? 'bg-white/20 border-white/40 shadow-inner' 
                  : 'border-transparent hover:bg-white/10 hover:border-white/20'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                active ? 'text-white scale-110' : 'text-white/90 group-hover:text-white group-hover:scale-110'
              }`} />
              {!collapsed && (
                <span className="font-medium whitespace-nowrap overflow-hidden text-sm">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Informações do usuário expandidas (apenas quando não collapsed) */}
      {!collapsed && userName && (
        <div className="px-4 py-3 border-t border-white/20 bg-white/5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <FaUser className="w-3 h-3 text-white/70" />
              <span className="truncate">{userName}</span>
            </div>
            {userEmail && (
              <div className="flex items-center gap-2 text-xs">
                <FaEnvelope className="w-3 h-3 text-white/70" />
                <span className="truncate">{userEmail}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs">
              <FaMapMarkerAlt className="w-3 h-3 text-white/70" />
              <span className="truncate">Vereador</span>
            </div>
          </div>
        </div>
      )}

      {/* Botão de sair */}
      <div className="mb-4 px-2">
        <button
          onClick={logout}
          className="group flex items-center justify-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 border border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-400/30 min-h-11 w-full"
          title={collapsed ? "Sair" : undefined}
        >
          <FaSignOutAlt className="w-5 h-5 flex-shrink-0 text-white/90 group-hover:text-red-300 transition-colors" />
          {!collapsed && (
            <span className="font-medium text-sm group-hover:text-red-200 transition-colors">
              Sair 
            </span>
          )}
        </button>
        
        {!collapsed && (
          <div className="text-center mt-2">
            <span className="text-white/50 text-xs">
              v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}