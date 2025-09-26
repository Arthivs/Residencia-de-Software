import React, { useState } from 'react';
import { Search, Plus, Minus, Download, FileText, Eye, Trash2 } from 'lucide-react';
// Importa o arquivo CSS
import './acoes.css';




function Actions() {
  const [selectedCity, setSelectedCity] = useState('Todas as cidades');
  const [selectedType, setSelectedType] = useState('Todos os tipos');
  const [searchTerm, setSearchTerm] = useState('');

  // A lista de ações original
  const actions = [
    { cidade: 'Lagarto', bairro: 'Centro', tipo: 'Reunião com Lideranças', data: '22/07/2025' },
    { cidade: 'Aracaju', bairro: 'Grageru', tipo: 'Evento', data: '22/07/2025' },
    { cidade: 'Aracaju', bairro: 'São José', tipo: 'Visita Técnica', data: '17/07/2025' },
    { cidade: 'Aracaju', bairro: '13 de Junho', tipo: 'Reunião com Lideranças', data: '17/07/2025' },
    { cidade: 'Aracaju', bairro: 'Grageru', tipo: 'Reunião com Lideranças', data: '16/07/2025' },
    { cidade: 'Aracaju', bairro: 'Luzia', tipo: 'Reunião com Lideranças', data: '16/07/2025' },
    { cidade: 'Aracaju', bairro: 'Jardins', tipo: 'Visita Técnica', data: '13/07/2025' },
    { cidade: 'Aracaju', bairro: 'Jardins', tipo: 'Visita Técnica', data: '13/07/2025' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="header text-white p-6">
        <div className="flex items-center gap-3">
          <div className="header-icon-container p-2 rounded">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ações</h1>
            <p className="text-blue-100">Visualize e gerencie as ações realizadas</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-4">Mapa de Ações</h2>
            <div className="flex gap-2 mb-4">
              <button className="btn-primary btn-blue">
                Pontos Individuais
              </button>
              <button className="btn-primary btn-green">
                Contadores por Bairro
              </button>
              <button className="btn-primary btn-red">
                Mapa de Calor
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative map-container">
            {/* Simplified map representation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Map points */}
                <div className="map-point map-point-lg top-1/3 left-2/3">
                  3
                </div>
                <div className="map-point map-point-md top-2/5 left-3/5">
                  2
                </div>
                <div className="map-point map-point-sm top-1/2 left-5/8">
                  1
                </div>
                <div className="map-point map-point-sm bottom-1/3 right-1/3">
                  1
                </div>
              </div>
            </div>

            {/* Map controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-1">
              <button className="map-control-button">
                <Plus className="w-4 h-4" />
              </button>
              <button className="map-control-button">
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 map-legend p-2 rounded text-sm">
              <div className="font-medium">9 ações cadastradas</div>
            </div>
          </div>
        </div>

        {/* Actions Registry */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Registro de Ações</h2>
            <div className="flex gap-2">
              <button className="btn-primary btn-blue hover:bg-blue-700">
                Nova Ação
              </button>
              <button className="btn-secondary">
                PDF
              </button>
              <button className="btn-secondary">
                Excel
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 border-b flex gap-4">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="filter-select"
            >
              <option>Todas as cidades</option>
              <option>Aracaju</option>
              <option>Lagarto</option>
            </select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 center-y w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Digite o bairro"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input pl-10" />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option>Todos os tipos</option>
              <option>Reunião com Lideranças</option>
              <option>Evento</option>
              <option>Visita Técnica</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="w-full">
              <thead className="table-header">
                <tr className="divide-y">
                  <th className="text-left table-row-item text-sm font-medium text-gray-600 uppercase tracking-wider">Cidade</th>
                  <th className="text-left table-row-item text-sm font-medium text-gray-600 uppercase tracking-wider">Bairro</th>
                  <th className="text-left table-row-item text-sm font-medium text-gray-600 uppercase tracking-wider">Tipo da Ação</th>
                  <th className="text-left table-row-item text-sm font-medium text-gray-600 uppercase tracking-wider">Data</th>
                  <th className="text-left table-row-item text-sm font-medium text-gray-600 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {actions.map((action, index) => (
                  <tr key={index} className="table-row">
                    <td className="table-row-item text-sm">{action.cidade}</td>
                    <td className="table-row-item text-sm">{action.bairro}</td>
                    <td className="table-row-item text-sm">{action.tipo}</td>
                    <td className="table-row-item text-sm">{action.data}</td>
                    <td className="table-row-item">
                      <div className="flex gap-1">
                        <button className="action-btn action-btn-view">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="action-btn action-btn-delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Actions;