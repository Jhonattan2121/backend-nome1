import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import cors from 'cors';
import { PrismaClient } from '../prisma/generated';
import jwt from 'jsonwebtoken'
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

const SECRET_KEY = 'Jhonattan';

const generateToken = (userId: string ) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
};

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token is not valid' });
    }

    if (!decoded || typeof decoded.id !== 'number') {
      return res.status(403).json({ error: 'Invalid user ID in the token' });
    }

    (req as any).userId = +decoded.id;
    next();
  });
};


app.post('/Auth/signup', async (req: Request<{}, {}, UserRequestBody>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ msg: 'Email e senha são obrigatórios' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }
   

    const newUser = await prisma.user.create({
      data: { 
        email, 
        password: await bcrypt.hash(password, 10),

      },
    });

    const token = generateToken(newUser.id);


    res.status(201).json({ user: newUser , token   });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no cadastro de usuário.' });
  }
});

app.post('/Auth/login', async (req: Request<{}, {}, UserRequestBody>, res: Response) => {
  const { email, password } = req.body;

  try {
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

    const token = generateToken(user.id);

    res.status(200).json({ id: user.id, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no processo de login.' });
  }
});

app.get('/user/:userId', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

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

app.get('/users', authenticateJWT, async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});


const PORT = parseInt(process.env.PORT || '3234', 10);
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
