const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { PrismaClient } = require('./prisma/');
const prisma = new PrismaClient();
app.use(express.json());
app.use(
  cors({
    origin: 'https://projeto-front-end-login-e-cadastro.vercel.app',
  })
);
const beekeeper = require('beekeeper');

const beek = beekeeper();

// Configurar rota para receber opiniões
beek.route('/api/feedbacks', {
  methods: ['GET'],
  handler: async (req, res) => {
    try {
      const feedbacks = await prisma.feedback.findMany();
      res.status(200).json(feedbacks);
    } catch (error) {
      console.error('Erro ao buscar feedbacks:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Usuário já registrado' });
  }

  const newUser = { username, password };
  users.push(newUser);

  return res.status(201).json({ message: 'Usuário registrado com sucesso' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  return res.status(200).json({ message: 'Login bem-sucedido' });
});

app.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});
