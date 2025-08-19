const nodemailer = require('nodemailer');
const { contactEmailTemplate, confirmationEmailTemplate } = require('../templates/emailTemplates');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.initialize();
  }

  /**
   * Inicializa el transporter de Nodemailer
   */
  initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      this.initialized = true;
      console.log('📧 Servicio de email inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar el servicio de email:', error.message);
      this.initialized = false;
    }
  }

  /**
   * Verifica la configuración del transporter
   */
  async verifyConnection() {
    if (!this.initialized || !this.transporter) {
      throw new Error('Servicio de email no inicializado');
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Error de verificación del email:', error.message);
      throw new Error('Error de configuración del servicio de email');
    }
  }

  /**
   * Envía email de contacto al administrador
   */
  async sendContactEmail(contactData) {
    if (!this.initialized) {
      throw new Error('Servicio de email no disponible');
    }

    const { name, email, subject, message, phone } = contactData;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `[GoGestia Contact] ${subject}`,
      html: contactEmailTemplate({
        name,
        email,
        subject,
        message,
        phone,
        timestamp: new Date().toLocaleString('es-ES', {
          timeZone: 'Europe/Madrid',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }),
      text: this.generatePlainTextEmail(contactData)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email de contacto enviado:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Error al enviar email de contacto:', error.message);
      throw new Error('Error al enviar el email de contacto');
    }
  }

  /**
   * Envía email de confirmación al usuario
   */
  async sendConfirmationEmail(contactData) {
    if (!this.initialized) {
      throw new Error('Servicio de email no disponible');
    }

    const { name, email } = contactData;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmación de contacto - GoGestia',
      html: confirmationEmailTemplate({
        name,
        timestamp: new Date().toLocaleString('es-ES', {
          timeZone: 'Europe/Madrid',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }),
      text: `Hola ${name},\n\nGracias por contactar con GoGestia. Hemos recibido tu mensaje y te responderemos lo antes posible.\n\nSaludos,\nEquipo GoGestia`
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email de confirmación enviado:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Error al enviar email de confirmación:', error.message);
      // No lanzamos error aquí para que no falle todo el proceso si falla la confirmación
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envía ambos emails con reintentos
   */
  async sendEmails(contactData, maxRetries = 3) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Verificar conexión antes de enviar
        await this.verifyConnection();

        // Enviar email de contacto (principal)
        const contactResult = await this.sendContactEmail(contactData);

        // Enviar email de confirmación (opcional)
        const confirmationResult = await this.sendConfirmationEmail(contactData);

        return {
          success: true,
          contactEmail: contactResult,
          confirmationEmail: confirmationResult,
          attempt
        };

      } catch (error) {
        lastError = error;
        console.warn(`⚠️  Intento ${attempt}/${maxRetries} fallido:`, error.message);

        if (attempt < maxRetries) {
          // Esperar antes del siguiente intento (backoff exponencial)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Error al enviar emails después de ${maxRetries} intentos: ${lastError.message}`);
  }

  /**
   * Genera versión de texto plano del email
   */
  generatePlainTextEmail(contactData) {
    const { name, email, subject, message, phone } = contactData;
    
    return `
NUEVO MENSAJE DE CONTACTO - GOGESTIA

Nombre: ${name}
Email: ${email}
${phone ? `Teléfono: ${phone}` : ''}
Asunto: ${subject}

Mensaje:
${message}

---
Enviado desde GoGestia Contact Form
Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
    `.trim();
  }
}

// Crear instancia singleton
const emailService = new EmailService();

module.exports = emailService;
