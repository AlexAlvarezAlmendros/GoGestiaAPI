/**
 * Template para email de contacto (interno - para GoGestia)
 * Se envía cuando un cliente solicita diagnóstico
 */
const contactEmailTemplate = ({ name, email, phone, company, position, message, timestamp }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Solicitud de Diagnóstico - GoGestia</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(9, 58, 41, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #093A29 0%, #0d4a35 100%); 
            color: white; 
            padding: 30px 40px; 
            text-align: center; 
        }
        .header h1 { 
            font-size: 24px; 
            font-weight: 700; 
            margin-bottom: 8px;
        }
        .header p { 
            font-size: 16px; 
            opacity: 0.9;
        }
        .content { 
            padding: 40px; 
        }
        .client-card { 
            background: #f8f9fa; 
            border-radius: 8px; 
            padding: 24px; 
            margin-bottom: 24px;
            border-left: 4px solid #C7F464;
        }
        .client-card h3 { 
            color: #093A29; 
            font-size: 18px; 
            font-weight: 600; 
            margin-bottom: 16px;
        }
        .info-row { 
            display: flex; 
            margin-bottom: 12px; 
            align-items: flex-start;
        }
        .info-label { 
            font-weight: 600; 
            color: #093A29; 
            min-width: 120px; 
            margin-right: 12px;
        }
        .info-value { 
            color: #555; 
            flex: 1;
        }
        .message-section { 
            background: white; 
            border: 2px solid #EAEAEA; 
            border-radius: 8px; 
            padding: 20px; 
            margin-top: 20px;
        }
        .message-section h4 { 
            color: #093A29; 
            font-size: 16px; 
            font-weight: 600; 
            margin-bottom: 12px;
        }
        .message-text { 
            color: #444; 
            font-style: italic; 
            line-height: 1.6;
            background: #f8f9fa;
            padding: 16px;
            border-radius: 6px;
            border-left: 3px solid #C7F464;
        }
        .cta-section { 
            text-align: center; 
            margin: 30px 0; 
            padding: 24px; 
            background: linear-gradient(135deg, #C7F464 0%, #b8e055 100%); 
            border-radius: 8px;
        }
        .cta-button { 
            display: inline-block; 
            background: #093A29; 
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 600; 
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .cta-text { 
            color: #093A29; 
            font-weight: 600; 
            margin-bottom: 16px;
        }
        .footer { 
            background: #093A29; 
            color: white; 
            padding: 24px 40px; 
            text-align: center; 
            font-size: 14px;
        }
        .footer a { 
            color: #C7F464; 
            text-decoration: none;
        }
        .timestamp { 
            color: #666; 
            font-size: 12px; 
            text-align: right; 
            margin-top: 20px; 
            font-style: italic;
        }
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .header, .content { padding: 20px; }
            .info-row { flex-direction: column; }
            .info-label { min-width: auto; margin-bottom: 4px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Nueva Solicitud de Diagnóstico</h1>
            <p>Un cliente potencial requiere análisis de procesos</p>
        </div>
        
        <div class="content">
            <div class="client-card">
                <h3>📋 Información del Cliente</h3>
                <div class="info-row">
                    <span class="info-label">Nombre:</span>
                    <span class="info-value"><strong>${name}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value"><a href="mailto:${email}" style="color: #093A29;">${email}</a></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value"><a href="tel:${phone}" style="color: #093A29;">${phone}</a></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Empresa:</span>
                    <span class="info-value"><strong>${company}</strong></span>
                </div>
                ${position ? `
                <div class="info-row">
                    <span class="info-label">Cargo:</span>
                    <span class="info-value">${position}</span>
                </div>
                ` : ''}
            </div>

            <div class="message-section">
                <h4>💬 Situación Actual de la Empresa</h4>
                <div class="message-text">
                    "${message}"
                </div>
            </div>

            <div class="cta-section">
                <div class="cta-text">⚡ Próximos pasos recomendados</div>
                <a href="mailto:${email}" class="cta-button">Contactar Cliente</a>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h4 style="color: #093A29; margin-bottom: 12px;">📝 Recordatorio del proceso:</h4>
                <ul style="color: #555; margin-left: 20px;">
                    <li>Contactar en máximo 24 horas</li>
                    <li>Agendar reunión inicial (30-60 min)</li>
                    <li>Realizar análisis básico (máx. 3h)</li>
                    <li>Entregar informe en 7 días</li>
                </ul>
            </div>

            <div class="timestamp">
                📅 Recibido el: ${timestamp}
            </div>
        </div>
        
        <div class="footer">
            <p><strong>GoGestia</strong> - Automatización y Optimización de Procesos</p>
            <p><a href="mailto:contacto@gogestia.com">contacto@gogestia.com</a> | <a href="https://gogestia.com">gogestia.com</a></p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Template para email de confirmación (enviado al cliente)
 * Se envía como confirmación de que recibimos su solicitud
 */
const confirmationEmailTemplate = ({ name, timestamp }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Solicitud - GoGestia</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(9, 58, 41, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #093A29 0%, #0d4a35 100%); 
            color: white; 
            padding: 40px; 
            text-align: center; 
        }
        .header .icon { 
            font-size: 48px; 
            margin-bottom: 16px; 
            color: #C7F464;
        }
        .header h1 { 
            font-size: 28px; 
            font-weight: 700; 
            margin-bottom: 8px;
        }
        .header p { 
            font-size: 16px; 
            opacity: 0.9;
        }
        .content { 
            padding: 40px; 
            text-align: center;
        }
        .welcome-message { 
            font-size: 18px; 
            color: #555; 
            margin-bottom: 30px; 
            line-height: 1.7;
        }
        .highlight { 
            font-weight: 600; 
            color: #093A29;
        }
        .process-card { 
            background: #f8f9fa; 
            border-radius: 8px; 
            padding: 30px; 
            margin: 30px 0; 
            text-align: left;
            border-left: 4px solid #C7F464;
        }
        .process-card h3 { 
            color: #093A29; 
            margin-bottom: 20px; 
            font-size: 18px;
            font-weight: 600;
        }
        .process-card ul { 
            margin: 0; 
            padding-left: 20px; 
            color: #555;
        }
        .process-card li { 
            margin-bottom: 12px; 
            font-size: 16px;
        }
        .value-prop { 
            background: linear-gradient(135deg, #C7F464 0%, #b8e055 100%); 
            padding: 30px; 
            border-radius: 8px; 
            margin: 30px 0;
            text-align: center;
        }
        .value-prop h3 { 
            color: #093A29; 
            font-size: 20px; 
            font-weight: 700; 
            margin-bottom: 12px;
        }
        .value-prop p { 
            color: #093A29; 
            font-size: 16px; 
            font-weight: 500;
        }
        .contact-info { 
            background: white; 
            border: 2px solid #EAEAEA; 
            border-radius: 8px; 
            padding: 24px; 
            margin: 30px 0; 
            text-align: left;
        }
        .contact-info h4 { 
            color: #093A29; 
            margin-bottom: 16px; 
            font-size: 16px;
        }
        .contact-item { 
            margin-bottom: 12px;
        }
        .contact-item strong { 
            color: #093A29;
        }
        .contact-item a { 
            color: #093A29; 
            text-decoration: none;
        }
        .footer { 
            background: #093A29; 
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .footer .brand { 
            font-weight: 600; 
            font-size: 18px; 
            margin-bottom: 8px;
        }
        .footer p { 
            margin: 5px 0; 
            font-size: 14px;
        }
        .footer .disclaimer { 
            margin-top: 20px; 
            font-size: 12px; 
            opacity: 0.8;
        }
        .timestamp { 
            color: #666; 
            font-size: 14px; 
            margin-top: 30px; 
            font-style: italic;
        }
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .header, .content, .footer { padding: 25px 20px; }
            .header h1 { font-size: 24px; }
            .welcome-message { font-size: 16px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">✅</div>
            <h1>¡Solicitud Recibida!</h1>
            <p>Gracias por confiar en GoGestia</p>
        </div>
        
        <div class="content">
            <p class="welcome-message">
                Hola <span class="highlight">${name}</span>,<br><br>
                Hemos recibido tu solicitud de diagnóstico y queremos agradecerte por considerar a GoGestia 
                como tu partner en optimización de procesos. <strong>Te contactaremos en las próximas 24 horas</strong> 
                para coordinar el análisis de tu empresa.
            </p>
            
            <div class="value-prop">
                <h3>🎯 Nuestro Compromiso</h3>
                <p>
                    "Detectamos ineficiencias en tus procesos y te proponemos soluciones personalizadas 
                    que aumentan tu rentabilidad y productividad, sin compromiso."
                </p>
            </div>
            
            <div class="process-card">
                <h3>🔔 ¿Qué sucede ahora?</h3>
                <ul>
                    <li><strong>Contacto inmediato:</strong> Te llamaremos en máximo 24 horas</li>
                    <li><strong>Reunión inicial:</strong> Análisis gratuito de 30-60 minutos</li>
                    <li><strong>Evaluación básica:</strong> Estudio de procesos (máximo 3 horas)</li>
                    <li><strong>Informe personalizado:</strong> Propuesta detallada en 7 días</li>
                </ul>
            </div>

            <div class="contact-info">
                <h4>📞 ¿Necesitas contactarnos directamente?</h4>
                <div class="contact-item">
                    <strong>Email:</strong> 
                    <a href="mailto:contacto@gogestia.com">contacto@gogestia.com</a>
                </div>
                <div class="contact-item">
                    <strong>Horario de atención:</strong> 
                    Lunes a Viernes: 9:00 - 18:00h
                </div>
            </div>
            
            <div class="timestamp">
                📅 Solicitud recibida el ${timestamp}
            </div>
        </div>
        
        <div class="footer">
            <div class="brand">GoGestia</div>
            <p>Automatización y Optimización de Procesos</p>
            <p>Tu partner en transformación digital</p>
            <div class="disclaimer">
                Este es un mensaje automático de confirmación. Si necesitas asistencia inmediata, 
                contáctanos directamente en contacto@gogestia.com
            </div>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
  contactEmailTemplate,
  confirmationEmailTemplate
};
