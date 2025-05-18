import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const html = `
    <h1>Hola ${name},</h1>
    <p>Gracias por registrarte en nuestra aplicación. Estamos emocionados de tenerte con nosotros.</p>
    <p>¡Disfruta de tu experiencia!</p>
  `;
  return await sendEmail(to, subject, html);
};


export const sendOtpRecuperacion = async (to, nombre, otp) => {
  const subject = 'Recuperación de contraseña - Código OTP';
  const html = `
    <h2>Hola ${nombre},</h2>
    <p>Recibimos una solicitud para recuperar tu contraseña.</p>
    <p>Tu código OTP es: <strong style="font-size: 20px;">${otp}</strong></p>
    <p>Este código es válido por <strong>5 minutos</strong>. Si no realizaste esta solicitud, puedes ignorar este mensaje.</p>
  `;
  return await sendEmail(to, subject, html);
};

export const sendOtpCambioPassword = async (to, nombre, otp) => {
  const subject = 'Cambio de contraseña - Verificación OTP';
  const html = `
    <h2>Hola ${nombre},</h2>
    <p>Estás intentando cambiar tu contraseña. Para continuar, utiliza el siguiente código OTP:</p>
    <p><strong style="font-size: 20px;">${otp}</strong></ p>
    <p>Recuerda que este código caduca en <strong>5 minutos</strong>.</p>
  `;
  return await sendEmail(to, subject, html);
};

export const sendOtpActualizarDatos = async (to, nombre, otp) => {
  const subject = 'Actualización de cuenta - Código de verificación';
  const html = `
    <h2>Hola ${nombre},</h2>
    <p>Solicitaste actualizar tu información de cuenta.</p>
    <p>Para continuar, ingresa este código OTP:</p>
    <p><strong style="font-size: 20px;">${otp}</strong></p>
    <p>Este código vence en <strong>5 minutos</strong>.</p>
  `;
  return await sendEmail(to, subject, html);
};
