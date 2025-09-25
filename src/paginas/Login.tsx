import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && senha) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* lado azul com ícone */}
        <div className="login-left">
          <FaUserCircle className="login-icon" />
        </div>

        {/*lado branco com formulário*/}
        <div className="login-right">
          <h2>Bem-vindo de volta</h2>
          <p>Faça login para acessar o sistema</p>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            <div className="login-options">
              <label>
                <input type="checkbox" /> Lembrar-me
              </label>
              <a href="#">Esqueci minha senha</a>
            </div>

            <button type="submit">Entrar</button>
          </form>

          <footer>Sistema de Gestão Política v1.0.0</footer>
        </div>
      </div>
    </div>
  );
}
