import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { authController } from './Auth/authController';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
}));

app.use('/auth', authController);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
