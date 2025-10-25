import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { pool } from './config/connection.js';
import authRouter from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/auth', authRouter);


// Rutas

// Ruta para la página de inicio de sesión
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/pages/login.html'));
});

// Ruta para el dashboard (después de iniciar sesión)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/pages/dashboard.html'));
});

// Middlewares

// Middleware para manejar rutas no encontradas
app.use((req, res, next) =>{
    res.status(404).sendFile(path.join(__dirname, '../client/pages/404.html'));
})

// Middleware para manejar errores en el servidor
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, '../client/pages/500.html'));
})

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