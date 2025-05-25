import AuthInterface from "../model/AuthInterface.js";
import { supabase } from "../db/supaClient.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

class AuthService extends AuthInterface {
    async registrar(datosCliente) {
        const contraseniaHasheada = await bcrypt.hash(datosCliente.contrasenia, SALT_ROUNDS);

        const { data, error } = await supabase
            .from("cuentas")
            .insert([{ 
                nombre: datosCliente.nombre,
                apellido: datosCliente.apellido,
                correo: datosCliente.correo,
                fechacreacion: new Date().toISOString().split("T")[0], 
                contrasenia: contraseniaHasheada,
                contrasenias: null
            }])
            .select("idcuenta, correo")
            .single();

        if (error) {
            throw new Error("Error al registrar usuario: " + error.message);
        }

        const token = jwt.sign(
            { userId: data.idcuenta, correo: data.correo },
            process.env.SUPABASE_JWT_SECRET,
            { expiresIn: "1h" }
        );

        return { message: "Registro exitoso", token };
    }

    async login(correo, contrasenia) {
        const { data: userData, error } = await supabase
            .from("cuentas")
            .select("idcuenta, correo, contrasenia, esAdmin")
            .eq("correo", correo)
            .maybeSingle();

        if (error || !userData) {
            throw new Error("Usuario no encontrado.");
        }

        const contraseniaValida = await bcrypt.compare(contrasenia, userData.contrasenia);
        if (!contraseniaValida) {
            throw new Error("Contraseña incorrecta.");
        }

        const token = jwt.sign(
            { userId: userData.idcuenta, correo: userData.correo, isAdmin: userData.esAdmin },
            process.env.SUPABASE_JWT_SECRET,
            { expiresIn: "1h" }
        );

        return { message: "Inicio de sesión exitoso", token };
    }
}

export default AuthService;
