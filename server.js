const express = require('express');
const app = express();
const port = process.env.PORT || 5000; 
const prisma = new PrismaClient();
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
app.use(express.json());

app.use(cors({
    origin: 'https://projeto-front-end-login-e-cadastro.vercel.app',
  }));
const users = [];
app.use(bodyParser.json());

// Rota para receber avaliações
app.post('/api/feedback', async (req, res) => {
  try {
    const { opinion } = req.body;

    // Salvar a avaliação no banco de dados
    const feedback = await prisma.feedback.create({
      data: {
        opinion,
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Erro ao salvar a avaliação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
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
