import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  MessageSquare, 
  HelpCircle, 
  User,
  Clock,
  BarChart3,
  Zap,
  Users,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  FileText,
  Activity
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'question' | 'summary' | 'general';
}

const AssistenteIA: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Como posso ajudar',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'general'
    },
    {
      id: '2',
      content: 'Preciso de um resumo do relatório',
      sender: 'user',
      timestamp: new Date(),
      type: 'question'
    },
    {
      id: '3',
      content: 'Claro! Vou gerar o resumo para você.',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'summary'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const faqs = [
    'Como gerar relatórios?',
    'Quais métricas estão disponíveis?',
    'Como exportar os dados?',
    'Posso personalizar o dashboard?',
    'Qual o período máximo de análise?',
    'Como compartilhar relatórios?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'question'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simula resposta da IA
    setTimeout(() => {
      const aiResponses = [
        "Analisando sua solicitação...",
        "Processando os dados disponíveis...",
        "Com base nas informações do sistema...",
        "Gerando insights personalizados..."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `${randomResponse} Em um ambiente real, isso se conectaria à API da OpenAI para análise completa.`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'summary'
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFAQClick = (faq: string) => {
    setInputMessage(faq);
  };

  const handleQuickAction = (action: string) => {
    const quickMessage: Message = {
      id: Date.now().toString(),
      content: action,
      sender: 'user',
      timestamp: new Date(),
      type: 'question'
    };

    setMessages(prev => [...prev, quickMessage]);
    setIsTyping(true);

    // Resposta automática para ações rápidas
    setTimeout(() => {
      let response = '';
      
      switch(action) {
        case 'Preciso de um resumo do relatório':
          response = 'Analisando os últimos dados disponíveis... O relatório mostra crescimento de 15% nas conversões este mês. Posso detalhar mais alguma métrica específica?';
          break;
        case 'Análise de performance':
          response = 'A página principal tem 92% de performance. Sugiro otimizar as imagens para ganhar mais 5%.';
          break;
        case 'Dados de usuários':
          response = 'Taxa de retenção: 78%. Tempo médio de sessão: 4m 32s. Usuários ativos: 1,245';
          break;
        case 'Problemas detectados':
          response = 'Identifiquei 3 áreas que precisam de atenção: tempo de carregamento, taxa de rejeição e experiência móvel.';
          break;
        default:
          response = 'Processando sua solicitação. Em instantes terei o relatório completo.';
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'summary'
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-6 bg-white rounded-2xl shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Assistente IA</h1>
              <p className="text-gray-600 mt-1">
                Interaja com o assistente inteligente para obter respostas rápidas e apoio nas suas tarefas
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <MessageSquare className="w-4 h-4" />
            <span>{messages.length} interações</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chat Container */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[600px] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {message.sender === 'assistant' ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {message.sender === 'assistant' ? 'Assistente IA' : 'Você'}
                        </span>
                        <Clock className="w-3 h-3 opacity-75" />
                        <span className="text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.type === 'summary' && (
                        <div className="mt-3 pt-3 border-t border-white/20 flex items-center space-x-2">
                          <FileText className="w-3 h-3" />
                          <span className="text-xs font-medium px-2 py-1 bg-white/20 rounded">
                            Resumo Gerado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none p-4">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleQuickAction('Preciso de um resumo do relatório')}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Resumo do Relatório</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('Análise de performance')}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Análise de Performance</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('Dados de usuários')}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Dados de Usuários</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('Problemas detectados')}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Problemas Detectados</span>
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Digite sua pergunta aqui..."
                      className="w-full p-4 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      aria-label="Enviar mensagem"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* FAQ Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-[600px] flex flex-col">
              <div className="flex items-center space-x-3 mb-6">
                <HelpCircle className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-800">Dúvidas Frequentes</h2>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto">
                {faqs.map((faq, index) => (
                  <button
                    key={index}
                    onClick={() => handleFAQClick(faq)}
                    className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 group-hover:text-gray-900 font-medium">
                        {faq}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Stats Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">94%</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Precisão</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">2.3s</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Resposta Média</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <Bot className="w-5 h-5" />
                  <span className="text-sm">Assistente IA • Conectado</span>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">
                  As respostas são geradas por IA e podem conter imprecisões
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistenteIA;