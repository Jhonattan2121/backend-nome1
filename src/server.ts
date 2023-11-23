import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient, User } from '../prisma/generated/client';
import bcrypt from 'bcrypt';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(bodyParser.json());

interface CreateUserParams {
  email: string;
  password: string;
 
}

async function createUser({ email, password }: CreateUserParams): Promise<User> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      return createdUser;
    });

    return user;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

app.post('/signup', async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password ) {
      return res
        .status(400)
        .json({ error: 'Email e senha são obrigatórios.' });
    }

    const user = await createUser({email, password});

    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no cadastro de usuário.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email e senha são obrigatórios.' });
    }

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

    // Responda com o ID do usuário
    res.status(200).json({ id: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no login.' });
  }
});

app.get('/user/:userId', async (req, res) => {
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

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
