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
  user: 'conta',
  host: 'localhost',
  database: 'mydb',
  password: '123',
  port: 5432,
});

app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao recuperar dados de usuários:', error);
    res.status(500).json({ error: 'Erro ao recuperar dados de usuários' });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password, email, firstName, lastName } = req.body;

  try {
    await pool.query(
      'INSERT INTO users (username, password, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5)',
      [username, password, email, firstName, lastName]
    );

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar o usuário:', error);
    res.status(500).json({ message: 'Ocorreu um erro ao registrar o usuário' });
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
