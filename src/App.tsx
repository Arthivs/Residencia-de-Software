import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DashConectProvider } from "./conect/dashconect";
import Login from "./paginas/Login";
import DashboardLayout from "./componentes/Layout/DashboardLayout";
import Dashboard from "./paginas/Dashboard";
import Acoes from "./paginas/acoes";
import Financeiro from "./paginas/financeiro";
import Configuracoes from "./paginas/configuracoes";
import Assistente from "./paginas/assistente";
import Tarefas from "./paginas/tarefas";

function App() {
  return (
    <DashConectProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tarefas" element={<Tarefas />} />
            <Route path="acoes" element={<Acoes />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="assistente" element={<Assistente />} />
          </Route>
        </Routes>
      </Router>
    </DashConectProvider>
  );
}

export default App;
