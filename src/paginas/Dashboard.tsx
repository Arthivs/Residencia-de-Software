import { useMemo } from "react";
import { useDashConect } from "../conect/dashconect";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from "recharts";
import {
  MapPin,
  ArrowRight,
  ClipboardList,
  Landmark,
  Eye,
  RefreshCw,
  AlertCircle,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Home
} from "lucide-react";

// Definir interfaces para as estatísticas
interface EstatisticasType {
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasAndamento: number;
  tarefasPendentes: number;
  porcentagemConcluidas: number;
  prazoMedio: number;
  eficiencia: number;
  totalAcoes: number;
  bairrosAtendidos: number;
  totalGasto: number;
  totalReceita: number;
  saldo: number;
  statusValues?: Array<{label: string, valor: number, cor: string}>;
  acoesPorTipo?: Array<{tipo: string, quantidade: number}>;
  gastoPorCategoria?: Array<{categoria: string, valor: number}>;
  evolucaoMensal?: Array<{mes: string, receita: number, despesa: number}>;
  responsaveis?: Array<{nome: string, valor: number}>;
  progressoTarefas?: Array<{mes: string, valor: number}>;
}

interface TarefaType {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  responsavel: string;
  prioridade: string;
  dataCriacao: string;
  dataPrazo?: string;
  progresso: number;
  categorias: string[];
}

interface AcaoType {
  id: string;
  titulo: string;
  tipo: string;
  descricao?: string;
  data: string;
  bairro: string;
  cidade: string;
  estado: string;
  lat?: number;
  lng?: number;
  endereco?: string;
  status: string;
}

interface FinanceiroType {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  tipo: 'despesa' | 'receita';
  formaPagamento: string;
  comprovante?: string;
  tags?: string[];
}

interface DashboardDataType {
  estatisticas: EstatisticasType;
  tarefas: TarefaType[];
  acoes: AcaoType[];
  financeiro: FinanceiroType[];
}

export default function Dashboard() {
  const { data, loading, recarregarDados, webSocketStatus } = useDashConect();
  const navigate = useNavigate();
  
  // Extrair dados com tipos definidos
  const { estatisticas = {} as EstatisticasType, tarefas = [], acoes = [], financeiro = [] } = data as DashboardDataType || {
    estatisticas: {} as EstatisticasType,
    tarefas: [],
    acoes: [],
    financeiro: []
  };

  // Desestruturar estatísticas com valores padrão
  const {
    totalTarefas = 0,
    tarefasConcluidas = 0,
    tarefasAndamento = 0,
    tarefasPendentes = 0,
    porcentagemConcluidas = 0,
    prazoMedio = 0,
    eficiencia = 0,
    totalAcoes = 0,
    bairrosAtendidos = 0,
    totalGasto = 0,
    totalReceita = 0,
    saldo = 0,
    statusValues = [],
    acoesPorTipo = [],
    gastoPorCategoria = [],
    evolucaoMensal = [],
    responsaveis = [],
    progressoTarefas = []
  } = estatisticas;

  // Função para formatar valores monetários
  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  // Gráfico pizza - Status das Tarefas (usando dados reais)
  const statusChartData = useMemo(() => {
    if (statusValues && statusValues.length > 0) {
      return statusValues;
    }
    // Fallback se não tiver statusValues
    return [
      { label: "A fazer", valor: tarefasPendentes, cor: "#3B82F6" },
      { label: "Em andamento", valor: tarefasAndamento, cor: "#F59E0B" },
      { label: "Concluído", valor: tarefasConcluidas, cor: "#10B981" },
    ];
  }, [statusValues, tarefasPendentes, tarefasAndamento, tarefasConcluidas]);

  // Tarefas por Responsável - REVISADO E SINCRONIZADO
  const responsaveisChartData = useMemo(() => {
    if (responsaveis && responsaveis.length > 0) {
      const cores = ["#3B82F6", "#06B6D4", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];
      return responsaveis.slice(0, 6).map((item, i) => ({
        nome: item.nome || "Não atribuído",
        nomeCompleto: item.nome || "Não atribuído",
        valor: item.valor || 0,
        cor: cores[i % cores.length]
      }));
    }
    
    // Sincronização direta com dados das tarefas
    if (!tarefas || tarefas.length === 0) return [];
    
    // Contar tarefas por responsável
    const responsaveisCount: Record<string, number> = {};
    
    tarefas.forEach((t: TarefaType) => {
      try {
        // Processar responsável
        let responsaveisList: string[] = [];
        
        if (t.responsavel) {
          if (typeof t.responsavel === 'string') {
            // Dividir por vírgula se houver múltiplos responsáveis
            if (t.responsavel.includes(',')) {
              responsaveisList = t.responsavel.split(',').map(r => {
                const nome = r.trim();
                return nome || 'Não atribuído';
              }).filter(nome => nome !== '');
            } else {
              const nome = t.responsavel.trim();
              responsaveisList = nome ? [nome] : ['Não atribuído'];
            }
          } else {
            // Se não for string, converter
            const nome = String(t.responsavel || '').trim();
            responsaveisList = nome ? [nome] : ['Não atribuído'];
          }
        } else {
          responsaveisList = ['Não atribuído'];
        }
        
        // Contar cada responsável
        responsaveisList.forEach(nome => {
          responsaveisCount[nome] = (responsaveisCount[nome] || 0) + 1;
        });
        
      } catch (error) {
        console.warn('Erro ao processar responsável da tarefa:', t.id, error);
      }
    });
    
    // Ordenar por quantidade (decrescente) e limitar a 6
    const cores = ["#3B82F6", "#06B6D4", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];
    const resultado = Object.entries(responsaveisCount)
      .map(([nome, quantidade], i) => ({
        nome: nome.length > 10 ? `${nome.substring(0, 10)}...` : nome,
        nomeCompleto: nome,
        valor: quantidade,
        cor: cores[i % cores.length],
        porcentagem: totalTarefas > 0 ? Math.round((quantidade / totalTarefas) * 100) : 0
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
    
    return resultado;
  }, [responsaveis, tarefas, totalTarefas]);

  // Progresso de Tarefas (Distribuição Mensal) - REVISADO E SINCRONIZADO
  const progressoTarefasData = useMemo(() => {
    if (progressoTarefas && progressoTarefas.length > 0) {
      return progressoTarefas;
    }
    
    // Sincronização direta com dados reais das tarefas
    if (!tarefas || tarefas.length === 0) {
      // Se não houver tarefas, mostrar meses vazios
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      
      // Últimos 6 meses
      return Array.from({ length: 6 }, (_, i) => {
        const mesIndex = (mesAtual - 5 + i + 12) % 12;
        return {
          mes: meses[mesIndex],
          valor: 0,
          mesCompleto: `${meses[mesIndex]} ${hoje.getFullYear()}`
        };
      });
    }
    
    // Agrupar tarefas por mês de criação
    const tarefasPorMes: Record<string, number> = {};
    const hoje = new Date();
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Inicializar últimos 12 meses
    const ultimosMeses: Array<{mes: string, ano: number, mesIndex: number}> = [];
    for (let i = 11; i >= 0; i--) {
      const data = new Date(hoje);
      data.setMonth(hoje.getMonth() - i);
      const mesIndex = data.getMonth();
      const ano = data.getFullYear();
      ultimosMeses.push({
        mes: meses[mesIndex],
        ano,
        mesIndex
      });
    }
    
    // Contar tarefas por mês
    tarefas.forEach((t: TarefaType) => {
      try {
        if (t.dataCriacao) {
          const dataCriacao = new Date(t.dataCriacao);
          if (!isNaN(dataCriacao.getTime())) {
            const mesIndex = dataCriacao.getMonth();
            const ano = dataCriacao.getFullYear();
            const chave = `${mesIndex}-${ano}`;
            tarefasPorMes[chave] = (tarefasPorMes[chave] || 0) + 1;
          }
        }
      } catch (error) {
        console.warn('Erro ao processar data da tarefa:', t.id, error);
      }
    });
    
    // Criar array com os últimos 6 meses
    const ultimos6Meses = ultimosMeses.slice(-6);
    
    const resultado = ultimos6Meses.map(({ mes, ano, mesIndex }) => {
      const chave = `${mesIndex}-${ano}`;
      return {
        mes,
        valor: tarefasPorMes[chave] || 0,
        mesCompleto: `${mes} ${ano}`,
        cor: "#3B82F6"
      };
    });
    
    return resultado;
  }, [progressoTarefas, tarefas]);

  // Calcular valor máximo para eixo Y com base nas tarefas
  const maxValorProgresso = useMemo(() => {
    if (progressoTarefasData.length === 0) return 1;
    
    const valores = progressoTarefasData.map((b: {mes: string, valor: number}) => b.valor);
    const max = Math.max(...valores);
    
    // Arredondar para o próximo múltiplo de 5 para melhor visualização
    return max === 0 ? 5 : Math.ceil(max / 5) * 5;
  }, [progressoTarefasData]);

  // Componente para renderizar gráfico de responsáveis
  const renderResponsaveisChart = () => {
    if (responsaveisChartData.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <Users className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">
            {tarefas.length > 0 
              ? 'Nenhum responsável atribuído às tarefas' 
              : 'Nenhuma tarefa cadastrada'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Total de tarefas: {totalTarefas}
          </p>
          {tarefas.length > 0 && (
            <button 
              onClick={() => navigate('/tarefas')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Atribuir Responsáveis às Tarefas
            </button>
          )}
        </div>
      );
    }

    // Calcular total para porcentagens
    const totalResponsaveis = responsaveisChartData.reduce((sum, item) => sum + item.valor, 0);
    
    return (
      <>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={responsaveisChartData}
            margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="nome"
              tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={60}
              axisLine={false}
            />
            <YAxis 
              tick={{ fill: "#6B7280", fontSize: 12 }} 
              allowDecimals={false}
              axisLine={false}
            />
            <Tooltip 
              formatter={(value: any, name: string, props: any) => {
                const item = props.payload;
                const porcentagem = totalTarefas > 0 
                  ? Math.round((item.valor / totalTarefas) * 100)
                  : 0;
                return [
                  <div key="tooltip">
                    <div className="font-semibold">{item.nomeCompleto}</div>
                    <div className="mt-1">
                      <span className="font-bold">{value} tarefas</span>
                      <span className="text-gray-500 ml-2">({porcentagem}%)</span>
                    </div>
                  </div>,
                  'Responsável'
                ];
              }}
              contentStyle={{ 
                borderRadius: 8, 
                border: "1px solid #E5E7EB",
                backgroundColor: 'white',
                fontSize: '12px',
                padding: '8px'
              }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar 
              dataKey="valor" 
              radius={[8, 8, 0, 0]}
              animationDuration={1500}
              animationBegin={300}
            >
              {responsaveisChartData.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.cor}
                  strokeWidth={0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legenda de Responsáveis */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {responsaveisChartData.map((item, index) => {
            const porcentagem = totalTarefas > 0 
              ? Math.round((item.valor / totalTarefas) * 100)
              : 0;
              
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.cor }}
                  />
                  <span className="text-sm font-medium truncate" title={item.nomeCompleto}>
                    {item.nomeCompleto.length > 20 
                      ? `${item.nomeCompleto.substring(0, 20)}...` 
                      : item.nomeCompleto}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">{item.valor}</span>
                  <span className="text-xs text-gray-500 ml-1">({porcentagem}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Componente para renderizar distribuição mensal
  const renderDistribuicaoMensal = () => {
    const totalTarefasPeriodo = progressoTarefasData.reduce((sum, item) => sum + item.valor, 0);
    const mesesComTarefas = progressoTarefasData.filter(item => item.valor > 0).length;
    
    return (
      <>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={progressoTarefasData}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="mes" 
              tick={{ fill: "#374151", fontSize: 14, fontWeight: 500 }} 
              axisLine={false}
            />
            <YAxis 
              domain={[0, maxValorProgresso]} 
              tick={{ fill: "#6B7280", fontSize: 12 }} 
              allowDecimals={false}
              axisLine={false}
              tickFormatter={(value) => value.toString()}
            />
            <Tooltip 
              formatter={(value: any, name: string, props: any) => {
                const item = props.payload;
                const porcentagemTotal = totalTarefasPeriodo > 0 
                  ? Math.round((item.valor / totalTarefasPeriodo) * 100)
                  : 0;
                const porcentagemGeral = totalTarefas > 0 
                  ? Math.round((item.valor / totalTarefas) * 100)
                  : 0;
                
                return [
                  <div key="tooltip">
                    <div className="font-semibold">{item.mesCompleto || item.mes}</div>
                    <div className="mt-1">
                      <span className="font-bold">{value} tarefas</span>
                      <div className="text-gray-500 text-xs mt-1">
                        {porcentagemTotal}% das tarefas do período
                        {porcentagemGeral > 0 && (
                          <div>{porcentagemGeral}% de todas as tarefas</div>
                        )}
                      </div>
                    </div>
                  </div>,
                  'Quantidade'
                ];
              }}
              contentStyle={{ 
                borderRadius: 8, 
                border: "1px solid #E5E7EB",
                backgroundColor: 'white',
                fontSize: '12px',
                padding: '8px'
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar 
              dataKey="valor" 
              radius={[8, 8, 0, 0]} 
              fill="#3B82F6"
              animationDuration={1500}
              animationBegin={300}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Estatísticas do período */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalTarefasPeriodo}
            </div>
            <div className="text-xs text-gray-600">Tarefas no período</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {mesesComTarefas}
            </div>
            <div className="text-xs text-gray-600">Meses com atividades</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {totalTarefasPeriodo > 0 
                ? Math.round(totalTarefasPeriodo / 6)
                : 0}
            </div>
            <div className="text-xs text-gray-600">Média por mês</div>
          </div>
        </div>
      </>
    );
  };

  // Função para renderizar labels do gráfico de pizza
  const renderPieLabel = (props: any) => {
    const { percent } = props;
    return `${((percent || 0) * 100).toFixed(0)}%`;
  };

  // Dados para os mini-dashboards
  const miniDashboards = useMemo(() => {
    // Dados de ações para gráfico
    const acoesChartData = acoesPorTipo.length > 0 
      ? acoesPorTipo.slice(0, 4).map((a: {tipo: string, quantidade: number}) => ({ 
          name: a.tipo || 'Sem tipo', 
          value: a.quantidade || 0 
        }))
      : [
          { name: 'Reunião', value: 8 },
          { name: 'Social', value: 6 },
          { name: 'Fiscal', value: 5 },
          { name: 'Outros', value: 5 }
        ];

    // Dados financeiros para gráfico de linha
    const financeiroChartData = evolucaoMensal.length > 0
      ? evolucaoMensal.slice(0, 6)
      : [
          { mes: 'Jan', receita: 28, despesa: 32 },
          { mes: 'Fev', receita: 32, despesa: 28 },
          { mes: 'Mar', receita: 45, despesa: 35 },
          { mes: 'Abr', receita: 20, despesa: 25 },
          { mes: 'Mai', receita: 35, despesa: 30 },
          { mes: 'Jun', receita: 40, despesa: 35 }
        ];

    // Calcular métricas atuais
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Tarefas deste mês
    const tarefasEsteMes = tarefas.filter((t: TarefaType) => {
      try {
        if (t.dataCriacao) {
          const dataTarefa = new Date(t.dataCriacao);
          return dataTarefa.getMonth() === mesAtual && 
                 dataTarefa.getFullYear() === anoAtual;
        }
        return false;
      } catch {
        return false;
      }
    }).length;

    // Ações deste mês
    const acoesEsteMes = acoes.filter((a: AcaoType) => {
      try {
        if (a.data) {
          const dataAcao = new Date(a.data);
          return dataAcao.getMonth() === mesAtual && 
                 dataAcao.getFullYear() === anoAtual;
        }
        return false;
      } catch {
        return false;
      }
    }).length;

    // Gastos deste mês
    const gastoEsteMes = financeiro
      .filter((f: FinanceiroType) => f.tipo === 'despesa')
      .filter((f: FinanceiroType) => {
        try {
          if (f.data) {
            const dataFin = new Date(f.data);
            return dataFin.getMonth() === mesAtual && 
                   dataFin.getFullYear() === anoAtual;
          }
          return false;
        } catch {
          return false;
        }
      })
      .reduce((sum: number, f: FinanceiroType) => sum + (f.valor || 0), 0);

    return [
      {
        titulo: "Gestão de Tarefas",
        descricao: "Acompanhe o desempenho da equipe",
        icone: <ClipboardList className="w-6 h-6" />,
        cor: "blue",
        rota: "/tarefas",
        metricas: [
          { 
            label: "Total", 
            valor: totalTarefas, 
            variacao: tarefasEsteMes > 0 ? `+${tarefasEsteMes}` : "0",
            icone: <ClipboardList className="w-4 h-4" />
          },
          { 
            label: "Concluídas", 
            valor: tarefasConcluidas, 
            variacao: totalTarefas > 0 ? `${Math.round((tarefasConcluidas / totalTarefas) * 100)}%` : "0%",
            icone: <TrendingUp className="w-4 h-4" />
          },
          { 
            label: "Eficiência", 
            valor: `${eficiencia}%`, 
            variacao: eficiencia > 70 ? "+8%" : eficiencia > 0 ? "+2%" : "0%",
            icone: <Clock className="w-4 h-4" />
          }
        ],
        grafico: (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart 
              data={progressoTarefasData} 
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="valor" 
                stroke="#3B82F6" 
                fill="url(#colorBlue)" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Tooltip 
                formatter={(value: any) => [`${value} tarefas`, 'Quantidade']}
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={{ 
                  borderRadius: 8, 
                  border: "1px solid #E5E7EB",
                  backgroundColor: 'white',
                  fontSize: '12px'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ),
        dadosAdicionais: [
          { 
            label: "Prazo Médio", 
            valor: `${prazoMedio} dias`,
            icone: <Clock className="w-3 h-3" />
          },
          { 
            label: "Em Atraso", 
            valor: `${tarefas.filter((t: TarefaType) => {
              try {
                return t.status === 'pendente' && 
                       t.dataPrazo && 
                       new Date(t.dataPrazo) < new Date();
              } catch {
                return false;
              }
            }).length || 0} tarefas`,
            icone: <AlertCircle className="w-3 h-3" />
          },
          { 
            label: "Prioridade Alta", 
            valor: `${tarefas.filter((t: TarefaType) => t.prioridade === 'alta').length || 0} tarefas`,
            icone: <AlertCircle className="w-3 h-3" />
          }
        ]
      },
      {
        titulo: "Sistema de Ações", 
        descricao: "Monitoramento territorial completo",
        icone: <MapPin className="w-6 h-6" />,
        cor: "green",
        rota: "/acoes",
        metricas: [
          { 
            label: "Total Ações", 
            valor: totalAcoes || acoes.length, 
            variacao: acoesEsteMes > 0 ? `+${acoesEsteMes}` : "0",
            icone: <MapPin className="w-4 h-4" />
          },
          { 
            label: "Bairros", 
            valor: bairrosAtendidos, 
            variacao: "+2",
            icone: <Home className="w-4 h-4" />
          },
          { 
            label: "Este Mês", 
            valor: acoesEsteMes,
            variacao: "+1",
            icone: <TrendingUp className="w-4 h-4" />
          }
        ],
        grafico: (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart 
              data={acoesChartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <Bar 
                dataKey="value" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Tooltip 
                formatter={(value: any) => [`${value} ações`, 'Quantidade']}
                contentStyle={{ 
                  borderRadius: 8, 
                  border: "1px solid #E5E7EB",
                  backgroundColor: 'white',
                  fontSize: '12px'
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ),
        dadosAdicionais: [
          { 
            label: "Geolocalizadas", 
            valor: `${acoes.filter((a: AcaoType) => a.lat && a.lng).length} ações`,
            icone: <MapPin className="w-3 h-3" />
          },
          { 
            label: "Em Andamento", 
            valor: `${acoes.filter((a: AcaoType) => 
              a.status === 'em_andamento' || 
              a.status === 'andamento' || 
              a.status?.toLowerCase().includes('andamento')
            ).length} ações`,
            icone: <Clock className="w-3 h-3" />
          },
          { 
            label: "Concluídas", 
            valor: `${acoes.filter((a: AcaoType) => 
              a.status === 'concluida' || 
              a.status === 'concluido' || 
              a.status?.toLowerCase().includes('conclu')
            ).length} ações`,
            icone: <TrendingUp className="w-3 h-3" />
          }
        ]
      },
      {
        titulo: "Controle Financeiro",
        descricao: "Gestão orçamentária detalhada",
        icone: <Landmark className="w-6 h-6" />,
        cor: "purple", 
        rota: "/financeiro",
        metricas: [
          { 
            label: "Total Gasto", 
            valor: formatarMoeda(totalGasto), 
            variacao: gastoEsteMes > 0 ? formatarMoeda(gastoEsteMes) : "R$ 0",
            icone: <DollarSign className="w-4 h-4" />
          },
          { 
            label: "Total Receita", 
            valor: formatarMoeda(totalReceita), 
            variacao: totalReceita > 0 ? "+12%" : "0%",
            icone: <TrendingUp className="w-4 h-4" />
          },
          { 
            label: "Saldo", 
            valor: formatarMoeda(saldo), 
            variacao: saldo >= 0 ? "+7%" : "-7%",
            icone: saldo >= 0 ? <TrendingUp className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />
          }
        ],
        grafico: (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart 
              data={financeiroChartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 3 }}
                activeDot={{ r: 5 }}
                name="Receita"
              />
              <Line 
                type="monotone" 
                dataKey="despesa" 
                stroke="#EC4899" 
                strokeWidth={2}
                dot={{ fill: '#EC4899', r: 3 }}
                activeDot={{ r: 5 }}
                name="Despesa"
              />
              <Tooltip 
                formatter={(value: any) => [formatarMoeda(value), 'Valor']}
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={{ 
                  borderRadius: 8, 
                  border: "1px solid #E5E7EB",
                  backgroundColor: 'white',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '11px',
                  paddingTop: '5px'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ),
        dadosAdicionais: [
          { 
            label: "Maior Gasto", 
            valor: gastoPorCategoria[0] ? 
              `${gastoPorCategoria[0].categoria}: ${formatarMoeda(gastoPorCategoria[0].valor)}` : 
              "R$ 0",
            icone: <AlertCircle className="w-3 h-3" />
          },
          { 
            label: "Categorias", 
            valor: `${gastoPorCategoria.length || 0} ativas`,
            icone: <Landmark className="w-3 h-3" />
          },
          { 
            label: "Média Mensal", 
            valor: totalGasto > 0 ? formatarMoeda(totalGasto / 12) : "R$ 0",
            icone: <Clock className="w-3 h-3" />
          }
        ]
      }
    ];
  }, [
    estatisticas, tarefas, acoes, financeiro,
    totalTarefas, tarefasConcluidas, eficiencia,
    totalAcoes, bairrosAtendidos, totalGasto, totalReceita, saldo,
    progressoTarefasData, acoesPorTipo, gastoPorCategoria, evolucaoMensal,
    formatarMoeda, prazoMedio
  ]);

  const getCardColor = (cor: string) => {
    const colors = {
      blue: { 
        bg: "bg-blue-50", 
        border: "border-blue-200", 
        text: "text-blue-600", 
        hover: "hover:bg-blue-100",
        gradient: "from-blue-500 to-blue-600",
        light: "#DBEAFE"
      },
      green: { 
        bg: "bg-green-50", 
        border: "border-green-200", 
        text: "text-green-600", 
        hover: "hover:bg-green-100",
        gradient: "from-green-500 to-green-600",
        light: "#D1FAE5"
      },
      purple: { 
        bg: "bg-purple-50", 
        border: "border-purple-200", 
        text: "text-purple-600", 
        hover: "hover:bg-purple-100",
        gradient: "from-purple-500 to-purple-600",
        light: "#EDE9FE"
      }
    };
    return colors[cor as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-inter">
      {/* Cabeçalho com Status WebSocket */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-gray-600 text-2xl font-light mb-3 tracking-wide">
              Olá Vereador, Bem Vindo!
            </h1>
            <h2 className="text-blue-600 text-4xl font-bold mb-4 tracking-tight">
              Dashboard
            </h2>
            <p className="text-gray-500 text-lg font-normal max-w-2xl leading-relaxed">
              Sistema de Gerenciamento de Ações do Vereador 
            </p>
    
            
          </div>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="mb-12">
        <h3 className="text-gray-800 text-2xl font-semibold mb-8 tracking-wide border-b border-gray-200 pb-3">
          Estatísticas de Gestão das Ações
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- CARD 1: STATUS DAS TAREFAS --- */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group min-h-[520px] lg:min-h-[640px] relative">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-gray-800 text-xl font-semibold tracking-wide group-hover:text-blue-600 transition-colors">
                Status das Tarefas
              </h4>
              {totalTarefas === 0 && (
                <div className="flex items-center gap-1 text-yellow-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Sem dados</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center mb-8 relative">
              {totalTarefas > 0 ? (
                <>
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={statusChartData.filter((s: any) => s.valor > 0)}
                        dataKey="valor"
                        nameKey="label"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        cornerRadius={10}
                        label={renderPieLabel}
                      >
                        {statusChartData
                          .filter((s: any) => s.valor > 0)
                          .map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} tarefas`, name]}
                        contentStyle={{ 
                          borderRadius: 8, 
                          border: "1px solid #E5E7EB",
                          backgroundColor: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Total Central */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100">
                      <span className="text-gray-700 text-lg font-bold">{totalTarefas}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma tarefa cadastrada</p>
                  <button 
                    onClick={() => navigate('/tarefas')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Criar Primeira Tarefa
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {statusChartData.map((s: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-3 px-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full shadow-md"
                      style={{ backgroundColor: s.cor }}
                    />
                    <span className="font-medium">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{s.valor}</span>
                    {totalTarefas > 0 && (
                      <span className="text-xs text-gray-500">
                        ({Math.round((s.valor / totalTarefas) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- TAREFAS POR RESPONSÁVEL (REVISADO) --- */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group min-h-[520px] lg:min-h-[640px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-gray-800 text-xl font-semibold tracking-wide group-hover:text-blue-600 transition-colors">
                  Tarefas por Responsável
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Distribuição baseada nas {totalTarefas} tarefas cadastradas
                </p>
              </div>
              <div className="flex items-center gap-2">
              </div>
            </div>
            <div className="flex-1">
              {renderResponsaveisChart()}
            </div>
          </div>

          {/* --- DISTRIBUIÇÃO MENSAL (REVISADO) --- */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group min-h-[520px] lg:min-h-[640px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-gray-800 text-xl font-semibold tracking-wide group-hover:text-blue-600 transition-colors">
                  Distribuição Mensal
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Últimos 6 meses - {totalTarefas} tarefas no total
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Período analisado</div>
                <div className="text-sm font-medium">
                  {progressoTarefasData.length > 0 
                    ? `${progressoTarefasData[0].mes} - ${progressoTarefasData[progressoTarefasData.length-1].mes}`
                    : 'Sem dados'}
                </div>
              </div>
            </div>
            <div className="flex-1">
              {renderDistribuicaoMensal()}
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Concluídas */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:border-emerald-200">
          <h4 className="text-gray-800 text-xl font-semibold mb-6 tracking-wide group-hover:text-emerald-600 transition-colors flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            Tarefas Concluídas
          </h4>
          <div className="text-center">
            <div className="text-6xl font-bold text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
              {tarefasConcluidas}
            </div>
            <div className="text-gray-600 font-medium bg-emerald-50 py-3 px-6 rounded-2xl border border-emerald-200 inline-block group-hover:bg-emerald-100 transition-colors">
              <span className="font-bold text-emerald-600">
                {totalTarefas > 0
                  ? Math.round((tarefasConcluidas / totalTarefas) * 100)
                  : 0}
                %
              </span>{" "}
              do total
            </div>
          </div>
        </div>

        {/* Prazo Médio */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:border-amber-200">
          <h4 className="text-gray-800 text-xl font-semibold mb-6 tracking-wide group-hover:text-amber-600 transition-colors flex items-center gap-3">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            Prazo Médio
          </h4>
          <div className="text-center">
            <div className="text-6xl font-bold text-amber-500 mb-4 group-hover:scale-110 transition-transform">
              {prazoMedio}
            </div>
            <div className="text-gray-600 font-medium bg-amber-50 py-3 px-6 rounded-2xl border border-amber-200 inline-block group-hover:bg-amber-100 transition-colors">
              dias em média
            </div>
          </div>
        </div>

        {/* Total de Tarefas */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:border-blue-200">
          <h4 className="text-gray-800 text-xl font-semibold mb-6 tracking-wide group-hover:text-blue-600 transition-colors flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Total de Tarefas
          </h4>
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-500 mb-4 group-hover:scale-110 transition-transform">
              {totalTarefas}
            </div>
            <div className="text-gray-600 font-medium bg-blue-50 py-3 px-6 rounded-2xl border border-blue-200 inline-block group-hover:bg-blue-100 transition-colors">
              em andamento
            </div>
          </div>
        </div>
      </div>

      {/* Mini Dashboards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-gray-800 text-2xl font-semibold tracking-wide border-b border-gray-200 pb-3">
            Módulos do Sistema
          </h3>
          <div className="text-sm text-gray-500">
            Dados atualizados em tempo real
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {miniDashboards.map((dashboard, index) => {
            const colors = getCardColor(dashboard.cor);
            
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${colors.gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        {dashboard.icone}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">
                          {dashboard.titulo}
                        </h4>
                        <p className="text-white text-opacity-80 text-sm">
                          {dashboard.descricao}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(dashboard.rota)}
                      className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Métricas Principais */}
                  <div className="grid grid-cols-3 gap-4">
                    {dashboard.metricas.map((metrica, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-2xl font-bold truncate" title={String(metrica.valor)}>
                          {metrica.valor}
                        </div>
                        <div className="text-xs text-white text-opacity-80 mt-1 flex items-center justify-center gap-1">
                          {metrica.icone}
                          {metrica.label}
                        </div>
                        <div className={`text-xs ${metrica.variacao.startsWith('+') ? 'text-green-200' : metrica.variacao.startsWith('-') ? 'text-red-200' : 'text-white text-opacity-60'}`}>
                          {metrica.variacao}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gráfico */}
                <div className="p-4 border-b border-gray-100">
                  {dashboard.grafico}
                </div>

                {/* Dados Adicionais */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {dashboard.dadosAdicionais.map((dado, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`text-sm font-semibold ${colors.text} truncate`} title={String(dado.valor)}>
                          {dado.valor}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                          {dado.icone}
                          {dado.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer com Botão */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <button 
                    onClick={() => navigate(dashboard.rota)}
                    className={`w-full py-3 bg-gradient-to-r ${colors.gradient} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                  >
                    Acessar Módulo Completo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer com informações do sistema */}
      <div className="text-center text-gray-500 text-sm pt-6 border-t border-gray-200">
        <p>
          Sistema atualizado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="mt-1">
          Total de Ações: {totalAcoes || 0} • 
          Total Financeiro: {formatarMoeda(saldo)}
        </p>
      </div>
    </div>
  );
}