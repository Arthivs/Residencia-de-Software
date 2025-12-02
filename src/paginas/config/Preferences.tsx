import React, { useState } from 'react';
import { 
  Settings, 
  Grid, 
  Bell, 
  Eye, 
  EyeOff,
  Check,
  AlertCircle,
  Save,
  X,
  Shield,
  Clock,
  Volume2,
  Mail,
  ZoomIn,
  ZoomOut,
  Layout,
  Type
} from 'lucide-react';

interface PreferencesData {
  densidadeInterface: 'compacta' | 'confortavel' | 'espacosa';
  notificacoesEmail: boolean;
  notificacoesSistema: boolean;
  mostrarSenhaPorPadrao: boolean;
  timeoutSessao: number;
  volumeNotificacoes: number;
  tamanhoFonte: 'pequeno' | 'medio' | 'grande';
  zoomInterface: number;
}

const Preferences: React.FC = () => {
  const [preferences, setPreferences] = useState<PreferencesData>(() => {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      densidadeInterface: 'confortavel',
      notificacoesEmail: true,
      notificacoesSistema: true,
      mostrarSenhaPorPadrao: false,
      timeoutSessao: 30,
      volumeNotificacoes: 80,
      tamanhoFonte: 'medio',
      zoomInterface: 100,
    };
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (key: keyof PreferencesData, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setIsSaved(false);
    
    // Aplicar mudanças imediatamente
    if (key === 'densidadeInterface' || key === 'tamanhoFonte' || key === 'zoomInterface') {
      applyInterfaceSettings(updated);
    }
  };

  const applyInterfaceSettings = (settings: PreferencesData) => {
    // Aplicar densidade
    document.documentElement.classList.remove('interface-compacta', 'interface-confortavel', 'interface-espacosa');
    document.documentElement.classList.add(`interface-${settings.densidadeInterface}`);
    
    // Aplicar tamanho da fonte
    document.documentElement.classList.remove('fonte-pequena', 'fonte-media', 'fonte-grande');
    document.documentElement.classList.add(`fonte-${settings.tamanhoFonte}`);
    
    // Aplicar zoom
    document.documentElement.style.fontSize = `${settings.zoomInterface}%`;
  };

  const handleSave = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    applyInterfaceSettings(preferences);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    const defaultPreferences: PreferencesData = {
      densidadeInterface: 'confortavel',
      notificacoesEmail: true,
      notificacoesSistema: true,
      mostrarSenhaPorPadrao: false,
      timeoutSessao: 30,
      volumeNotificacoes: 80,
      tamanhoFonte: 'medio',
      zoomInterface: 100,
    };
    setPreferences(defaultPreferences);
    applyInterfaceSettings(defaultPreferences);
    setIsSaved(false);
  };

  const densidadeOptions = [
    { 
      value: 'compacta', 
      label: 'Compacta', 
      icon: <Grid className="w-5 h-5" />, 
      color: 'text-blue-500',
      description: 'Mais conteúdo por tela'
    },
    { 
      value: 'confortavel', 
      label: 'Confortável', 
      icon: <Layout className="w-5 h-5" />, 
      color: 'text-green-500',
      description: 'Balanceado para uso diário'
    },
    { 
      value: 'espacosa', 
      label: 'Espaçosa', 
      icon: <ZoomOut className="w-5 h-5" />, 
      color: 'text-purple-500',
      description: 'Mais espaço entre elementos'
    },
  ];

  const tamanhoFonteOptions = [
    { value: 'pequeno', label: 'Pequeno', size: 'text-sm' },
    { value: 'medio', label: 'Médio', size: 'text-base' },
    { value: 'grande', label: 'Grande', size: 'text-lg' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Preferências do Sistema
          </h2>
          <p className="text-gray-600 mt-1">
            Personalize a aparência e comportamento do sistema
          </p>
        </div>
        <div className="p-3 bg-purple-100 rounded-lg">
          <Settings className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      <form className="space-y-8">
        {/* Seção: Aparência da Interface */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Layout className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Aparência da Interface
              </h3>
              <p className="text-gray-600 text-sm">
                Ajuste a densidade e tamanho dos elementos
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Densidade da Interface */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Densidade da Interface
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {densidadeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('densidadeInterface', option.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      preferences.densidadeInterface === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`${option.color}`}>
                          {option.icon}
                        </div>
                        <span className="font-medium text-gray-900">
                          {option.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                      {preferences.densidadeInterface === option.value && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Check className="w-4 h-4" />
                          <span>Selecionado</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tamanho da Fonte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Tamanho da Fonte
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tamanhoFonteOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('tamanhoFonte', option.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      preferences.tamanhoFonte === option.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Type className="w-5 h-5 text-gray-500" />
                      <span className={`font-medium ${option.size}`}>
                        {option.label}
                      </span>
                      {preferences.tamanhoFonte === option.value && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <Check className="w-4 h-4" />
                          <span>Selecionado</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom da Interface */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-900 flex items-center gap-2">
                  <ZoomIn className="w-5 h-5" />
                  Zoom da Interface
                </label>
                <span className="text-sm font-medium text-gray-700">
                  {preferences.zoomInterface}%
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="150"
                step="5"
                value={preferences.zoomInterface}
                onChange={(e) => handleChange('zoomInterface', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>80%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Notificações */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Notificações
              </h3>
              <p className="text-gray-600 text-sm">
                Configure como deseja receber alertas e notificações
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block font-medium text-gray-900">
                    Notificações por E-mail
                  </label>
                  <p className="text-sm text-gray-600">
                    Receba notificações importantes no seu e-mail
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleChange('notificacoesEmail', !preferences.notificacoesEmail)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notificacoesEmail ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.notificacoesEmail ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block font-medium text-gray-900">
                    Notificações do Sistema
                  </label>
                  <p className="text-sm text-gray-600">
                    Alertas e notificações dentro do sistema
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleChange('notificacoesSistema', !preferences.notificacoesSistema)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notificacoesSistema ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.notificacoesSistema ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-900 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Volume das Notificações
                </label>
                <span className="text-sm font-medium text-gray-700">
                  {preferences.volumeNotificacoes}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.volumeNotificacoes}
                onChange={(e) => handleChange('volumeNotificacoes', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Seção: Segurança */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Segurança e Acesso
              </h3>
              <p className="text-gray-600 text-sm">
                Configurações de segurança e tempo de sessão
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preferences.mostrarSenhaPorPadrao ? (
                  <Eye className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <label className="block font-medium text-gray-900">
                    Mostrar Senha por Padrão
                  </label>
                  <p className="text-sm text-gray-600">
                    Exibir senhas em campos de texto por padrão
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleChange('mostrarSenhaPorPadrao', !preferences.mostrarSenhaPorPadrao)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.mostrarSenhaPorPadrao ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.mostrarSenhaPorPadrao ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tempo de Sessão (minutos)
                </label>
                <span className="text-sm font-medium text-gray-700">
                  {preferences.timeoutSessao} min
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={preferences.timeoutSessao}
                onChange={(e) => handleChange('timeoutSessao', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Aviso */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Aplicação das Preferências
              </h4>
              <p className="text-sm text-gray-600">
                As configurações de interface são aplicadas imediatamente. 
                As demais preferências são salvas para sessões futuras.
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200">
          {isSaved && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              <span>Preferências salvas com sucesso!</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Redefinir Padrões
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all"
          >
            <Save className="w-4 h-4" />
            Salvar Preferências
          </button>
        </div>
      </form>
    </div>
  );
};

export default Preferences;