import { useState } from "react";
import "./stylec.css"; 
import "@fortawesome/fontawesome-free/css/all.min.css"; 
import TelaCadastro from "./TelaCadastro";

function App() {
  const [telaAtiva, setTelaAtiva] = useState("senha"); // tela inicial

  return (
    <>
      <header className="top-bar">
        <div className="container">
          <h1>Configurações</h1>
          <p>Gerencie suas configurações de usuário</p>
        </div>
      </header>

      <main className="container">
        <div className="card">
          <nav className="tabs">
            <button
              className={`tab ${telaAtiva === "senha" ? "active" : ""}`}
              onClick={() => setTelaAtiva("senha")}
            >
              <i className="fa-solid fa-circle-info"></i> Alteração de Senha
            </button>
            <button
              className={`tab ${telaAtiva === "cadastro" ? "active" : ""}`}
              onClick={() => setTelaAtiva("cadastro")}
            >
              <i className="fa-solid fa-user"></i> Cadastro de Usuário
            </button>
            <button
              className={`tab ${telaAtiva === "admin" ? "active" : ""}`}
              onClick={() => setTelaAtiva("admin")}
            >
              <i className="fa-solid fa-users"></i> Administração de Usuários
            </button>
          </nav>

          <section className="form-section">
            {telaAtiva === "senha" && (
              <>
                <h2>Alteração de Senha</h2>
                <form className="form">
                  <label htmlFor="senha">Senha</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="senha"
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <label htmlFor="nova-senha">Nova senha (exatamente 8 caracteres)</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="nova-senha"
                      placeholder="Digite a nova senha"
                    />
                  </div>

                  <label htmlFor="confirmar-senha">Confirmar nova senha</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="confirmar-senha"
                      placeholder="Confirme a nova senha"
                    />
                  </div>

                  <div className="actions">
                    <button type="submit" className="btn-primary">
                      Alterar Senha
                    </button>
                  </div>
                </form>
              </>
            )}

            {telaAtiva === "cadastro" && <TelaCadastro />}

            {telaAtiva === "admin" && (
              <>
                <h2>Administração de Usuários</h2>
                <p>Aqui vai o conteúdo da tela de administração.</p>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
