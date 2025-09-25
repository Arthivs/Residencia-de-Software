// db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",       // seu usuário do Postgres
  host: "localhost",
  database: "postgres",   // ou o banco que você criou
  password: "987654321",  // sua senha do Postgres
  port: 5432,
});

module.exports = pool;