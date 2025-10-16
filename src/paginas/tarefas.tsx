import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, ClipboardList } from 'lucide-react';


interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // Formato: dd/mm/aaaa
  responsavel: string [];
  prioridade: 'Baixa' | 'Média' | 'Alta';
  status: 'A Fazer' | 'Em andamento' | 'Concluído';
  categorias: string;
}

const initialTasks: Tarefa[] = [];


const STATUS_COLUMNS = [
  { name: 'A Fazer', color: 'bg-[#0057B7]' },
  { name: 'Em andamento', color: 'bg-[#D49125]' },
  { name: 'Concluído', color: 'bg-[#12A107]' },
] as const;

const PRIORIDADES = ['Baixa', 'Média', 'Alta'] as const;

// -----------------------------------------------
// Função que valida e formata data
// -----------------------------------------------

const validateAndFormatDate = (input: string): string => {
  let cleanInput = input.replace(/\D/g, '');

  let formattedDate = '';
  if (cleanInput.length > 0) {
    formattedDate += cleanInput.substring(0, 2);
  }
  if (cleanInput.length > 2) {
    formattedDate += '/' + cleanInput.substring(2, 4);
  }
  if (cleanInput.length > 4) {
    formattedDate += '/' + cleanInput.substring(4, 8);
  }
 
  return formattedDate.substring(0, 10);
};

// ===============================================
// Cartão
// ===============================================

interface CardProps {
  tarefa: Tarefa;
  onEdit: (task: Tarefa) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<CardProps> = ({ tarefa, onEdit, onDelete }) => {
  const priorityColor = tarefa.prioridade === 'Alta' ? 'bg-red-200 text-red-800' :
                        tarefa.prioridade === 'Média' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-800';

  return (
    <div className="bg-white p-3 shadow-sm rounded-lg mb-3 border border-gray-200">
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
          <Trash2 size={14} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => onDelete(tarefa.id)} />
        </div>
      </div>

        {tarefa.descricao && (
        <p className="text-xs text-gray-600 mb-3">
            {tarefa.descricao}
        </p>
    )}

      <div className="flex justify-between items-center text-xs mt-3">
        <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded ${priorityColor} text-[10px]`}>{tarefa.prioridade}</span>
            <span className="text-gray-500 text-[10px]">{tarefa.data}</span>
        </div>
       
        <div className="flex items-center space-x-1">
            <Pencil size={14} className="text-gray-400 cursor-pointer hover:text-blue-500 mr-2" onClick={() => onEdit(tarefa)} />
               
        {/*Parte que cuida da exibição dos ícones dos responsáveis pela tarefa*/}
        
        {tarefa.responsavel && tarefa.responsavel.map((nome, index) => {
            const firstInitial = nome.trim().charAt(0).toUpperCase(); 
            
            const colors = ['bg-blue-300 text-blue-800', 'bg-green-300 text-green-800', 'bg-yellow-300 text-yellow-800', 'bg-red-300 text-red-800'];
            const color = colors[index % colors.length];

            return (
                <span 
                    key={index}
                    title={nome} 
                    className={`
                        ${color} rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] 
                        ring-2 ring-white cursor-help 
                        hover:z-10 transition-all duration-150
                    `}
                    style={{ marginLeft: index > 0 ? '-8px' : '0px' }} 
                >
                    {firstInitial}
                </span>
            );
        })}
        </div>
      </div>
    </div>
  );
};


// ===============================================
// Modal lateral 
// ===============================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Tarefa) => void;
  initialTask: Tarefa | null;
}


const TaskModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const [taskState, setTaskState] = useState<Tarefa>(initialTask || {
    id: '', titulo: '', descricao: '', data: '', responsavel: [] , prioridade: 'Média', status: 'A Fazer', categorias: ''
  });


  
  const [currentResponsible, setCurrentResponsible] = useState('');

  useEffect(() => {
    setTaskState(initialTask || {
      id: '', titulo: '', descricao: '', data: '',  responsavel: [] , prioridade: 'Média', status: 'A Fazer', categorias: ''
    });


  setCurrentResponsible('');

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
   
    
    if (name === 'data') {
        const formattedValue = validateAndFormatDate(value);
        setTaskState(prev => ({ ...prev, [name]: formattedValue }));
        return;
    }

    setTaskState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   
    
    if (taskState.data.length !== 10) {
        alert("Por favor, preencha a data no formato dd/mm/aaaa (Ex: 01/01/2025).");
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
                <h3 className="text-2xl font-bold text-gray-800">Nova Tarefa</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
            </div>
           
           
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow">
             
         
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input name="titulo" value={taskState.titulo} onChange={handleChange} required className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500" />
              </div>
             
         
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea name="descricao" value={taskState.descricao} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500" rows={3} />
              </div>
             
              <div className="grid grid-cols-2 gap-4">

                
            {taskState.responsavel.length > 0 && (
                <div className="space-y-1 mt-3"> 
                    <label className="block text-sm font-medium text-gray-700">Atribuídos:</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {taskState.responsavel.map((name, index) => (
                            <div 
                                key={index} 
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                                <span>{name}</span>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveResponsible(name)} 
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Data *</label>
                  <input
                    name="data"
                    value={taskState.data}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                  />
                </div>
              
             
              
              <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Responsáveis</label>
                  <div className="flex space-x-2">
                      <input 
                          value={currentResponsible} 
                          onChange={(e) => setCurrentResponsible(e.target.value)} 
                          onKeyDown={(e) => { 
                              if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddResponsible();
                              }
                          }}
                          className="flex-grow border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500" 
                          placeholder="Nome para adicionar"
                      />
                      <button 
                          type="button" 
                          onClick={handleAddResponsible} 
                          className="bg-gray-200 text-gray-700 px-3 rounded-md hover:bg-gray-300 transition duration-150"
                      >
                          <Plus size={16} />
                      </button>
                  </div>
              </div>

              
           </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                <select name="prioridade" value={taskState.prioridade} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500">
                  {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

           
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Categorias (separadas por vírgula)</label>
                <input name="categorias" value={taskState.categorias} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Planejamento, reunião" />
              </div>
             
             
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" value={taskState.status} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500">
                  {STATUS_COLUMNS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-auto">
                <button type="button" onClick={onClose} className="px-5 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                    Cancelar
                </button>
                <button type="submit" onClick={handleSubmit} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-150">
                    {initialTask ? 'Salvar Tarefa' : 'Criar Tarefa'}
                </button>
            </div>
           </form>

        </div>
      </div>
    </div>
  );
};


// ===============================================
// Parte com o Kanban e as tarefas
// ===============================================

export default function Tarefas() {
  const [tasks, setTasks] = useState<Tarefa[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tarefa | null>(null);

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
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="p-8 max-w-full mx-auto">
     
      
      <div className="mb-6 flex justify-between items-center">
        <div>
        
          <h2 className="flex items-center space-x-2 text-[#3A3A3A] text-3xl font-semibold mb-1">
            <ClipboardList size={28} className="text-blue-600" />
            <span>Gestão de Tarefas</span>
          </h2>
    
          <p className="text-[#282828] text-base font-normal">
            Organize e acompanhe o progresso das tarefas
          </p>
        </div>
        <button
          onClick={handleNewTask}
          className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-150 shadow-md"
        >
          <span>Nova Tarefa</span>
        </button>
      </div>
     
     
      <p className="text-sm text-gray-500 mb-6">
        <span className="text-[#114A6D] font-medium">Início</span> &gt; Gestão de Tarefas
      </p>

      <div className="flex space-x-6 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map(column => (
          <div key={column.name} className="flex-shrink-0 w-80">
           
            <div className={`flex items-center justify-between p-3 rounded-t-lg text-white ${column.color}`}>
              <h3 className="font-semibold text-base">{column.name}</h3>
              <span className="bg-white text-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                {tasks.filter(t => t.status === column.name).length}
              </span>
            </div>

            
            <div className="bg-gray-100 p-3 rounded-b-lg min-h-64 max-h-[70vh] overflow-y-auto">
              {tasks
                .filter(t => t.status === column.name)
                .map(tarefa => (
                  <TaskCard
                    key={tarefa.id}
                    tarefa={tarefa}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
               
            
              {tasks.filter(t => t.status === column.name).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                    Nenhuma tarefa em "{column.name}"
                </p>
              )}
            </div>
          </div>
        ))}
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

