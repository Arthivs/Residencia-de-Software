import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCog, FaArrowLeft } from 'react-icons/fa';

export default function AlterarSenha() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para alterar senha
    console.log('Dados do formulário:', formData);
    navigate('/login');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cabeçalho Azul */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-blue-100">Gerencie suas configurações de usuário</p>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white p-8 lg:p-12 lg:w-2/5">
            <button 
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-blue-100 hover:text-white mb-8 transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              <span>Voltar para login</span>
            </button>
            
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start items-center gap-4 mb-6">
                <div className="relative">
                  <FaUserCircle className="text-6xl text-blue-200" />
                  <FaCog className="text-3xl text-white absolute -bottom-2 -right-2" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">Configurações</h1>
              <p className="text-blue-200 text-lg">Gerencie suas configurações de usuário</p>
            </div>

            {/* Lista de funcionalidades */}
            <div className="mt-12 hidden lg:block">
              <h3 className="font-semibold text-blue-200 mb-4">Funcionalidades disponíveis:</h3>
              <ul className="space-y-3 text-blue-100">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span>Cadastro de Usuário</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span>Administração de Usuários</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span>Preferências do Sistema</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Formulário */}
          <div className="p-8 lg:p-12 lg:w-3/5">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Alteração de Senha</h2>
              <p className="text-gray-600">Atualize sua senha de acesso ao sistema</p>
            </div>

            {/* Listas da imagem */}
            <div className="space-y-6 mb-8">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Seguidores quanto</h3>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• Usuários, empresa e investimentos</li>
                  <li>• Usuários, empresa e investimentos (equipos)</li>
                  <li>• Usuários, empresa e investimentos (e-mail)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">Senha</h3>
                <p className="text-gray-600 text-sm">Equipos que servão atual</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">Nova senha (exatamente 8 caracteres)</h3>
                <p className="text-gray-600 text-sm">O Equipo menos como 40 caracteres</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">Confirmar nova senha</h3>
                <p className="text-gray-600 text-sm">O Equipo menos como 2 anos sendo</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Senha Atual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Atual
                </label>
                <input
                  type="password"
                  name="senhaAtual"
                  value={formData.senhaAtual}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite sua senha atual"
                  required
                />
              </div>

              {/* Nova Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                  <span className="text-xs text-gray-500 font-normal ml-2">(exatamente 8 caracteres)</span>
                </label>
                <input
                  type="password"
                  name="novaSenha"
                  value={formData.novaSenha}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite a nova senha"
                  maxLength={8}
                  required
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Mínimo 8 caracteres</span>
                  <span>{formData.novaSenha.length}/8</span>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirme a nova senha"
                  maxLength={8}
                  required
                />
                {formData.novaSenha && formData.confirmarSenha && formData.novaSenha !== formData.confirmarSenha && (
                  <p className="text-red-500 text-xs mt-1">As senhas não coincidem</p>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg shadow-blue-500/25"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>

            <footer className="mt-8 text-center text-gray-500 text-sm border-t border-gray-200 pt-6">
              Sistema de Gestão Política v.1.0.0
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}