// src/paginas/acoes/tabela.jsx - ATUALIZADO COM BOTÃO EDITAR
import React, { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import ExportButton from "../../componentes/ExportButton";

export default function ActionsTable({ 
  actions = [], 
  onCreate, 
  onEdit, // NOVA PROP
  onDelete, 
  isLoading 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("data");
  const [sortDirection, setSortDirection] = useState("desc");

  // Filtros e ordenação
  const filteredAndSortedActions = actions
    .filter(action => {
      const matchesSearch = 
        action.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.bairro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.descricao?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "data") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Registro de Ações</h3>
          <p className="text-gray-600 text-sm">
            {filteredAndSortedActions.length} de {actions.length} ações encontradas
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Barra de Pesquisa */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar ações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>

          {/* Botão Exportar */}
          <ExportButton 
            data={filteredAndSortedActions}
            disabled={isLoading || filteredAndSortedActions.length === 0}
            filename="tabela_acoes"
          />

          {/* Botão Nova Ação */}
          <button 
            onClick={onCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Ação
          </button>
        </div>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Carregando ações...
        </div>
      ) : filteredAndSortedActions.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-lg font-medium text-gray-600">Nenhuma ação encontrada</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm 
              ? "Tente ajustar os termos de busca" 
              : "Comece criando sua primeira ação"
            }
          </p>
          {(actions.length === 0 && !searchTerm) && (
            <button
              onClick={onCreate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Primeira Ação
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("titulo")}
                >
                  <div className="flex items-center gap-1">
                    Título
                    <SortIcon field="titulo" />
                  </div>
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("bairro")}
                >
                  <div className="flex items-center gap-1">
                    Bairro
                    <SortIcon field="bairro" />
                  </div>
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("tipo")}
                >
                  <div className="flex items-center gap-1">
                    Tipo
                    <SortIcon field="tipo" />
                  </div>
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("data")}
                >
                  <div className="flex items-center gap-1">
                    Data
                    <SortIcon field="data" />
                  </div>
                </th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedActions.map((action, index) => (
                <tr key={action.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{action.titulo}</div>
                    {action.descricao && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {action.descricao}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-gray-700">{action.bairro || "-"}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {action.tipo}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">
                    {action.data ? new Date(action.data).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {/* BOTÃO EDITAR ADICIONADO */}
                      <button 
                        onClick={() => onEdit(action)}
                        className="p-2 rounded text-blue-600 hover:bg-blue-50 transition-colors border border-blue-200"
                        title="Editar ação"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(action.id)}
                        className="p-2 rounded text-red-600 hover:bg-red-50 transition-colors border border-red-200"
                        title="Excluir ação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer com Paginação Simples */}
      {filteredAndSortedActions.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <div>
            Mostrando {filteredAndSortedActions.length} ação{filteredAndSortedActions.length !== 1 ? 'es' : ''}
          </div>
        </div>
      )}
    </div>
  );
}