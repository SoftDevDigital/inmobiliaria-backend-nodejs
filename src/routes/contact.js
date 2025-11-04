const express = require('express');
const router = express.Router();
const multer = require('multer');
const { sendContactEmail } = require('../config/email');

// Configurar multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por archivo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WEBP)'), false);
    }
  }
});

// Middleware para manejar tanto JSON como multipart/form-data
const handleUpload = (req, res, next) => {
  // Si es multipart/form-data, usar multer
  if (req.is('multipart/form-data')) {
    return upload.array('fotos', 10)(req, res, (err) => {
      // Manejar errores de multer
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: 'File too large',
              message: 'El archivo es demasiado grande. Máximo 10MB por archivo.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              error: 'Too many files',
              message: 'Se puede enviar un máximo de 10 fotos.'
            });
          }
          return res.status(400).json({
            error: 'Upload error',
            message: err.message
          });
        }
        // Error de fileFilter u otro error
        return res.status(400).json({
          error: 'File upload error',
          message: err.message
        });
      }
      next();
    });
  }
  // Si no, continuar sin multer (para JSON)
  next();
};

// POST /api/contact
router.post('/', handleUpload, async (req, res) => {
  try {
    const { tipo, nombre, mail, telefono, mensaje, empresa, ubicacion } = req.body;
    const fotos = req.files || []; // Array de archivos subidos (si hay)

    // Validación básica
    if (!nombre || !mail || !mensaje || !tipo) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'tipo, nombre, mail, and mensaje are required'
      });
    }

    // Validar que el tipo sea válido
    if (tipo !== 'canjea' && tipo !== 'forma') {
      return res.status(400).json({
        error: 'Invalid tipo',
        message: 'tipo must be either "canjea" or "forma"'
      });
    }

    // Enviar email con las fotos adjuntas (si hay)
    await sendContactEmail({
      tipo,
      nombre,
      mail,
      telefono,
      mensaje,
      empresa,
      ubicacion,
      fotos: fotos // Array de archivos (vacío si no hay)
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      fotosEnviadas: fotos.length
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message
    });
  }
});

module.exports = router;

