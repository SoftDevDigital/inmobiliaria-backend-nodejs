const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../config/email');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { tipo, nombre, mail, telefono, mensaje, empresa, ubicacion, foto } = req.body;

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

    // Enviar email
    await sendContactEmail({
      tipo,
      nombre,
      mail,
      telefono,
      mensaje,
      empresa,
      ubicacion,
      foto
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully'
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

