const User = require('./models/User'); 
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

const pool = new Pool({
  user: 'conta',         
  host: 'localhost',       
  database: 'mydb',        
  password: '123',  
  port: 5432,       
});

app.get('/api/users', (req, res) => {
  dbInstance.any('SELECT * FROM users')
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.status(500).json({ error: 'Erro ao recuperar dados de usuários' });
    });
});


router.post('/register', async (req, res) => {
  const { username, password, email, firstName, lastName } = req.body;

  const newUser = new User({
    username,
    password, 
    email,
    firstName,
    lastName,
  });

  try {
    await newUser.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Ocorreu um erro ao registrar o usuário' });
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
