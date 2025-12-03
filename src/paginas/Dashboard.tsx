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
  Area
} from "recharts";
import {
  MapPin,
  ArrowRight,
  ClipboardList,
  Landmark,
  Eye
} from "lucide-react";

export default function Dashboard() {
  const { data } = useDashConect();
  const navigate = useNavigate();
  
  // Extrair apenas os dados necessários
  const { estatisticas, tarefas } = data || {
    estatisticas: {
      tarefasPendentes: 0,
      tarefasAndamento: 0,
      tarefasConcluidas: 0,
      totalTarefas: 0,
      eficiencia: 0,
      prazoMedio: 0
    },
    tarefas: []
  };

  // Gráfico pizza - Status das Tarefas
  const statusValues = useMemo(() => [
    { label: "A fazer", valor: estatisticas.tarefasPendentes, cor: "#2563EB" },
    { label: "Em andamento", valor: estatisticas.tarefasAndamento, cor: "#F59E0B" },
    { label: "Concluído", valor: estatisticas.tarefasConcluidas, cor: "#10B981" },
  ], [estatisticas]);

  const totalTarefas = estatisticas.totalTarefas || 0;

  // Tarefas por Responsável
  const responsaveis = useMemo(() => {
    if (!tarefas || !tarefas.length) return [];
    const map: Record<string, number> = {};
    tarefas.forEach((t: any) => {
      const nome = t.responsavel?.trim() || "Não atribuído";
      map[nome] = (map[nome] || 0) + 1;
    });
    const cores = ["#2563EB", "#06B6D4", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];
    return Object.entries(map).map(([nome, valor], i) => ({
      nome,
      valor,
      cor: cores[i % cores.length],
    }));
  }, [tarefas]);

  // Progresso (exemplo: distribuição mensal)
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];
  const barras = useMemo(() => {
    if (!tarefas || !tarefas.length) {
      return meses.map(mes => ({ mes, valor: 0 }));
    }
    return meses.map((mes, i) => ({
      mes,
      valor: tarefas.filter((_: any, idx: number) => idx % meses.length === i).length,
    }));
  }, [tarefas]);

  const maxValor = Math.max(...barras.map((b) => b.valor), 10);

  // Dados para os mini-dashboards
  const miniDashboards = [
    {
      titulo: "Gestão de Tarefas",
      descricao: "Acompanhe o desempenho da equipe",
      icone: <ClipboardList className="w-6 h-6" />,
      cor: "blue",
      rota: "/tarefas",
      metricas: [
        { label: "Total", valor: tarefas?.length || 0, variacao: "+12%" },
        { label: "Concluídas", valor: estatisticas.tarefasConcluidas, variacao: "+5%" },
        { label: "Eficiência", valor: `${estatisticas.eficiencia}%`, variacao: "+8%" }
      ],
      grafico: (
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={barras}>
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
              fillOpacity={1} 
              fill="url(#colorBlue)" 
              strokeWidth={2}
            />
            <Tooltip />
          </AreaChart>
        </ResponsiveContainer>
      ),
      dadosAdicionais: [
        { label: "Prazo Médio", valor: `${estatisticas.prazoMedio} dias` },
        { label: "Em Atraso", valor: "2 tarefas" },
        { label: "Prioridade Alta", valor: "5 tarefas" }
      ]
    },
    {
      titulo: "Sistema de Ações", 
      descricao: "Monitoramento territorial completo",
      icone: <MapPin className="w-6 h-6" />,
      cor: "green",
      rota: "/acoes",
      metricas: [
        { label: "Total Ações", valor: "24", variacao: "+18%" },
        { label: "Bairros", valor: "8", variacao: "+2" },
        { label: "Tipos", valor: "6", variacao: "+1" }
      ],
      grafico: (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={[
            { name: 'Reunião', value: 8 },
            { name: 'Social', value: 6 },
            { name: 'Fiscal', value: 5 },
            { name: 'Outros', value: 5 }
          ]}>
            <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Tooltip />
          </BarChart>
        </ResponsiveContainer>
      ),
      dadosAdicionais: [
        { label: "Este Mês", valor: "8 ações" },
        { label: "Geolocalizadas", valor: "22 ações" },
        { label: "Em Andamento", valor: "3 ações" }
      ]
    },
    {
      titulo: "Controle Financeiro",
      descricao: "Gestão orçamentária detalhada",
      icone: <Landmark className="w-6 h-6" />,
      cor: "purple", 
      rota: "/financeiro",
      metricas: [
        { label: "Total Gasto", valor: "R$ 125k", variacao: "-5%" },
        { label: "Economia", valor: "R$ 15k", variacao: "+12%" },
        { label: "Registros", valor: "12", variacao: "+3" }
      ],
      grafico: (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={[
            { mes: 'Jan', valor: 28 },
            { mes: 'Fev', valor: 32 },
            { mes: 'Mar', valor: 45 },
            { mes: 'Abr', valor: 20 }
          ]}>
            <Line 
              type="monotone" 
              dataKey="valor" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 3 }}
            />
            <Tooltip formatter={(value: any) => [`R$ ${value}k`, 'Gasto']} />
          </LineChart>
        </ResponsiveContainer>
      ),
      dadosAdicionais: [
        { label: "Maior Gasto", valor: "Locação R$ 40k" },
        { label: "Categorias", valor: "7 ativas" },
        { label: "Média Mensal", valor: "R$ 31k" }
      ]
    }
  ];

  const getCardColor = (cor: string) => {
    const colors = {
      blue: { 
        bg: "bg-blue-50", 
        border: "border-blue-200", 
        text: "text-blue-600", 
        hover: "hover:bg-blue-100",
        gradient: "from-blue-500 to-blue-600"
      },
      green: { 
        bg: "bg-green-50", 
        border: "border-green-200", 
        text: "text-green-600", 
        hover: "hover:bg-green-100",
        gradient: "from-green-500 to-green-600"
      },
      purple: { 
        bg: "bg-purple-50", 
        border: "border-purple-200", 
        text: "text-purple-600", 
        hover: "hover:bg-purple-100",
        gradient: "from-purple-500 to-purple-600"
      }
    };
    return colors[cor as keyof typeof colors] || colors.blue;
  };

  // Função para lidar com percent no gráfico de pizza
  const renderPieLabel = (props: any) => {
    const { percent } = props;
    return `${((percent || 0) * 100).toFixed(0)}%`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-inter">
      {/* Cabeçalho - MANTIDO ORIGINAL */}
      <div className="mb-12">
        <h1 className="text-gray-600 text-2xl font-light mb-3 tracking-wide">
          Olá Vereador, Bem Vindo!
        </h1>
        <h2 className="text-vereador-blue text-4xl font-bold mb-4 tracking-tight">
          Dashboard
        </h2>
        <p className="text-gray-500 text-lg font-normal max-w-2xl leading-relaxed">
          Sistema de Gerenciamento de Ações do Vereador 
        </p>
      </div>

      {/* Gráficos - MANTIDO ORIGINAL */}
      <div className="mb-12">
        <h3 className="text-gray-800 text-2xl font-semibold mb-8 tracking-wide border-b border-gray-200 pb-3">
          Estatísticas de Gestão das Ações
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- CARD 1: STATUS DAS TAREFAS --- */}
          <div className="bg-white p-8 rounded-2xl shadow-vereador-card border border-gray-100 hover:shadow-xl transition-all duration-300 group min-h-[520px] lg:min-h-[640px] relative">
            <h4 className="text-gray-800 text-xl font-semibold mb-6 tracking-wide group-hover:text-vereador-blue transition-colors">
              Status das Tarefas
            </h4>

            <div className="flex items-center justify-center mb-8 relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={statusValues.filter((s) => s.valor > 0)}
                    dataKey="valor"
                    nameKey="label"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    cornerRadius={10}
                    label={renderPieLabel}
                  >
                    {statusValues
                      .filter((s) => s.valor > 0)
                      .map((entry, index) => (
                        <Cell key={index} fill={entry.cor} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}`, name]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Total Central */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100">
                  <span className="text-gray-700 text-lg font-bold">{totalTarefas}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {statusValues.map((s) => (
                <div
                  key={s.label}
                  className="flex justify-between items-center py-3 px-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full shadow-md"
                      style={{ backgroundColor: s.cor }}
                    />
                    <span>{s.label}</span>
                  </div>
                  <span className="font-bold">{s.valor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TAREFAS POR RESPONSÁVEL */}
          <div className="bg-white p-8 rounded-2xl shadow-vereador-card border border-gray-100 hover:shadow-xl transition-all duration-300 group min-h-[520px] lg:min-h-[640px] flex flex-col">
            <h4 className="text-gray-800 text-xl font-semibold mb-6 tracking-wide group-hover:text-vereador-blue transition-colors">
              Tarefas por Responsável
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={responsaveis}
                  margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="nome"
                    tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
                  <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                    {responsaveis.map((entry, index) => (
                      <Cell key={index} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/*Tarefas*/}
          <div className="bg-white p-8 rounded-2xl shadow-vereador-card border border-gray-100 hover:shadow-xl transition-all duration-300 group min-h-[520px] lg:min-h-[640px] flex flex-col">
            <h4 className="text-gray-800 text-xl font-semibold mb-6 tracking-wide group-hover:text-vereador-blue transition-colors">
              Progresso de Tarefas
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barras}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: "#374151", fontSize: 14, fontWeight: 500 }} />
                  <YAxis domain={[0, maxValor]} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
                  <Bar dataKey="valor" radius={[8, 8, 0, 0]} fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Concluídas */}
        <div className="bg-white p-8 rounded-2xl shadow-vereador-card border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:border-emerald-200">
          <h4 className="text-gray-800 text-xl font-semibold mb-6 tracking-wide group-hover:text-emerald-600 transition-colors flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            Tarefas Concluídas
          </h4>
          <div className="text-center">
            <div className="text-6xl font-bold text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
              {estatisticas.tarefasConcluidas}
            </div>
            <div className="text-gray-600 font-medium bg-emerald-50 py-3 px-6 rounded-2xl border border-emerald-200 inline-block group-hover:bg-emerald-100 transition-colors">
              <span className="font-bold text-emerald-600">
                {totalTarefas > 0
                  ? Math.round((estatisticas.tarefasConcluidas / totalTarefas) * 100)
                  : 0}
                %
              </span>{" "}
              do total
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-vereador-card border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:border-amber-200">
          <h4 className="text-gray-800 text-xl font-semibold mb-6 tracking-wide group-hover:text-amber-600 transition-colors flex items-center gap-3">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            Prazo Médio
          </h4>
          <div className="text-center">
            <div className="text-6xl font-bold text-amber-500 mb-4 group-hover:scale-110 transition-transform">
              {estatisticas.prazoMedio}
            </div>
            <div className="text-gray-600 font-medium bg-amber-50 py-3 px-6 rounded-2xl border border-amber-200 inline-block group-hover:bg-amber-100 transition-colors">
              dias em média
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white p-8 rounded-2xl shadow-vereador-card border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:border-blue-200">
          <h4 className="text-gray-800 text-xl font-semibold mb-6 tracking-wide group-hover:text-vereador-blue transition-colors flex items-center gap-3">
            <div className="w-3 h-3 bg-vereador-blue rounded-full"></div>
            Total de Tarefas
          </h4>
          <div className="text-center">
            <div className="text-6xl font-bold text-vereador-blue mb-4 group-hover:scale-110 transition-transform">
              {totalTarefas}
            </div>
            <div className="text-gray-600 font-medium bg-blue-50 py-3 px-6 rounded-2xl border border-blue-200 inline-block group-hover:bg-blue-100 transition-colors">
              em andamento
            </div>
          </div>
        </div>
      </div>

      {/* mini dash */}
      <div className="mb-8">
        <h3 className="text-gray-800 text-2xl font-semibold mb-8 tracking-wide border-b border-gray-200 pb-3">
          Módulos do Sistema
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {miniDashboards.map((dashboard, index) => {
            const colors = getCardColor(dashboard.cor);
            
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-vereador-card border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/*Header*/}
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
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Métricas Principais */}
                  <div className="grid grid-cols-3 gap-4">
                    {dashboard.metricas.map((metrica, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-2xl font-bold">
                          {metrica.valor}
                        </div>
                        <div className="text-xs text-white text-opacity-80 mt-1">
                          {metrica.label}
                        </div>
                        <div className={`text-xs ${metrica.variacao.startsWith('+') ? 'text-green-200' : 'text-red-200'}`}>
                          {metrica.variacao}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* gráficos*/}
                <div className="p-4 border-b border-gray-100">
                  {dashboard.grafico}
                </div>

                {/* Dados Adicionais */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {dashboard.dadosAdicionais.map((dado, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`text-sm font-semibold ${colors.text}`}>
                          {dado.valor}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
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
    </div>
  );
}