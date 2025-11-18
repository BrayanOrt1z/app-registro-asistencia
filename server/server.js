import { app } from './app.js';
import { pool } from './config/database.js';

const PORT = process.env.PORT || 3000;

// Función asíncrona para iniciar la aplicación
async function startserver() {
    try {
        // Probar la conexión a la base de datos
        const connection = await pool.getConnection();
        console.log('✅ Conexión a la base de datos exitosa');
        connection.release();

        // Iniciar el servidor

        app.listen(PORT, () => {
            console.log('==========================================');
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📍 http://localhost:${PORT}`);
            console.log('==========================================');
        });           
    } catch (error){
        console.error('❌ Error al conectar a la base de datos:', error.message);
        console.error('🚀 El servidor no se ha iniciado');
    }
}

startserver();