import { supabase } from "../db/supaClient.js";
import AuthService from "../service/AuthService.js";
import AuthProxy from "../proxy/AuthProxy.js";
import * as cuentasService from "../service/cuentasService.js";

export const getCuenta = async(req, res) => {
    try {
        const {id} = req.params;
        const {data, error} = await cuentasService.getCuentaId(id);

        if (!data) {
            return res.status(404).json({ message: `No se encontró la cuenta con ID ${id}` });
        }

        if(error){
            return res.status(400).json({ message: "Error al obtener la cuenta", error });
        }

        res.status(200).json(data);
    } catch (error) {
        return res.status(500).json(error);
    }    
}

const authService = new AuthService(); 
const authProxy = new AuthProxy(authService, supabase);

export const register = async(req, res) => {
    try {
        const resultado = await authProxy.registrar(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const login = async(req, res) => {
    try {
        const resultado = await authProxy.login(req.body.correo, req.body.contrasenia);
        res.status(200).json(resultado); 
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const actualizarCuentaConOtp = async (req, res) => {
  const { correo, otp, ...info } = req.body;

  if (!correo || !otp) {
    return res.status(400).json({ message: "Correo y OTP son requeridos" });
  }

  try {
    const resultado = await cuentasService.actualizarInfoCuentaConOtp(correo, info, otp);
    res.status(200).json({ message: "Cuenta actualizada con éxito", data: resultado.data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const eliminarCuenta = async (req, res) => {
    try {
        const {id} = req.params
        const {data, error} = cuentasService.eliminarCuenta(id);
        if(error){
            throw new Error("Error al eliminar la cuenta" + error.message);
        }
        res.status(200).json({message: "Cuenta eliminada con éxito, sus tarjetas también fueron borradas"});

    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export const sendOtp = async (req, res) => {
  const { correo, tipo } = req.body;

  if (!correo) {
    return res.status(400).json({ message: 'El correo es requerido' });
  }

  try {
    await cuentasService.generateAndSendOtp(correo, tipo);
    res.status(200).json({ message: 'OTP enviado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const verifyOtp = async (req, res) => {
  const { correo, otp } = req.body;

  if (!correo || !otp) {
    return res.status(400).json({ message: 'Correo y OTP son requeridos' });
  }

  try {
    const valido = await cuentasService.verifyOtpCode(correo, otp, false);

    if (valido) {
      res.status(200).json({ message: 'OTP válido' });
    } else {
      res.status(400).json({ message: 'OTP inválido o expirado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const cambiarPassword = async (req, res) => {
  const { correo, nuevaContrasenia} = req.body;

  try {
    const resultado = await cuentasService.cambiarContrasenia(correo, nuevaContrasenia);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  const { correo, nuevaContrasenia } = req.body;

  if (!correo || !nuevaContrasenia) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    const resultado = await cuentasService.resetContrasenia(correo, nuevaContrasenia);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
