import { Router, Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();
const updateProfileRoute = Router();

updateProfileRoute.put('/:userId', async (req: Request, res: Response) => {
  const userId: string = req.params.userId;
  const updatedProfile: Partial<User> = req.body;

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: updatedProfile,
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal Server Error - Update failed' });
  }
});

export default updateProfileRoute;
