// seed.js
const { Pool } = require("pg");
const { faker } = require("@faker-js/faker");
const bcrypt = require('bcrypt'); // Importar bcrypt

// Conexão com o Postgres
const pool = new Pool({
  user: "postgres",       // seu usuário do Postgres
  host: "localhost",
  database: "postgres",   // ou o banco que você criou
  password: "987654321",  // ⚠️ Sua senha do Postgres (Ajustar se diferente)
  port: 5432,
});

// Criar tabela com a nova coluna 'senha' para o hash
async function criarTabela() {
  const query = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Garante a função de UUID
    CREATE TABLE IF NOT EXISTS usuarios_fake (
      id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Mudando para genérica uuid
      nome_completo TEXT,
      idade TEXT,
      sexo TEXT,
      email TEXT UNIQUE, -- Adicionado UNIQUE para facilitar o login
      senha TEXT, -- Novo campo para armazenar o HASH da senha
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
  const saltRounds = 10;
  
  // Hash da senha de teste '123456' para o primeiro usuário, para testes
  const senhaTeste = '123456';
  const senhaHash = await bcrypt.hash(senhaTeste, saltRounds);

  for (let i = 0; i < qtd; i++) {
    const nome_completo = faker.person.fullName();
    const idade = faker.number.int({ min: 18, max: 70 }).toString();
    const sexo = faker.helpers.arrayElement(["Masculino", "Feminino", "Outro"]);
    
    // Usar um e-mail de teste para o primeiro registro
    const email = i === 0 ? "teste@exemplo.com" : faker.internet.email();
    
    // Usar o hash de senha para o primeiro registro, e um hash de senha aleatória para os demais
    const senha = i === 0 ? senhaHash : await bcrypt.hash(faker.internet.password(), saltRounds);
    
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
      (nome_completo, idade, sexo, email, senha, celular, endereco, escolaridade, assessor, assunto, observacao, cidade, bairro, data_criacao, tag_equipe, tag, latitude, longitude)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [nome_completo, idade, sexo, email, senha, celular, endereco, escolaridade, assessor, assunto, observacao, cidade, bairro, data_criacao, tag_equipe, tag, latitude, longitude]
    );
 }
  console.log(`${qtd} registros inseridos com sucesso (1 com email teste@exemplo.com e senha 123456)`);
}

async function main() {
  try {
    // Dropa a tabela para recriar com a nova coluna de senha.
    // **CUIDADO: Isso APAGARÁ todos os dados anteriores.**
    await pool.query('DROP TABLE IF EXISTS usuarios_fake;');
    console.log("Tabela antiga 'usuarios_fake' deletada.");

    await criarTabela();
    await inserirDados(20); // insere 20 registros fake
  } catch (err) {
    console.error("Erro ao popular banco:", err);
  } finally {
    pool.end();
  }
}

main();