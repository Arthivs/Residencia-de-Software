// frontend/src/paginas/acoes/modal.jsx - VERSÃO INTEGRADA COM API
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { X } from "lucide-react";
import { toast } from "react-toastify";

// icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
});

export default function CreateActionModal({ onSubmit, bairrosList = [] }) {
  const [open, setOpen] = useState(false);
  const [tipoPersonalizado, setTipoPersonalizado] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "",
    data: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    lat: -10.9117,
    lng: -37.0678,
    status: "planejada",
    fotos: []
  });

  // Opções de tipo de ação
  const tiposAcao = [
    "Reunião Comunitária",
    "Ação Social", 
    "Visita Técnica",
    "Fiscalização",
    "Atendimento ao Cidadão",
    "Evento Público",
    "Outros"
  ];

  // Status disponíveis
  const statusAcao = [
    { value: "planejada", label: "Planejada" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "concluida", label: "Concluída" },
    { value: "cancelada", label: "Cancelada" }
  ];

  useEffect(() => {
    const openCreateEvent = () => {
      setForm({
        titulo: "",
        descricao: "",
        tipo: "",
        data: new Date().toISOString().split('T')[0],
        endereco: "",
        bairro: "",
        cidade: "",
        estado: "",
        lat: -10.9117,
        lng: -37.0678,
        status: "planejada",
        fotos: []
      });
      setTipoPersonalizado("");
      setIsEditing(false);
      setEditingId(null);
      setOpen(true);
    };
    
    const openEditEvent = (event) => {
      const actionData = event.detail;
      
      setForm({
        titulo: actionData.titulo || "",
        descricao: actionData.descricao || "",
        tipo: actionData.tipo || "",
        data: actionData.data || new Date().toISOString().split('T')[0],
        endereco: actionData.endereco || "",
        bairro: actionData.bairro || "",
        cidade: actionData.cidade || "",
        estado: actionData.estado || "",
        lat: actionData.lat || -10.9117,
        lng: actionData.lng || -37.0678,
        status: actionData.status || "planejada",
        fotos: actionData.fotos || []
      });
      
      if (actionData.tipo && !tiposAcao.includes(actionData.tipo)) {
        setForm(prev => ({ ...prev, tipo: "Outros" }));
        setTipoPersonalizado(actionData.tipo);
      } else {
        setTipoPersonalizado("");
      }
      
      setIsEditing(true);
      setEditingId(actionData.id);
      setOpen(true);
    };
    
    window.addEventListener("openCreateModal", openCreateEvent);
    window.addEventListener("openEditModal", openEditEvent);
    
    return () => {
      window.removeEventListener("openCreateModal", openCreateEvent);
      window.removeEventListener("openEditModal", openEditEvent);
    };
  }, [tiposAcao]);

  // GEO LOCALIZAÇÃO REVERSA
  async function reverseGeo(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`
      );

      const data = await res.json();
      const a = data.address || {};

      return {
        bairro:
          a.suburb ||
          a.neighbourhood ||
          a.quarter ||
          a.village ||
          a.locality ||
          "",
        cidade:
          a.city ||
          a.town ||
          a.village ||
          a.municipality ||
          a.county || "",
        estado: a.state || "",
        endereco: a.road || a.residential || "",
      };
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // Click MAPA
  const handleMapSelect = async (lat, lng) => {
    setForm((prev) => ({ ...prev, lat, lng }));

    const info = await reverseGeo(lat, lng);
    if (!info) {
      toast.error("Não foi possível identificar o endereço");
      return;
    }

    setForm((prev) => ({
      ...prev,
      bairro: info.bairro,
      cidade: info.cidade,
      estado: info.estado,
      endereco: info.endereco,
    }));
  };

  // COMPONENTE INTERNO DO MAPA
  function MapClick() {
    useMapEvents({
      click(e) {
        handleMapSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const handleSubmit = async () => {
    const tipoFinal = form.tipo === "Outros" && tipoPersonalizado ? tipoPersonalizado : form.tipo;

    if (!form.titulo.trim()) return toast.error("Título obrigatório");
    if (!tipoFinal.trim()) return toast.error("Tipo da ação obrigatório");
    if (!form.bairro.trim()) return toast.error("Selecione um ponto no mapa");
    if (!form.data) return toast.error("Data obrigatória");

    // Preparar dados para envio
    const dadosEnvio = {
      titulo: form.titulo.trim(),
      tipo: tipoFinal,
      descricao: form.descricao.trim(),
      data: form.data,
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim() || "Aracaju",
      estado: form.estado.trim() || "SE",
      lat: form.lat,
      lng: form.lng,
      endereco: form.endereco.trim(),
      status: form.status,
      fotos: form.fotos
    };

    // Adicionar ID se for edição
    if (isEditing && editingId) {
      dadosEnvio.id = editingId;
    }

    try {
      await onSubmit(dadosEnvio);
      
      if (isEditing) {
        toast.success("Ação atualizada com sucesso!");
      } else {
        toast.success("Ação criada com sucesso!");
      }
      
      setOpen(false);
      setTipoPersonalizado("");
      setIsEditing(false);
      setEditingId(null);
      
    } catch (error) {
      console.error("Erro ao salvar ação:", error);
      toast.error("Erro ao salvar ação. Tente novamente.");
    }
  };

  const handleTipoChange = (value) => {
    setForm(prev => ({ ...prev, tipo: value }));
    if (value !== "Outros") {
      setTipoPersonalizado("");
    }
  };

  const handleStatusChange = (value) => {
    setForm(prev => ({ ...prev, status: value }));
  };

  // Função para selecionar bairro da lista
  const handleBairroSelect = (bairro) => {
    if (bairro) {
      setForm(prev => ({ ...prev, bairro }));
      
      // Tentar obter coordenadas do bairro
      const getBairroCoordinates = () => {
        const coordenadas = {
          "Centro": { lat: -10.9117, lng: -37.0678 },
          "São José": { lat: -10.9275, lng: -37.0712 },
          "Atalaia": { lat: -10.9589, lng: -37.0447 },
          "Jardins": { lat: -10.9452, lng: -37.0728 },
          "São Conrado": { lat: -10.9385, lng: -37.0512 },
          "Coroa do Meio": { lat: -10.9183, lng: -37.0517 },
          "Treze de Julho": { lat: -10.9289, lng: -37.0561 },
          "Salgado Filho": { lat: -10.9356, lng: -37.0783 }
        };
        
        return coordenadas[bairro] || { lat: -10.9117, lng: -37.0678 };
      };
      
      const coords = getBairroCoordinates();
      setForm(prev => ({ 
        ...prev, 
        lat: coords.lat, 
        lng: coords.lng 
      }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Overlay com scroll */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />

      {/* Modal com altura máxima e scroll */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        {/* Header fixo */}
        <div className="flex-shrink-0 p-4 bg-blue-600 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">
            {isEditing ? "Editar Ação" : "Nova Ação"}
          </h3>
          <button 
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Título */}
          <div>
            <label className="text-sm font-semibold">Título *</label>
            <input
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.titulo}
              onChange={(e) =>
                setForm({ ...form, titulo: e.target.value })
              }
              placeholder="Digite o título da ação"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="text-sm font-semibold">Tipo da Ação *</label>
            <select
              className="w-full border rounded p-2 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.tipo}
              onChange={(e) => handleTipoChange(e.target.value)}
            >
              <option value="">Selecione o tipo</option>
              {tiposAcao.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            {form.tipo === "Outros" && (
              <div className="mt-2">
                <label className="text-sm font-semibold">Especifique o tipo *</label>
                <input
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tipoPersonalizado}
                  onChange={(e) => setTipoPersonalizado(e.target.value)}
                  placeholder="Digite o tipo da ação..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Descreva o tipo específico da ação
                </p>
              </div>
            )}
          </div>

          {/* Data e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Data *</label>
              <input
                type="date"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.data}
                onChange={(e) =>
                  setForm({ ...form, data: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Status</label>
              <select
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {statusAcao.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mapa com altura fixa */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold">Localização *</label>
              <div className="text-xs text-gray-500">
                Clique no mapa ou selecione bairro abaixo
              </div>
            </div>
            
            <div className="h-48 border rounded overflow-hidden mb-2">
              <MapContainer
                center={[form.lat, form.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClick />
                <Marker position={[form.lat, form.lng]} />
              </MapContainer>
            </div>

            {/* Seletor de bairro rápido */}
            {bairrosList.length > 0 && (
              <div className="mb-2">
                <label className="text-sm text-gray-600 mb-1 block">
                  Ou selecione um bairro conhecido:
                </label>
                <div className="flex flex-wrap gap-1">
                  {bairrosList.slice(0, 5).map((bairro) => (
                    <button
                      key={bairro}
                      type="button"
                      onClick={() => handleBairroSelect(bairro)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
                    >
                      {bairro}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Informações automáticas */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm">Bairro *</label>
              <input
                className="w-full border rounded p-2 bg-gray-50"
                readOnly
                value={form.bairro}
                placeholder="Clique no mapa para selecionar"
              />
            </div>

            <div>
              <label className="text-sm">Cidade</label>
              <input
                className="w-full border rounded p-2 bg-gray-50"
                readOnly
                value={form.cidade}
              />
            </div>

            <div>
              <label className="text-sm">Estado</label>
              <input
                className="w-full border rounded p-2 bg-gray-50"
                readOnly
                value={form.estado}
              />
            </div>

            <div>
              <label className="text-sm">Rua</label>
              <input
                className="w-full border rounded p-2 bg-gray-50"
                readOnly
                value={form.endereco}
              />
            </div>
          </div>

          {/* Coordenadas */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm">Latitude</label>
              <input
                type="number"
                step="any"
                className="w-full border rounded p-2"
                value={form.lat}
                onChange={(e) =>
                  setForm({ ...form, lat: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-sm">Longitude</label>
              <input
                type="number"
                step="any"
                className="w-full border rounded p-2"
                value={form.lng}
                onChange={(e) =>
                  setForm({ ...form, lng: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-semibold">Descrição</label>
            <textarea
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={form.descricao}
              onChange={(e) =>
                setForm({ ...form, descricao: e.target.value })
              }
              placeholder="Descreva os detalhes da ação..."
            />
          </div>
        </div>

        {/* Footer fixo com botões */}
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {isEditing ? "Editando ação existente" : "Criando nova ação"}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={handleSubmit}
              >
                {isEditing ? "Atualizar Ação" : "Criar Ação"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}