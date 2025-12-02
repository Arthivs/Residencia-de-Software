// src/services/api.ts - CORRIGIDO
const API_BASE_URL = 'http://localhost:3001/api';

// Serviço de Tarefas
export const tarefasService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/tarefas`);
    if (!response.ok) throw new Error('Erro ao buscar tarefas');
    return response.json();
  },

  async create(tarefa: any) {
    const response = await fetch(`${API_BASE_URL}/tarefas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarefa)
    });
    if (!response.ok) throw new Error('Erro ao criar tarefa');
    return response.json();
  },

  async update(id: string, tarefa: any) {
    const response = await fetch(`${API_BASE_URL}/tarefas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarefa)
    });
    if (!response.ok) throw new Error('Erro ao atualizar tarefa');
    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/tarefas/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao excluir tarefa');
    return response.json();
  }
};

// Serviço de Ações
export const acoesService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/acoes`);
    if (!response.ok) throw new Error('Erro ao buscar ações');
    return response.json();
  },

  async create(acao: any) {
    const response = await fetch(`${API_BASE_URL}/acoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(acao)
    });
    if (!response.ok) throw new Error('Erro ao criar ação');
    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/acoes/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao excluir ação');
    return response.json();
  }
};

// Serviço Financeiro
export const financeiroService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/financeiro`);
    if (!response.ok) throw new Error('Erro ao buscar registros financeiros');
    return response.json();
  },

  async create(registro: any) {
    const response = await fetch(`${API_BASE_URL}/financeiro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro)
    });
    if (!response.ok) throw new Error('Erro ao criar registro financeiro');
    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/financeiro/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao excluir registro financeiro');
    return response.json();
  }
};

// Serviço de Dashboard (dados consolidados)
export const dashboardService = {
  async getResumo() {
    const response = await fetch(`${API_BASE_URL}/dashboard/resumo`);
    if (!response.ok) throw new Error('Erro ao buscar resumo do dashboard');
    return response.json();
  },

  async getMetricas() {
    const response = await fetch(`${API_BASE_URL}/dashboard/metricas`);
    if (!response.ok) throw new Error('Erro ao buscar métricas');
    return response.json();
  }
};

// Exportação do apiService (se necessário)
export const apiService = {
  tarefas: tarefasService,
  acoes: acoesService,
  financeiro: financeiroService,
  dashboard: dashboardService
};

// Exportação padrão também
export default apiService;