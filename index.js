const express = require("express");
const pool = require("./db");
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const cors = require('cors'); // Para permitir a conexão do front-end

const app = express();

// ⚠️ CHAVE SECRETA: Sua chave aleatória e complexa
const JWT_SECRET = '46064cd82521607a7457c6876849573dc74493945caa078a8d3357ae87cbdc8d'; 

// --- MIDDLEWARES GERAIS ---
app.use(cors()); // Permite que o front-end em outra porta acesse o backend
app.use(express.json()); // Permite que o Express leia JSON do corpo da requisição


// --- MIDDLEWARE DE AUTENTICAÇÃO JWT ---
function authenticateToken(req, res, next) {
    // 1. Obtém o cabeçalho Authorization (esperado: Bearer <TOKEN>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        // 401 Unauthorized: Não há token
        return res.status(401).json({ message: "Acesso negado. Token não fornecido." }); 
    }

    // 2. Verifica a validade do Token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // 403 Forbidden: Token inválido ou expirado
            return res.status(403).json({ message: "Token inválido ou expirado." }); 
        }
        
        // 3. Token válido: Salva os dados do payload na requisição
        req.user = user; 
        next(); // Continua para a função da rota
    });
}


// --- ROTA DE LOGIN (POST) ---
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    try {
        const result = await pool.query("SELECT * FROM usuarios_fake WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const passwordMatch = await bcrypt.compare(password, user.senha);

        if (passwordMatch) {
            // SUCESSO: 
            // 1. Gera o Token JWT
            const token = jwt.sign(
                { id: user.id_usuario, email: user.email }, 
                JWT_SECRET, 
                { expiresIn: '1h' } 
            );

            // 2. Retorna o Token e dados básicos do usuário
            return res.json({ 
                message: "Login realizado com sucesso!", 
                token: token, 
                user: { nome: user.nome_completo } 
            });

        } else {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
});


// --- ROTA PROTEGIDA: /usuarios ---
// Agora a rota só pode ser acessada se o token for válido
app.get("/usuarios", authenticateToken, async (req, res) => {
  try {
    // Acessamos o usuário autenticado via req.user, se necessário
    
    const result = await pool.query("SELECT id_usuario, nome_completo, email FROM usuarios_fake LIMIT 10");
    res.json(result.rows);
  } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ message: "Erro ao buscar dados." });
  }
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));