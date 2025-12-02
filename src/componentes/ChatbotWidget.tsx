import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  MessageSquare,
  Clock,
  User,
  Loader2,
  BarChart3,
  Users,
  AlertCircle,
  Trash2,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatbotWidgetProps {
  apiEndpoint?: string;
  initialMessage?: string;
  primaryColor?: string;
  companyName?: string;
  showNotificationBadge?: boolean;
  autoOpen?: boolean;
  maxHeight?: number | string;
}

interface QuickAction {
  text: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
  actionType?: 'dashboard' | 'performance' | 'users' | 'issues';
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  initialMessage = 'Olá! Sou seu assistente IA. Posso ajudar a analisar dados do dashboard.',
  primaryColor = '#3b82f6',
  companyName = 'Dashboard Analytics',
  showNotificationBadge = true,
  autoOpen = false,
  maxHeight = '600px'
}) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: initialMessage,
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  const quickActions: QuickAction[] = useMemo(() => [
    { 
      text: 'Resumo do dashboard', 
      icon: <BarChart3 className="w-3 h-3" aria-hidden="true" />,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200',
      description: 'Obter um resumo geral do dashboard',
      actionType: 'dashboard'
    },
    { 
      text: 'Performance geral', 
      icon: <Activity className="w-3 h-3" aria-hidden="true" />,
      color: 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200',
      description: 'Ver métricas de performance',
      actionType: 'performance'
    },
    { 
      text: 'Dados de usuários', 
      icon: <Users className="w-3 h-3" aria-hidden="true" />,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200',
      description: 'Analisar dados dos usuários',
      actionType: 'users'
    },
    { 
      text: 'Problemas detectados', 
      icon: <AlertTriangle className="w-3 h-3" aria-hidden="true" />,
      color: 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200',
      description: 'Identificar problemas no sistema',
      actionType: 'issues'
    }
  ], []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: trimmedMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Simulando resposta da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockResponses = [
        "Analisando os dados do dashboard... Vejo que as tarefas concluídas aumentaram 15% este mês.",
        "Com base nas métricas, sugiro focar nas tarefas com prioridade alta que estão próximas do prazo.",
        "Os dados mostram crescimento consistente na eficiência da equipe.",
        "Identifiquei oportunidades de melhoria na distribuição de tarefas por responsável.",
        "Analisando o progresso mensal, percebo que há picos de produtividade em determinados períodos."
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Não foi possível conectar ao servidor. Tente novamente.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, estou tendo problemas para me conectar. Tente novamente em alguns instantes.',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = useCallback((action: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: action,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      let response = '';
      
      switch (action) {
        case 'Resumo do dashboard':
          response = `Resumo do Dashboard:
• Tarefas Concluídas: Aumento de 15%
• Eficiência: 78%
• Prazo Médio: 7 dias
• Tarefas por Responsável: Bem distribuídas`;
          break;
        case 'Performance geral':
          response = `Performance Geral:
• Velocidade de conclusão: 4.2 dias (melhor que a média)
• Taxa de sucesso: 92%
• Tarefas em atraso: 2
• Satisfação: Alta`;
          break;
        case 'Dados de usuários':
          response = `Dados dos Usuários:
• Usuários ativos: 24
• Novos usuários este mês: 3
• Atividade média: 8h/dia
• Taxa de engajamento: 85%`;
          break;
        case 'Problemas detectados':
          response = `Problemas Detectados:
• 2 tarefas próximas do prazo
• 1 responsável com carga excessiva
• Comunicação entre setores pode melhorar`;
          break;
        default:
          response = 'Analisando os dados relacionados a esta ação...';
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 600);
  }, []);

  const clearConversation = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar toda a conversa?')) {
      setMessages([
        {
          id: '1',
          content: initialMessage,
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [initialMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }, [inputMessage, isLoading]);

  const userMessagesCount = useMemo(() => 
    messages.filter(m => m.sender === 'user').length,
    [messages]
  );

  return (
    <div className="fixed bottom-6 right-6 z-50" role="dialog" aria-label="Assistente IA">
      {/* Botão para abrir */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 4px 20px ${primaryColor}40`
          }}
          aria-label="Abrir assistente IA"
          title="Conversar com o assistente IA"
        >
          <MessageSquare className="w-7 h-7 text-white" aria-hidden="true" />
          {showNotificationBadge && userMessagesCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              aria-label={`${userMessagesCount} novas mensagens`}
            >
              {userMessagesCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div 
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96'
          }`}
          style={{ 
            boxShadow: `0 10px 40px rgba(0, 0, 0, 0.1), 0 0 20px ${primaryColor}20`,
            maxHeight: isMinimized ? '4rem' : maxHeight,
            height: isMinimized ? '4rem' : 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
          role="document"
        >
          {/* Header */}
          <div 
            className="p-4 text-white flex items-center justify-between flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <Bot className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="font-bold truncate">Assistente IA</h3>
                <p className="text-xs opacity-90 truncate">{companyName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                title={isMinimized ? "Maximizar" : "Minimizar"}
                aria-label={isMinimized ? "Maximizar" : "Minimizar"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Minimize2 className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                title="Fechar"
                aria-label="Fechar assistente"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Error Message */}
              {error && (
                <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Fechar mensagem de erro"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Messages Area */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
                style={{ maxHeight: '380px' }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    role="article"
                    aria-label={`Mensagem de ${message.sender === 'user' ? 'você' : 'assistente'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 ${
                        message.sender === 'user'
                          ? 'rounded-tr-none text-white'
                          : 'rounded-tl-none bg-gray-100 text-gray-800'
                      }`}
                      style={message.sender === 'user' ? { backgroundColor: primaryColor } : {}}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender === 'assistant' ? (
                          <Bot className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <User className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span className="text-xs font-medium">
                          {message.sender === 'assistant' ? 'Assistente' : 'Você'}
                        </span>
                        <Clock className="w-3 h-3 opacity-70" aria-hidden="true" />
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm break-words">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start" role="status" aria-live="polite">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" aria-hidden="true" />
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span className="text-sm">Analisando dados...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} aria-hidden="true" />
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="mb-2">
                  <p className="text-xs text-gray-600 font-medium mb-1" id="quick-actions-label">
                    Ações Rápidas:
                  </p>
                  <div 
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-labelledby="quick-actions-label"
                  >
                    {quickActions.map((action, index) => (
                      <button
                        key={`${action.text}-${index}`}
                        onClick={() => handleQuickAction(action.text)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
                        disabled={isLoading}
                        title={action.description}
                        aria-label={action.description || action.text}
                      >
                        {action.icon}
                        <span>{action.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <button
                    onClick={clearConversation}
                    className="flex items-center space-x-1 hover:text-gray-800 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-1 py-0.5"
                    disabled={messages.length <= 1 || isLoading}
                    title="Limpar toda a conversa"
                    aria-label="Limpar conversa"
                  >
                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                    <span>Limpar conversa</span>
                  </button>
                  <span className="flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3" aria-hidden="true" />
                    <span>{messages.length} mensagem{messages.length !== 1 ? 's' : ''}</span>
                  </span>
                </div>
              </div>

              {/* Input Area */}
              <form 
                onSubmit={handleSendMessage} 
                className="p-4 border-t border-gray-200 flex-shrink-0"
              >
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pergunte sobre os dados do dashboard..."
                    className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    disabled={isLoading}
                    aria-label="Digite sua mensagem"
                    aria-describedby="input-help-text"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-offset-2"
                    style={{ 
                      backgroundColor: primaryColor,
                      color: 'white'
                    }}
                    title="Enviar mensagem"
                    aria-label="Enviar mensagem"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <p 
                  id="input-help-text" 
                  className="text-xs text-gray-500 mt-2 text-center"
                >
                  Pressione Enter para enviar • Shift+Enter para nova linha
                  {inputMessage.length > 0 && (
                    <span className="block">Caracteres: {inputMessage.length}/500</span>
                  )}
                </p>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;