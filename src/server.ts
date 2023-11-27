import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import cors from 'cors';
import { PrismaClient } from '../prisma/generated';

const prisma = new PrismaClient({});

const app = express();

app.use(cors({
  origin: 'https://conectaamigos.vercel.app',
  credentials: true,
}));

app.use(bodyParser.json());

interface UserRequestBody {
  email: string;
  password: string;
}

interface UserIdParam {
  userId: string;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const allowedDomains = ['gmail.com', 'hotmail.com']; // Adicione os domínios permitidos aqui

  if (!emailRegex.test(email)) {
    return false;
  }

  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

app.post('/signup', async (req: Request<{}, {}, UserRequestBody>, res: Response) => {
  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Formato de e-mail inválido.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no cadastro de usuário.' });
  }
});

app.post('/login', async (req: Request<{}, {}, UserRequestBody>, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  res.status(200).json({ id: user.id });
});

app.get('/user/:userId', async (req: Request<UserIdParam>, res: Response) => {
  try {
    const userId = req.params.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Perfil do usuário não encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil do usuário.' });
  }
});

app.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

const PORT = process.env.PORT || 3234;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
