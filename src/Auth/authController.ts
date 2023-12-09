import { Router } from 'express';
import registerRoute from './Routes/registerRoute';
import loginRoute from './Routes/loginRoute';
import updateProfileRoute from './Routes/updateProfileRoute';


export const authController = Router();

authController.use('/register', registerRoute);
authController.use('/login', loginRoute);
authController.use('/user', updateProfileRoute);
