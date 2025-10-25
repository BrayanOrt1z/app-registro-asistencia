import bcrypt from 'bcrypt';
import { userModel } from './../models/userModel.js';

export const loginUser = async (req, res) => {
    const {usuario, contrasenia} = req.body;

    if (!usuario || !contrasenia) {
        return res.redirect('/?error=Faltan%20campos%20requeridos');
    }

    try {
        const foundUser = await userModel.findByUsuario(usuario);
        if (!foundUser) {
            return res.redirect('/?error=Usuario%20o%20contrase%C3%B1a%20inv%C3%A1lidos');
        }

        const validPassword = await bcrypt.compare(contrasenia, foundUser.contrasenia);

        if (!validPassword) {
            return res.redirect('/?error=Usuario%20o%20contrase%C3%B1a%20inv%C3%A1lidos');
        } else {
            return res.redirect('/dashboard');
        }

    } catch (error){
        console.error('Error al buscar el usuario:', error);
        return res.redirect('/?error=Error%20del%20servidor');
    };
};