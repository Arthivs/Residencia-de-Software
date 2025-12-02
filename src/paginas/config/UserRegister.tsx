// src/pages/settings/UserRegister.tsx
import React, { useState } from 'react';
import { 
  User,
  Mail,
  Key,
  Check,
  X,
  Eye,
  EyeOff,
  Shield,
  Hash,
  UserPlus,
  AlertCircle
} from 'lucide-react';

interface FormData {
  nome: string;
  sobrenome: string;
  email: string;
  perfil: string;
  senha: string;
  confirmarSenha: string;
}

const UserRegister: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    sobrenome: '',
    email: '',
    perfil: 'comum',
    senha: '',
    confirmarSenha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpa erro do campo ao modificar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.sobrenome.trim()) {
      newErrors.sobrenome = 'Sobrenome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Formulário enviado:', formData);
      alert('Usuário cadastrado com sucesso!');
      
      // Reset form
      setFormData({
        nome: '',
        sobrenome: '',
        email: '',
        perfil: 'comum',
        senha: '',
        confirmarSenha: '',
      });
    }
  };

  // Componente de checkbox visual apenas (não clicável)
  const VisualCheckbox = ({ checked, label, required = false }: { checked: boolean; label: string; required?: boolean }) => (
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked 
          ? 'bg-vereador-blue border-vereador-blue' 
          : 'bg-white border-gray-300'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="text-base font-semibold text-gray-800">{label}</span>
      {required && <span className="text-red-500 text-sm ml-1">*</span>}
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Cadastro de Usuário
          </h2>
          <p className="text-gray-600 mt-1">
            Preencha os dados para criar um novo usuário no sistema
          </p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
          <UserPlus className="w-8 h-8 text-vereador-blue" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Nome e campos principais */}
          <div className="space-y-6">
            {/* Seção: Nome */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-vereador-blue" />
                Nome
              </h3>
              
              <div className="space-y-6">
                {/* Campo: Nome */}
                <div>
                  <VisualCheckbox checked={!!formData.nome} label="Nome" required />
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors ${
                        errors.nome 
                          ? 'border-red-300 focus:border-red-500' 
                          : formData.nome
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-300 focus:border-vereador-blue'
                      }`}
                      placeholder="Digite o nome do usuário"
                    />
                  </div>
                  {errors.nome && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                {/* Campo: E-mail */}
                <div>
                  <VisualCheckbox checked={!!formData.email} label="E-mail" required />
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-500' 
                          : formData.email
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-300 focus:border-vereador-blue'
                      }`}
                      placeholder="usuario@exemplo.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Campo: Tipo de Perfil */}
                <div>
                  <VisualCheckbox checked={!!formData.perfil} label="Tipo de Perfil" />
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="perfil"
                      value={formData.perfil}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-vereador-blue focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors appearance-none bg-white"
                    >
                      <option value="comum">Usuário Comum</option>
                      <option value="administrador">Administrador</option>
                      <option value="moderador">Moderador</option>
                      <option value="visualizador">Apenas Visualização</option>
                    </select>
                  </div>
                </div>

                {/* Indicador: Usuário Comum */}
                <div>
                  <VisualCheckbox checked={formData.perfil === 'comum'} label="Usuário Comum" />
                  {formData.perfil === 'comum' && (
                    <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="text-green-700 text-sm font-medium">
                        Perfil selecionado: Permissões básicas de usuário
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Sobrenome e senhas */}
          <div className="space-y-6">
            {/* Seção: Sobrenome */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-vereador-blue" />
                Sobrenome
              </h3>
              
              <div className="space-y-6">
                {/* Campo: Sobrenome */}
                <div>
                  <VisualCheckbox checked={!!formData.sobrenome} label="Sobrenome" required />
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="sobrenome"
                      value={formData.sobrenome}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors ${
                        errors.sobrenome 
                          ? 'border-red-300 focus:border-red-500' 
                          : formData.sobrenome
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-300 focus:border-vereador-blue'
                      }`}
                      placeholder="Digite o sobrenome do usuário"
                    />
                  </div>
                  {errors.sobrenome && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.sobrenome}
                    </p>
                  )}
                </div>

                {/* Campo: Senha */}
                <div>
                  <VisualCheckbox checked={!!formData.senha} label="Senha" required />
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="senha"
                      value={formData.senha}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors ${
                        errors.senha 
                          ? 'border-red-300 focus:border-red-500' 
                          : formData.senha
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-300 focus:border-vereador-blue'
                      }`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.senha && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.senha}
                    </p>
                  )}
                  {formData.senha && !errors.senha && (
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            formData.senha.length >= 8 ? 'bg-green-500' :
                            formData.senha.length >= 6 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((formData.senha.length / 12) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Força da senha: {
                          formData.senha.length >= 8 ? 'Forte' :
                          formData.senha.length >= 6 ? 'Média' :
                          'Fraca'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Campo: Confirmar Senha */}
                <div>
                  <VisualCheckbox checked={!!formData.confirmarSenha} label="Confirmar Senha" required />
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors ${
                        errors.confirmarSenha 
                          ? 'border-red-300 focus:border-red-500' 
                          : formData.confirmarSenha
                            ? formData.senha === formData.confirmarSenha
                              ? 'border-green-300 focus:border-green-500'
                              : 'border-amber-300 focus:border-amber-500'
                            : 'border-gray-300 focus:border-vereador-blue'
                      }`}
                      placeholder="Digite a senha novamente"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmarSenha && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmarSenha}
                    </p>
                  )}
                  {formData.confirmarSenha && !errors.confirmarSenha && formData.senha === formData.confirmarSenha && (
                    <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                      <Check className="w-4 h-4" />
                      <span>As senhas coincidem</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações de validação */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Campos obrigatórios
              </h4>
              <p className="text-sm text-gray-600">
                Os campos marcados com <span className="text-red-500">*</span> são de preenchimento obrigatório.
                Todos os dados serão validados antes do cadastro.
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            onClick={() => {
              setFormData({
                nome: '',
                sobrenome: '',
                email: '',
                perfil: 'comum',
                senha: '',
                confirmarSenha: '',
              });
              setErrors({});
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-vereador-blue text-white font-medium hover:bg-vereador-blue-dark transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            disabled={!formData.nome || !formData.sobrenome || !formData.email || !formData.senha || !formData.confirmarSenha}
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Usuário
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserRegister;