import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Pencil, Trash2, Calendar, User, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { FaTasks } from 'react-icons/fa';
import { useDashConect } from '../conect/dashconect';
import { apiService } from '../services/api';

// Interface para resposta da API (backend PostgreSQL)
interface TarefaAPI {
  id: number;
  titulo: string;
  descricao?: string;
  data_prazo: string; // Formato: yyyy-mm-dd
  prioridade: 'baixa' | 'media' | 'alta';
  status: 'pendente' | 'andamento' | 'concluido';
  data_criacao: string;
  data_conclusao?: string;
  progresso?: number;
  responsaveis: string[];
  categorias: string[];
  usuario_id: number;
}

// Interface para UI (formato usado no frontend)
interface TarefaUIView {
  id: string;
  titulo: string;
  descricao?: string;
  data: string; // Formato: yyyy-mm-dd (renomeado de data_prazo)
  responsavel: string[];
  prioridade: 'Baixa' | 'Média' | 'Alta';
  status: 'A Fazer' | 'Em andamento' | 'Concluído';
  categorias: string[];
  dataCriacao: string;
  progresso?: number;
}

// Interface para os dados que a API espera
interface TarefaAPIData {
  titulo: string;
  descricao?: string;
  data: string;
  responsavel: string; // string, não array
  prioridade: 'baixa' | 'media' | 'alta';
  status: 'pendente' | 'andamento' | 'concluido';
  categorias: string; // string separada por vírgulas
}

const STATUS_COLUMNS = [
  { name: 'A Fazer', color: 'bg-blue-600', apiStatus: 'pendente' },
  { name: 'Em andamento', color: 'bg-amber-500', apiStatus: 'andamento' },
  { name: 'Concluído', color: 'bg-emerald-500', apiStatus: 'concluido' },
] as const;

const PRIORIDADES_UI = ['Baixa', 'Média', 'Alta'] as const;
const PRIORIDADES_API = ['baixa', 'media', 'alta'] as const;

// Funções de conversão
const converterParaUI = (tarefaApi: any): TarefaUIView => {
  // Parsear responsavel e categorias de string para array
  const responsavelArray = tarefaApi.responsavel ? 
    (typeof tarefaApi.responsavel === 'string' ? 
      tarefaApi.responsavel.split(',').map((r: string) => r.trim()).filter((r: string) => r) : 
      Array.isArray(tarefaApi.responsavel) ? tarefaApi.responsavel : []) : [];

  const categoriasArray = tarefaApi.categorias ? 
    (typeof tarefaApi.categorias === 'string' ? 
      tarefaApi.categorias.split(',').map((c: string) => c.trim()).filter((c: string) => c) : 
      Array.isArray(tarefaApi.categorias) ? tarefaApi.categorias : []) : [];

  // Converter prioridade
  let prioridadeUI: 'Baixa' | 'Média' | 'Alta' = 'Média';
  if (tarefaApi.prioridade === 'alta') prioridadeUI = 'Alta';
  else if (tarefaApi.prioridade === 'baixa') prioridadeUI = 'Baixa';

  // Converter status
  let statusUI: 'A Fazer' | 'Em andamento' | 'Concluído' = 'A Fazer';
  if (tarefaApi.status === 'concluido') statusUI = 'Concluído';
  else if (tarefaApi.status === 'andamento') statusUI = 'Em andamento';

  return {
    id: tarefaApi.id.toString(),
    titulo: tarefaApi.titulo || '',
    descricao: tarefaApi.descricao,
    data: tarefaApi.data_prazo || tarefaApi.data || new Date().toISOString().split('T')[0],
    responsavel: responsavelArray,
    prioridade: prioridadeUI,
    status: statusUI,
    categorias: categoriasArray,
    dataCriacao: tarefaApi.data_criacao || '',
    progresso: tarefaApi.progresso || 0
  };
};

const converterParaAPI = (tarefaUI: TarefaUIView): TarefaAPIData => {
  // Converter prioridade
  let prioridadeAPI: 'baixa' | 'media' | 'alta' = 'media';
  if (tarefaUI.prioridade === 'Alta') prioridadeAPI = 'alta';
  else if (tarefaUI.prioridade === 'Baixa') prioridadeAPI = 'baixa';

  // Converter status
  let statusAPI: 'pendente' | 'andamento' | 'concluido' = 'pendente';
  if (tarefaUI.status === 'Concluído') statusAPI = 'concluido';
  else if (tarefaUI.status === 'Em andamento') statusAPI = 'andamento';

  return {
    titulo: tarefaUI.titulo.trim(),
    descricao: tarefaUI.descricao?.trim() || '',
    data: tarefaUI.data,
    responsavel: tarefaUI.responsavel.join(', '), // Converter array para string
    prioridade: prioridadeAPI,
    status: statusAPI,
    categorias: tarefaUI.categorias.join(', ') // Converter array para string
  };
};

// Componente Card
interface CardProps {
  tarefa: TarefaUIView;
  onEdit: (task: TarefaUIView) => void;
  onDelete: (id: string) => void;
  onDragStart: (taskId: string) => void;
}

const TaskCard: React.FC<CardProps> = ({ tarefa, onEdit, onDelete, onDragStart }) => {
  const priorityColor = tarefa.prioridade === 'Alta' ? 'bg-red-100 text-red-800 border-red-200' :
                        tarefa.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-gray-100 text-gray-800 border-gray-200';

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
      className="bg-white p-4 shadow-sm rounded-lg mb-3 border border-gray-200 hover:shadow-md transition-shadow cursor-move hover:border-blue-300"
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {tarefa.categorias.length > 0 && (
            <div className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {tarefa.categorias.join(', ')}
            </div>
          )}
         
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            {tarefa.titulo}
          </h4>
        </div>

        <div className="flex space-x-2 flex-shrink-0">
          <button 
            onClick={() => onEdit(tarefa)} 
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => onDelete(tarefa.id)} 
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {tarefa.descricao && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {tarefa.descricao}
        </p>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityColor}`}>
            {tarefa.prioridade}
          </span>
          <div className="flex items-center text-gray-500 text-[10px]">
            <Calendar className="w-3 h-3 mr-1" />
            {formatarData(tarefa.data)}
          </div>
        </div>
       
        <div className="flex items-center space-x-1">
          {tarefa.responsavel?.map((responsavelItem, index) => {
            let nome = "";
            
            if (typeof responsavelItem === 'string') {
              nome = responsavelItem.trim();
            } else if (responsavelItem != null) {
              nome = String(responsavelItem).trim();
            }
            
            if (!nome) return null;
            
            const firstInitial = nome.charAt(0).toUpperCase(); 
            const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-amber-100 text-amber-800', 'bg-red-100 text-red-800'];
            const color = colors[index % colors.length];

            return (
              <div
                key={index}
                title={nome} 
                className={`
                  ${color} rounded-full h-6 w-6 flex items-center justify-center font-bold text-xs 
                  border-2 border-white cursor-help hover:scale-110 transition-transform
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
  onSubmit: (task: TarefaUIView) => Promise<void>;
  initialTask: TarefaUIView | null;
}

const TaskModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const [taskState, setTaskState] = useState<TarefaUIView>({
    id: '',
    titulo: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    responsavel: [],
    prioridade: 'Média',
    status: 'A Fazer',
    categorias: [],
    dataCriacao: ''
  });
  
  const [currentResponsible, setCurrentResponsible] = useState('');
  const [currentCategoria, setCurrentCategoria] = useState('');
  const [dataError, setDataError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTaskState(initialTask);
    } else {
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
        categorias: [],
        dataCriacao: ''
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
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setDataError('A data não pode ser no passado');
      } else {
        setDataError('');
      }
      
      setTaskState(prev => ({ ...prev, [name]: value }));
      return;
    }

    setTaskState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskState.titulo.trim()) {
      alert("Por favor, preencha o título da tarefa.");
      return;
    }

    if (!taskState.data) {
      setDataError('Por favor, selecione uma data.');
      return;
    }

    if (dataError) {
      alert("Por favor, corrija os erros antes de salvar.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(taskState);
    } finally {
      setLoading(false);
    }
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
              className="text-gray-500 hover:text-gray-800 transition-colors p-1"
              aria-label="Fechar"
              disabled={loading}
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o título da tarefa"
                maxLength={100}
                disabled={loading}
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Descreva a tarefa em detalhes..."
                maxLength={500}
                disabled={loading}
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
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    dataError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={loading}
                />
                
                {dataError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {dataError}
                  </p>
                )}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  {PRIORIDADES_UI.map(p => (
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
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite o nome do responsável"
                    disabled={loading}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddResponsible}
                  className="px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 font-medium"
                  aria-label="Adicionar responsável"
                  disabled={loading}
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
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-200"
                      >
                        <User size={12} />
                        <span>{name}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveResponsible(name)} 
                          className="text-blue-600 hover:text-blue-800 ml-1"
                          aria-label={`Remover ${name}`}
                          disabled={loading}
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
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Planejamento, Reunião"
                    maxLength={50}
                    disabled={loading}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddCategoria}
                  className="px-4 py-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 font-medium"
                  aria-label="Adicionar categoria"
                  disabled={loading}
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
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-800 rounded-lg text-sm font-medium border border-green-200"
                      >
                        <Tag size={12} />
                        <span>{cat}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveCategoria(cat)} 
                          className="text-green-600 hover:text-green-800 ml-1"
                          aria-label={`Remover ${cat}`}
                          disabled={loading}
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
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
                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 min-w-[120px] justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>{initialTask ? 'Salvar' : 'Criar Tarefa'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente principal CORRIGIDO
export default function Tarefas() {
  const { 
    data, 
    atualizarTarefas,
    removerTarefa,
    sincronizarDashboard
  } = useDashConect();
  
  const [tasks, setTasks] = useState<TarefaUIView[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TarefaUIView | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Refs para controlar loops
  const hasLoaded = useRef(false);
  const isFetching = useRef(false);

  // Carregar dados do backend - CORREÇÃO DO LOOP
  useEffect(() => {
    const carregarDados = async () => {
      // Prevenir múltiplas chamadas simultâneas
      if (isFetching.current || hasLoaded.current) {
        return;
      }

      isFetching.current = true;
      setLoading(true);
      
      try {
        console.log("📡 Buscando tarefas do servidor...");
        const tarefasData = await apiService.tarefas.getAll();
        
        console.log(`✅ ${tarefasData.length} tarefas recebidas do servidor`);
        
        // Converter dados da API para UI
        const tarefasUI: TarefaUIView[] = tarefasData.map((t: any) => converterParaUI(t));
        
        setTasks(tarefasUI);
        hasLoaded.current = true;
        
        // Atualizar contexto do dashboard (formato correto para dashconect)
        const tarefasContexto = tarefasUI.map(t => {
          // Converter status UI para API
          let statusAPI: 'pendente' | 'andamento' | 'concluido' = 'pendente';
          if (t.status === 'Concluído') statusAPI = 'concluido';
          else if (t.status === 'Em andamento') statusAPI = 'andamento';
          
          return {
            id: t.id,
            titulo: t.titulo,
            descricao: t.descricao || '',
            status: statusAPI,
            responsavel: t.responsavel.join(', '),
            prioridade: (t.prioridade.toLowerCase() as "baixa" | "media" | "alta"),
            dataCriacao: t.dataCriacao,
            dataPrazo: t.data,
            progresso: t.progresso || 0,
            categorias: t.categorias
          };
        });
        
        atualizarTarefas(tarefasContexto);
        
      } catch (error) {
        console.error('❌ Erro ao carregar tarefas:', error);
        hasLoaded.current = true;
        
        // Usar dados do contexto como fallback apenas uma vez
        if (data?.tarefas?.length > 0 && tasks.length === 0) {
          const contextData: TarefaUIView[] = data.tarefas.map((t: any) => {
            // Converter do formato do contexto para TarefaAPI temporário
            const tempTarefaAPI = {
              id: parseInt(t.id),
              titulo: t.titulo,
              descricao: t.descricao,
              data_prazo: t.dataPrazo || new Date().toISOString().split('T')[0],
              prioridade: (t.prioridade as 'baixa' | 'media' | 'alta') || 'media',
              status: (t.status as 'pendente' | 'andamento' | 'concluido') || 'pendente',
              data_criacao: t.dataCriacao || '',
              responsavel: t.responsavel ? t.responsavel.split(',').map((r: string) => r.trim()).filter((r: string) => r) : [],
              categorias: t.categorias || [],
              usuario_id: 1 // valor temporário
            };
            
            return converterParaUI(tempTarefaAPI);
          });
          setTasks(contextData);
        }
      } finally {
        setLoading(false);
        setTimeout(() => {
          isFetching.current = false;
        }, 1000);
      }
    };

    // Carregar dados apenas uma vez
    if (!hasLoaded.current) {
      carregarDados();
    }

    // Cleanup
    return () => {
      hasLoaded.current = false;
    };
  }, []); // Array vazio para executar apenas uma vez

  // Funções para arrastar tarefas
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TarefaUIView['status']) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    
    if (draggedTaskId) {
      try {
        setSaving(true);
        
        // Encontrar a tarefa a ser atualizada
        const taskToUpdate = tasks.find(t => t.id === draggedTaskId);
        if (taskToUpdate) {
          // Preparar dados atualizados
          const tarefaAtualizada: TarefaUIView = {
            ...taskToUpdate,
            status: newStatus
          };
          
          const dadosAPI = converterParaAPI(tarefaAtualizada);
          
          // Atualizar no backend
          await apiService.tarefas.update(parseInt(draggedTaskId), dadosAPI);
          
          // Atualizar localmente
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === draggedTaskId ? tarefaAtualizada : task
            )
          );
          
          // SINCRONIZAR COM DASHBOARD
          await sincronizarDashboard('tarefas');
        }
        setDraggedTaskId(null);
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status da tarefa');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: TarefaUIView) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      setSaving(true);
      // 1. Excluir do servidor
      await apiService.tarefas.delete(parseInt(id));
      
      // 2. Atualizar lista local
      setTasks(prev => prev.filter(t => t.id !== id));
      
      // 3. Atualizar contexto
      removerTarefa(id);
      
      // 4. SINCRONIZAR COM DASHBOARD
      await sincronizarDashboard('tarefas');
      
      alert('✅ Tarefa excluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao excluir tarefa:', error);
      alert('❌ Erro ao excluir tarefa. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTask = async (taskData: TarefaUIView) => {
    try {
      setSaving(true);
      console.log('💾 Salvando tarefa:', taskData);
      
      const dadosAPI = converterParaAPI(taskData);
      
      console.log('📤 Dados para API:', dadosAPI);

      if (editingTask) {
        // Atualizar tarefa existente
        console.log(`🔄 Atualizando tarefa ID: ${taskData.id}`);
        const resposta = await apiService.tarefas.update(parseInt(taskData.id), dadosAPI);
        
        console.log('📥 Resposta da API:', resposta);
        
        // Converter resposta para UI e atualizar
        const tarefaAtualizada = converterParaUI(resposta);
        
        // Atualizar localmente
        setTasks(prev => prev.map(t => t.id === taskData.id ? tarefaAtualizada : t));
        
      } else {
        // Criar nova tarefa
        console.log('🆕 Criando nova tarefa');
        const novaTarefaAPI = await apiService.tarefas.create(dadosAPI);
        
        console.log('✅ Tarefa criada no servidor:', novaTarefaAPI);
        
        // Converter resposta para UI
        const novaTarefaUI = converterParaUI(novaTarefaAPI);
        
        // Adicionar à lista local
        setTasks(prev => [novaTarefaUI, ...prev]);
      }
      
      // SINCRONIZAR COM DASHBOARD
      await sincronizarDashboard('tarefas');
      
      console.log('✅ Tarefa salva com sucesso!');
      setEditingTask(null);
      setIsModalOpen(false);
      
      alert('✅ Tarefa salva com sucesso!');
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar tarefa:', error);
      alert(`❌ Erro ao salvar tarefa: ${error.message || 'Tente novamente'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Cabeçalho azul padronizado */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-2">
            <FaTasks className="w-8 h-8 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Gestão de Tarefas
            </h1>
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
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              <span className="text-blue-600 font-medium">Dashboard</span> &gt; Gestão de Tarefas
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Arraste e solte para alterar o status das tarefas
            </p>
          </div>

          {/* Conteúdo principal */}
          <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
              <div>
              </div>
              <button
                onClick={handleNewTask}
                className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-150 shadow-md hover:shadow-lg"
                disabled={saving || loading}
              >
                <Plus size={18} />
                <span>Nova Tarefa</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando tarefas...</p>
              </div>
            ) : (
              <div className="flex space-x-6 overflow-x-auto pb-4">
                {STATUS_COLUMNS.map(column => (
                  <div 
                    key={column.name} 
                    className="flex-shrink-0 w-80"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.name as TarefaUIView['status'])}
                  >
                    <div className={`flex items-center justify-between p-3 rounded-t-lg text-white ${column.color}`}>
                      <h3 className="font-semibold text-base">{column.name}</h3>
                      <span className="bg-white text-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                        {tasks.filter(t => t.status === column.name).length}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-b-lg min-h-64 max-h-[70vh] overflow-y-auto transition-colors duration-200 border border-gray-200 border-t-0">
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