// src/pages/settings/UserAdmin.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  User,
  UserCheck,
  UserX
} from 'lucide-react';

// Tipos - Definir primeiro
type UserStatus = 'ativo' | 'inativo';
type UserRole = 'Administrador' | 'Moderador' | 'Usuário Comum';

interface User {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  perfil: UserRole;
  status: UserStatus;
  ultimoAcesso: string;
}

// Simulação de dados dos usuários - Com tipagem explícita
const mockUsers: User[] = [
  {
    id: 1,
    nome: 'Alan Grego da Costa',
    telefone: '(83) 3538-8564',
    email: 'alan.grego@exemplo.com',
    perfil: 'Usuário Comum',
    status: 'ativo',
    ultimoAcesso: '2024-01-14 10:15',
  },
  {
    id: 2,
    nome: 'Arnaldo Leandro Domingues Jr.',
    telefone: '(96) 3239-5125',
    email: 'arnaldo.domingues@exemplo.com',
    perfil: 'Moderador',
    status: 'ativo',
    ultimoAcesso: '2024-01-15 09:45',
  },
  {
    id: 3,
    nome: 'Elisa Rosimeire Bittencourt Dias',
    telefone: '(87) 3002-6107',
    email: 'elisa.dias@exemplo.com',
    perfil: 'Usuário Comum',
    status: 'inativo',
    ultimoAcesso: '2024-01-10 16:20',
  },
  {
    id: 4,
    nome: 'Bruno Aranda Rico',
    telefone: '(79) 2238-2205',
    email: 'bruno.rico@exemplo.com',
    perfil: 'Administrador',
    status: 'ativo',
    ultimoAcesso: '2024-01-15 11:10',
  },
  {
    id: 5,
    nome: 'Altair Bento Escobar Rodrigues Buarque',
    telefone: '(14) 3238-4846',
    email: 'altair.buarque@exemplo.com',
    perfil: 'Usuário Comum',
    status: 'ativo',
    ultimoAcesso: '2024-01-13 13:25',
  },
  {
    id: 6,
    nome: 'Alexa Raquel Galhardo Quintana Guerra',
    telefone: '(89) 2063-6912',
    email: 'alexa.guerra@exemplo.com',
    perfil: 'Moderador',
    status: 'ativo',
    ultimoAcesso: '2024-01-15 08:45',
  },
  {
    id: 7,
    nome: 'Martinho Aranda de Feliciano',
    telefone: '(95) 2042-6469',
    email: 'martinho.feliciano@exemplo.com',
    perfil: 'Usuário Comum',
    status: 'inativo',
    ultimoAcesso: '2024-01-08 15:30',
  },
];

// Simulação do usuário logado
const getCurrentUser = () => {
  return {
    nome: 'Administrador',
    perfil: 'Administrador' as UserRole,
    email: 'admin@vereador.com'
  };
};

const UserAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'todos'>('todos');
  const currentUser = getCurrentUser();
  const isAdmin = currentUser.perfil === 'Administrador';

  // Estatísticas
  const stats = {
    total: users.length,
    ativos: users.filter(u => u.status === 'ativo').length,
    inativos: users.filter(u => u.status === 'inativo').length,
    administradores: users.filter(u => u.perfil === 'Administrador').length,
  };

  // Filtra usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telefone.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'todos' || user.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Ações dos usuários
  const toggleUserStatus = (id: number) => {
    if (!isAdmin) return;
    
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'ativo' ? 'inativo' : 'ativo' }
        : user
    ));
  };

  const deleteUser = (id: number) => {
    if (!isAdmin) return;
    
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  // Se não for admin, mostra mensagem de acesso negado
  if (!isAdmin) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Administração de Usuários
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie todos os usuários do sistema
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-12 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Acesso Restrito
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Esta área é restrita apenas para usuários com perfil de <strong>Administrador</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full">
      {/* Header específico para Administração */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Administração de Usuários
        </h2>
        <p className="text-gray-600 mt-1">
          Gerencie todos os usuários do sistema
        </p>
      </div>

      {/* Estatísticas em grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total de Usuários */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-gray-600 text-sm">Total de Usuários</div>
            </div>
          </div>
        </div>

        {/* Usuários Ativos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{stats.ativos}</div>
              <div className="text-gray-600 text-sm">Usuários Ativos</div>
            </div>
          </div>
        </div>

        {/* Usuários Inativos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">{stats.inativos}</div>
              <div className="text-gray-600 text-sm">Usuários Inativos</div>
            </div>
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{stats.administradores}</div>
              <div className="text-gray-600 text-sm">Administradores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-vereador-blue focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Filtro de status */}
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Todos os status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'todos')}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:border-vereador-blue focus:outline-none bg-white min-w-[120px]"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                  Nome
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                  Telefone
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                  E-mail
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                  Perfil
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  {/* Nome */}
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.nome}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>Último acesso: {user.ultimoAcesso.split(' ')[0]}</span>
                        <span>{user.ultimoAcesso.split(' ')[1]}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Telefone */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {user.telefone}
                    </div>
                  </td>
                  
                  {/* E-mail */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  
                  {/* Perfil */}
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.perfil === 'Administrador'
                        ? 'bg-purple-100 text-purple-800'
                        : user.perfil === 'Moderador'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.perfil}
                    </span>
                  </td>
                  
                  {/* Status */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {user.status === 'ativo' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-medium">Ativo</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 font-medium">Inativo</span>
                        </>
                      )}
                    </div>
                  </td>
                  
                  {/* Ações */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-2 rounded transition-colors ${
                          user.status === 'ativo'
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        title={user.status === 'ativo' ? 'Desativar usuário' : 'Ativar usuário'}
                      >
                        {user.status === 'ativo' ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé da tabela */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Mostrando {filteredUsers.length} de {users.length} usuários
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Usuário: <span className="font-semibold text-vereador-blue">{currentUser.nome}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Ordenar por:</span>
                <select className="border-none bg-transparent focus:outline-none focus:ring-0">
                  <option>Nome</option>
                  <option>Status</option>
                  <option>Último acesso</option>
                </select>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAdmin;