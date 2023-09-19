const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { Pool } = require('pg');

app.use(express.json());
app.use(
  cors({
    origin: 'https://projeto-front-end-login-e-cadastro.vercel.app',
  })
);

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: '123',
  port: 5432,
});

app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const query = 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)';
    await pool.query(query, [username, password, email]);
    res.status(201).send('Usuário registrado com sucesso.');
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).send('Ocorreu um erro ao registrar o usuário.');
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
  pool.query(query, [username, password], (error, result) => {
    if (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ message: 'Ocorreu um erro ao fazer login' });
    } else {
      if (result.rows.length === 1) {
        res.status(200).json({ message: 'Login bem-sucedido' });
      } else {
        res.status(401).json({ message: 'Credenciais inválidas' });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});
