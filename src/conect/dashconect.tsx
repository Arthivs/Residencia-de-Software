// src/conect/dashconect.tsx - VERSÃO SIMPLIFICADA
import React, { createContext, useContext, useState, useEffect } from "react";

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
  limparErro: () => void;
}

// Dados mockados
const dadosMockados: DashboardData = {
  tarefas: [
    {
      id: '1',
      titulo: 'Reunião com lideranças comunitárias do Jardins',
      descricao: 'Discutir melhorias para o bairro e ouvir demandas da população',
      status: 'concluido',
      responsavel: 'João Silva',
      prioridade: 'alta',
      dataCriacao: new Date('2024-01-10'),
      dataPrazo: new Date('2024-01-15'),
      dataConclusao: new Date('2024-01-14'),
      progresso: 100,
      categorias: ['Reunião', 'Comunidade']
    },
    {
      id: '2',
      titulo: 'Visita técnica para vistoria de buracos na via',
      descricao: 'Verificar situação das ruas no São Conrado e solicitar reparos',
      status: 'andamento',
      responsavel: 'Maria Santos',
      prioridade: 'media',
      dataCriacao: new Date('2024-01-12'),
      dataPrazo: new Date('2024-02-15'),
      progresso: 60,
      categorias: ['Infraestrutura', 'Vistoria']
    },
    {
      id: '3',
      titulo: 'Elaborar relatório trimestral de atividades',
      descricao: 'Compilar todas as ações realizadas no último trimestre',
      status: 'pendente',
      responsavel: 'Pedro Costa',
      prioridade: 'media',
      dataCriacao: new Date('2024-01-18'),
      dataPrazo: new Date('2024-02-01'),
      progresso: 20,
      categorias: ['Administrativo', 'Relatório']
    }
  ],
  acoes: [
    {
      id: '1',
      titulo: 'Ação social de distribuição de cestas básicas',
      tipo: 'Ação Social',
      descricao: 'Distribuição de 200 cestas básicas para famílias carentes do bairro Jardins',
      data: '2024-01-15',
      bairro: 'Jardins',
      cidade: 'Aracaju',
      estado: 'SE',
      lat: -10.9452,
      lng: -37.0728,
      endereco: 'Praça Central do Jardins',
      dataCriacao: new Date('2024-01-15'),
      status: 'concluida'
    },
    {
      id: '2',
      titulo: 'Fiscalização de comércio irregular',
      tipo: 'Fiscalização',
      descricao: 'Vistoria em estabelecimentos comerciais operando sem alvará',
      data: '2024-01-18',
      bairro: 'São Conrado',
      cidade: 'Aracaju',
      estado: 'SE',
      lat: -10.9385,
      lng: -37.0512,
      endereco: 'Rua Comercial Principal',
      dataCriacao: new Date('2024-01-18'),
      status: 'em_andamento'
    }
  ],
  financeiro: [
    {
      id: '1',
      data: '2024-01-15',
      descricao: 'Locação do imóvel para gabinete',
      categoria: 'Locação',
      valor: 40000,
      tipo: 'despesa',
      formaPagamento: 'Transferência',
      dataCriacao: new Date('2024-01-15'),
      tags: ['gabinete', 'fixo']
    },
    {
      id: '2',
      data: '2024-01-10',
      descricao: 'Assessoria jurídica mensal',
      categoria: 'Assessoria',
      valor: 20000,
      tipo: 'despesa',
      formaPagamento: 'Transferência',
      dataCriacao: new Date('2024-01-10'),
      tags: ['assessoria', 'mensal']
    }
  ],
  estatisticas: {
    totalTarefas: 3,
    tarefasConcluidas: 1,
    tarefasAndamento: 1,
    tarefasPendentes: 1,
    porcentagemConcluidas: 33,
    prazoMedio: 15,
    eficiencia: 85,
    totalAcoes: 2,
    acoesPorTipo: [
      { tipo: 'Ação Social', quantidade: 1 },
      { tipo: 'Fiscalização', quantidade: 1 }
    ],
    bairrosAtendidos: 2,
    acoesEsteMes: 2,
    totalGasto: 60000,
    totalReceita: 0,
    saldo: -60000,
    gastoPorCategoria: [
      { categoria: 'Locação', valor: 40000 },
      { categoria: 'Assessoria', valor: 20000 }
    ],
    evolucaoMensal: [
      { mes: 'Jan', receita: 0, despesa: 60000 }
    ],
    atividadesRecentes: [
      { tipo: 'tarefa', descricao: 'Tarefa "Reunião com lideranças" concluída', data: new Date('2024-01-14') },
      { tipo: 'acao', descricao: 'Ação social realizada no Jardins', data: new Date('2024-01-15') }
    ],
    alertas: [
      { tipo: 'warning', mensagem: '1 tarefa próxima do prazo', data: new Date('2024-01-18') }
    ]
  }
};

// Criar o Context
const DashConectContext = createContext<DashConectType | undefined>(undefined);

export const DashConectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<DashboardData>(dadosMockados);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar dados
  const fetchDataFromBackend = async () => {
    try {
      setLoading(true);
      setError(null);
      // Usar dados mockados
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      setData(dadosMockados);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Usando dados locais.');
      setData(dadosMockados);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao iniciar
  useEffect(() => {
    fetchDataFromBackend();
  }, []);

  const limparErro = () => setError(null);

  const value: DashConectType = {
    data,
    loading,
    error,
    recarregarDados: fetchDataFromBackend,
    limparErro
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