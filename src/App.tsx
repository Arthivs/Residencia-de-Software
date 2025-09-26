import { Routes, Route } from "react-router-dom";
import Login from "./paginas/Login";
import DashboardLayout from "./componentes/layout/DashboardLayout";
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
      
      {/*Route sidebar*/}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="acoes" element={<Acoes />} />
        <Route path="tarefas" element={<Tarefas />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="assistente" element={<Assistente />} />
      </Route>
      
      {/*fallback*/}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;