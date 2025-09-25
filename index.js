const express = require("express");
const pool = require("./db"); // <-- aqui também importa a mesma conexão

const app = express();

app.get("/clientes", async (req, res) => {
  const result = await pool.query("SELECT * FROM clientes_fake LIMIT 10");
  res.json(result.rows);
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));