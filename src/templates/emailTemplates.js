/**
 * Template para email de contacto (enviado al administrador)
 */
const contactEmailTemplate = ({ name, email, subject, message, phone, timestamp }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo mensaje de contacto - GoGestia</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .field {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #667eea;
        }
        .field-label {
            font-weight: 600;
            color: #495057;
            margin-bottom: 5px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .field-value {
            color: #212529;
            font-size: 16px;
            word-break: break-word;
        }
        .message-field {
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 20px;
            margin-top: 10px;
            white-space: pre-wrap;
            font-family: inherit;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
        .priority-high {
            border-left-color: #dc3545;
        }
        .timestamp {
            color: #6c757d;
            font-size: 14px;
            margin-top: 20px;
            text-align: center;
            font-style: italic;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .content, .header {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Nuevo Mensaje de Contacto</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">GoGestia Contact Form</p>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="field-label">👤 Nombre</div>
                <div class="field-value">${name}</div>
            </div>
            
            <div class="field">
                <div class="field-label">📧 Email</div>
                <div class="field-value">
                    <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">
                        ${email}
                    </a>
                </div>
            </div>
            
            ${phone ? `
            <div class="field">
                <div class="field-label">📱 Teléfono</div>
                <div class="field-value">
                    <a href="tel:${phone}" style="color: #667eea; text-decoration: none;">
                        ${phone}
                    </a>
                </div>
            </div>
            ` : ''}
            
            <div class="field priority-high">
                <div class="field-label">📋 Asunto</div>
                <div class="field-value">${subject}</div>
            </div>
            
            <div class="field">
                <div class="field-label">💬 Mensaje</div>
                <div class="message-field">${message}</div>
            </div>
            
            <div class="timestamp">
                📅 Recibido el ${timestamp}
            </div>
        </div>
        
        <div class="footer">
            <p>Este mensaje fue enviado desde el formulario de contacto de GoGestia.</p>
            <p>Para responder, utiliza el email: <strong>${email}</strong></p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Template para email de confirmación (enviado al usuario)
 */
const confirmationEmailTemplate = ({ name, timestamp }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de contacto - GoGestia</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header .icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .message {
            font-size: 18px;
            color: #495057;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .highlight {
            font-weight: 600;
            color: #28a745;
        }
        .info-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            text-align: left;
        }
        .info-box h3 {
            color: #495057;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .info-box ul {
            margin: 0;
            padding-left: 20px;
            color: #6c757d;
        }
        .info-box li {
            margin-bottom: 8px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #6c757d;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
        }
        .brand {
            font-weight: 600;
            color: #495057;
            font-size: 18px;
            margin-bottom: 10px;
        }
        .timestamp {
            color: #6c757d;
            font-size: 14px;
            margin-top: 20px;
            font-style: italic;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .content, .header, .footer {
                padding: 25px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .message {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">✅</div>
            <h1>¡Mensaje Recibido!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">
                Gracias por contactar con GoGestia
            </p>
        </div>
        
        <div class="content">
            <p class="message">
                Hola <span class="highlight">${name}</span>,<br><br>
                Hemos recibido tu mensaje y queremos agradecerte por contactar con nosotros. 
                <strong>Te responderemos lo antes posible</strong>, normalmente en un plazo de 24-48 horas.
            </p>
            
            <div class="info-box">
                <h3>🔔 ¿Qué pasa ahora?</h3>
                <ul>
                    <li><strong>Revisión:</strong> Nuestro equipo revisará tu consulta</li>
                    <li><strong>Respuesta:</strong> Te contactaremos en máximo 48 horas</li>
                    <li><strong>Seguimiento:</strong> Si es necesario, programaremos una llamada</li>
                </ul>
            </div>
            
            <p style="color: #6c757d; font-size: 16px; margin-top: 30px;">
                Si tienes alguna pregunta urgente, no dudes en llamarnos o escribirnos directamente.
            </p>
            
            <div class="timestamp">
                📅 Mensaje enviado el ${timestamp}
            </div>
        </div>
        
        <div class="footer">
            <div class="brand">GoGestia</div>
            <p>Tu partner en gestión empresarial</p>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                Este es un mensaje automático, por favor no respondas a este email.
            </p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
  contactEmailTemplate,
  confirmationEmailTemplate
};
