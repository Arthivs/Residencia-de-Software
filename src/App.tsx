import { Routes, Route } from "react-router-dom";
import Login from "./paginas/Login";
import DashboardLayout from "./componentes/Layout/DashboardLayout";
import Dashboard from "./paginas/Dashboard";
import Acoes from "./paginas/acoes";
import Tarefas from "./paginas/tarefas";
import Financeiro from "./paginas/financeiro";
import Configuracoes from "./paginas/configuracoes";
import Assistente from "./paginas/assistente";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Layout principal com sidebar */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="acoes" element={<Acoes />} />
        <Route path="tarefas" element={<Tarefas />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="assistente" element={<Assistente />} />
      </Route>
      
      {/* Rota fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;