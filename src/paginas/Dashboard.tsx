import React, { useMemo } from "react";
import { useDashConect } from "../conect/dashconect";
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
} from "recharts";

export default function Dashboard() {
  const { data } = useDashConect();
  const { estatisticas, tarefas } = data;

  // Grafico pizza
  const statusValues = useMemo(() => [
    { label: "A fazer", valor: estatisticas.tarefasPendentes, cor: "#2563EB" },
    { label: "Em andamento", valor: estatisticas.tarefasAndamento, cor: "#F59E0B" },
    { label: "Concluído", valor: estatisticas.tarefasConcluidas, cor: "#10B981" },
  ], [estatisticas]);

  const totalTarefas = estatisticas.totalTarefas || 0;

  // --- Tarefas por Responsável ---
  const responsaveis = useMemo(() => {
    if (!tarefas.length) return [];
    const map: Record<string, number> = {};
    tarefas.forEach((t) => {
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

  // --- Progresso (exemplo: distribuição mensal) ---
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];
  const barras = useMemo(() => {
    return meses.map((mes, i) => ({
      mes,
      valor: tarefas.filter((_, idx) => idx % meses.length === i).length,
    }));
  }, [tarefas]);

  const maxValor = Math.max(...barras.map((b) => b.valor), 10);

  return (
    <div className="p-8 max-w-7xl mx-auto font-inter">
      {/* Cabeçalho */}
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

      {/* Gráficos */}
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
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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

          {/* --- CARD 2: TAREFAS POR RESPONSÁVEL --- */}
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

          {/* --- CARD 3: PROGRESSO DE TAREFAS --- */}
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

      {/* Cards Inferiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

        {/* Prazo Médio */}
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
    </div>
  );
}
