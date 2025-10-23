import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Pencil, Trash2, ClipboardList, AlertTriangle } from 'lucide-react';

const dateToInputFormat = (dateStr: string): string => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
};


const dateFromInputFormat = (dateStr: string): string => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return '';
};

const isValidDate = (dateStr: string): boolean => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    
    const date = new Date(year, month - 1, day);

    
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

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


const isDeadlineApproaching = (dateStr: string): boolean => {
    if (!isValidDate(dateStr)) return false; 

    const [day, month, year] = dateStr.split('/').map(Number);
    const deadline = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    deadline.setHours(0, 0, 0, 0);

    const deadlineTime = deadline.getTime();
    const todayTime = today.getTime();
    const tomorrowTime = tomorrow.getTime();

    return deadlineTime === todayTime || deadlineTime === tomorrowTime;
};


type Status = 'A Fazer' | 'Em andamento' | 'Concluído' | '';
type Prioridade = 'Baixa' | 'Média' | 'Alta' | '';

interface Tarefa {
    id: string;
    titulo: string;
    descricao: string;
    data: string; 
    responsavel: string[];
    prioridade: Prioridade;
    status: Status;
    categorias: string;
}

const initialTasks: Tarefa[] = [];

const STATUS_COLUMNS: { name: Status, color: string }[] = [
    { name: 'A Fazer', color: 'bg-[#0057B7]' },
    { name: 'Em andamento', color: 'bg-[#D49125]' },
    { name: 'Concluído', color: 'bg-[#12A107]' },
];

const PRIORIDADES: Prioridade[] = ['Baixa', 'Média', 'Alta'];

// ===============================================
// Cartão 
// ===============================================

interface CardProps {
    tarefa: Tarefa;
    onEdit: (task: Tarefa) => void;
    onDelete: (id: string) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string, status: Status) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>, targetId: string) => void;
    isDragging: boolean; 
}

const TaskCard: React.FC<CardProps> = ({ tarefa, onEdit, onDelete, onDragStart, onDragOver, isDragging }) => {
    const priorityColor = tarefa.prioridade === 'Alta' ? 'bg-red-200 text-red-800' :
        tarefa.prioridade === 'Média' ? 'bg-yellow-200 text-yellow-800' :
            'bg-gray-200 text-gray-800';

    const approachingDeadline = isDeadlineApproaching(tarefa.data);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        onDragOver(e, tarefa.id);
    }

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, tarefa.id, tarefa.status)}
            onDragOver={handleDragOver}
            data-task-id={tarefa.id}
            className={`
                bg-white p-3 shadow-sm rounded-lg mb-3 border border-gray-200
                relative cursor-grab active:cursor-grabbing
                ${isDragging ? 'opacity-40' : 'opacity-100'}
                transition-opacity duration-100
            `} 
        >
            {approachingDeadline && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold py-1 px-2 rounded-bl-lg flex items-center space-x-1 z-10">
                    <AlertTriangle size={10} />
                    <span>Próximo do Prazo</span>
                </div>
            )}

            <div className="text-xs text-gray-500 font-semibold mb-1 pt-2">
                {tarefa.categorias
                    .split(',')
                    .map(c => c.trim())
                    .filter(c => c.length > 0)
                    .join(', ')
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

                    {tarefa.responsavel.map((nome, i) => {
                        const firstInitial = nome.trim().charAt(0).toUpperCase();
                        const colors = ['bg-blue-300 text-blue-800', 'bg-green-300 text-green-800', 'bg-yellow-300 text-yellow-800', 'bg-red-300 text-red-800'];
                        const color = colors[i % colors.length];

                        return (
                            <span
                                key={i}
                                title={nome}
                                className={`
                                    ${color} rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px]
                                    ring-2 ring-white cursor-help
                                    hover:z-10 transition-all duration-150
                                `}
                                style={{ marginLeft: i > 0 ? '-8px' : '0px' }}
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



interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: Tarefa) => void;
    initialTask: Tarefa | null;
}

const TaskModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, initialTask }) => {
    const [taskState, setTaskState] = useState<Tarefa>(initialTask || {
        id: '', titulo: '', descricao: '', data: '', responsavel: [], prioridade: '', status: '', categorias: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentResponsible, setCurrentResponsible] = useState('');

    useEffect(() => {
        setTaskState(initialTask || {
            id: '', titulo: '', descricao: '', data: '', responsavel: [], prioridade: '', status: '', categorias: ''
        });
        setErrors({});
        setCurrentResponsible('');
    }, [initialTask, isOpen]);

    const validateForm = (task: Tarefa) => {
        const newErrors: Record<string, string> = {};
        if (!task.titulo.trim()) { newErrors.titulo = "O título é obrigatório."; }
        if (!isValidDate(task.data)) { newErrors.data = "A data deve ser válida e estar no formato dd/mm/aaaa."; }
        if (task.responsavel.length === 0) { newErrors.responsavel = "É obrigatório atribuir pelo menos um responsável."; }
        if (!task.categorias.trim()) { newErrors.categorias = "É obrigatório ter pelo menos uma categoria."; }
        if (!task.prioridade) { newErrors.prioridade = "A prioridade é obrigatória."; }
        if (!task.status) { newErrors.status = "O status é obrigatório."; }
        return newErrors;
    };

    const handleAddResponsible = () => {
        const name = currentResponsible.trim();
        if (name && !taskState.responsavel.includes(name)) {
            setTaskState(prev => ({
                ...prev,
                responsavel: [...prev.responsavel, name]
            }));
            setCurrentResponsible('');
            setErrors(prev => ({ ...prev, responsavel: '' }));
        }
    };

    const handleRemoveResponsible = (nameToRemove: string) => {
        setTaskState(prev => ({
            ...prev,
            responsavel: prev.responsavel.filter(name => name !== nameToRemove),
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, type } = e.target;
        let formattedValue = '';

        if (type === 'date') {

            formattedValue = dateFromInputFormat(value);
        } else {

            formattedValue = validateAndFormatDate(value);
        }

        setTaskState(prev => ({ ...prev, data: formattedValue }));
        if (errors.data) { setErrors(prev => ({ ...prev, data: '' })); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name === 'data' || type === 'date') {
            handleDateChange(e as React.ChangeEvent<HTMLInputElement>);
            return;
        }

        setTaskState(prev => ({ ...prev, [name]: value }));
        if (errors[name]) { setErrors(prev => ({ ...prev, [name]: '' })); }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formErrors = validateForm(taskState);
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            alert("Por favor, preencha todos os campos obrigatórios marcados com (*).");
            return;
        }
        onSubmit(taskState);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 transition-opacity duration-300">
            <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="text-2xl font-bold text-gray-800">{initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Título *</label>
                            <input name="titulo" value={taskState.titulo} onChange={handleChange} className={`w-full border rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 ${errors.titulo ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea name="descricao" value={taskState.descricao} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500" rows={3} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Campo de data com o calendário */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Data *</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="date"
                                        name="data-calendar"
                                        value={dateToInputFormat(taskState.data)} 
                                        onChange={handleDateChange}
                                        className={`flex-grow border rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 ${errors.data ? 'border-red-500' : 'border-gray-300'}`}
                                        title="Selecione a data pelo calendário"
                                    />
                                    <input
                                        type="text"
                                        name="data"
                                        value={taskState.data}
                                        onChange={handleChange}
                                        className={`w-28 border rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 text-center ${errors.data ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="dd/mm/aaaa"
                                        maxLength={10}
                                        title="Ou digite a data (dd/mm/aaaa)"
                                    />
                                </div>
                                {errors.data && <p className="text-red-500 text-xs mt-1">{errors.data}</p>}
                            </div>

                          
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Responsáveis *</label>
                                {taskState.responsavel.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1 mb-2">
                                        {taskState.responsavel.map((name, index) => (
                                            <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                <span>{name}</span>
                                                <button type="button" onClick={() => handleRemoveResponsible(name)} className="text-blue-600 hover:text-blue-800"><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex space-x-2">
                                    <input value={currentResponsible} onChange={(e) => setCurrentResponsible(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddResponsible(); } }} className={`flex-grow border rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 ${errors.responsavel ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nome para adicionar" />
                                    <button type="button" onClick={handleAddResponsible} className="bg-gray-200 text-gray-700 px-3 rounded-md hover:bg-gray-300 transition duration-150"><Plus size={16} /></button>
                                </div>
                                {errors.responsavel && <p className="text-red-500 text-xs mt-1">{errors.responsavel}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Prioridade *</label>
                                <select name="prioridade" value={taskState.prioridade} onChange={handleChange} className={`w-full border rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 ${errors.prioridade ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="" disabled>Selecione a Prioridade...</option>
                                    {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                {errors.prioridade && <p className="text-red-500 text-xs mt-1">{errors.prioridade}</p>}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Categorias (separadas por vírgula) *</label>
                            <input name="categorias" value={taskState.categorias} onChange={handleChange} className={`w-full border rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 ${errors.categorias ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ex: Planejamento, reunião" />
                            {errors.categorias && <p className="text-red-500 text-xs mt-1">{errors.categorias}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Status *</label>
                            <select name="status" value={taskState.status} onChange={handleChange} className={`w-full border rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 ${errors.status ? 'border-red-500' : 'border-gray-300'}`}>
                                <option value="" disabled>Selecione o Status...</option>
                                {STATUS_COLUMNS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t mt-auto">
                            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-700 rounded-md hover:bg-gray-100">Cancelar</button>
                            <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-150">
                                {initialTask ? 'Salvar Edição' : 'Criar Tarefa'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};




interface ColumnProps {
    statusName: Status;
    color: string;
    tasks: Tarefa[];
    onEdit: (task: Tarefa) => void;
    onDelete: (id: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: Status) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>, targetId: string) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string, status: Status) => void;
    draggedTaskId: string | null; // Passado para o Card
}

const Column: React.FC<ColumnProps> = ({ statusName, color, tasks, onEdit, onDelete, onDrop, onDragStart, onDragOver, draggedTaskId }) => {

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        onDrop(e, statusName);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); 
    };

    return (
        <div className="flex-shrink-0 w-80">
            <div className={`flex items-center justify-between p-3 rounded-t-lg text-white ${color}`}>
                <h3 className="font-semibold text-base">{statusName}</h3>
                <span className="bg-white text-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                    {tasks.length}
                </span>
            </div>

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                data-column-status={statusName}
                className="bg-gray-100 p-3 rounded-b-lg min-h-64 max-h-[70vh] overflow-y-auto"
            >
                {tasks.map((tarefa) => (
                    <TaskCard
                        key={tarefa.id}
                        tarefa={tarefa}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        isDragging={tarefa.id === draggedTaskId} 
                    />
                ))}

                {tasks.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Nenhuma tarefa em "{statusName}"
                    </p>
                )}
            </div>
        </div>
    );
};




export default function Tarefas() {
    const [tasks, setTasks] = useState<Tarefa[]>(initialTasks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Tarefa | null>(null);

    const [draggedItem, setDraggedItem] = useState<{ id: string, status: Status } | null>(null);
    const [dragTargetId, setDragTargetId] = useState<string | null>(null);

    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);


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

    
    const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, id: string, status: Status) => {
        e.dataTransfer.setData('task/id', id);
        setDraggedItem({ id, status });
        setDraggedTaskId(id); 

        if (e.dataTransfer.setDragImage) {
            const blankImg = document.createElement('div');
            blankImg.style.width = '1px';
            blankImg.style.height = '1px';
            e.dataTransfer.setDragImage(blankImg, 0, 0);
        }
    }, []);


    const handleDragEnd = useCallback(() => {
        setDraggedTaskId(null); 
        setDraggedItem(null);
        setDragTargetId(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, targetId?: string) => {
        e.preventDefault();
        if (targetId) {
            setDragTargetId(targetId);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, newStatus: Status) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('task/id');

        setDraggedTaskId(null);
        setDraggedItem(null);
        setDragTargetId(null);

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = tasks[taskIndex];
        let newTasks = [...tasks];

        if (task.status === newStatus) {

            const targetTask = tasks.find(t => t.id === dragTargetId);
            if (!targetTask) return;

            const tasksInColumn = newTasks.filter(t => t.status === newStatus);

            const startIndex = tasksInColumn.findIndex(t => t.id === taskId);
            const endIndex = tasksInColumn.findIndex(t => t.id === dragTargetId);

            if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
                const [reorderedItem] = tasksInColumn.splice(startIndex, 1);
                tasksInColumn.splice(endIndex, 0, reorderedItem);

                const tasksWithoutCurrentColumn = newTasks.filter(t => t.status !== newStatus);
                newTasks = [...tasksWithoutCurrentColumn, ...tasksInColumn];
                setTasks(newTasks);
            }

        } else {
         
            const updatedTasks = newTasks.map(t =>
                t.id === taskId ? { ...t, status: newStatus } : t
            );

         
            setTasks(updatedTasks);
        }

    }, [tasks, dragTargetId]);

    const tasksByStatus = STATUS_COLUMNS.reduce((acc, column) => {
        acc[column.name] = tasks.filter(t => t.status === column.name);
        return acc;
    }, {} as Record<Status, Tarefa[]>);

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

            <div 
                className="flex space-x-6 overflow-x-auto pb-4"
                onDragEnd={handleDragEnd} 
            >
                {STATUS_COLUMNS.map(column => (
                    <Column
                        key={column.name}
                        statusName={column.name}
                        color={column.color}
                        tasks={tasksByStatus[column.name]}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        draggedTaskId={draggedTaskId}
                    />
                ))}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveTask}
                initialTask={editingTask}
            />
        </div>
    );
}