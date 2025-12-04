// frontend/src/paginas/tarefas.tsx - VERSÃO FINAL CORRIGIDA
import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { FaTasks } from 'react-icons/fa';
import { useDashConect } from '../conect/dashconect';
import { apiService } from '../services/api';
import type { Tarefa as ApiTarefa } from '../services/api';

// Interface compatível com API
interface TarefaUI {
  id: string;
  titulo: string;
  descricao?: string;
  data: string; // Formato: yyyy-mm-dd
  responsavel: string[];
  prioridade: 'Baixa' | 'Média' | 'Alta';
  status: 'A Fazer' | 'Em andamento' | 'Concluído';
  categorias: string[];
  dataCriacao?: Date;
  progresso?: number;
}

const STATUS_COLUMNS = [
  { name: 'A Fazer', color: 'bg-[#0057B7]' },
  { name: 'Em andamento', color: 'bg-[#D49125]' },
  { name: 'Concluído', color: 'bg-[#12A107]' },
] as const;

const PRIORIDADES = ['Baixa', 'Média', 'Alta'] as const;

// Componente Card com arraste
interface CardProps {
  tarefa: TarefaUI;
  onEdit: (task: TarefaUI) => void;
  onDelete: (id: string) => void;
  onDragStart: (taskId: string) => void;
}

const TaskCard: React.FC<CardProps> = ({ tarefa, onEdit, onDelete, onDragStart }) => {
  const priorityColor = tarefa.prioridade === 'Alta' ? 'bg-red-200 text-red-800' :
                        tarefa.prioridade === 'Média' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-800';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', tarefa.id);
    onDragStart(tarefa.id);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  // Formatar data para exibição
  const formatarData = (dataString: string): string => {
    try {
      const [ano, mes, dia] = dataString.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dataString;
    }
  };

  return (
    <div 
      className="bg-white p-3 shadow-sm rounded-lg mb-3 border border-gray-200 hover:shadow-md transition-shadow cursor-move"
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="text-xs text-gray-500 font-semibold mb-1">
        {tarefa.categorias?.join(', ')}
      </div>
     
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold truncate text-gray-800">
          {tarefa.titulo}
        </h4>

        <div className="flex space-x-2 flex-shrink-0">
          <Pencil 
            size={14} 
            className="text-gray-400 cursor-pointer hover:text-blue-500" 
            onClick={() => onEdit(tarefa)} 
          />
          <Trash2 
            size={14} 
            className="text-gray-400 cursor-pointer hover:text-red-500" 
            onClick={() => onDelete(tarefa.id)} 
          />
        </div>
      </div>

      {tarefa.descricao && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {tarefa.descricao}
        </p>
      )}

      <div className="flex justify-between items-center text-xs mt-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded ${priorityColor} text-[10px]`}>
            {tarefa.prioridade}
          </span>
          <div className="flex items-center text-gray-500 text-[10px]">
            <Calendar className="w-3 h-3 mr-1" />
            {formatarData(tarefa.data)}
          </div>
        </div>
       
        <div className="flex items-center space-x-1">
          {tarefa.responsavel?.map((nome, index) => {
            const firstInitial = nome.trim().charAt(0).toUpperCase(); 
            const colors = ['bg-blue-300 text-blue-800', 'bg-green-300 text-green-800', 'bg-yellow-300 text-yellow-800', 'bg-red-300 text-red-800'];
            const color = colors[index % colors.length];

            return (
              <div
                key={index}
                title={nome} 
                className={`
                  ${color} rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] 
                  ring-2 ring-white cursor-help hover:z-10 transition-all duration-150
                `}
                style={{ marginLeft: index > 0 ? '-8px' : '0px' }} 
              >
                {firstInitial}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TarefaUI) => void;
  initialTask: TarefaUI | null;
}

const TaskModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const [taskState, setTaskState] = useState<TarefaUI>({
    id: '',
    titulo: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    responsavel: [],
    prioridade: 'Média',
    status: 'A Fazer',
    categorias: []
  });
  
  const [currentResponsible, setCurrentResponsible] = useState('');
  const [currentCategoria, setCurrentCategoria] = useState('');
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTaskState(initialTask);
    } else {
      // Data padrão: amanhã
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTaskState({
        id: '',
        titulo: '',
        descricao: '',
        data: tomorrow.toISOString().split('T')[0],
        responsavel: [],
        prioridade: 'Média',
        status: 'A Fazer',
        categorias: []
      });
    }
    setCurrentResponsible('');
    setCurrentCategoria('');
    setDataError('');
  }, [initialTask, isOpen]);

  const handleAddResponsible = () => {
    const name = currentResponsible.trim();
    if (name && !taskState.responsavel.includes(name)) {
      setTaskState(prev => ({ 
        ...prev, 
        responsavel: [...prev.responsavel, name] 
      }));
      setCurrentResponsible('');
    }
  };

  const handleRemoveResponsible = (nameToRemove: string) => {
    setTaskState(prev => ({
      ...prev,
      responsavel: prev.responsavel.filter(name => name !== nameToRemove),
    }));
  };

  const handleAddCategoria = () => {
    const cat = currentCategoria.trim();
    if (cat && !taskState.categorias.includes(cat)) {
      setTaskState(prev => ({ 
        ...prev, 
        categorias: [...prev.categorias, cat] 
      }));
      setCurrentCategoria('');
    }
  };

  const handleRemoveCategoria = (catToRemove: string) => {
    setTaskState(prev => ({
      ...prev,
      categorias: prev.categorias.filter(cat => cat !== catToRemove),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'data') {
      setTaskState(prev => ({ ...prev, [name]: value }));
      setDataError('');
      return;
    }

    setTaskState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskState.titulo.trim()) {
      alert("Por favor, preencha o título da tarefa.");
      return;
    }

    if (!taskState.data) {
      setDataError('Por favor, selecione uma data.');
      return;
    }

    onSubmit(taskState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 transition-opacity duration-300">
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {initialTask ? 'Atualize os detalhes da tarefa' : 'Preencha os detalhes da nova tarefa'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>
           
          <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto flex-grow pr-2">
            {/* Título */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Título *
              </label>
              <input 
                name="titulo" 
                value={taskState.titulo} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o título da tarefa"
                maxLength={100}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Obrigatório</span>
                <span>{taskState.titulo.length}/100 caracteres</span>
              </div>
            </div>
             
            {/* Descrição */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea 
                name="descricao" 
                value={taskState.descricao} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Descreva a tarefa em detalhes..."
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Opcional</span>
                <span>{(taskState.descricao || '').length}/500 caracteres</span>
              </div>
            </div>

            {/* Data e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Data *
                </label>
                <input
                  name="data"
                  type="date"
                  value={taskState.data}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    dataError ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                
                {/* Mensagens de validação */}
                <div className="min-h-[20px]">
                  {dataError ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {dataError}
                    </p>
                  ) : null}
                </div>
              </div>
              
              {/* Prioridade */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Prioridade
                </label>
                <select 
                  name="prioridade" 
                  value={taskState.prioridade} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PRIORIDADES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Responsáveis */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Responsáveis
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    value={currentResponsible} 
                    onChange={(e) => setCurrentResponsible(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddResponsible();
                      }
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite o nome do responsável"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddResponsible}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1"
                  aria-label="Adicionar responsável"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Adicionar</span>
                </button>
              </div>
              
              {/* Lista de responsáveis */}
              {taskState.responsavel.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {taskState.responsavel.map((name, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm font-medium"
                      >
                        <User size={12} />
                        <span>{name}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveResponsible(name)} 
                          className="text-blue-600 hover:text-blue-800 ml-1"
                          aria-label={`Remover ${name}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Categorias */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Categorias
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    value={currentCategoria} 
                    onChange={(e) => setCurrentCategoria(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategoria();
                      }
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Planejamento, Reunião"
                    maxLength={50}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddCategoria}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1"
                  aria-label="Adicionar categoria"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Adicionar</span>
                </button>
              </div>
              
              {/* Lista de categorias */}
              {taskState.categorias.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {taskState.categorias.map((cat, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm font-medium"
                      >
                        <Tag size={12} />
                        <span>{cat}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveCategoria(cat)} 
                          className="text-green-600 hover:text-green-800 ml-1"
                          aria-label={`Remover ${cat}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select 
                name="status" 
                value={taskState.status} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500"
              >
                {STATUS_COLUMNS.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                {initialTask ? 'Salvar Alterações' : 'Criar Tarefa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente principal
export default function Tarefas() {
  const { data, atualizarTarefas } = useDashConect();
  const [tasks, setTasks] = useState<TarefaUI[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TarefaUI | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar dados do backend
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const tarefasData = await apiService.tarefas.getAll();
        
        const tarefasUI: TarefaUI[] = tarefasData.map((t: ApiTarefa) => {
          // Converter categorias para array
          let categoriasArray: string[] = [];
          if (Array.isArray(t.categorias)) {
            categoriasArray = t.categorias;
          } else if (typeof t.categorias === 'string' && t.categorias) {
            categoriasArray = t.categorias.split(',').map((c: string) => c.trim()).filter((c: string) => c);
          }
          
          // Converter responsavel para array
          let responsavelArray: string[] = [];
          if (Array.isArray(t.responsavel)) {
            responsavelArray = t.responsavel;
          } else if (typeof t.responsavel === 'string' && t.responsavel) {
            try {
              // Tentar parsear como JSON
              const parsed = JSON.parse(t.responsavel);
              responsavelArray = Array.isArray(parsed) ? parsed : [t.responsavel];
            } catch {
              // Se falhar, tratar como string simples
              responsavelArray = t.responsavel ? [t.responsavel] : [];
            }
          }
          
          // Converter status para formato UI
          let statusUI: 'A Fazer' | 'Em andamento' | 'Concluído' = 'A Fazer';
          if (t.status === 'concluido' || t.status === 'Concluído') {
            statusUI = 'Concluído';
          } else if (t.status === 'andamento' || t.status === 'Em andamento') {
            statusUI = 'Em andamento';
          }
          
          // Converter prioridade para formato UI
          let prioridadeUI: 'Baixa' | 'Média' | 'Alta' = 'Média';
          if (t.prioridade === 'alta' || t.prioridade === 'Alta') {
            prioridadeUI = 'Alta';
          } else if (t.prioridade === 'baixa' || t.prioridade === 'Baixa') {
            prioridadeUI = 'Baixa';
          }
          
          return {
            id: t.id.toString(),
            titulo: t.titulo || '',
            descricao: t.descricao || '',
            data: t.data || new Date().toISOString().split('T')[0],
            responsavel: responsavelArray,
            prioridade: prioridadeUI,
            status: statusUI,
            categorias: categoriasArray,
            dataCriacao: new Date(t.data_criacao || Date.now()),
            progresso: t.progresso || 0
          };
        });
        
        setTasks(tarefasUI);
        
        // Converter para o formato do contexto
        const tarefasContexto = tarefasUI.map(t => ({
          id: t.id,
          titulo: t.titulo,
          descricao: t.descricao || '',
          status: (t.status === 'Concluído' ? 'concluido' : 
                  t.status === 'Em andamento' ? 'andamento' : 'pendente') as "pendente" | "andamento" | "concluido",
          responsavel: t.responsavel.join(', '),
          prioridade: (t.prioridade.toLowerCase() as "baixa" | "media" | "alta"),
          dataCriacao: t.dataCriacao || new Date(),
          dataPrazo: new Date(t.data),
          progresso: t.status === 'Concluído' ? 100 : t.status === 'Em andamento' ? 50 : 0,
          categorias: t.categorias
        }));
        
        atualizarTarefas(tarefasContexto);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        // Usar dados do contexto como fallback
        const contextData: TarefaUI[] = data.tarefas.map((t: any) => {
          let statusUI: 'A Fazer' | 'Em andamento' | 'Concluído' = 'A Fazer';
          if (t.status === 'concluido') {
            statusUI = 'Concluído';
          } else if (t.status === 'andamento') {
            statusUI = 'Em andamento';
          }
          
          let prioridadeUI: 'Baixa' | 'Média' | 'Alta' = 'Média';
          if (t.prioridade === 'alta') {
            prioridadeUI = 'Alta';
          } else if (t.prioridade === 'baixa') {
            prioridadeUI = 'Baixa';
          }
          
          return {
            id: t.id,
            titulo: t.titulo,
            descricao: t.descricao || '',
            data: t.dataPrazo ? t.dataPrazo.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            responsavel: t.responsavel ? [t.responsavel] : [],
            prioridade: prioridadeUI,
            status: statusUI,
            categorias: t.categorias || [],
            dataCriacao: t.dataCriacao || new Date(),
            progresso: t.progresso || 0
          };
        });
        setTasks(contextData);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [data.tarefas, atualizarTarefas]);

  // Funções para arrastar tarefas
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-gray-200');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-gray-200');
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TarefaUI['status']) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-200');
    
    if (draggedTaskId) {
      try {
        // Converter status para formato API
        let statusAPI = newStatus;
        if (newStatus === 'Concluído') statusAPI = 'Concluído';
        else if (newStatus === 'Em andamento') statusAPI = 'Em andamento';
        else statusAPI = 'A Fazer';
        
        // Atualizar no backend
        const taskToUpdate = tasks.find(t => t.id === draggedTaskId);
        if (taskToUpdate) {
          await apiService.tarefas.update(parseInt(draggedTaskId), {
            titulo: taskToUpdate.titulo,
            descricao: taskToUpdate.descricao,
            data: taskToUpdate.data,
            responsavel: JSON.stringify(taskToUpdate.responsavel),
            prioridade: taskToUpdate.prioridade,
            status: statusAPI,
            categorias: taskToUpdate.categorias.join(', ')
          });
          
          // Atualizar localmente
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === draggedTaskId ? { ...task, status: newStatus } : task
            )
          );
        }
        setDraggedTaskId(null);
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status da tarefa');
      }
    }
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: TarefaUI) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: TarefaUI) => {
    try {
      // Converter responsavel para string JSON
      const responsavelStr = JSON.stringify(taskData.responsavel);
      
      if (editingTask) {
        // Atualizar tarefa existente
        await apiService.tarefas.update(parseInt(taskData.id), {
          titulo: taskData.titulo,
          descricao: taskData.descricao,
          data: taskData.data,
          responsavel: responsavelStr,
          prioridade: taskData.prioridade,
          status: taskData.status,
          categorias: taskData.categorias.join(', ')
        });
        
        setTasks(prev => prev.map(t => t.id === taskData.id ? taskData : t));
      } else {
        // Criar nova tarefa
        const novaTarefa = await apiService.tarefas.create({
          titulo: taskData.titulo,
          descricao: taskData.descricao,
          data: taskData.data,
          responsavel: responsavelStr,
          prioridade: taskData.prioridade,
          status: taskData.status,
          categorias: taskData.categorias.join(', ')
        });
        
        const novaTarefaUI: TarefaUI = {
          id: novaTarefa.id.toString(),
          titulo: novaTarefa.titulo,
          descricao: novaTarefa.descricao || '',
          data: novaTarefa.data || new Date().toISOString().split('T')[0],
          responsavel: novaTarefa.responsavel ? 
            (Array.isArray(novaTarefa.responsavel) ? 
              novaTarefa.responsavel : 
              (typeof novaTarefa.responsavel === 'string' ? 
                JSON.parse(novaTarefa.responsavel) : 
                [])) : [],
          prioridade: (novaTarefa.prioridade as 'Baixa' | 'Média' | 'Alta') || 'Média',
          status: (novaTarefa.status as 'A Fazer' | 'Em andamento' | 'Concluído') || 'A Fazer',
          categorias: novaTarefa.categorias ? 
            (Array.isArray(novaTarefa.categorias) ? 
              novaTarefa.categorias : 
              novaTarefa.categorias.split(',').map((c: string) => c.trim())) : [],
          dataCriacao: new Date(novaTarefa.data_criacao || Date.now()),
          progresso: novaTarefa.progresso || 0
        };
        
        setTasks(prev => [novaTarefaUI, ...prev]);
      }
      
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Erro ao salvar tarefa. Tente novamente.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      await apiService.tarefas.delete(parseInt(id));
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      alert('Erro ao excluir tarefa. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Cabeçalho azul padronizado */}
      <div className="bg-blue-600 text-white w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-2">
            <FaTasks className="w-8 h-8 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Gestão de Tarefas
            </h1>
            <span className="text-xs bg-green-500 px-2 py-1 rounded-full">
              Tempo Real
            </span>
          </div>
          <p className="text-blue-100 text-lg">
            Organize e acompanhe o progresso das tarefas
          </p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Caminho de navegação */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="text-[#114A6D] font-medium">Dashboard</span> &gt; Gestão de Tarefas
            </p>
          </div>

          {/* Conteúdo principal */}
          <div className="p-6">
            <div className="mb-6 flex justify-end">
              <button
                onClick={handleNewTask}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-150 shadow-md"
              >
                <Plus size={18} />
                <span>Nova Tarefa</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando tarefas...</p>
              </div>
            ) : (
              <div className="flex space-x-6 overflow-x-auto pb-4">
                {STATUS_COLUMNS.map(column => (
                  <div 
                    key={column.name} 
                    className="flex-shrink-0 w-80"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.name as TarefaUI['status'])}
                  >
                    <div className={`flex items-center justify-between p-3 rounded-t-lg text-white ${column.color}`}>
                      <h3 className="font-semibold text-base">{column.name}</h3>
                      <span className="bg-white text-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                        {tasks.filter(t => t.status === column.name).length}
                      </span>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-b-lg min-h-64 max-h-[70vh] overflow-y-auto transition-colors duration-200">
                      {tasks
                        .filter(t => t.status === column.name)
                        .map(tarefa => (
                          <TaskCard
                            key={tarefa.id}
                            tarefa={tarefa}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onDragStart={handleDragStart}
                          />
                        ))}
                      
                      {tasks.filter(t => t.status === column.name).length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <p className="text-sm">Nenhuma tarefa aqui</p>
                          <p className="text-xs mt-1">Arraste tarefas para cá</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  );
}