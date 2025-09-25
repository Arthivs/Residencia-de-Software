import { Routes, Route } from "react-router-dom";
import Login from "./paginas/Login";
import Dashboard from "./paginas/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
