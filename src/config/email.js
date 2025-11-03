const nodemailer = require('nodemailer');

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verificar la configuración del transporter al inicio
transporter.verify(function (error, success) {
  if (error) {
    console.log('Error en configuración de email:', error);
  } else {
    console.log('Server is ready to send messages');
  }
});

/**
 * Envía un email de contacto
 * @param {Object} contactData - Datos del formulario de contacto
 * @param {string} contactData.tipo - Tipo de formulario ('canjea' o 'forma')
 * @param {string} contactData.nombre - Nombre del remitente
 * @param {string} contactData.mail - Email del remitente
 * @param {string} contactData.telefono - Teléfono
 * @param {string} contactData.mensaje - Mensaje
 * @param {string} contactData.empresa - Nombre de la empresa (solo para 'canjea')
 * @param {string} contactData.ubicacion - Ubicación (solo para 'canjea')
 * @param {string} contactData.foto - Nombre del archivo de foto (solo para 'canjea')
 */
const sendContactEmail = async ({ tipo, nombre, mail, telefono, mensaje, empresa, ubicacion, foto }) => {
  // Determinar el asunto según el tipo de formulario
  const subject = tipo === 'canjea' 
    ? 'Nuevo intercambio - CANJEA' 
    : 'Nuevo contacto - FORMÁ PARTE';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'intercanjes@gmail.com',
    to: process.env.EMAIL_TO || 'intercanjes@gmail.com',
    subject: subject,
    html: `
      <h2>Nuevo mensaje de contacto - ${tipo.toUpperCase()}</h2>
      <p><strong>Tipo de formulario:</strong> ${tipo.toUpperCase()}</p>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${mail}</p>
      <p><strong>Teléfono:</strong> ${telefono}</p>
      ${empresa ? `<p><strong>Empresa:</strong> ${empresa}</p>` : ''}
      ${ubicacion ? `<p><strong>Ubicación:</strong> ${ubicacion}</p>` : ''}
      ${foto ? `<p><strong>Foto:</strong> ${foto}</p>` : ''}
      <hr>
      <p><strong>Mensaje:</strong></p>
      <p>${mensaje.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><em>Enviado desde el formulario de contacto</em></p>
    `,
    text: `
Nuevo mensaje de contacto - ${tipo.toUpperCase()}

Tipo de formulario: ${tipo.toUpperCase()}
Nombre: ${nombre}
Email: ${mail}
Teléfono: ${telefono}
${empresa ? `Empresa: ${empresa}` : ''}
${ubicacion ? `Ubicación: ${ubicacion}` : ''}
${foto ? `Foto: ${foto}` : ''}

Mensaje:
${mensaje}

---
Enviado desde el formulario de contacto
    `
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = {
  sendContactEmail,
  transporter
};

