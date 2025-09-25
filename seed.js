const pool = require("./db"); // <-- aqui você importa a conexão
const { faker } = require("@faker-js/faker");

// resto do código para criar tabela e inserir dados

const { Pool } = require("pg");
const { faker } = require("@faker-js/faker");

// Conexão com o Postgres
const pool = new Pool({
  user: "postgres",       // seu usuário do Postgres
  host: "localhost",
  database: "postgres",   // ou o banco que você criou
  password: "sua_senha",  // sua senha do Postgres
  port: 5432,
});

// Criar tabela com as colunas que você listou
async function criarTabela() {
  const query = `
    CREATE TABLE IF NOT EXISTS usuarios_fake (
      id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome_completo TEXT,
      idade TEXT,
      sexo TEXT,
      email TEXT,
      celular TEXT,
      endereco TEXT,
      escolaridade TEXT,
      assessor TEXT,
      assunto TEXT,
      observacao TEXT,
      cidade TEXT,
      bairro TEXT,
      data_criacao TIMESTAMPTZ,
      tag_equipe TEXT,
      tag TEXT,
      latitude NUMERIC,
      longitude NUMERIC
    );
  `;
  await pool.query(query);
  console.log("Tabela 'usuarios_fake' criada/verificada ✅");
}

// Inserir dados fake
async function inserirDados(qtd = 20) {
  for (let i = 0; i < qtd; i++) {
    const nome_completo = faker.person.fullName();
    const idade = faker.number.int({ min: 18, max: 70 }).toString();
    const sexo = faker.helpers.arrayElement(["Masculino", "Feminino", "Outro"]);
    const email = faker.internet.email();
    const celular = faker.phone.number();
    const endereco = faker.location.streetAddress();
    const escolaridade = faker.helpers.arrayElement(["Ensino Fundamental", "Ensino Médio", "Superior"]);
    const assessor = faker.person.fullName();
    const assunto = faker.lorem.words(3);
    const observacao = faker.lorem.sentence();
    const cidade = faker.location.city();
    const bairro = faker.location.city();
    const data_criacao = faker.date.recent({ days: 30 });
    const tag_equipe = faker.helpers.arrayElement(["Equipe A", "Equipe B", "Equipe C"]);
    const tag = faker.helpers.arrayElement(["Prioridade Alta", "Normal", "Baixa"]);
    const latitude = faker.location.latitude();
    const longitude = faker.location.longitude();

    await pool.query(
      `INSERT INTO usuarios_fake 
      (nome_completo, idade, sexo, email, celular, endereco, escolaridade, assessor, assunto, observacao, cidade, bairro, data_criacao, tag_equipe, tag, latitude, longitude)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [nome_completo, idade, sexo, email, celular, endereco, escolaridade, assessor, assunto, observacao, cidade, bairro, data_criacao, tag_equipe, tag, latitude, longitude]
    );
 }
  console.log(`${qtd} registros inseridos com sucesso`);

}

async function main() {
  try {
    await criarTabela();
    await inserirDados(20); // insere 20 registros fake
  } catch (err) {
    console.error("Erro ao popular banco:", err);
  } finally {
    pool.end();
  }
}

main();