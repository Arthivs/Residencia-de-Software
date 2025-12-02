import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { TrendingUp, MapPin, Users, Calendar } from "lucide-react";

const COLORS = [
  "#0284c7", "#10b981", "#6366f1", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#ec4899"
];

export default function AnalyticsDashboard({ filteredActions = [], bairroStats = {} }) {
  // grafico dados
  
  // Distribuição por Tipo
  const byType = filteredActions.reduce((acc, a) => {
    acc[a.tipo] = (acc[a.tipo] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(byType).map(([name, value]) => ({
    name,
    value,
  }));

  // Top Bairros
  const barData = Object.values(bairroStats)
    .filter((b) => b.bairro)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((b) => ({
      name: b.bairro,
      count: b.count,
    }));

  // Evolução Temporal (últimos 6 meses)
  const last6Months = getLast6Months();
  const timelineData = last6Months.map(month => {
    const monthActions = filteredActions.filter(action => {
      if (!action.data) return false;
      const actionDate = new Date(action.data);
      return actionDate.getMonth() === month.month && 
             actionDate.getFullYear() === month.year;
    });
    return {
      name: month.label,
      ações: monthActions.length
    };
  });

  // Métricas Principais
  const metrics = {
    total: filteredActions.length,
    bairros: Object.keys(bairroStats).length,
    tipos: Object.keys(byType).length,
    mediaMensal: Math.round(filteredActions.length / 6)
  };

  return (
    <div className="space-y-6">

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Ações</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Bairros Atendidos</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.bairros}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipos de Ação</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.tipos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-orange-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Média Mensal</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.mediaMensal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DOS GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico de Pizza - Distribuição por Tipo */}
        <div className="bg-white rounded-xl shadow-md p-5 border">
          <h4 className="font-semibold text-lg mb-3 text-gray-700">
            Distribuição por Tipo de Ação
          </h4>

          {pieData.length === 0 ? (
            <div className="text-gray-500 text-center py-10">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {pieData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico de Barras */}
        <div className="bg-white rounded-xl shadow-md p-5 border">
          <h4 className="font-semibold text-lg mb-3 text-gray-700">
            Bairros com Mais Ações
          </h4>

          {barData.length === 0 ? (
            <div className="text-gray-500 text-center py-10">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico de Linha - Evolução Temporal */}
        <div className="bg-white rounded-xl shadow-md p-5 border lg:col-span-2">
          <h4 className="font-semibold text-lg mb-3 text-gray-700">
            Evolução das Ações (Últimos 6 Meses)
          </h4>

          {timelineData.some(item => item.ações > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ações" 
                  stroke="#0284c7" 
                  strokeWidth={2}
                  dot={{ fill: '#0284c7', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#0284c7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 text-center py-10">
              Nenhum dado temporal disponível
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Função auxiliar para obter últimos 6 meses
function getLast6Months() {
  const months = [];
  const today = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      month: date.getMonth(),
      year: date.getFullYear()
    });
  }
  
  return months;
}