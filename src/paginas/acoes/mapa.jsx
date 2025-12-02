// src/paginas/acoes/mapa.jsx - MAPA DE CALOR REAL
import React, { useRef, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker
} from "react-leaflet";
import HeatLayer from "./layer";
import { Plus, Filter, MapPin, Users, Flame } from "lucide-react";

export default function MapView({
  mapView = "pontos",
  setMapView,
  filteredActions = [],
  bairroStats = {},
  onCreate
}) {
  const center = [-10.9117, -37.0678];
  const mapRef = useRef();
  const [showFilters, setShowFilters] = useState(false);

  // CALCULAR DENSIDADE REAL PARA MAPA DE CALOR
  const heatPoints = useMemo(() => {
    if (filteredActions.length === 0) return [];
    
    // Agrupar ações por área (usando grid de 0.01 graus ~1km)
    const gridSize = 0.01;
    const heatMap = new Map();
    
    filteredActions.forEach(action => {
      if (action.lat && action.lng) {
        // Arredondar coordenadas para criar células do grid
        const gridLat = Math.round(action.lat / gridSize) * gridSize;
        const gridLng = Math.round(action.lng / gridSize) * gridSize;
        const gridKey = `${gridLat},${gridLng}`;
        
        // Contar ações nesta célula
        heatMap.set(gridKey, (heatMap.get(gridKey) || 0) + 1);
      }
    });
    
    // Converter para pontos de calor com intensidade baseada na contagem
    const points = [];
    const maxCount = Math.max(...Array.from(heatMap.values()));
    
    heatMap.forEach((count, key) => {
      const [lat, lng] = key.split(',').map(Number);
      // Normalizar intensidade (0.3 a 2.0) baseada na contagem relativa
      const intensity = 0.3 + (count / maxCount) * 1.7;
      points.push([lat, lng, intensity]);
    });
    
    return points;
  }, [filteredActions]);

  // CALCULAR DENSIDADE POR BAIRRO (alternativa)
  const heatPointsByBairro = useMemo(() => {
    if (Object.keys(bairroStats).length === 0) return [];
    
    const points = [];
    const maxCount = Math.max(...Object.values(bairroStats).map(b => b.count));
    
    Object.values(bairroStats).forEach(bairro => {
      if (bairro.lat && bairro.lng && bairro.count > 0) {
        // Intensidade baseada na contagem do bairro
        const intensity = 0.5 + (bairro.count / maxCount) * 2.0;
        points.push([bairro.lat, bairro.lng, intensity]);
      }
    });
    
    return points;
  }, [bairroStats]);

  // Usar a densidade por bairro para melhor representação
  const finalHeatPoints = heatPointsByBairro.length > 0 ? heatPointsByBairro : heatPoints;

  // Estatísticas rápidas
  const stats = useMemo(() => ({
    total: filteredActions.length,
    withLocation: filteredActions.filter(a => a.lat && a.lng).length,
    bairros: Object.keys(bairroStats).length,
    tipos: [...new Set(filteredActions.map(a => a.tipo))].length,
    // Estatísticas específicas do mapa de calor
    heatPoints: finalHeatPoints.length,
    maxDensity: finalHeatPoints.length > 0 
      ? Math.max(...finalHeatPoints.map(p => p[2])).toFixed(1) 
      : 0,
    avgDensity: finalHeatPoints.length > 0 
      ? (finalHeatPoints.reduce((sum, p) => sum + p[2], 0) / finalHeatPoints.length).toFixed(1) 
      : 0
  }), [filteredActions, bairroStats, finalHeatPoints]);

  // Configurações para cada modo de visualização
  const viewConfigs = {
    pontos: {
      name: "Pontos Individuais",
      icon: MapPin,
      color: "sky",
      description: "Visualize cada ação individualmente no mapa"
    },
    contadores: {
      name: "Contadores por Bairro",
      icon: Users,
      color: "emerald", 
      description: "Veja a quantidade de ações por bairro"
    },
    calor: {
      name: "Mapa de Calor",
      icon: Flame,
      color: "red",
      description: "Análise de densidade das ações por região"
    }
  };

  const getColorClass = (view, config) => {
    if (mapView !== view) return "bg-white text-gray-700 hover:bg-gray-50";
    
    const colors = {
      sky: "bg-sky-600 text-white",
      emerald: "bg-emerald-600 text-white",
      red: "bg-red-600 text-white"
    };
    return colors[config.color] || colors.sky;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border">

      {/* Cabeçalho Melhorado */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Mapa de Ações</h2>
            <p className="text-sm text-gray-500">
              {stats.total} ações • {stats.withLocation} geolocalizadas • {stats.bairros} bairros
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Visualizações
            </button>
            
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Ação
            </button>
          </div>
        </div>

        {/* Seções de Visualização */}
        {showFilters && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3 font-medium">Modo de Visualização:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(viewConfigs).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setMapView(key)}
                    className={`p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 ${getColorClass(key, config)}`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{config.name}</div>
                      <div className="text-xs opacity-80">{config.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="h-[60vh] relative">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          whenCreated={m => (mapRef.current = m)}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* 1. Pontos individuais melhorados */}
          {mapView === "pontos" &&
            filteredActions
              .filter(a => a.lat && a.lng)
              .map((a, i) => (
                <Marker key={a.id || i} position={[a.lat, a.lng]}>
                  <Popup className="custom-popup">
                    <div className="min-w-[250px]">
                      <div className="font-semibold text-gray-800 text-sm mb-2">
                        {a.titulo || a.tipo}
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium">{a.tipo}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bairro:</span>
                          <span className="font-medium">{a.bairro}</span>
                        </div>
                        
                        {a.data && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Data:</span>
                            <span className="font-medium">
                              {new Date(a.data).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

          {/* 2. Contadores por bairro estilizados */}
          {mapView === "contadores" &&
            Object.values(bairroStats)
              .filter(b => b.lat && b.lng)
              .map((b, i) => {
                const radius = Math.min(8 + b.count * 2, 25);
                const opacity = Math.min(0.3 + (b.count / Math.max(...Object.values(bairroStats).map(b => b.count))) * 0.7, 0.9);
                
                return (
                  <CircleMarker
                    key={i}
                    center={[b.lat, b.lng]}
                    radius={radius}
                    pathOptions={{
                      color: "#1d4ed8",
                      fillColor: "#3b82f6",
                      fillOpacity: opacity,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="text-center min-w-[150px]">
                        <div className="font-semibold text-blue-600 text-lg">{b.bairro}</div>
                        <div className="text-sm text-gray-700 mt-1">
                          <span className="text-2xl font-bold text-blue-800">{b.count}</span>
                          <br />
                          ação{b.count !== 1 ? 'es' : ''} registrada{b.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

          {/* 3. MAPA DE CALOR REAL - baseado em densidade por bairro */}
          {mapView === "calor" && finalHeatPoints.length > 0 && (
            <HeatLayer
              points={finalHeatPoints}
              options={{
                radius: 40, // Raio maior para melhor cobertura
                blur: 25,   // Suavização adequada
                maxZoom: 18,
                minOpacity: 0.4,
                // Gradiente real baseado em densidade
                gradient: {
                  0.0: "#00FF00",   // Verde - baixa densidade
                  0.3: "#FFFF00",   // Amarelo - densidade média
                  0.6: "#FFA500",   // Laranja - densidade alta
                  0.9: "#FF0000",   // Vermelho - densidade muito alta
                  1.0: "#8B0000"    // Vermelho escuro - densidade máxima
                }
              }}
            />
          )}

          {/* Mensagem quando não há dados para mapa de calor */}
          {mapView === "calor" && finalHeatPoints.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-[400]">
              <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                <Flame className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Sem dados para mapa de calor
                </h3>
                <p className="text-gray-500 text-sm">
                  Não há ações geolocalizadas suficientes para gerar o mapa de calor.
                </p>
              </div>
            </div>
          )}
        </MapContainer>

        {/* Legenda do Mapa Dinâmica */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border max-w-xs">
          <div className="text-xs font-semibold text-gray-700 mb-2">Legenda:</div>
          
          {mapView === "pontos" && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Marcadores: Ações individuais</span>
              </div>
              <div className="text-xs text-gray-500">
                Clique nos marcadores para ver detalhes
              </div>
            </div>
          )}
          
          {mapView === "contadores" && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-blue-400 bg-opacity-50"></div>
                <span>Círculos: Quantidade por bairro</span>
              </div>
              <div className="text-xs text-gray-500">
                Tamanho = Quantidade de ações
              </div>
            </div>
          )}
          
          {mapView === "calor" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-4 h-3 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded"></div>
                <span>Densidade de Ações por Região</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                <div className="text-center text-green-600 font-medium">Baixa</div>
                <div className="text-center text-yellow-600 font-medium">Média</div>
                <div className="text-center text-orange-600 font-medium">Alta</div>
                <div className="text-center text-red-600 font-medium">Máxima</div>
              </div>
              {finalHeatPoints.length > 0 && (
                <div className="text-xs text-gray-500 border-t pt-1">
                  Áreas: {finalHeatPoints.length}<br />
                  Densidade máx: {stats.maxDensity}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Indicador de Modo Ativo */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-2 rounded-lg text-white text-sm font-medium ${
            mapView === "pontos" ? "bg-sky-600" :
            mapView === "contadores" ? "bg-emerald-600" :
            "bg-red-600"
          }`}>
            {viewConfigs[mapView]?.name}
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas - Dinâmicas para mapa de calor */}
      <div className="p-4 border-t bg-gray-50">
        <div className={`grid gap-4 text-center ${
          mapView === "calor" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-4"
        }`}>
          <div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-600">Total de Ações</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{stats.withLocation}</div>
            <div className="text-xs text-gray-600">Geolocalizadas</div>
          </div>
          
          {mapView === "calor" ? (
            <>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.heatPoints}</div>
                <div className="text-xs text-gray-600">Áreas de Calor</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.maxDensity}</div>
                <div className="text-xs text-gray-600">Densidade Máx</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.bairros}</div>
                <div className="text-xs text-gray-600">Bairros</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.tipos}</div>
                <div className="text-xs text-gray-600">Tipos Diferentes</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}