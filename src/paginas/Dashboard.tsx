import { useState } from "react";
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

import "./dashboard.css";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // menu sidebar
  const menuItems = [
    {
      path: "/dashboard",
      icon: FaHome,
      label: "Dashboard",
      // AVISO: substituir "path" por rota real se necessário
    },
    {
      path: "/acoes",
      icon: FaList,
      label: "Ações",
      // AVISO: substituir "path" por rota real se necessário
    },
    {
      path: "/tarefas",
      icon: FaTasks,
      label: "Gestão de Tarefas",
      // AVISO: substituir "path" por rota real se necessário
    },
    {
      path: "/financeiro",
      icon: FaMoneyBillWave,
      label: "Financeiro",
      // AVISO: substituir "path" por rota real se necessário
    },
    {
      path: "/configuracoes",
      icon: FaCog,
      label: "Configurações",
      // AVISO: substituir "path" por rota real se necessário
    },
    {
      path: "/assistente",
      icon: FaRobot,
      label: "Assistente de IA",
      // AVISO: substituir "path" por rota real se necessário
    },
    // Aqui você pode adicionar novos botões:
    // Exemplo:
    // { path: "/usuarios", icon: FaUserCircle, label: "Usuários" },
  ];

  // Função para verificar se o menuItem está ativo
  const isActive = (path: string) => location.pathname === path;

  // Função de logout, pode adicionar limpeza de sessão aqui
  const handleLogout = () => {
    // AVISO: adicionar limpeza de tokens ou estado de login se necessário
    navigate("/login"); // Redireciona para página de login
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="user-container">
        <div className="user">
          <FaUserCircle className="avatar" />
          {!collapsed && (
            <div className="user-info">
              <span className="name">Verador</span>
              <span className="role">Vereador</span>
            </div>
          )}
        </div>
      </div>

      {/*botao de recolher*/}
      <button
        className="collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/*menu*/}
      <div className="menu">
        {!collapsed && <span className="menu-title">Menu principal</span>}

        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path} // AVISO: substituir "to" por rota real quando criar a página
              className={`menu-item ${isActive(item.path) ? "active" : ""}`}
            >
              <IconComponent className="icon" />
              <span className="menu-item-text">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/*sair*/}
      <div className="logout">
        <button
          onClick={handleLogout}
          className="menu-item"
          // AVISO: este botão chama a função handleLogout
        >
          <FaSignOutAlt className="icon" />
          <span className="menu-item-text">Sair</span>
        </button>
      </div>
    </aside>
  );
}
