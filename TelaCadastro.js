import "./TelaCadastro.css";

function TelaCadastro() {
  return (
    <section className="form-section">
      <h2 className="form-title">Cadastro de Usuário</h2>

      <form className="form-cadastro">
        <div className="input-group">
          <label htmlFor="nome">Nome</label>
          <input type="text" id="nome" placeholder="Digite o nome" />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Digite o email" />
        </div>

        <div className="input-group">
          <label htmlFor="senha">Senha</label>
          <input type="password" id="senha" placeholder="Digite a senha" />
        </div>

        <div className="actions">
          <button type="submit" className="btn-cadastrar">
            Cadastrar
          </button>
        </div>
      </form>
    </section>
  );
}

export default TelaCadastro;
