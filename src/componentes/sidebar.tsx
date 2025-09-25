import { Link, useLocation, useNavigate } from "react-router-dom";
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
} from "react-icons/fa";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/dashboard", icon: FaHome, label: "Dashboard" },
    { path: "/acoes", icon: FaList, label: "Ações" },
    { path: "/tarefas", icon: FaTasks, label: "Gestão de Tarefas" },
    { path: "/financeiro", icon: FaMoneyBillWave, label: "Financeiro" },
    { path: "/configuracoes", icon: FaCog, label: "Configurações" },
    { path: "/assistente", icon: FaRobot, label: "Assistente de IA" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const handleLogout = () => navigate("/login");

  return (
    <aside className={`bg-blue-600 text-white flex flex-col justify-between transition-all duration-300 shadow-lg fixed left-0 top-0 h-full z-50 overflow-hidden ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="border-b border-white/20 pb-4">
        <div className="flex items-center gap-3 p-4">
          <FaUserCircle className="text-3xl flex-shrink-0 min-w-8" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm">Vereador</span>
              <span className="text-white/80 text-xs">Vereador</span>
            </div>
          )}
        </div>
      </div>
      <button
        className="fixed top-1/2 bg-blue-600 text-white border-2 border-white/70 rounded-lg w-7 h-7 flex items-center justify-center transition-all duration-300 text-xs font-bold z-60 shadow-md hover:bg-blue-700 active:bg-blue-800"
        style={{ 
          left: collapsed ? '70px' : '240px', 
          transform: 'translateY(-50%) translateX(-50%)' 
        }}
        onClick={onToggle}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/*menu*/}
      <div className="flex flex-col mt-5 px-2 flex-1">
        {!collapsed && (
          <span className="text-white/70 text-xs uppercase tracking-wide px-4 py-2">
            Menu principal
          </span>
        )}
        
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 border border-transparent min-h-11 hover:bg-white/10 hover:border-white/20 ${
                isActive(item.path) ? 'bg-white/15 border-white/30' : ''
              }`}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0 transition-transform duration-200 hover:scale-110" />
              {!collapsed && (
                <span className="font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/*sair*/}
      <div className="mb-5 px-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-red-400/30 min-h-11 w-full"
        >
          <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}