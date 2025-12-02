import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// IMPORTANTE: estes dois imports ATIVAM TODOS OS ESTILOS:
import "./index.css";              // Tailwind + estilos do projeto
import "leaflet/dist/leaflet.css"; // CSS necessário para o mapa aparecer

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


