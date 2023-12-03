import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import cors from 'cors';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(
  cors({
    origin: 'https://conectaamigos.vercel.app',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
  })
);

interface User {
  id: string | number; // Update the type to allow string or number
  email: string;
  password: string;
  name: string;
}

const dataFilePath = 'data.json';

const readDataFromFile = (): User[] => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const existingData: User[] = readDataFromFile();

const writeDataToFile = (data: User[]) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

app.get('/jsondata', (req: Request, res: Response) => {
  const data: User[] = readDataFromFile();
  res.json(data);
});

app.post('/jsondata', (req: Request, res: Response) => {
  try {
    const { id, email, password, name }: User = req.body;

    if (!id || !email || !password || !name) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const newUser: User = { id, email, password, name };
    existingData.push(newUser);

    writeDataToFile(existingData);

    res.json({ message: 'Usuário criado com sucesso!', newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.use(bodyParser.json());
const SECRET_KEY = 'Jhonattan';

const generateToken = (userId: string | number): string => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
};


app.post('/Auth/signup', (req: Request, res: Response) => {
  try {
    const { email, password, name }: User = req.body;

    const existingUser: User | undefined = existingData.find((user) => user.email === email);

    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já está em uso.' });
    }

    const hashedPassword: string = bcrypt.hashSync(password, 10);

    const newUser: User = {
      id: uuidv4(), // Use uuidv4 to generate a unique user ID
      email,
      password: hashedPassword,
      name,
    };    
    existingData.push(newUser);

    writeDataToFile(existingData);

    const token: string = generateToken(newUser.id);

    res.status(201).json({ user: newUser, token, message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro durante o registro' });
  }
});

app.post('/Auth/login', (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    const user: User | undefined = existingData.find((u) => u.email === email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token: string = generateToken(user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro durante o login' });
  }
});

app.get('/user/:userId', (req: Request, res: Response) => {
  try {
    const userId: number = parseInt(req.params.userId, 10);

    const user: User | undefined = existingData.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

app.put('/users/:userId', (req: Request, res: Response) => {
  try {
    const userId: number = parseInt(req.params.userId, 10);
    const { email, password }: { email: string; password: string } = req.body;

    // Restante do código...
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

app.delete('/users/:userId', (req: Request, res: Response) => {
  try {
    const userId: number = parseInt(req.params.userId, 10);

    const userIndex: number = existingData.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    existingData.splice(userIndex, 1);

    writeDataToFile(existingData);

    res.status(200).json({ message: 'Usuário excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

app.get('/users', (req: Request, res: Response) => {
  try {
    res.status(200).json(existingData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

const PORT: number = parseInt(process.env.PORT || '3234', 10);
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
