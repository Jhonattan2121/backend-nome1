const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(express.json());
app.use(
  cors({
    origin: 'https://projeto-front-end-login-e-cadastro.vercel.app',
  })
);

app.post('/api/feedback', async (req, res) => {
  try {
    const { opinion } = req.body;

    const response = await axios.post(
      beekeeperUrl,
      { opinion },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${beekeeperApiKey}`,
        },
      }
    );

    if (response.status === 201) {
      res.status(200).json({ message: 'Feedback saved successfully' });
    } else {
      res.status(response.status).json({ message: 'Failed to save feedback' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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
