import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { pool } from './db/connection.js';
import authRouter from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/auth', authRouter);


// Rutas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Función asíncrona para iniciar la aplicación de forma segura
async function starserver() {
    try {
        // Probar la conexión a la base de datos
        await pool.getConnection();
        console.log('✅ Conexión a la base de datos exitosa');

        app.listen(port, () => {
            console.log(`Servidor en http://localhost:${port}`);
        });
    } catch (error){
        console.error('❌ Error al conectar a la base de datos:', error.message);
        console.error('🚀 El servidor no se ha iniciado');
    }
}

starserver();