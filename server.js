const express = require('express');
const app = express();
const port = process.env.PORT || 5000; // Use a porta fornecida pelo ambiente ou 3000 por padrão
const cors = require('cors');
app.use(express.json());

app.use(cors({
  origin: 'https://conectaamigos.vercel.app',
}));
const users = [];

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

// Rota de login de usuário
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

  // Verifique se o usuário existe e a senha está correta (você deve verificar contra o banco de dados)
  const user = users.find((user) => user.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  return res.status(200).json({ message: 'Login bem-sucedido' });
});

app.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});