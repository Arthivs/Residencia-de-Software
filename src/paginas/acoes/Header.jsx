import React from "react";
import { Map, List, BarChart3 } from "lucide-react";

export default function Header({ activeView, setActiveView, actionStats }) {
  return (
    <div className="bg-blue-600 text-white shadow-xl">
      <div className="max-w-7xl mx-auto p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Ações</h1>
          <p className="text-sm text-sky-100">Visualize e gerencie as ações realizadas</p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="text-sm">
            Ações: <strong>{actionStats.total}</strong>
          </div>
          <div className="text-sm">
            Bairros: <strong>{actionStats.neighborhoods}</strong>
          </div>

          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setActiveView("map")}
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                activeView === "map" ? "bg-white text-blue-600" : "hover:bg-white hover:bg-opacity-10"
              }`}
            >
              <Map className="w-4 h-4" /> Mapa
            </button>

            <button
              onClick={() => setActiveView("list")}
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                activeView === "list" ? "bg-white text-blue-600" : "hover:bg-white hover:bg-opacity-10"
              }`}
            >
              <List className="w-4 h-4" /> Lista
            </button>

            <button
              onClick={() => setActiveView("analytics")}
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                activeView === "analytics" ? "bg-white text-blue-600" : "hover:bg-white hover:bg-opacity-10"
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Desempenho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
