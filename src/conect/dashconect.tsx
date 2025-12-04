import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../services/api";
import { authService } from "../services/authService";
import { realTimeService } from "../services/realTimeService";
import type { RealTimeEvent } from "../services/realTimeService";

// Tipos dos dados
export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: "pendente" | "andamento" | "concluido";
  responsavel: string;
  prioridade: "baixa" | "media" | "alta";
  dataCriacao: string; 
   dataPrazo?: string;
 dataConclusao?: string;
  progresso: number;
  categorias?: string[];
}

export interface Acao {
  id: string;
  titulo: string;
  tipo: string;
  descricao?: string;
  data: string;
  bairro: string;
  cidade: string;
  estado: string;
  lat: number;
  lng: number;
  endereco?: string;
  dataCriacao: string;
  fotos?: string[];
  status: "planejada" | "em_andamento" | "concluida" | "cancelada";
}

export interface RegistroFinanceiro {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  tipo: "despesa" | "receita";
  formaPagamento: string;
  comprovante?: string;
  dataCriacao: string;
  tags?: string[];
}

export interface DashboardData {
  tarefas: Tarefa[];
  acoes: Acao[];
  financeiro: RegistroFinanceiro[];
  estatisticas: {
    totalTarefas: number;
    tarefasConcluidas: number;
    tarefasAndamento: number;
    tarefasPendentes: number;
    porcentagemConcluidas: number;
    prazoMedio: number;
    eficiencia: number;
    totalAcoes: number;
    acoesPorTipo: { tipo: string; quantidade: number }[];
    bairrosAtendidos: number;
    acoesEsteMes: number;
    totalGasto: number;
    totalReceita: number;
    saldo: number;
    gastoPorCategoria: { categoria: string; valor: number }[];
    evolucaoMensal: { mes: string; receita: number; despesa: number }[];
    atividadesRecentes: any[];
    alertas: any[];
  };
}

interface DashConectType {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  recarregarDados: () => Promise<void>;
  atualizarTarefas: (tarefas: Tarefa[]) => void;
  atualizarFinanceiro: (financeiro: RegistroFinanceiro[]) => void;
  atualizarAcoes: (acoes: Acao[]) => void;
  limparErro: () => void;
  user: any | null;
  logout: () => void;
  webSocketStatus: {
    connected: boolean;
    connecting: boolean;
    hasConnected: boolean;
    reconnectAttempts: number;
  };
  // NOVAS FUNÇÕES PARA SINCRONIZAÇÃO
  removerTarefa: (id: string) => void;
  removerAcao: (id: string) => void;
  removerRegistroFinanceiro: (id: string) => void;
  sincronizarDashboard: (tipo: 'tarefas' | 'acoes' | 'financeiro') => Promise<void>;
}

// Dados iniciais
const dadosIniciais: DashboardData = {
  tarefas: [],
  acoes: [],
  financeiro: [],
  estatisticas: {
    totalTarefas: 0,
    tarefasConcluidas: 0,
    tarefasAndamento: 0,
    tarefasPendentes: 0,
    porcentagemConcluidas: 0,
    prazoMedio: 0,
    eficiencia: 0,
    totalAcoes: 0,
    acoesPorTipo: [],
    bairrosAtendidos: 0,
    acoesEsteMes: 0,
    totalGasto: 0,
    totalReceita: 0,
    saldo: 0,
    gastoPorCategoria: [],
    evolucaoMensal: [],
    atividadesRecentes: [],
    alertas: []
  }
};

// Criar o Context
const DashConectContext = createContext<DashConectType | undefined>(undefined);

export const DashConectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<DashboardData>(dadosIniciais);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [webSocketStatus, setWebSocketStatus] = useState({
    connected: false,
    connecting: false,
    hasConnected: false,
    reconnectAttempts: 0
  });

  // Refs para controle de loops
  const isMounted = useRef(true);
  const unsubscribeRefs = useRef<(() => void)[]>([]);
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownWebSocketWarning = useRef(false);
  const lastUpdateRef = useRef<number>(0);

  // Atualizar status do WebSocket
  const updateWebSocketStatus = useCallback(() => {
    if (!isMounted.current) return;
    setWebSocketStatus(realTimeService.getStatus());
  }, []);

  // Função para calcular estatísticas dos mini-dashboards
  const calcularEstatisticas = useCallback((currentData: DashboardData) => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    
    // Calcular estatísticas das ações
    const totalAcoes = currentData.acoes.length;
    const bairrosSet = new Set(currentData.acoes.map(a => a.bairro).filter(Boolean));
    const acoesEsteMes = currentData.acoes.filter(a => {
      try {
        const dataAcao = new Date(a.data);
        return dataAcao.getMonth() === mesAtual && dataAcao.getFullYear() === anoAtual;
      } catch {
        return false;
      }
    }).length;
    
    // Calcular tipos de ações
    const tipoMap = new Map<string, number>();
    currentData.acoes.forEach(acao => {
      const tipo = acao.tipo || 'Outro';
      tipoMap.set(tipo, (tipoMap.get(tipo) || 0) + 1);
    });
    const acoesPorTipo = Array.from(tipoMap.entries()).map(([tipo, quantidade]) => ({
      tipo,
      quantidade
    }));
    
    // Calcular estatísticas financeiras
    const totalGasto = currentData.financeiro
      .filter(f => f.tipo === 'despesa')
      .reduce((sum, f) => sum + f.valor, 0);
    
    const totalReceita = currentData.financeiro
      .filter(f => f.tipo === 'receita')
      .reduce((sum, f) => sum + f.valor, 0);
    
    // Calcular gastos por categoria
    const categoriaMap = new Map<string, number>();
    currentData.financeiro
      .filter(f => f.tipo === 'despesa')
      .forEach(f => {
        const categoria = f.categoria || 'Outros';
        categoriaMap.set(categoria, (categoriaMap.get(categoria) || 0) + f.valor);
      });
    const gastoPorCategoria = Array.from(categoriaMap.entries()).map(([categoria, valor]) => ({
      categoria,
      valor
    }));
    
    return {
      totalAcoes,
      bairrosAtendidos: bairrosSet.size,
      acoesPorTipo,
      acoesEsteMes,
      totalGasto,
      totalReceita,
      saldo: totalReceita - totalGasto,
      gastoPorCategoria
    };
  }, []);

  // Função para buscar dados COM ATUALIZAÇÃO DOS MINI-DASHBOARDS
  const fetchDataFromBackend = useCallback(async (force = false) => {
    // Cancelar timeout anterior se existir
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }

    if (!authService.isAuthenticated()) {
      console.log('⚠️ Usuário não autenticado, limpando dados');
      setData(dadosIniciais);
      return;
    }

    // Evitar múltiplas requisições simultâneas
    if (isFetching.current && !force) {
      console.log('⚠️ Fetch já em andamento, ignorando...');
      return;
    }

    // Rate limiting - não atualizar mais de uma vez a cada 2 segundos
    const now = Date.now();
    if (now - lastUpdateRef.current < 2000 && !force) {
      console.log('⏱️ Rate limiting: aguardando antes de nova atualização');
      return;
    }

    try {
      isFetching.current = true;
      lastUpdateRef.current = now;
      setLoading(true);
      
      console.log('📊 Buscando dados do dashboard...');
      const dashboardData = await apiService.dashboard.getDashboardData();
      
      if (!isMounted.current) return;

      console.log('✅ Dados recebidos:', {
        tarefas: dashboardData.tarefas?.length || 0,
        financeiro: dashboardData.financeiro?.length || 0,
        acoes: dashboardData.acoes?.length || 0
      });

      // Transformar dados (compatível com SQLite e PostgreSQL)
      const transformedData: DashboardData = {
        tarefas: (dashboardData.tarefas || []).map((t: any) => ({
          id: t.id?.toString() || '',
          titulo: t.titulo || '',
          descricao: t.descricao,
          status: ((t.status || 'pendente').toLowerCase()) as "pendente" | "andamento" | "concluido",
          responsavel: t.responsavel || '',
          prioridade: ((t.prioridade || 'media').toLowerCase()) as "baixa" | "media" | "alta",
          dataCriacao: new Date(t.data_criacao || t.createdAt || Date.now()),
          dataPrazo: t.data_prazo || t.dataPrazo ? new Date(t.data_prazo || t.dataPrazo) : undefined,
          dataConclusao: t.data_conclusao || t.dataConclusao ? new Date(t.data_conclusao || t.dataConclusao) : undefined,
          progresso: t.progresso || 0,
          categorias: Array.isArray(t.categorias) ? t.categorias : 
                     (t.categorias ? t.categorias.split(',').map((c: string) => c.trim()).filter((c: string) => c) : [])
        })),
        
        financeiro: (dashboardData.financeiro || []).map((f: any) => ({
          id: f.id?.toString() || '',
          data: f.data || new Date().toISOString().split('T')[0],
          descricao: f.descricao || '',
          categoria: f.categoria || '',
          valor: parseFloat(f.valor) || 0,
          tipo: ((f.tipo || 'despesa').toLowerCase()) as "despesa" | "receita",
          formaPagamento: f.forma_pagamento || f.formaPagamento || '',
          comprovante: f.comprovante,
          dataCriacao: new Date(f.data_criacao || f.createdAt || Date.now()),
          tags: Array.isArray(f.tags) ? f.tags : (f.tags ? JSON.parse(f.tags) : [])
        })),
        
        acoes: (dashboardData.acoes || []).map((a: any) => ({
          id: a.id?.toString() || '',
          titulo: a.titulo || '',
          tipo: a.tipo || '',
          descricao: a.descricao,
          data: a.data || new Date().toISOString().split('T')[0],
          bairro: a.bairro || '',
          cidade: a.cidade || '',
          estado: a.estado || '',
          lat: parseFloat(a.lat) || 0,
          lng: parseFloat(a.lng) || 0,
          endereco: a.endereco,
          dataCriacao: new Date(a.data_criacao || a.createdAt || Date.now()),
          fotos: Array.isArray(a.fotos) ? a.fotos : (a.fotos ? JSON.parse(a.fotos) : []),
          status: ((a.status || 'planejada').toLowerCase().replace(' ', '_')) as "planejada" | "em_andamento" | "concluida" | "cancelada"
        })),
        
        estatisticas: dashboardData.estatisticas ? {
          totalTarefas: dashboardData.estatisticas.totalTarefas || 0,
          tarefasConcluidas: dashboardData.estatisticas.tarefasConcluidas || 0,
          tarefasAndamento: dashboardData.estatisticas.tarefasAndamento || 0,
          tarefasPendentes: dashboardData.estatisticas.tarefasPendentes || 0,
          porcentagemConcluidas: dashboardData.estatisticas.porcentagemConcluidas || 0,
          prazoMedio: dashboardData.estatisticas.prazoMedio || 0,
          eficiencia: dashboardData.estatisticas.eficiencia || 0,
          totalAcoes: dashboardData.estatisticas.totalAcoes || 0,
          acoesPorTipo: dashboardData.estatisticas.acoesPorTipo || [],
          bairrosAtendidos: dashboardData.estatisticas.bairrosAtendidos || 0,
          acoesEsteMes: dashboardData.estatisticas.acoesEsteMes || 0,
          totalGasto: dashboardData.estatisticas.totalGasto || 0,
          totalReceita: dashboardData.estatisticas.totalReceita || 0,
          saldo: dashboardData.estatisticas.saldo || 0,
          gastoPorCategoria: dashboardData.estatisticas.gastoPorCategoria || [],
          evolucaoMensal: dashboardData.estatisticas.evolucaoMensal || [],
          atividadesRecentes: dashboardData.estatisticas.atividadesRecentes || [],
          alertas: dashboardData.estatisticas.alertas || []
        } : dadosIniciais.estatisticas
      };
      
      // Calcular estatísticas atualizadas dos mini-dashboards
      const novasEstatisticas = calcularEstatisticas(transformedData);
      
      setData({
        ...transformedData,
        estatisticas: {
          ...transformedData.estatisticas,
          ...novasEstatisticas
        }
      });
      
      setUser(authService.getUser());
      
      hasInitialized.current = true;
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar dados:', err);
      if (isMounted.current) {
        setError(err.message || 'Erro ao carregar dados do servidor');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        // Delay para evitar requisições muito rápidas
        setTimeout(() => {
          isFetching.current = false;
        }, 1000);
      }
    }
  }, [calcularEstatisticas]);

  // Funções para atualizar partes específicas dos dados
  const atualizarTarefas = useCallback((novasTarefas: Tarefa[]) => {
    setData(prev => {
      const tarefasConcluidas = novasTarefas.filter(t => t.status === 'concluido').length;
      const totalTarefas = novasTarefas.length;
      
      // Calcular estatísticas atualizadas
      const novasEstatisticas = calcularEstatisticas({
        ...prev,
        tarefas: novasTarefas
      });
      
      return {
        ...prev,
        tarefas: novasTarefas,
        estatisticas: {
          ...prev.estatisticas,
          ...novasEstatisticas,
          totalTarefas,
          tarefasConcluidas,
          tarefasAndamento: novasTarefas.filter(t => t.status === 'andamento').length,
          tarefasPendentes: novasTarefas.filter(t => t.status === 'pendente').length,
          porcentagemConcluidas: totalTarefas > 0 
            ? Math.round((tarefasConcluidas / totalTarefas) * 100)
            : 0
        }
      };
    });
  }, [calcularEstatisticas]);

  const atualizarFinanceiro = useCallback((novosFinanceiros: RegistroFinanceiro[]) => {
    setData(prev => {
      const totalGasto = novosFinanceiros
        .filter(f => f.tipo === 'despesa')
        .reduce((sum, f) => sum + f.valor, 0);
      const totalReceita = novosFinanceiros
        .filter(f => f.tipo === 'receita')
        .reduce((sum, f) => sum + f.valor, 0);
      
      // Calcular estatísticas atualizadas
      const novasEstatisticas = calcularEstatisticas({
        ...prev,
        financeiro: novosFinanceiros
      });
      
      return {
        ...prev,
        financeiro: novosFinanceiros,
        estatisticas: {
          ...prev.estatisticas,
          ...novasEstatisticas,
          totalGasto,
          totalReceita,
          saldo: totalReceita - totalGasto
        }
      };
    });
  }, [calcularEstatisticas]);

  const atualizarAcoes = useCallback((novasAcoes: Acao[]) => {
    setData(prev => {
      // Calcular estatísticas atualizadas
      const novasEstatisticas = calcularEstatisticas({
        ...prev,
        acoes: novasAcoes
      });
      
      return {
        ...prev,
        acoes: novasAcoes,
        estatisticas: {
          ...prev.estatisticas,
          ...novasEstatisticas,
          totalAcoes: novasAcoes.length,
          // As outras estatísticas já estão em novasEstatisticas
        }
      };
    });
  }, [calcularEstatisticas]);

  // NOVAS FUNÇÕES PARA REMOVER DADOS
  const removerTarefa = useCallback((id: string) => {
    setData(prev => {
      const novasTarefas = prev.tarefas.filter(t => t.id !== id);
      
      // Calcular estatísticas atualizadas
      const novasEstatisticas = calcularEstatisticas({
        ...prev,
        tarefas: novasTarefas
      });
      
      return {
        ...prev,
        tarefas: novasTarefas,
        estatisticas: {
          ...prev.estatisticas,
          ...novasEstatisticas,
          totalTarefas: Math.max(0, novasTarefas.length)
        }
      };
    });
  }, [calcularEstatisticas]);

  const removerAcao = useCallback((id: string) => {
    setData(prev => {
      const novasAcoes = prev.acoes.filter(a => a.id !== id);
      
      // Calcular estatísticas atualizadas
      const novasEstatisticas = calcularEstatisticas({
        ...prev,
        acoes: novasAcoes
      });
      
      return {
        ...prev,
        acoes: novasAcoes,
        estatisticas: {
          ...prev.estatisticas,
          ...novasEstatisticas,
          totalAcoes: Math.max(0, novasAcoes.length)
        }
      };
    });
  }, [calcularEstatisticas]);

  const removerRegistroFinanceiro = useCallback((id: string) => {
    setData(prev => {
      const registro = prev.financeiro.find(f => f.id === id);
      if (!registro) return prev;
      
      const novosFinanceiros = prev.financeiro.filter(f => f.id !== id);
      
      // Calcular estatísticas atualizadas
      const novasEstatisticas = calcularEstatisticas({
        ...prev,
        financeiro: novosFinanceiros
      });
      
      return {
        ...prev,
        financeiro: novosFinanceiros,
        estatisticas: {
          ...prev.estatisticas,
          ...novasEstatisticas
        }
      };
    });
  }, [calcularEstatisticas]);

  // Função para sincronizar dashboard
  const sincronizarDashboard = useCallback(async (tipo: 'tarefas' | 'acoes' | 'financeiro') => {
    console.log(`🔄 Sincronizando dashboard após exclusão de ${tipo}`);
    await fetchDataFromBackend(true);
  }, [fetchDataFromBackend]);

  // Handler para eventos WebSocket - ATUALIZAÇÃO AUTOMÁTICA
  const handleWebSocketEvent = useCallback((event: RealTimeEvent) => {
    console.log(`📡 Evento WebSocket recebido: ${event.type}`, event.data);
    
    // Cancelar timeout anterior
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Debounce de 500ms para agrupar múltiplos eventos
    updateTimeoutRef.current = setTimeout(() => {
      console.log(`🔄 Atualizando dashboard devido ao evento: ${event.type}`);
      fetchDataFromBackend(true);
    }, 500);
  }, [fetchDataFromBackend]);

  // Setup de listeners do WebSocket
  const setupWebSocketListeners = useCallback(() => {
    // Limpar listeners anteriores
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];

    console.log('🔌 Configurando listeners WebSocket...');

    // Registrar handlers para todos os eventos relevantes
    const eventos = [
      'dashboard:atualizar',
      'tarefa:criada',
      'tarefa:atualizada',
      'tarefa:excluida',
      'financeiro:criado',
      'financeiro:excluido',
      'acao:criada',
      'acao:atualizada',
      'acao:excluida'
    ];

    eventos.forEach(evento => {
      const unsubscribe = realTimeService.on(evento, handleWebSocketEvent);
      unsubscribeRefs.current.push(unsubscribe);
    });

    console.log(`✅ ${unsubscribeRefs.current.length} listeners WebSocket configurados`);
  }, [handleWebSocketEvent]);

  // Efeito principal de inicialização
  useEffect(() => {
    isMounted.current = true;
    
    const initialize = async () => {
      const currentUser = authService.getUser();
      setUser(currentUser);
      
      if (currentUser && !hasInitialized.current) {
        try {
          console.log('🚀 Inicializando dashboard...');
          
          // Pequeno delay para evitar inicialização muito rápida
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 1. Carregar dados iniciais
          await fetchDataFromBackend();
          
          // 2. Tentar conectar WebSocket
          console.log('🔌 Tentando conectar WebSocket...');
          try {
            await realTimeService.connect();
            updateWebSocketStatus();
            setupWebSocketListeners();
            console.log('✅ WebSocket conectado com sucesso');
          } catch (wsError: any) {
            if (!hasShownWebSocketWarning.current) {
              console.warn('⚠️ WebSocket não conectado, continuando sem atualizações em tempo real:', 
                wsError?.message || 'Erro desconhecido');
              hasShownWebSocketWarning.current = true;
            }
            // Não marcar como erro fatal, continuar sem WebSocket
          }
          
          hasInitialized.current = true;
          console.log('✅ Dashboard inicializado com sucesso');
          
        } catch (error) {
          console.error('❌ Erro na inicialização:', error);
          // Não propagar erro para não quebrar a aplicação
        }
      }
    };

    // Usar timeout para garantir execução única
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }
    
    initTimeoutRef.current = setTimeout(() => {
      if (!hasInitialized.current) {
        initialize();
      }
    }, 100);

    // Cleanup
    return () => {
      isMounted.current = false;
      
      // Limpar todos os timeouts
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      
      // Desconectar WebSocket e limpar listeners
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
      unsubscribeRefs.current = [];
      realTimeService.disconnect();
    };
  }, [fetchDataFromBackend, setupWebSocketListeners, updateWebSocketStatus]);

  // Efeito para verificar autenticação
  useEffect(() => {
    if (!isMounted.current) return;

    // Verificar autenticação apenas quando necessário
    const checkAuth = () => {
      const currentUser = authService.getUser();
      
      if (!currentUser && user) {
        // Usuário foi deslogado
        console.log('👤 Usuário deslogado, limpando dados...');
        setUser(null);
        setData(dadosIniciais);
        realTimeService.disconnect();
        unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
        unsubscribeRefs.current = [];
        hasInitialized.current = false;
        hasShownWebSocketWarning.current = false;
      }
    };

    // Verificar apenas a cada 30 segundos
    const authInterval = setInterval(checkAuth, 30000);

    return () => {
      clearInterval(authInterval);
    };
  }, [user]);

  // Monitorar status do WebSocket
  useEffect(() => {
    if (!isMounted.current) return;

    const interval = setInterval(() => {
      updateWebSocketStatus();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [updateWebSocketStatus]);

  const limparErro = () => setError(null);
  
  const logout = useCallback(() => {
    console.log('👋 Logout solicitado');
    authService.logout();
    realTimeService.disconnect();
    setUser(null);
    setData(dadosIniciais);
    setWebSocketStatus({
      connected: false,
      connecting: false,
      hasConnected: false,
      reconnectAttempts: 0
    });
    
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];
    hasInitialized.current = false;
    hasShownWebSocketWarning.current = false;
    
    // Limpar timeouts
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    
    console.log('✅ Logout completo');
  }, []);

  const recarregarDados = useCallback(async () => {
    console.log('🔃 Recarregando dados manualmente...');
    await fetchDataFromBackend(true);
  }, [fetchDataFromBackend]);

  const value: DashConectType = {
    data,
    loading,
    error,
    recarregarDados,
    atualizarTarefas,
    atualizarFinanceiro,
    atualizarAcoes,
    limparErro,
    user,
    logout,
    webSocketStatus,
    removerTarefa,
    removerAcao,
    removerRegistroFinanceiro,
    sincronizarDashboard,
  };

  return (
    <DashConectContext.Provider value={value}>
      {children}
    </DashConectContext.Provider>
  );
};

// Hook para usar o contexto
export const useDashConect = () => {
  const context = useContext(DashConectContext);
  if (!context) {
    throw new Error("useDashConect deve ser usado dentro de um DashConectProvider");
  }
  return context;
};