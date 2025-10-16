// db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",       // seu usuário do Postgres
  host: "localhost",
  database: "postgres",   // ou o banco que você criou
  password: "987654321",  // ⚠️ Sua senha do Postgres (Ajuste aqui também)
  port: 5432,
});

module.exports = pool;