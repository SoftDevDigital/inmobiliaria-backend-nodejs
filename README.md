# inmobiliaria-backend-nodejs

Backend para envío de emails desde formulario de contacto.

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Server Configuration
PORT=3000

# Email Configuration
EMAIL_FROM=intercanjes@gmail.com
EMAIL_TO=intercanjes@gmail.com

# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=intercanjes@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion_aqui
```

**Importante:** Para Gmail, necesitas generar una "Contraseña de aplicación" en lugar de usar tu contraseña normal:
1. Ve a tu cuenta de Google
2. Seguridad > Verificación en 2 pasos
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña para "Correo"

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## API

### POST /api/contact

Envía un email de contacto.

**Body:**
```json
{
  "tipo": "canjea",
  "nombre": "Juan Pérez",
  "mail": "juan@example.com",
  "telefono": "+5491112345678",
  "mensaje": "Me interesa saber más sobre...",
  "empresa": "Mi Empresa S.A.",
  "ubicacion": "-31.4201, -64.1888",
  "foto": "terreno.jpg"
}
```

**Campos requeridos:**
- `tipo`: Tipo de formulario (`"canjea"` o `"forma"`)
- `nombre`: Nombre del remitente
- `mail`: Email del remitente
- `mensaje`: Mensaje del contacto

**Campos opcionales (solo para tipo "canjea"):**
- `empresa`: Nombre de la empresa
- `ubicacion`: Coordenadas o dirección
- `foto`: Nombre del archivo de foto
- `telefono`: Teléfono del remitente (opcional en ambos tipos)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**Respuesta de error (400/500):**
```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

### GET /health

Endpoint de salud del servidor.