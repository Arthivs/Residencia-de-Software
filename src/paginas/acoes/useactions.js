import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { geocodeNominatim } from "./api";
import { TODOS_BAIRROS, getBairroCoordinatesSync } from "./bairros";

export default function useActions() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [mapView, setMapView] = useState("pontos");
  const [activeView, setActiveView] = useState("map");

  const [showFilters, setShowFilters] = useState(true);
  const [bairrosList, setBairrosList] = useState(TODOS_BAIRROS);

  /** Carrega dados das ações */
  const fetchActions = useCallback(async () => {
    setLoading(true);

    try {
      const fallbackEndpoints = ["/api/acoes", "/api/actions", "/api/tarefas"];
      let data = null;

      for (const ep of fallbackEndpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const json = await res.json();
            data =
              Array.isArray(json)
                ? json
                : json.acoes || json.actions || json.tarefas || [];
            break;
          }
        } catch {}
      }

      /**
       * Caso API esteja offline — usa dados demonstrativos
       */
      if (!data || data.length === 0) {
        data = [
          {
            id: '1',
            titulo: "Reunião com Lideranças",
            tipo: "Reunião Comunitária",
            cidade: "Aracaju",
            bairro: "Jardins",
            data: "2024-01-15",
            descricao: "Reunião com lideranças comunitárias para discutir melhorias no bairro",
            lat: -10.9452,
            lng: -37.0728,
            endereco: "Praça Central",
            estado: "SE",
            dataCriacao: new Date('2024-01-15'),
            status: "concluida"
          },
          {
            id: '2',
            titulo: "Campanha de Vacinação",
            tipo: "Ação Social",
            cidade: "Aracaju",
            bairro: "São Conrado",
            data: "2024-01-10",
            descricao: "Campanha de vacinação contra influenza",
            lat: -10.9385,
            lng: -37.0512,
            endereco: "Posto de Saúde",
            estado: "SE",
            dataCriacao: new Date('2024-01-10'),
            status: "concluida"
          },
          {
            id: '3',
            titulo: "Fiscalização de Comércio",
            tipo: "Fiscalização",
            cidade: "Aracaju",
            bairro: "Centro",
            data: "2024-01-18",
            descricao: "Vistoria em estabelecimentos comerciais",
            lat: -10.9117,
            lng: -37.0678,
            endereco: "Rua Comercial",
            estado: "SE",
            dataCriacao: new Date('2024-01-18'),
            status: "em_andamento"
          },
          {
            id: '4',
            titulo: "Visita Técnica à Escola",
            tipo: "Visita Técnica",
            cidade: "Aracaju",
            bairro: "Atalaia",
            data: "2024-01-20",
            descricao: "Visita para verificar condições da infraestrutura",
            lat: -10.9589,
            lng: -37.0447,
            endereco: "Escola Municipal",
            estado: "SE",
            dataCriacao: new Date('2024-01-20'),
            status: "planejada"
          }
        ];
      } else {
        // Corrige ações sem lat/lng
        data = data.map((a) =>
          a.lat && a.lng
            ? a
            : {
                ...a,
                ...getBairroCoordinatesSync(a.bairro),
              }
        );
      }

      setActions(data);

      // Atualiza lista de bairros disponíveis
      setBairrosList((prev) =>
        Array.from(
          new Set([...prev, ...data.map((a) => a.bairro).filter(Boolean)])
        ).sort()
      );
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar ações");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  /** Criar ação */
  const createAction = useCallback(async (payload) => {
    try {
      /**
       * Garante coordenadas para ações criadas manualmente
       */
      if ((!payload.lat || !payload.lng) && payload.bairro) {
        const g = await geocodeNominatim(payload.bairro);
        payload.lat = g.lat;
        payload.lng = g.lng;
      }

      const endpoints = ["/api/acoes", "/api/actions", "/api/tarefas"];
      let created = null;

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            created = await res.json();
            break;
          }
        } catch {}
      }

      // API offline → cria localmente
      if (!created) {
        created = {
          id: Date.now().toString(),
          ...payload,
          dataCriacao: new Date(),
          status: payload.status || "concluida"
        };
      }

      setActions((prev) => [created, ...prev]);

      if (created.bairro) {
        setBairrosList((prev) =>
          Array.from(new Set([created.bairro, ...prev])).sort()
        );
      }

      toast.success("Ação criada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao criar ação");
    }
  }, []);

  /** Atualizar ação - NOVA FUNÇÃO */
  const updateAction = useCallback(async (id, updatedData) => {
    try {
      const endpoints = ["/api/acoes", "/api/actions", "/api/tarefas"];
      let updated = null;

      for (const ep of endpoints) {
        try {
          const res = await fetch(`${ep}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
          });

          if (res.ok) {
            updated = await res.json();
            break;
          }
        } catch {}
      }

      // API offline → atualiza localmente
      if (!updated) {
        updated = { ...updatedData, id };
      }

      setActions((prev) =>
        prev.map((action) =>
          action.id === id ? { ...action, ...updated } : action
        )
      );

      toast.success("Ação atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao atualizar ação");
    }
  }, []);

  /** Excluir ação */
  const deleteAction = useCallback(async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta ação?")) return;

    try {
      const endpoints = [
        `/api/acoes/${id}`,
        `/api/actions/${id}`,
        `/api/tarefas/${id}`,
      ];

      for (const ep of endpoints) {
        try {
          await fetch(ep, { method: "DELETE" });
        } catch {}
      }

      setActions((prev) => prev.filter((a) => a.id !== id));

      toast.success("Ação excluída com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir ação");
    }
  }, []);

  /** Filtro de ações */
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

  /** Estatísticas por bairro */
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
    updateAction, // NOVA FUNÇÃO EXPORTADA
    deleteAction,
    fetchActions,
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