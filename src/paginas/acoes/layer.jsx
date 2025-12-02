import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat"; 

export default function HeatLayer({ points = [], options = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (!L.heatLayer) {
      console.warn("leaflet.heat não está carregado");
      return;
    }

    // preparar pontos: [[lat, lng, intensity], ...]
    const heatPoints = (points || []).map(p => {
      // p pode ser [lat, lng] ou [lat, lng, weight]
      const lat = Number(p[0]);
      const lng = Number(p[1]);
      const w = p.length >= 3 ? Number(p[2]) : 1.0;
      return [lat, lng, isFinite(w) ? w : 1.0];
    });

    // defaults profissionais
    const defaults = {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      minOpacity: 0.25,
      // gradiente do azul/verde -> vermelho, altere conforme preferir
      gradient: {
        0.0: "green",
        0.25: "lime",
        0.45: "yellow",
        0.65: "orange",
        1.0: "red",
      },
    };

    const layer = L.heatLayer(heatPoints, { ...defaults, ...options });
    layer.addTo(map);

    // Se houver poucos pontos, aumentar visibilidade (ajuste de fallback)
    if (heatPoints.length <= 3) {
      try {
        layer.setOptions({ radius: Math.max(24, defaults.radius) });
      } catch (e) {}
    }

    return () => {
      try {
        map.removeLayer(layer);
      } catch (e) {}
    };
    // strings para evitar re-rendering infinito por referência em options/points
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, JSON.stringify(points || []), JSON.stringify(options || {})]);

  return null;
}
