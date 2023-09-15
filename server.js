const express = require('express');
const app = express();
const port = process.env.PORT || 5000; 
const cors = require('cors');
const nodemailer = require('nodemailer');

app.use(express.json());

app.use(cors({
    origin: 'https://projeto-front-end-login-e-cadastro.vercel.app',
  }));
const users = [];

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'jhoontutors@gmail.com', 
  },
});

app.post('/api/send-feedback', (req, res) => {
  const { email, opinion } = req.body;

  const mailOptions = {
    from: 'jhoontutors@gmail.com', 
    to: 'jhoontutors@email.com', 
    subject: 'Feedback do Usuário',
    text: `Opinião: ${opinion}\nE-mail do usuário: ${email}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Ocorreu um erro ao enviar o feedback por e-mail' });
    } else {
      console.log('E-mail enviado: ' + info.response);
      res.status(200).json({ message: 'Feedback enviado com sucesso' });
    }
  });
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
