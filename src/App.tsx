// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { DashConectProvider } from "./conect/dashconect";
import Login from "./paginas/Login";
import DashboardLayout from "./componentes/Layout/DashboardLayout";
import Dashboard from "./paginas/Dashboard";
import Acoes from "./paginas/acoes/acoes.jsx";
import Financeiro from "./paginas/financeiro";
import Configuracoes from "./paginas/config/configuracoes";
import Assistente from "./paginas/assistente";
import Tarefas from "./paginas/tarefas";
import AlterarSenha from "./paginas/AlterarSenha";
import ProtectedRoute from "./componentes/ProtectedRoute";

function App() {
  return (
    <DashConectProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/alterar-senha" element={<AlterarSenha />} />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tarefas" element={<Tarefas />} />
            <Route path="acoes" element={<Acoes />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="assistente" element={<Assistente />} />
          </Route>
          
          {/* Rota fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </DashConectProvider>
  );
}

export default App;