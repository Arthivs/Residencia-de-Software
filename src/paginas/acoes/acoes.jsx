import React, { Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useActions from "./useactions";
import Header from "./Header";
import ExportButton from "../../componentes/ExportButton";

// componentes da pasta /acoes
const MapView = lazy(() => import("./mapa"));
const ActionsTable = lazy(() => import("./tabelas"));
const AnalyticsDashboard = lazy(() => import("./analisedash"));
const CreateActionModal = lazy(() => import("./modal"));

export default function ActionsPage() {
  const {
    actions,
    loading,
    createAction,
    updateAction, 
    deleteAction,
    filteredActions,
    bairroStats,
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    mapView,
    setMapView,
    activeView,
    setActiveView,
    bairrosList,
  } = useActions();

  // Função para abrir modal de edição
  const handleEditAction = (action) => {
    window.dispatchEvent(new CustomEvent("openEditModal", { 
      detail: action 
    }));
  };

  // Função para atualizar ação (integra com useActions)
  const handleUpdateAction = async (actionData) => {
    // Se a ação tem ID, é uma atualização
    if (actionData.id) {
      await updateAction(actionData.id, actionData);
    } else {
      await createAction(actionData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ToastContainer position="top-right" />

      {/* HEADER */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        actionStats={{
          total: actions.length,
          cities: 1,
          neighborhoods: Object.keys(bairroStats).length,
        }}
      />

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">

        {/* FILTROS */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-4 items-center flex-1 w-full">
              <input
                className="border rounded px-3 py-2 flex-1"
                placeholder="Buscar bairro ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="border rounded px-3 py-2"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                {[...new Set(actions.map((a) => a.tipo))].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

            </div>
            <div className="flex gap-2">
              <ExportButton 
                data={filteredActions}
                disabled={loading || filteredActions.length === 0}
                filename="acoes_vereador"
              />
            </div>
          </div>
        </div>

        {/* MAPA */}
        <Suspense fallback={<div>Carregando mapa...</div>}>
          {activeView === "map" && (
            <MapView
              mapView={mapView}
              setMapView={setMapView}
              filteredActions={filteredActions}
              bairroStats={bairroStats}
              onCreate={() =>
                window.dispatchEvent(new CustomEvent("openCreateModal"))
              }
            />
          )}
        </Suspense>

        {/* Desempenho */}
        <Suspense fallback={<div>Carregando análises...</div>}>
          {activeView === "analytics" && (
            <AnalyticsDashboard
              filteredActions={filteredActions}
              bairroStats={bairroStats}
            />
          )}
        </Suspense>

        {/* TABELA - ATUALIZADA COM onEdit */}
        <Suspense fallback={<div>Carregando tabela...</div>}>
          <ActionsTable
            actions={filteredActions}
            onCreate={() =>
              window.dispatchEvent(new CustomEvent("openCreateModal"))
            }
            onEdit={handleEditAction} 
            onDelete={deleteAction}
            isLoading={loading}
          />
        </Suspense>
      </div>

      {/* MODAL - ATUALIZADO COM SUPORTE A EDIÇÃO */}
      <Suspense fallback={null}>
        <CreateActionModal 
          onSubmit={handleUpdateAction} 
          bairrosList={bairrosList}
        />
      </Suspense>
    </div>
  );
}