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
function generateToken(userId: string): string {
  const secretKey = process.env.SECRET_KEY || 'your_secret_key'; // Replace with your actual secret key
  const expiresIn = '1h'; // Set the token expiration time

  const token = jwt.sign({ userId }, secretKey, { expiresIn });
  return token;
}

// Middleware to verify JWT token
function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const secretKey = process.env.SECRET_KEY || 'your_secret_key'; // Replace with your actual secret key

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    (req as any).userId = (decoded as any).userId; // Attach userId to the request object
    next();
  });
}

interface UserRequestBody {
  email: string;
  password: string;
}

app.post('/signup', async (req: Request<{}, {}, UserRequestBody>, res: Response) => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já registrado.' });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
      },
    });

     const token = generateToken(newUser.id);

    res.status(201).json({ user: newUser , token  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no cadastro de usuário.' });
  }
});

app.post('/login', async (req: Request<{}, {}, UserRequestBody>, res: Response) => {
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


    res.status(200).json({ id: user.id,  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no processo de login.' });
  }
});

app.get('/user/:userId', verifyToken, async (req: Request, res: Response) => {
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

app.get('/users', verifyToken, async (_req: Request, res: Response) => {
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
