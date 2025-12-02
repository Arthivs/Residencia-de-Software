// src/pages/settings/SettingsPage.tsx
import React, { useState } from 'react';
import { 
  Lock,
  UserPlus,
  Users,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { FaCog } from 'react-icons/fa'; // Importe o ícone da sidebar
import UserRegister from './UserRegister';
import PasswordChange from './PasswordChange';
import UserAdmin from './UserAdmin';
import Preferences from './Preferences';

type MenuItemType = 'password' | 'register' | 'admin' | 'preferences';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<MenuItemType>('register');

  // Menu items baseados na imagem
  const menuItems = [
    { 
      id: 'password' as MenuItemType, 
      label: 'Alteração de Senha', 
      active: false,
      icon: <Lock className="w-5 h-5" />,
      color: 'text-amber-600'
    },
    { 
      id: 'register' as MenuItemType, 
      label: 'Cadastro de Usuário', 
      active: true,
      icon: <UserPlus className="w-5 h-5" />,
      color: 'text-vereador-blue'
    },
    { 
      id: 'admin' as MenuItemType, 
      label: 'Administração de Usuários', 
      active: true,
      icon: <Users className="w-5 h-5" />,
      color: 'text-emerald-600'
    },
    { 
      id: 'preferences' as MenuItemType, 
      label: 'Preferências do Sistema', 
      active: true,
      icon: <FaCog className="w-5 h-5" />,
      color: 'text-purple-600'
    },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'register':
        return <UserRegister />;
      case 'password':
        return <PasswordChange />;
      case 'admin':
        return <UserAdmin />;
      case 'preferences':
        return <Preferences />;
      default:
        return <UserRegister />;
    }
  };

  // Para Administração de Usuários, não mostrar sidebar
  const showSidebar = activeSection !== 'admin';

  return (
    <div className="min-h-screen bg-vereador-bg font-inter">
      {/* Container principal com largura total */}
      <div className="w-full">
        {/* Cabeçalho azul que vai até a borda - usando ícone da sidebar */}
        <div className="bg-blue-600 text-white w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            <div className="flex items-center gap-3 mb-2">
              <FaCog className="w-8 h-8 text-white" /> {/* Ícone da sidebar */}
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Configurações
              </h1>
            </div>
            <p className="text-blue-100 text-lg">
              Gerencie suas configurações de usuário
            </p>
          </div>
        </div>

        {/* Conteúdo principal - ocupando largura total */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="bg-white rounded-2xl shadow-vereador-card overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Sidebar Menu - Escondido para Administração */}
              {showSidebar && (
                <nav className="lg:w-72 bg-gradient-to-b from-gray-50 to-white border-b lg:border-b-0 lg:border-r border-gray-200">
                  <div className="p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Menu de Configurações
                    </h3>
                    <ul className="space-y-2">
                      {menuItems.map((item) => {
                        const isActive = activeSection === item.id;
                        const isChecked = item.active || isActive;
                        
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => setActiveSection(item.id)}
                              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                                isActive
                                  ? 'bg-blue-50 text-vereador-blue border-2 border-blue-100'
                                  : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`${item.color}`}>
                                  {item.icon}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm">
                                    {isChecked ? '[x]' : '[ ]'}
                                  </span>
                                  <span className="font-medium text-left">
                                    {item.label}
                                  </span>
                                </div>
                              </div>
                              {isActive && (
                                <ChevronRight className="w-4 h-4 text-vereador-blue" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </nav>
              )}

              {/* Main Content - Tela cheia para Administração */}
              <main className={`${showSidebar ? 'flex-1' : 'w-full'}`}>
                {/* Botão de voltar para Configurações (apenas na Administração) */}
                {activeSection === 'admin' && (
                  <div className="px-6 pt-6 md:px-8 md:pt-8">
                    <button
                      onClick={() => setActiveSection('register')}
                      className="group flex items-center gap-3 text-gray-600 hover:text-vereador-blue transition-colors mb-6"
                    >
                      <div className="p-2 bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:text-vereador-blue transition-colors" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium group-hover:text-vereador-blue">
                          Voltar para Configurações
                        </span>
                        <p className="text-xs text-gray-500 group-hover:text-gray-600">
                          Retornar ao menu principal
                        </p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Conteúdo da seção */}
                <div className={`${activeSection === 'admin' ? 'px-6 pb-6 md:px-8 md:pb-8' : 'p-6 md:p-8'}`}>
                  {renderSection()}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;