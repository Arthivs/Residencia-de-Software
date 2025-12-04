import React, { Suspense, lazy, useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDashConect } from "@/conect/dashconect";
import { apiService } from "@/services/api";
import Header from "./Header";
import ExportButton from "../../componentes/ExportButton";

// componentes da pasta /acoes
const MapView = lazy(() => import("./mapa"));
const ActionsTable = lazy(() => import("./tabelas"));
const AnalyticsDashboard = lazy(() => import("./analisedash"));
const CreateActionModal = lazy(() => import("./modal"));

// Hook useActions integrado 
function useActionsIntegrated() {
  const { data, atualizarAcoes, removerAcao, sincronizarDashboard } = useDashConect();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mapView, setMapView] = useState("pontos");
  const [activeView, setActiveView] = useState("map");
  const [showFilters, setShowFilters] = useState(true);
  const [bairrosList, setBairrosList] = useState([]);

  // Refs para controle de loops
  const hasLoadedActions = useRef(false);
  const isFetching = useRef(false);

  // Carregar dados - CORRIGIDO para evitar loops
  useEffect(() => {
    const fetchActions = async () => {
      // Evitar múltiplas chamadas
      if (isFetching.current || hasLoadedActions.current) {
        return;
      }

      // Se já temos dados no contexto, usar eles primeiro
      if (data.acoes && data.acoes.length > 0 && !hasLoadedActions.current) {
        console.log("📂 Usando dados do contexto para ações");
        const contextActions = data.acoes.map((a) => ({
          id: a.id.toString(),
          titulo: a.titulo,
          tipo: a.tipo,
          descricao: a.descricao,
          data: a.data,
          bairro: a.bairro,
          cidade: a.cidade,
          estado: a.estado,
          lat: a.lat,
          lng: a.lng,
          endereco: a.endereco,
          dataCriacao: a.dataCriacao,
          fotos: a.fotos || [],
          status: a.status
        }));
        
        setActions(contextActions);
        
        const bairros = [...new Set(contextActions.map((a) => a.bairro).filter(Boolean))].sort();
        setBairrosList(bairros);
        
        hasLoadedActions.current = true;
        return;
      }

      // Carregar do servidor apenas se necessário
      try {
        isFetching.current = true;
        setLoading(true);
        
        console.log("📡 Buscando ações do servidor...");
        const acoesData = await apiService.acoes.getAll();
        
        // Converter para formato UI
        const actionsUI = acoesData.map((a) => ({
          id: a.id.toString(),
          titulo: a.titulo,
          tipo: a.tipo,
          descricao: a.descricao,
          data: a.data,
          bairro: a.bairro,
          cidade: a.cidade,
          estado: a.estado,
          lat: a.lat,
          lng: a.lng,
          endereco: a.endereco,
          dataCriacao: new Date(a.data_criacao),
          fotos: Array.isArray(a.fotos) ? a.fotos : [],
          status: a.status || "planejada"
        }));
        
        setActions(actionsUI);
        
        // Atualizar contexto apenas se for diferente
        if (actionsUI.length > 0) {
          const acoesContexto = actionsUI.map(a => ({
            id: a.id,
            titulo: a.titulo,
            tipo: a.tipo,
            descricao: a.descricao,
            data: a.data,
            bairro: a.bairro,
            cidade: a.cidade,
            estado: a.estado,
            lat: a.lat,
            lng: a.lng,
            endereco: a.endereco,
            dataCriacao: a.dataCriacao,
            fotos: a.fotos,
            status: a.status
          }));
          
          atualizarAcoes(acoesContexto);
        }
        
        // Atualizar lista de bairros
        const bairros = [...new Set(acoesData.map((a) => a.bairro).filter(Boolean))].sort();
        setBairrosList(bairros);
        
        hasLoadedActions.current = true;
        
      } catch (error) {
        console.error("❌ Erro ao carregar ações:", error);
        // Se falhar, usar dados do contexto
        const contextData = data.acoes.map((a) => ({
          id: a.id,
          titulo: a.titulo,
          tipo: a.tipo,
          descricao: a.descricao,
          data: a.data,
          bairro: a.bairro,
          cidade: a.cidade,
          estado: a.estado,
          lat: a.lat,
          lng: a.lng,
          endereco: a.endereco,
          dataCriacao: a.dataCriacao,
          fotos: a.fotos || [],
          status: a.status
        }));
        setActions(contextData);
        
        const bairros = [...new Set(contextData.map((a) => a.bairro).filter(Boolean))].sort();
        setBairrosList(bairros);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    // Executar apenas uma vez
    fetchActions();

    // Cleanup
    return () => {
      hasLoadedActions.current = false;
    };
  }, []); // ← Array vazio para executar apenas uma vez

  // Criar ação COM SINCRONIZAÇÃO
  const createAction = async (payload) => {
    try {
      const acaoCriada = await apiService.acoes.create({
        titulo: payload.titulo,
        tipo: payload.tipo,
        descricao: payload.descricao,
        data: payload.data,
        bairro: payload.bairro,
        cidade: payload.cidade,
        estado: payload.estado,
        lat: payload.lat || 0,
        lng: payload.lng || 0,
        endereco: payload.endereco,
        fotos: payload.fotos || [],
        status: payload.status || "planejada"
      });

      const novaAcao = {
        id: acaoCriada.id.toString(),
        titulo: acaoCriada.titulo,
        tipo: acaoCriada.tipo,
        descricao: acaoCriada.descricao,
        data: acaoCriada.data,
        bairro: acaoCriada.bairro,
        cidade: acaoCriada.cidade,
        estado: acaoCriada.estado,
        lat: acaoCriada.lat,
        lng: acaoCriada.lng,
        endereco: acaoCriada.endereco,
        dataCriacao: new Date(acaoCriada.data_criacao),
        fotos: Array.isArray(acaoCriada.fotos) ? acaoCriada.fotos : [],
        status: acaoCriada.status
      };

      setActions(prev => [novaAcao, ...prev]);
      
      // Atualizar lista de bairros
      if (novaAcao.bairro && !bairrosList.includes(novaAcao.bairro)) {
        setBairrosList(prev => [...prev, novaAcao.bairro].sort());
      }

      // SINCRONIZAR COM DASHBOARD
      await sincronizarDashboard('acoes');

      return novaAcao;
    } catch (error) {
      console.error("Erro ao criar ação:", error);
      throw error;
    }
  };

  // Atualizar ação COM SINCRONIZAÇÃO
  const updateAction = async (id, updatedData) => {
    try {
      const acaoAtualizada = await apiService.acoes.update(parseInt(id), updatedData);

      const acaoUI = {
        id: acaoAtualizada.id.toString(),
        titulo: acaoAtualizada.titulo,
        tipo: acaoAtualizada.tipo,
        descricao: acaoAtualizada.descricao,
        data: acaoAtualizada.data,
        bairro: acaoAtualizada.bairro,
        cidade: acaoAtualizada.cidade,
        estado: acaoAtualizada.estado,
        lat: acaoAtualizada.lat,
        lng: acaoAtualizada.lng,
        endereco: acaoAtualizada.endereco,
        dataCriacao: new Date(acaoAtualizada.data_criacao),
        fotos: Array.isArray(acaoAtualizada.fotos) ? acaoAtualizada.fotos : [],
        status: acaoAtualizada.status
      };

      setActions(prev =>
        prev.map((action) =>
          action.id === id ? { ...action, ...acaoUI } : action
        )
      );

      // SINCRONIZAR COM DASHBOARD
      await sincronizarDashboard('acoes');

      return acaoUI;
    } catch (error) {
      console.error("Erro ao atualizar ação:", error);
      throw error;
    }
  };

  // Excluir ação COM SINCRONIZAÇÃO
  const deleteAction = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta ação?")) return;

    try {
      // 1. Excluir do servidor
      await apiService.acoes.delete(parseInt(id));
      
      // 2. Atualizar lista local
      setActions(prev => prev.filter((a) => a.id !== id));
      
      // 3. SINCRONIZAR COM DASHBOARD
      removerAcao(id); // Atualização imediata
      await sincronizarDashboard('acoes'); // Recarregar dados completos
      
      toast.success("Ação excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir ação:", error);
      toast.error("Erro ao excluir ação");
      throw error;
    }
  };

  // Filtro de ações
  const q = (searchTerm || "").toLowerCase();

  const filteredActions = actions.filter((a) => {
    const matchesType = !selectedType || a.tipo === selectedType;
    const matchesSearch =
      !q ||
      (a.bairro || "").toLowerCase().includes(q) ||
      (a.tipo || "").toLowerCase().includes(q) ||
      (a.titulo || "").toLowerCase().includes(q) ||
      (a.descricao || "").toLowerCase().includes(q);

    return matchesType && matchesSearch;
  });

  // Estatísticas por bairro
  const bairroStats = filteredActions.reduce((acc, action) => {
    const key = action.bairro || "Sem Bairro";

    if (!acc[key]) {
      acc[key] = {
        bairro: action.bairro,
        lat: action.lat,
        lng: action.lng,
        count: 0,
      };
    }

    acc[key].count++;

    return acc;
  }, {});

  return {
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
    showFilters,
    setShowFilters,
    bairrosList,
  };
}

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
  } = useActionsIntegrated();

  // Função para abrir modal de edição
  const handleEditAction = (action) => {
    window.dispatchEvent(new CustomEvent("openEditModal", { 
      detail: action 
    }));
  };

  // Função para atualizar ação COM SINCRONIZAÇÃO
  const handleUpdateAction = async (actionData) => {
    try {
      if (actionData.id) {
        await updateAction(actionData.id, actionData);
      } else {
        await createAction(actionData);
      }
    } catch (error) {
      console.error("Erro ao salvar ação:", error);
      toast.error("Erro ao salvar ação. Tente novamente.");
    }
  };

  // Função para excluir ação
  const handleDeleteAction = async (id) => {
    try {
      await deleteAction(id);
    } catch (error) {
      console.error("Erro ao excluir ação:", error);
      // O toast de erro já é exibido pela função deleteAction
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
        <Suspense fallback={<div className="p-8 text-center">Carregando mapa...</div>}>
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
        <Suspense fallback={<div className="p-8 text-center">Carregando análises...</div>}>
          {activeView === "analytics" && (
            <AnalyticsDashboard
              filteredActions={filteredActions}
              bairroStats={bairroStats}
            />
          )}
        </Suspense>

        {/* TABELA */}
        <Suspense fallback={<div className="p-8 text-center">Carregando tabela...</div>}>
          <ActionsTable
            actions={filteredActions}
            onCreate={() =>
              window.dispatchEvent(new CustomEvent("openCreateModal"))
            }
            onEdit={handleEditAction} 
            onDelete={handleDeleteAction}
            isLoading={loading}
          />
        </Suspense>
      </div>

      {/* MODAL */}
      <Suspense fallback={null}>
        <CreateActionModal 
          onSubmit={handleUpdateAction} 
          bairrosList={bairrosList}
        />
      </Suspense>
    </div>
  );
}