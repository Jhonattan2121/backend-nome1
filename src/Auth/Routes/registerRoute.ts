import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();
const registerRoute = Router();

registerRoute.post('/', async (req: Request, res: Response) => {
  const { name, email, password }: { name: string; email: string; password: string } = req.body;

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user: User = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        displayName: "", 
        photoURL: "", 
      },
    });

    res.json({ id: user.id });
  } catch (error: any) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error - Registration failed' });
  }
});

export default registerRoute;
