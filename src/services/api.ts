// frontend/src/services/api.ts - VERSÃO ATUALIZADA
import apiClient from './apiClient';

// Interfaces atualizadas para corresponder ao backend
export interface Tarefa {
  id: number;
  titulo: string;
  descricao?: string;
  data: string;  // Campo data adicionado
  responsavel: string | string[];  // Pode ser string ou array
  prioridade: string;
  status: string;
  data_criacao: string;
  categorias?: string | string[];  // Pode ser string ou array
  progresso?: number;
  id_usuario?: string;
}

export interface Acao {
  id: number;
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
  data_criacao: string;
  fotos?: string[];
  status: string;
  id_usuario?: string;
}

export interface RegistroFinanceiro {
  id: number;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  tipo: string;
  forma_pagamento: string;
  comprovante?: string;
  data_criacao: string;
  tags?: string[];
  id_usuario?: string;
}

// TAREFAS SERVICE ATUALIZADO
export const tarefasService = {
  async getAll(): Promise<Tarefa[]> {
    try {
      const response = await apiClient.get('/api/tarefas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return [];
    }
  },

  async create(tarefaData: Omit<Tarefa, 'id' | 'data_criacao'>): Promise<Tarefa> {
    try {
      // Converter arrays para strings se necessário
      const dataToSend = {
        ...tarefaData,
        responsavel: Array.isArray(tarefaData.responsavel) 
          ? JSON.stringify(tarefaData.responsavel)
          : tarefaData.responsavel,
        categorias: Array.isArray(tarefaData.categorias)
          ? tarefaData.categorias.join(', ')
          : tarefaData.categorias || ''
      };
      
      const response = await apiClient.post('/api/tarefas', dataToSend);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  },

  async update(id: number, updates: Partial<Tarefa>): Promise<Tarefa> {
    try {
      // Converter arrays para strings se necessário
      const updatesToSend: any = { ...updates };
      
      if (updates.responsavel && Array.isArray(updates.responsavel)) {
        updatesToSend.responsavel = JSON.stringify(updates.responsavel);
      }
      
      if (updates.categorias && Array.isArray(updates.categorias)) {
        updatesToSend.categorias = updates.categorias.join(', ');
      }
      
      const response = await apiClient.put(`/api/tarefas/${id}`, updatesToSend);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/tarefas/${id}`);
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      throw error;
    }
  }
};

// AÇÕES SERVICE - MANTIDO
export const acoesService = {
  async getAll(): Promise<Acao[]> {
    try {
      const response = await apiClient.get('/api/acoes');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ações:', error);
      return [];
    }
  },

  async create(acaoData: Omit<Acao, 'id' | 'data_criacao'>): Promise<Acao> {
    try {
      const response = await apiClient.post('/api/acoes', acaoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ação:', error);
      throw error;
    }
  },

  async update(id: number, updates: Partial<Acao>): Promise<Acao> {
    try {
      const response = await apiClient.put(`/api/acoes/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar ação:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/acoes/${id}`);
    } catch (error) {
      console.error('Erro ao excluir ação:', error);
      throw error;
    }
  }
};

// FINANCEIRO SERVICE - MANTIDO
export const financeiroService = {
  async getAll(): Promise<RegistroFinanceiro[]> {
    try {
      const response = await apiClient.get('/api/financeiro');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar financeiro:', error);
      return [];
    }
  },

  async create(registroData: Omit<RegistroFinanceiro, 'id' | 'data_criacao'>): Promise<RegistroFinanceiro> {
    try {
      const response = await apiClient.post('/api/financeiro', registroData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar registro financeiro:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/financeiro/${id}`);
    } catch (error) {
      console.error('Erro ao excluir registro financeiro:', error);
      throw error;
    }
  }
};

// DASHBOARD SERVICE
export const dashboardService = {
  async getDashboardData(): Promise<any> {
    try {
      const response = await apiClient.get('/api/dashboard');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      return {
        tarefas: [],
        financeiro: [],
        estatisticas: {}
      };
    }
  }
};

// Exportação consolidada
export const apiService = {
  tarefas: tarefasService,
  acoes: acoesService,
  financeiro: financeiroService,
  dashboard: dashboardService
};

export default apiService;