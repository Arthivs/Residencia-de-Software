// ✅ src/conect/dashconect.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

// Tipos dos dados
export interface Tarefa {
  id: string;
  titulo: string;
  status: "pendente" | "andamento" | "concluido";
  responsavel: string;
  prazo: Date;
  progresso: number;
  dataConclusao?: Date;
}

export interface DashboardData {
  tarefas: Tarefa[];
  estatisticas: {
    totalTarefas: number;
    tarefasConcluidas: number;
    tarefasAndamento: number;
    tarefasPendentes: number;
    porcentagemConcluidas: number;
    prazoMedio: number;
    eficiencia: number;
  };
}

interface DashConectType {
  data: DashboardData;
  adicionarTarefa: (tarefa: Omit<Tarefa, "id">) => void;
  atualizarTarefa: (id: string, updates: Partial<Tarefa>) => void;
  excluirTarefa: (id: string) => void;
}

// Criar o Context
const DashConectContext = createContext<DashConectType | undefined>(undefined);

// Dados iniciais (vazio para sincronizar corretamente com Gestão de Tarefas)
const dadosIniciais: DashboardData = {
  tarefas: [],
  estatisticas: {
    totalTarefas: 0,
    tarefasConcluidas: 0,
    tarefasAndamento: 0,
    tarefasPendentes: 0,
    porcentagemConcluidas: 0,
    prazoMedio: 0,
    eficiencia: 0,
  },
};

export const DashConectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [estatisticas, setEstatisticas] = useState(dadosIniciais.estatisticas);

  // 🔹 Calcular estatísticas com base nas tarefas
  const calcularEstatisticas = (tarefas: Tarefa[]) => {
    const totalTarefas = tarefas.length;
    const tarefasConcluidas = tarefas.filter(
      (t) => t.status === "concluido"
    ).length;
    const tarefasAndamento = tarefas.filter(
      (t) => t.status === "andamento"
    ).length;
    const tarefasPendentes = tarefas.filter(
      (t) => t.status === "pendente"
    ).length;

    const porcentagemConcluidas =
      totalTarefas > 0
        ? Math.round((tarefasConcluidas / totalTarefas) * 100)
        : 0;

    // Prazo médio (somente tarefas em andamento ou pendentes)
    const hoje = new Date();
    const prazos = tarefas
      .filter((t) => t.prazo && t.status !== "concluido")
      .map((t) =>
        Math.ceil((t.prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      )
      .filter((dias) => dias > 0);

    const prazoMedio =
      prazos.length > 0
        ? Math.round(prazos.reduce((a, b) => a + b, 0) / prazos.length)
        : 0;

    // Eficiência = % de tarefas concluídas dentro do prazo
    const tarefasConcluidasNoPrazo = tarefas.filter(
      (t) =>
        t.status === "concluido" &&
        t.dataConclusao &&
        t.prazo &&
        t.dataConclusao <= t.prazo
    ).length;

    const eficiencia =
      tarefasConcluidas > 0
        ? Math.round(
            (tarefasConcluidasNoPrazo / tarefasConcluidas) * 100
          )
        : 0;

    return {
      totalTarefas,
      tarefasConcluidas,
      tarefasAndamento,
      tarefasPendentes,
      porcentagemConcluidas,
      prazoMedio,
      eficiencia,
    };
  };

  // 🔁 Atualiza estatísticas em tempo real
  useEffect(() => {
    setEstatisticas(calcularEstatisticas(tarefas));
  }, [tarefas]);

  // Funções CRUD
  const adicionarTarefa = (tarefa: Omit<Tarefa, "id">) => {
    const novaTarefa: Tarefa = { ...tarefa, id: Date.now().toString() };
    setTarefas((prev) => [...prev, novaTarefa]);
  };

  const atualizarTarefa = (id: string, updates: Partial<Tarefa>) => {
    setTarefas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const excluirTarefa = (id: string) => {
    setTarefas((prev) => prev.filter((t) => t.id !== id));
  };

  const data: DashboardData = { tarefas, estatisticas };

  return (
    <DashConectContext.Provider
      value={{ data, adicionarTarefa, atualizarTarefa, excluirTarefa }}
    >
      {children}
    </DashConectContext.Provider>
  );
};

// Hook para usar o contexto
export const useDashConect = () => {
  const context = useContext(DashConectContext);
  if (!context) {
    throw new Error(
      "useDashConect deve ser usado dentro de um DashConectProvider"
    );
  }
  return context;
};
