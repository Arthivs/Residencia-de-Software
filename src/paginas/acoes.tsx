import React, { useState } from 'react';
import { Search, Plus, Minus, Download, Eye, Trash2, MapPin } from 'lucide-react';
import { FaList } from 'react-icons/fa';

function Actions() {
  const [selectedCity, setSelectedCity] = useState('Todas as cidades');
  const [selectedType, setSelectedType] = useState('Todos os tipos');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapView, setMapView] = useState('pontos'); // 'pontos', 'contadores', 'calor'
  const [zoom, setZoom] = useState(100);

  // A lista de ações original
  const initialActions = [
    { id: 1, cidade: 'Lagarto', bairro: 'Centro', tipo: 'Reunião com Lideranças', data: '22/07/2025' },
    { id: 2, cidade: 'Aracaju', bairro: 'Grageru', tipo: 'Evento', data: '22/07/2025' },
    { id: 3, cidade: 'Aracaju', bairro: 'São José', tipo: 'Visita Técnica', data: '17/07/2025' },
    { id: 4, cidade: 'Aracaju', bairro: '13 de Junho', tipo: 'Reunião com Lideranças', data: '17/07/2025' },
    { id: 5, cidade: 'Aracaju', bairro: 'Grageru', tipo: 'Reunião com Lideranças', data: '16/07/2025' },
    { id: 6, cidade: 'Aracaju', bairro: 'Luzia', tipo: 'Reunião com Lideranças', data: '16/07/2025' },
    { id: 7, cidade: 'Aracaju', bairro: 'Jardins', tipo: 'Visita Técnica', data: '13/07/2025' },
    { id: 8, cidade: 'Aracaju', bairro: 'Jardins', tipo: 'Visita Técnica', data: '13/07/2025' }
  ];

  const [actions, setActions] = useState(initialActions);

  // Filtrar ações baseado nos filtros
  const filteredActions = actions.filter(action => {
    const matchesCity = selectedCity === 'Todas as cidades' || action.cidade === selectedCity;
    const matchesType = selectedType === 'Todos os tipos' || action.tipo === selectedType;
    const matchesSearch = action.bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCity && matchesType && matchesSearch;
  });

  // Funções dos botões
  const handleNovaAcao = () => {
    alert('Funcionalidade: Abrir modal para nova ação');
    // Aqui você implementaria a lógica para adicionar nova ação
  };

  const handleExportPDF = () => {
    alert('Funcionalidade: Exportar para PDF');
    // Lógica para gerar PDF
  };

  const handleExportExcel = () => {
    alert('Funcionalidade: Exportar para Excel');
    // Lógica para gerar Excel
  };

  const handleViewAction = (actionId: number) => {
    alert(`Visualizar ação ID: ${actionId}`);
    // Navegar para página de detalhes ou abrir modal
  };

  const handleDeleteAction = (actionId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta ação?')) {
      setActions(actions.filter(action => action.id !== actionId));
      alert('Ação excluída com sucesso!');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 20, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 20, 50));
  };

  // Estatísticas para o mapa
  const estatisticas = {
    totalAcoes: filteredActions.length,
    acoesAracaju: filteredActions.filter(a => a.cidade === 'Aracaju').length,
    acoesLagarto: filteredActions.filter(a => a.cidade === 'Lagarto').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-500 bg-opacity-20">
            <FaList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ações</h1>
            <p className="text-blue-100">Visualize e gerencie as ações realizadas</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Mapa de Ações</h2>
            <div className="flex gap-2 mb-4 flex-wrap">
              <button 
                onClick={() => setMapView('pontos')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  mapView === 'pontos' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pontos Individuais
              </button>
              <button 
                onClick={() => setMapView('contadores')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  mapView === 'contadores' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Contadores por Bairro
              </button>
              <button 
                onClick={() => setMapView('calor')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  mapView === 'calor' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Mapa de Calor
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative h-96 bg-gradient-to-br from-green-100 via-blue-50 to-blue-200 overflow-hidden">
            <div 
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <div className="relative w-full h-full">
                {/* Pontos do mapa baseados nos dados reais */}
                {filteredActions.slice(0, 4).map((action, index) => (
                  <div
                    key={action.id}
                    className={`absolute rounded-full flex items-center justify-center text-white font-bold transform -translate-x-1/2 -translate-y-1/2 ${
                      index === 0 ? 'top-1/3 left-2/3 w-8 h-8 bg-blue-600 text-sm' :
                      index === 1 ? 'top-2/5 left-3/5 w-6 h-6 bg-blue-500 text-xs' :
                      index === 2 ? 'top-1/2 left-5/8 w-6 h-6 bg-blue-400 text-xs' :
                      'bottom-1/3 right-1/3 w-6 h-6 bg-blue-400 text-xs'
                    }`}
                    title={`${action.bairro} - ${action.tipo}`}
                  >
                    {index + 1}
                  </div>
                ))}
                
                {/* Marcador adicional para mostrar que há mais ações */}
                {filteredActions.length > 4 && (
                  <div 
                    className="absolute top-1/4 left-1/4 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold transform -translate-x-1/2 -translate-y-1/2"
                    title={`+${filteredActions.length - 4} ações`}
                  >
                    +{filteredActions.length - 4}
                  </div>
                )}
              </div>
            </div>

            {/* Map controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-1">
              <button 
                onClick={handleZoomIn}
                className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded text-sm shadow-sm">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                {filteredActions.length} ações encontradas
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {estatisticas.acoesAracaju} em Aracaju • {estatisticas.acoesLagarto} em Lagarto
              </div>
            </div>

            {/* View Indicator */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded text-sm">
              <span className="text-gray-700">
                Modo: {mapView === 'pontos' ? 'Pontos' : mapView === 'contadores' ? 'Contadores' : 'Calor'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Registry */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Registro de Ações</h2>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={handleNovaAcao}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Ação
              </button>
              <button 
                onClick={handleExportPDF}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button 
                onClick={handleExportExcel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Todas as cidades</option>
              <option>Aracaju</option>
              <option>Lagarto</option>
            </select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Digite o bairro, cidade ou tipo"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Todos os tipos</option>
              <option>Reunião com Lideranças</option>
              <option>Evento</option>
              <option>Visita Técnica</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Cidade
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Bairro
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Tipo da Ação
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Data
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredActions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      Nenhuma ação encontrada com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredActions.map((action) => (
                    <tr key={action.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-sm text-gray-700">{action.cidade}</td>
                      <td className="p-3 text-sm text-gray-700 font-medium">{action.bairro}</td>
                      <td className="p-3 text-sm text-gray-700">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          action.tipo === 'Reunião com Lideranças' ? 'bg-blue-100 text-blue-800' :
                          action.tipo === 'Evento' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {action.tipo}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-700">{action.data}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleViewAction(action.id)}
                            className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Visualizar ação"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAction(action.id)}
                            className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                            title="Excluir ação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer com contador */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Mostrando {filteredActions.length} de {initialActions.length} ações
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Actions;