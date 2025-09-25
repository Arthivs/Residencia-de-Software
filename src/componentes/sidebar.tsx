// components/sidebar/sidebar.tsx
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

import "./sidebar.css";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Menu SEM "Eleição"
  const menuItems = [
    { path: "/dashboard", icon: FaHome, label: "Dashboard" },
    { path: "/acoes", icon: FaList, label: "Ações" },
    { path: "/tarefas", icon: FaTasks, label: "Gestão de Tarefas" },
    { path: "/financeiro", icon: FaMoneyBillWave, label: "Financeiro" },
    { path: "/configuracoes", icon: FaCog, label: "Configurações" },
    { path: "/assistente", icon: FaRobot, label: "Assistente IA" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const handleLogout = () => navigate("/login");

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="user-container">
        <div className="user">
          <FaUserCircle className="avatar" />
          {!collapsed && (
            <div className="user-info">
              <span className="name">Vereador</span>
              <span className="role">Parlamentar</span>
            </div>
          )}
        </div>
      </div>

      <button
        className="collapse-btn"
        onClick={onToggle}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      <div className="menu">
        {!collapsed && <span className="menu-title">Menu principal</span>}
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${isActive(item.path) ? "active" : ""}`}
            >
              <IconComponent className="icon" />
              <span className="menu-item-text">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="logout">
        <button onClick={handleLogout} className="menu-item">
          <FaSignOutAlt className="icon" />
          <span className="menu-item-text">Sair</span>
        </button>
      </div>
    </aside>
  );
}