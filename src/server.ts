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


// Adicione esta rota antes das rotas de cadastro
app.get('/userExists', async (req: Request<{ email: string }, {}, {}>, res: Response) => {
  const { email } = req.query;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email as string },
    });

    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao verificar a existência do e-mail.' });
  }
});

// Rota /signup modificado
app.post('/signup', async (req: Request<{}, {}, UserRequestBody>, res: Response) => {
  const { email, password } = req.body;

  // Verificar se o e-mail já está cadastrado
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({ error: 'E-mail já cadastrado.' });
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



const PORT = process.env.PORT || 3234;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
