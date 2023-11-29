import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import cors from 'cors';
import { PrismaClient, User } from '../prisma/generated';
import jwt from 'jsonwebtoken'
const prisma = new PrismaClient({});
const app = express();
app.use(cors({
  origin: 'https://conectaamigos.vercel.app',
  credentials: true,
}));

app.use(bodyParser.json());
const SECRET_KEY = 'Jhonattan';


const generateToken = (userId: number) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
};

app.post('/Auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criação do usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    const NewUser = generateToken(Number(user.id));
    res.header('Access-Control-Allow-Origin', 'https://conectaamigos.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(201).json({ user: user, NewUser });


    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro durante o registro' });
  }
});

app.post('/Auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Busca do usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificação da senha
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Geração do token JWT
    const token = jwt.sign({ userId: user.id }, 'secretpassword', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro durante o login' });
  }
});

app.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

app.put('/users/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { email, password } = req.body;

    // Hash da nova senha, se fornecida
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Atualização do usuário no banco de dados
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

app.delete('/users/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Exclusão do usuário no banco de dados
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({ message: 'Usuário excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});


const PORT = parseInt(process.env.PORT || '3234', 10);
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
