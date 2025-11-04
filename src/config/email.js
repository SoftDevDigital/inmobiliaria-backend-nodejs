const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

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
 * @param {Array} contactData.fotos - Array de archivos de fotos (multer files)
 */
const sendContactEmail = async ({ tipo, nombre, mail, telefono, mensaje, empresa, ubicacion, fotos = [] }) => {
  // Determinar el asunto según el tipo de formulario
  const subject = tipo === 'canjea' 
    ? 'Nuevo intercambio - CANJEA' 
    : 'Nuevo contacto - FORMÁ PARTE';
  
  // Sanitizar datos para HTML (escapar caracteres especiales)
  const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const nombreSafe = escapeHtml(nombre);
  const mailSafe = escapeHtml(mail);
  const telefonoSafe = escapeHtml(telefono || 'No proporcionado');
  const ubicacionSafe = escapeHtml(ubicacion || (tipo === 'canjea' ? 'No especificada' : 'N/A'));
  const mensajeSafe = escapeHtml(mensaje).replace(/\n/g, '<br>');
  const empresaSafe = empresa ? escapeHtml(empresa) : '';
  
  // Subject para el reply (codificado para URL)
  const replySubject = encodeURIComponent(`Re: Tu consulta en Intercanjes - ${tipo === 'canjea' ? 'CANJEA' : 'FORMÁ PARTE'}`);

  // Preparar attachments (logo y fotos)
  const attachments = [];
  const publicDir = path.join(__dirname, '../../public');
  
  // Intentar encontrar el logo en diferentes formatos y nombres
  const logoNames = ['logoC.png', 'logo.png', 'logo.jpg', 'hero-construccion.png', 'logo.svg'];
  let logoPath = null;
  
  for (const logoName of logoNames) {
    const testPath = path.join(publicDir, logoName);
    if (fs.existsSync(testPath)) {
      logoPath = testPath;
      break;
    }
  }
  
  // Si encontramos el logo, agregarlo como attachment
  if (logoPath) {
    const logoExt = path.extname(logoPath).toLowerCase();
    const attachmentFilename = logoExt === '.svg' ? 'logo.svg' : 'logo.png';
    attachments.push({
      filename: attachmentFilename,
      path: logoPath,
      cid: 'logo'
    });
  }

  // Procesar fotos subidas por el usuario
  const fotosCids = [];
  if (fotos && fotos.length > 0) {
    fotos.forEach((foto, index) => {
      const cid = `foto-${index + 1}`;
      const extension = foto.originalname.split('.').pop() || 'jpg';
      const filename = `foto-${index + 1}.${extension}`;
      
      attachments.push({
        filename: filename,
        content: foto.buffer,
        cid: cid,
        contentType: foto.mimetype
      });
      
      fotosCids.push({
        cid: cid,
        filename: foto.originalname || filename
      });
    });
  }

  const htmlTemplate = `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nuevo contacto - Intercanjes</title>
    <style>
      /* Estilos mínimos responsive compatibles */
      @media only screen and (max-width: 620px) {
        .container { width: 100% !important; }
        .px { padding-left: 16px !important; padding-right: 16px !important; }
        .ptb { padding-top: 16px !important; padding-bottom: 16px !important; }
        .stack { display: block !important; width: 100% !important; }
        .logo img { max-width: 160px !important; height: auto !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background:#0b0b0b; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;">
    <center role="article" aria-roledescription="email" lang="es" style="width:100%; background:#0b0b0b;">
      <!-- Wrapper -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0b0b0b;">
        <tr>
          <td align="center">
            <!-- Max width -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="width:600px; max-width:600px;">
              <!-- Header -->
              <tr>
                <td class="px" style="padding:20px 24px 12px 24px; background:#0b0b0b; border-bottom:1px solid #1f2937;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td class="logo" align="left" valign="middle">
                        ${attachments.length > 0 
                          ? '<img src="cid:logo" alt="INTERCANJES" width="220" style="display:block; border:0; outline:none; text-decoration:none; max-width:220px; height:auto;">'
                          : '<span style="font:700 24px/1 Arial, Helvetica, sans-serif; color:#f97316;">INTERCANJES</span>'
                        }
                      </td>
                      <td align="right" valign="middle" style="font:500 12px/1.2 Arial, Helvetica, sans-serif; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em;">
                        Notificación de contacto
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Hero -->
              <tr>
                <td style="background:#111; padding:0;">
                  <div style="padding:18px 24px;">
                    <h1 style="margin:0; font:700 20px/1.35 Arial, Helvetica, sans-serif; color:#ffffff;">
                      Nuevo mensaje de contacto${tipo === 'canjea' ? ' - CANJEA' : ' - FORMÁ PARTE'}
                    </h1>
                    <p style="margin:8px 0 0; font:400 14px/1.6 Arial, Helvetica, sans-serif; color:#e5e7eb;">
                      Has recibido una nueva consulta desde el formulario de Intercanjes.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Datos -->
              <tr>
                <td class="px" style="padding:20px 24px; background:#0b0b0b;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate; border-spacing:0; background:#111827; border:1px solid #1f2937; border-radius:10px;">
                    <tr>
                      <td style="padding:16px 18px; border-bottom:1px solid #1f2937;">
                        <span style="display:inline-block; font:600 12px/1 Arial, Helvetica, sans-serif; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em;">Nombres y Apellido</span>
                        <div style="margin-top:6px; font:600 16px/1.5 Arial, Helvetica, sans-serif; color:#ffffff;">
                          ${nombreSafe}
                        </div>
                      </td>
                    </tr>
                    ${empresaSafe ? `
                    <tr>
                      <td style="padding:16px 18px; border-bottom:1px solid #1f2937;">
                        <span style="display:inline-block; font:600 12px/1 Arial, Helvetica, sans-serif; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em;">Empresa</span>
                        <div style="margin-top:6px; font:600 15px/1.5 Arial, Helvetica, sans-serif; color:#ffffff;">
                          ${empresaSafe}
                        </div>
                      </td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding:16px 18px; border-bottom:1px solid #1f2937;">
                        <table role="presentation" width="100%">
                          <tr>
                            <td class="stack" width="50%" style="vertical-align:top; padding-right:8px;">
                              <span style="display:inline-block; font:600 12px/1 Arial, Helvetica, sans-serif; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em;">Teléfono</span>
                              <div style="margin-top:6px; font:600 15px/1.5 Arial, Helvetica, sans-serif; color:#ffffff;">
                                ${telefonoSafe}
                              </div>
                            </td>
                            <td class="stack" width="50%" style="vertical-align:top; padding-left:8px;">
                              <span style="display:inline-block; font:600 12px/1 Arial, Helvetica, sans-serif; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em;">Email</span>
                              <div style="margin-top:6px; font:600 15px/1.5 Arial, Helvetica, sans-serif;">
                                <a href="mailto:${mailSafe}" style="color:#f97316; text-decoration:none;">${mailSafe}</a>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    ${tipo === 'canjea' ? `
                    <tr>
                      <td style="padding:16px 18px; border-bottom:1px solid #1f2937;">
                        <span style="display:inline-block; font:600 12px/1 Arial, Helvetica, sans-serif; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em;">Ubicación</span>
                        <div style="margin-top:6px; font:600 15px/1.5 Arial, Helvetica, sans-serif; color:#ffffff;">
                          ${ubicacionSafe}
                        </div>
                      </td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding:16px 18px;">
                        <span style="display:inline-block; font:600 12px/1 Arial, Helvetica, sans-serif; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em;">Descripción</span>
                        <div style="margin-top:6px; font:400 15px/1.7 Arial, Helvetica, sans-serif; color:#e5e7eb;">
                          ${mensajeSafe}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${fotosCids.length > 0 ? `
              <!-- Fotos adjuntas -->
              <tr>
                <td class="px" style="padding:20px 24px; background:#0b0b0b;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate; border-spacing:0; background:#111827; border:1px solid #1f2937; border-radius:10px;">
                    <tr>
                      <td style="padding:16px 18px; border-bottom:1px solid #1f2937;">
                        <span style="display:inline-block; font:600 12px/1 Arial, Helvetica, sans-serif; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em;">Fotos adjuntas (${fotosCids.length})</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 18px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                          ${fotosCids.map((foto, idx) => `
                          <tr>
                            <td style="padding-bottom:${idx < fotosCids.length - 1 ? '16px' : '0'};">
                              <img src="cid:${foto.cid}" alt="${escapeHtml(foto.filename)}" style="display:block; max-width:100%; height:auto; border-radius:8px; border:1px solid #1f2937;" />
                              <p style="margin:8px 0 0; font:400 12px/1.4 Arial, Helvetica, sans-serif; color:#9ca3af;">
                                ${escapeHtml(foto.filename)}
                              </p>
                            </td>
                          </tr>
                          `).join('')}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ` : ''}

              <!-- CTA / Footer -->
              <tr>
                <td class="px ptb" style="padding:10px 24px 28px 24px; background:#0b0b0b;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td align="left" style="padding-top:8px;">
                        <a href="mailto:${mail}?subject=${replySubject}" 
                           style="display:inline-block; background:#f97316; color:#0b0b0b; font:700 14px/1 Arial, Helvetica, sans-serif; padding:12px 18px; border-radius:8px; text-decoration:none;">
                          Responder al contacto
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:18px; font:400 12px/1.6 Arial, Helvetica, sans-serif; color:#9ca3af;">
                        © Intercanjes. Este mensaje fue enviado automáticamente desde el formulario de contacto.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>`;

  // Versión texto plano
  const fotosText = fotosCids.length > 0 
    ? `\nFotos adjuntas (${fotosCids.length}):\n${fotosCids.map((f, i) => `  ${i + 1}. ${f.filename}`).join('\n')}\n` 
    : '';
  
  const textVersion = `
Nuevo mensaje de contacto - ${tipo.toUpperCase()}

Has recibido una nueva consulta desde el formulario de Intercanjes.

Nombre: ${nombre}
${empresa ? `Empresa: ${empresa}\n` : ''}Teléfono: ${telefono || 'No proporcionado'}
Email: ${mail}
${tipo === 'canjea' ? `Ubicación: ${ubicacion || 'No especificada'}\n` : ''}
Descripción:
${mensaje}
${fotosText}
---
© Intercanjes. Este mensaje fue enviado automáticamente desde el formulario de contacto.
  `.trim();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'intercanjes@gmail.com',
    to: 'alexis.correa026@gmail.com',
    subject: subject,
    html: htmlTemplate,
    text: textVersion,
    attachments: attachments.length > 0 ? attachments : undefined
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = {
  sendContactEmail,
  transporter
};

