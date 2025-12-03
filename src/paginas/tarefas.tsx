import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { FaTasks } from 'react-icons/fa';

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // Formato: dd/mm/aaaa
  responsavel: string[];
  prioridade: 'Baixa' | 'Média' | 'Alta';
  status: 'A Fazer' | 'Em andamento' | 'Concluído';
  categorias: string;
}

const initialTasks: Tarefa[] = [
  {
    id: '1',
    titulo: 'Tarefa de Exemplo',
    descricao: 'Esta é uma tarefa de exemplo',
    data: '15/12/2024',
    responsavel: ['João Silva'],
    prioridade: 'Média',
    status: 'A Fazer',
    categorias: 'Exemplo, Teste'
  }
];

const STATUS_COLUMNS = [
  { name: 'A Fazer', color: 'bg-[#0057B7]' },
  { name: 'Em andamento', color: 'bg-[#D49125]' },
  { name: 'Concluído', color: 'bg-[#12A107]' },
] as const;

const PRIORIDADES = ['Baixa', 'Média', 'Alta'] as const;


// Cartão com arraste 

interface CardProps {
  tarefa: Tarefa;
  onEdit: (task: Tarefa) => void;
  onDelete: (id: string) => void;
  onDragStart: (taskId: string) => void;
}

const TaskCard: React.FC<CardProps> = ({ tarefa, onEdit, onDelete, onDragStart }) => {
  const priorityColor = tarefa.prioridade === 'Alta' ? 'bg-red-200 text-red-800' :
                        tarefa.prioridade === 'Média' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-800';

  // Função para arrastar - CORRIGIDA
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', tarefa.id);
    onDragStart(tarefa.id);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  return (
    <div 
      className="bg-white p-3 shadow-sm rounded-lg mb-3 border border-gray-200 hover:shadow-md transition-shadow cursor-move"
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="text-xs text-gray-500 font-semibold mb-1">
        {tarefa.categorias ?
          tarefa.categorias
            .split(',')
            .map(c => c.trim())
            .filter(c => c.length > 0)
            .join(', ')
          : null
        }
      </div>
     
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold truncate text-gray-800">
          {tarefa.titulo}
        </h4>

        <div className="flex space-x-2 flex-shrink-0">
          <Pencil size={14} className="text-gray-400 cursor-pointer hover:text-blue-500" onClick={() => onEdit(tarefa)} />
          <Trash2 size={14} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => onDelete(tarefa.id)} />
        </div>
      </div>

      {tarefa.descricao && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {tarefa.descricao}
        </p>
      )}

      <div className="flex justify-between items-center text-xs mt-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded ${priorityColor} text-[10px]`}>{tarefa.prioridade}</span>
          <div className="flex items-center text-gray-500 text-[10px]">
            <Calendar className="w-3 h-3 mr-1" />
            {tarefa.data}
          </div>
        </div>
       
        <div className="flex items-center space-x-1">
          {tarefa.responsavel && tarefa.responsavel.map((nome, index) => {
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


// Modal lateral com calendário 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Tarefa) => void;
  initialTask: Tarefa | null;
}

const TaskModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const [taskState, setTaskState] = useState<Tarefa>({
    id: '',
    titulo: '',
    descricao: '',
    data: '',
    responsavel: [],
    prioridade: 'Média',
    status: 'A Fazer',
    categorias: ''
  });
  
  const [currentResponsible, setCurrentResponsible] = useState('');
  const [dataError, setDataError] = useState('');

  // Função para converter string dd/mm/aaaa para Date
  const parseDateString = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.length !== 10) return null;
    
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Função para converter Date para string dd/mm/aaaa
  const formatDateToString = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
        data: formatDateToString(tomorrow),
        responsavel: [],
        prioridade: 'Média',
        status: 'A Fazer',
        categorias: ''
      });
    }
    setCurrentResponsible('');
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

  // Função para validar data
  const validateDate = (dateStr: string): boolean => {
    if (!dateStr || dateStr.length !== 10) return false;
    
    const date = parseDateString(dateStr);
    if (!date) return false;
    
    const [day, month, year] = dateStr.split('/').map(Number);
    return date.getDate() === day && 
           (date.getMonth() + 1) === month && 
           date.getFullYear() === year;
  };

  // Função para formatar data enquanto digita
  const formatDateInput = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    
    let formatted = '';
    
    if (cleaned.length > 0) {
      formatted = cleaned.substring(0, 2);
    }
    if (cleaned.length > 2) {
      formatted += '/' + cleaned.substring(2, 4);
    }
    if (cleaned.length > 4) {
      formatted += '/' + cleaned.substring(4, 8);
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'data') {
      const formattedValue = formatDateInput(value);
      setTaskState(prev => ({ ...prev, [name]: formattedValue }));
      
      if (formattedValue.length === 10) {
        if (!validateDate(formattedValue)) {
        } else {
          setDataError('');
        }
      } else if (formattedValue.length > 0) {
      } else {
        setDataError('');
      }
      return;
    }

    setTaskState(prev => ({ ...prev, [name]: value }));
  };

  // FUNÇÃO CORRIGIDA para abrir date picker
  const handleCalendarIconClick = () => {
    // Criar um input date e simular clique
    const input = document.createElement('input');
    input.type = 'date';
    
    // Configurar valor atual se existir
    if (taskState.data && validateDate(taskState.data)) {
      const date = parseDateString(taskState.data);
      if (date) {
        input.value = date.toISOString().split('T')[0];
      }
    }
    
    // Configurar data mínima
    const today = new Date();
    input.min = today.toISOString().split('T')[0];
    
    // Configurar evento change
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.value) {
        const selectedDate = new Date(target.value);
        const formattedDate = formatDateToString(selectedDate);
        setTaskState(prev => ({ ...prev, data: formattedDate }));
        setDataError('');
      }
    };
    
    // Adicionar ao DOM, focar e remover
    document.body.appendChild(input);
    input.focus();
    input.click();
    document.body.removeChild(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskState.titulo.trim()) {
      alert("Por favor, preencha o título da tarefa.");
      return;
    }

    if (!taskState.data || !validateDate(taskState.data)) {
      setDataError('Por favor, preencha uma data válida (dd/mm/aaaa).');
      return;
    }

    onSubmit(taskState);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.currentTarget.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (e.currentTarget.getAttribute('name') === 'responsavelInput') {
        handleAddResponsible();
      }
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
                <span>{taskState.descricao.length}/500 caracteres</span>
              </div>
            </div>

            {/* Data e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data - COM CALENDÁRIO FUNCIONAL */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Data *
                </label>
                <div className="relative">
                  {/* Ícone do calendário - AGORA FUNCIONAL */}
                  <button
                    type="button"
                    onClick={handleCalendarIconClick}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-blue-500 cursor-pointer z-10"
                    aria-label="Abrir calendário"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                  
                  {/* Campo de data */}
                  <input
                    name="data"
                    type="text"
                    value={taskState.data}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      dataError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
                
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
                    name="responsavelInput"
                    value={currentResponsible} 
                    onChange={(e) => setCurrentResponsible(e.target.value)}
                    onKeyDown={handleKeyDown}
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
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  name="categorias" 
                  value={taskState.categorias} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Planejamento, Reunião, Desenvolvimento"
                  maxLength={200}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Separe por vírgula</span>
                <span>{taskState.categorias.length}/200 caracteres</span>
              </div>
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


// Parte com o Kanban 

export default function Tarefas() {
  const [tasks, setTasks] = useState<Tarefa[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tarefa | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // CORREÇÃO: Funções para arrastar tarefas
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

  const handleDrop = (e: React.DragEvent, newStatus: Tarefa['status']) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-200');
    
    if (draggedTaskId) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === draggedTaskId ? { ...task, status: newStatus } : task
        )
      );
      setDraggedTaskId(null);
    }
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Tarefa) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (newTask: Tarefa) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...newTask } : t));
    } else {
      setTasks([...tasks, { ...newTask, id: Date.now().toString() }]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setTasks(tasks.filter(t => t.id !== id));
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

            <div className="flex space-x-6 overflow-x-auto pb-4">
              {STATUS_COLUMNS.map(column => (
                <div 
                  key={column.name} 
                  className="flex-shrink-0 w-80"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.name as Tarefa['status'])}
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
          </div>
        </div>
      </div>

      {/* Chamada do modal lateral */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  );
}