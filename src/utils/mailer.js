import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// 🌟 Template base con logo y estilos
const baseEmailTemplate = (title, body) => `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://vrhudhgvjtcbebdnpftb.supabase.co/storage/v1/object/public/imagenes//Logo.png" alt="Logo de la app" width="100" />
      </div>
      <h2 style="text-align: center; color: #333;">${title}</h2>
      <div style="margin-top: 20px; color: #555; font-size: 16px;">
        ${body}
      </div>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #888; text-align: center;">© 2025 TuApp. Todos los derechos reservados.</p>
    </div>
  </div>
`;

// 📬 Función genérica para enviar emails
export const sendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tu App <no-reply@updates.devcorebits.com>',
      to,
      subject,
      html,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (to, name) => {
  const subject = 'Bienvenido a nuestra aplicación';
  const body = `
    <p>Hola <strong>${name}</strong>,</p>
    <p>Gracias por registrarte en nuestra aplicación. Estamos emocionados de tenerte con nosotros.</p>
    <p>¡Disfruta de tu experiencia!</p>
  `;
  const html = baseEmailTemplate('Bienvenido a TuApp', body);
  return await sendEmail(to, subject, html);
};

export const sendOtpRecuperacion = async (to, nombre, otp) => {
  const subject = 'Recuperación de contraseña - Código OTP';
  const body = `
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Recibimos una solicitud para recuperar tu contraseña.</p>
    <p>Tu código OTP es:</p>
    <p style="font-size: 24px; font-weight: bold; color: #1E40AF; text-align: center;">${otp}</p>
    <p>Este código es válido por <strong>5 minutos</strong>. Si no realizaste esta solicitud, puedes ignorar este mensaje.</p>
  `;
  const html = baseEmailTemplate('Código de recuperación', body);
  return await sendEmail(to, subject, html);
};

export const sendOtpCambioPassword = async (to, nombre, otp) => {
  const subject = 'Cambio de contraseña - Verificación OTP';
  const body = `
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Estás intentando cambiar tu contraseña. Para continuar, utiliza el siguiente código OTP:</p>
    <p style="font-size: 24px; font-weight: bold; color: #1E40AF; text-align: center;">${otp}</p>
    <p>Recuerda que este código caduca en <strong>5 minutos</strong>.</p>
  `;
  const html = baseEmailTemplate('Verificación de contraseña', body);
  return await sendEmail(to, subject, html);
};

export const sendOtpActualizarDatos = async (to, nombre, otp) => {
  const subject = 'Actualización de cuenta - Código de verificación';
  const body = `
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Solicitaste actualizar tu información de cuenta.</p>
    <p>Para continuar, ingresa este código OTP:</p>
    <p style="font-size: 24px; font-weight: bold; color: #1E40AF; text-align: center;">${otp}</p>
    <p>Este código vence en <strong>5 minutos</strong>.</p>
  `;
  const html = baseEmailTemplate('Verifica tu cuenta', body);
  return await sendEmail(to, subject, html);
};
