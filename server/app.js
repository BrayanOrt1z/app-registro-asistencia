import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import attendanceRouter from '../server/routes/attendanceRoutes.js';
import { fileURLToPath } from 'url';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { verifyToken } from './middlewares/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Infraestructura (global)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));
app.use(cookieParser());

// Rutas de API
app.use('/api/auth', authRouter);
app.use('/api/attendance', attendanceRouter);

// Rutas de páginas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/pages/login.html'));
});

app.get('/dashboard', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/pages/dashboard.html'));
});


// 404 y errores
app.use(notFound);
app.use(errorHandler);
