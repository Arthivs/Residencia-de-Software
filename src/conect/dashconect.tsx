// frontend/src/conect/dashconect.tsx - VERSÃO FINAL OTIMIZADA
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../services/api";
import { authService } from "../services/authService";
import { realTimeService } from "../services/realTimeService";

// Tipos dos dados
export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: "pendente" | "andamento" | "concluido";
  responsavel: string;
  prioridade: "baixa" | "media" | "alta";
  dataCriacao: Date;
  dataPrazo?: Date;
  dataConclusao?: Date;
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
  dataCriacao: Date;
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
  dataCriacao: Date;
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

  // Refs para controle
  const isMounted = useRef(true);
  const unsubscribeRefs = useRef<(() => void)[]>([]);
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);

  // Função para buscar dados
  const fetchDataFromBackend = useCallback(async (force = false) => {
    if (!authService.isAuthenticated()) {
      setData(dadosIniciais);
      return;
    }

    // Evitar múltiplas requisições simultâneas
    if (isFetching.current && !force) {
      console.log('⚠️ Fetch já em andamento');
      return;
    }

    try {
      isFetching.current = true;
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
      
      setData(transformedData);
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
        isFetching.current = false;
      }
    }
  }, []);

  // Funções para atualizar partes específicas dos dados
  const atualizarTarefas = useCallback((novasTarefas: Tarefa[]) => {
    setData(prev => {
      const tarefasConcluidas = novasTarefas.filter(t => t.status === 'concluido').length;
      const totalTarefas = novasTarefas.length;
      
      return {
        ...prev,
        tarefas: novasTarefas,
        estatisticas: {
          ...prev.estatisticas,
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
  }, []);

  const atualizarFinanceiro = useCallback((novosFinanceiros: RegistroFinanceiro[]) => {
    setData(prev => {
      const totalGasto = novosFinanceiros
        .filter(f => f.tipo === 'despesa')
        .reduce((sum, f) => sum + f.valor, 0);
      const totalReceita = novosFinanceiros
        .filter(f => f.tipo === 'receita')
        .reduce((sum, f) => sum + f.valor, 0);
      
      return {
        ...prev,
        financeiro: novosFinanceiros,
        estatisticas: {
          ...prev.estatisticas,
          totalGasto,
          totalReceita,
          saldo: totalReceita - totalGasto
        }
      };
    });
  }, []);

  const atualizarAcoes = useCallback((novasAcoes: Acao[]) => {
    setData(prev => {
      const bairrosSet = new Set<string>();
      const tipoMap = new Map<string, number>();
      const agora = new Date();
      
      let acoesEsteMes = 0;
      
      novasAcoes.forEach(acao => {
        if (acao.bairro) bairrosSet.add(acao.bairro);
        
        const tipo = acao.tipo || 'Outro';
        tipoMap.set(tipo, (tipoMap.get(tipo) || 0) + 1);
        
        try {
          const dataAcao = new Date(acao.data);
          if (dataAcao.getMonth() === agora.getMonth() && 
              dataAcao.getFullYear() === agora.getFullYear()) {
            acoesEsteMes++;
          }
        } catch (e) {
          // Ignora datas inválidas
        }
      });
      
      const acoesPorTipo = Array.from(tipoMap.entries()).map(([tipo, quantidade]) => ({
        tipo,
        quantidade
      }));
      
      return {
        ...prev,
        acoes: novasAcoes,
        estatisticas: {
          ...prev.estatisticas,
          totalAcoes: novasAcoes.length,
          bairrosAtendidos: bairrosSet.size,
          acoesPorTipo,
          acoesEsteMes
        }
      };
    });
  }, []);

  // Setup de listeners do WebSocket
  const setupWebSocketListeners = useCallback(() => {
    // Limpar listeners anteriores
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];

    console.log('🔌 Configurando listeners WebSocket...');

    // Handler para atualização geral do dashboard
    const handleDashboardUpdate = () => {
      console.log('🔄 Evento: dashboard:atualizar');
      // Debounce para evitar múltiplas chamadas rápidas
      setTimeout(() => {
        fetchDataFromBackend(true);
      }, 500);
    };

    // Handler para tarefas
    const handleTarefaCriada = (event: any) => {
      console.log('📝 Evento: tarefa:criada');
      const novaTarefa: Tarefa = {
        id: event.data.id?.toString() || '',
        titulo: event.data.titulo || '',
        descricao: event.data.descricao,
        status: (event.data.status || 'pendente').toLowerCase() as "pendente" | "andamento" | "concluido",
        responsavel: event.data.responsavel || '',
        prioridade: (event.data.prioridade || 'media').toLowerCase() as "baixa" | "media" | "alta",
        dataCriacao: new Date(event.data.data_criacao || Date.now()),
        dataPrazo: event.data.data_prazo ? new Date(event.data.data_prazo) : undefined,
        dataConclusao: event.data.data_conclusao ? new Date(event.data.data_conclusao) : undefined,
        progresso: event.data.progresso || 0,
        categorias: Array.isArray(event.data.categorias) ? event.data.categorias : []
      };
      
      setData(prev => ({
        ...prev,
        tarefas: [novaTarefa, ...prev.tarefas]
      }));
    };

    // Registrar handlers
    const unsubscribeDashboard = realTimeService.on('dashboard:atualizar', handleDashboardUpdate);
    const unsubscribeTarefaCriada = realTimeService.on('tarefa:criada', handleTarefaCriada);
    const unsubscribeFinanceiroCriado = realTimeService.on('financeiro:criado', handleDashboardUpdate);
    const unsubscribeAcaoCriada = realTimeService.on('acao:criada', handleDashboardUpdate);

    unsubscribeRefs.current.push(
      unsubscribeDashboard,
      unsubscribeTarefaCriada,
      unsubscribeFinanceiroCriado,
      unsubscribeAcaoCriada
    );

    console.log(`✅ ${unsubscribeRefs.current.length} listeners WebSocket configurados`);
  }, [fetchDataFromBackend]);

  // Efeito principal de inicialização
  useEffect(() => {
    isMounted.current = true;
    
    const initialize = async () => {
      const currentUser = authService.getUser();
      setUser(currentUser);
      
      if (currentUser && !hasInitialized.current) {
        try {
          console.log('🚀 Inicializando dashboard...');
          // Carregar dados iniciais
          await fetchDataFromBackend();
          
          // Conectar WebSocket APÓS carregar dados iniciais
          console.log('🔌 Conectando WebSocket...');
          await realTimeService.connect();
          
          // Configurar listeners
          setupWebSocketListeners();
          
          hasInitialized.current = true;
          console.log('✅ Dashboard inicializado com sucesso');
          
        } catch (error) {
          console.error('❌ Erro na inicialização:', error);
        }
      }
    };

    initialize();

    // Cleanup
    return () => {
      isMounted.current = false;
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
      unsubscribeRefs.current = [];
      hasInitialized.current = false;
    };
  }, [fetchDataFromBackend, setupWebSocketListeners]);

  // Verificar autenticação periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
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
        
      } else if (currentUser && !user) {
        // Usuário logou (em outra aba)
        console.log('👤 Novo usuário detectado');
        setUser(currentUser);
        hasInitialized.current = false;
        // O efeito principal vai detectar a mudança
      }
    }, 15000); // Apenas a cada 15 segundos

    return () => clearInterval(interval);
  }, [user]);

  const limparErro = () => setError(null);
  
  const logout = useCallback(() => {
    console.log('👋 Logout solicitado');
    authService.logout();
    realTimeService.disconnect();
    setUser(null);
    setData(dadosIniciais);
    
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];
    hasInitialized.current = false;
    
    console.log('✅ Logout completo');
  }, []);

  const value: DashConectType = {
    data,
    loading,
    error,
    recarregarDados: () => fetchDataFromBackend(true),
    atualizarTarefas,
    atualizarFinanceiro,
    atualizarAcoes,
    limparErro,
    user,
    logout,
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