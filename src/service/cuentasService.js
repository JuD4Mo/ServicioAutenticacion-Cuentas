import { supabase } from "../db/supaClient.js";
import { getTarjetaCuentaId } from "./tarjetaService.js";
import { sendEmail } from '../utils/mailer.js';
import bcrypt from "bcryptjs";
import { sendOtpRecuperacion, sendOtpActualizarDatos, sendOtpCambioPassword} from "../utils/mailer.js";

export const getCuentaId = async(cuentaId) => {
   const cuenta = await supabase.from('cuentas').select('*').eq('idcuenta', cuentaId).single();
   return cuenta;
}

export const actualizarInfoCuentaConOtp = async (correo, info, otp) => {
  const valido = await verifyOtpCode(correo, otp);
  if (!valido) throw new Error("OTP inválido o expirado");

  const camposAActualizar = {};
  if (info.nombre) camposAActualizar.nombre = info.nombre;
  if (info.apellido) camposAActualizar.apellido = info.apellido;
  if (info.correo) camposAActualizar.correo = info.correo;

  if (Object.keys(camposAActualizar).length === 0) {
    throw new Error("No se enviaron datos para actualizar.");
  }

  return await supabase
    .from('cuentas')
    .update(camposAActualizar)
    .eq('correo', correo)
    .select('*');
};

export const eliminarCuenta = async(cuentaId) => {
    let {data, error} = await getTarjetaCuentaId(cuentaId); //Método getTarjetaCuentaId que está en TarjetaService
    for(const tarjeta of data){
        await supabase.from('tarjetas').delete('*').eq('idtarjeta', tarjeta.idtarjeta);
    }

    return await supabase.from('cuentas').delete('*').eq('idcuenta',cuentaId);
}

export const generateAndSendOtp = async (correo, tipo = 'generico') => {
  const cuenta = await supabase
    .from('cuentas')
    .select('nombre')
    .eq('correo', correo)
    .maybeSingle();

  if (!cuenta.data) {
    throw new Error("Correo no registrado");
  }

  const nombre = cuenta.data.nombre;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('cuentas')
    .update({ otp, expires_at: expiresAt, usado: false })
    .eq('correo', correo);

  if (error) throw new Error("Error al actualizar OTP");

  switch (tipo) {
    case 'recuperacion':
      await sendOtpRecuperacion(correo, nombre, otp); break;
    case 'cambio':
      await sendOtpCambioPassword(correo, nombre, otp); break;
    case 'actualizacion':
      await sendOtpActualizarDatos(correo, nombre, otp); break;
    default:
      await sendEmail(correo, 'Código OTP', `<p>Tu código OTP es: <strong>${otp}</strong></p>`);
  }
};



export const verifyOtpCode = async (correo, otp) => {
  const { data, error } = await supabase
    .from('cuentas')
    .select('otp, expires_at, usado')
    .eq('correo', correo)
    .single();

  if (error || !data) return false;

  const now = new Date();
  const expirado = new Date(data.expires_at) < now;

  if (data.otp === otp && !expirado && !data.usado) {
    await supabase
      .from('cuentas')
      .update({ otp: null, expires_at: null, usado: true })
      .eq('correo', correo);
    return true;
  }

  return false;
};

const actualizarContraseniaSeguro = async (correo, nuevaContrasenia) => {
  const { data: cuenta, error } = await supabase
    .from("cuentas")
    .select("contrasenia, contrasenias")
    .eq("correo", correo)
    .single();

  if (error || !cuenta) throw new Error("Cuenta no encontrada");

  const historial = cuenta.contrasenias || [];

  for (const hash of [cuenta.contrasenia, ...historial]) {
    const match = await bcrypt.compare(nuevaContrasenia, hash);
    if (match) {
      throw new Error("Esta contraseña ya ha sido usada. Elige una nueva.");
    }
  }

  const nuevaHash = await bcrypt.hash(nuevaContrasenia, 10);
  const nuevoHistorial = [cuenta.contrasenia, ...historial].slice(0, 5);

  const { error: updateError } = await supabase
    .from("cuentas")
    .update({
      contrasenia: nuevaHash,
      contrasenias: nuevoHistorial,
    })
    .eq("correo", correo);

  if (updateError) throw new Error("Error al guardar la nueva contraseña");

  return { message: "Contraseña actualizada exitosamente" };
};

export const cambiarContrasenia = async (correo, nuevaContrasenia) => {
  return await actualizarContraseniaSeguro(correo, nuevaContrasenia);
};

export const resetContrasenia = async (correo, nuevaContrasenia) => {
  return await actualizarContraseniaSeguro(correo, nuevaContrasenia);
};
