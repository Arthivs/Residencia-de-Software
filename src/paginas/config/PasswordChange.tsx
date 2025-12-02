// src/pages/settings/PasswordChange.tsx
import React, { useState } from 'react';
import { 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  Check,
  X,
  Shield,
  AlertCircle
} from 'lucide-react';

const PasswordChange: React.FC = () => {
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpa erro do campo ao modificar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.senhaAtual) {
      newErrors.senhaAtual = 'Senha atual é obrigatória';
    }

    if (!formData.novaSenha) {
      newErrors.novaSenha = 'Nova senha é obrigatória';
    } else if (formData.novaSenha.length !== 8) {
      newErrors.novaSenha = 'A senha deve ter exatamente 8 caracteres';
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.novaSenha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Senha alterada:', formData);
      alert('Senha alterada com sucesso!');
      
      // Reset form
      setFormData({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      });
    }
  };

  // Componente de checkbox customizado
  const CustomCheckbox = ({ checked, label }: { checked: boolean; label: string }) => (
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked 
          ? 'bg-vereador-blue border-vereador-blue' 
          : 'bg-white border-gray-300'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="text-base font-semibold text-gray-800">{label}</span>
    </div>
  );

  // Contador de caracteres
  const passwordLength = formData.novaSenha.length;
  const isPasswordValid = passwordLength === 8;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Alteração de Senha
          </h2>
          <p className="text-gray-600 mt-1">
            Atualize sua senha de acesso ao sistema
          </p>
        </div>
        <div className="p-3 bg-amber-100 rounded-lg">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {/* Card de informações */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Requisitos da senha
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Deve conter exatamente 8 caracteres</li>
                <li>• Use letras, números e símbolos para maior segurança</li>
                <li>• Não utilize senhas óbvias ou sequências simples</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Campo: Senha Atual */}
        <div className="mb-8">
          <CustomCheckbox checked={!!formData.senhaAtual} label="Senha" />
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showSenhaAtual ? "text" : "password"}
              name="senhaAtual"
              value={formData.senhaAtual}
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors ${
                errors.senhaAtual 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-vereador-blue'
              }`}
              placeholder="Digite sua senha atual"
            />
            <button
              type="button"
              onClick={() => setShowSenhaAtual(!showSenhaAtual)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSenhaAtual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.senhaAtual && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.senhaAtual}
            </p>
          )}
        </div>

        {/* Campo: Nova Senha */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <CustomCheckbox checked={!!formData.novaSenha} label="Nova senha (exatamente 8 caracteres)" />
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isPasswordValid ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={`text-sm font-medium ${
                isPasswordValid ? 'text-green-600' : 'text-gray-500'
              }`}>
                {passwordLength}/8
              </span>
            </div>
          </div>
          
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showNovaSenha ? "text" : "password"}
              name="novaSenha"
              value={formData.novaSenha}
              onChange={handleChange}
              maxLength={8}
              className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors ${
                errors.novaSenha 
                  ? 'border-red-300 focus:border-red-500' 
                  : isPasswordValid 
                    ? 'border-green-300 focus:border-green-500' 
                    : 'border-gray-300 focus:border-vereador-blue'
              }`}
              placeholder="Digite a nova senha (8 caracteres)"
            />
            <button
              type="button"
              onClick={() => setShowNovaSenha(!showNovaSenha)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNovaSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  passwordLength === 8 ? 'bg-green-500' :
                  passwordLength >= 6 ? 'bg-amber-500' :
                  passwordLength >= 4 ? 'bg-blue-500' :
                  'bg-gray-400'
                }`}
                style={{ width: `${(passwordLength / 8) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {errors.novaSenha && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.novaSenha}
            </p>
          )}
        </div>

        {/* Campo: Confirmar Nova Senha */}
        <div className="mb-10">
          <CustomCheckbox checked={!!formData.confirmarSenha} label="Confirmar nova senha" />
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirmarSenha ? "text" : "password"}
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              maxLength={8}
              className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors ${
                errors.confirmarSenha 
                  ? 'border-red-300 focus:border-red-500' 
                  : formData.novaSenha === formData.confirmarSenha && formData.confirmarSenha.length === 8
                    ? 'border-green-300 focus:border-green-500'
                    : 'border-gray-300 focus:border-vereador-blue'
              }`}
              placeholder="Digite novamente a nova senha"
            />
            <button
              type="button"
              onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Feedback visual da confirmação */}
          {formData.confirmarSenha && (
            <div className="mt-2">
              {formData.novaSenha === formData.confirmarSenha ? (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  <span>As senhas coincidem</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>As senhas não coincidem</span>
                </div>
              )}
            </div>
          )}
          
          {errors.confirmarSenha && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.confirmarSenha}
            </p>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            onClick={() => setFormData({
              senhaAtual: '',
              novaSenha: '',
              confirmarSenha: ''
            })}
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-vereador-blue text-white font-medium hover:bg-vereador-blue-dark transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            disabled={!isPasswordValid || !formData.senhaAtual || !formData.confirmarSenha}
          >
            <Lock className="w-4 h-4" />
            Alterar Senha
          </button>
        </div>
      </form>

      {/* Dicas de segurança */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dicas de segurança
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded">
                <Key className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Não reutilize senhas</span>
            </div>
            <p className="text-sm text-gray-600">
              Use uma senha diferente para cada serviço importante
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">Altere periodicamente</span>
            </div>
            <p className="text-sm text-gray-600">
              Recomendamos alterar a senha a cada 90 dias
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded">
                <Lock className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-medium text-gray-900">Mantenha sigilo</span>
            </div>
            <p className="text-sm text-gray-600">
              Nunca compartilhe sua senha com outras pessoas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChange;