const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {

  /**
   * Registra un nuevo usuario
   */
  async register(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { email, password, name, nickname, role = 'viewer' } = req.body;

      // Validar que el rol solicitado sea válido para registro
      const allowedRegistrationRoles = ['admin', 'editor', 'viewer'];
      if (!allowedRegistrationRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: `Rol no válido para registro. Los roles permitidos son: ${allowedRegistrationRoles.join(', ')}`,
          details: [{ field: 'role', message: 'Rol no válido' }]
        });
      }

      const result = await authService.register({
        email,
        password,
        name,
        nickname,
        role
      });

      res.status(201).json(result);

    } catch (error) {
      console.error('Error en registro:', error);
      
      const statusCode = error.message.includes('ya está registrado') ? 409 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Error interno del servidor',
        code: 'REGISTRATION_ERROR'
      });
    }
  }

  /**
   * Autentica un usuario
   */
  async login(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      const result = await authService.login({
        email,
        password
      });

      // 🔍 MOSTRAR TOKEN JWT CRUDO EN CONSOLA (SOLO PARA DEBUGGING)
      if (result.success && result.data && result.data.access_token) {
        console.log('🔐 === LOGIN EXITOSO ===');
        console.log(`👤 Usuario: ${email}`);
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
        console.log('🎫 JWT TOKEN CRUDO:');
        console.log('─'.repeat(80));
        console.log(result.data.access_token);
        console.log('─'.repeat(80));
        console.log(`📝 Token type: ${result.data.token_type || 'Bearer'}`);
        console.log(`⏱️ Expires in: ${result.data.expires_in || 'No especificado'} segundos`);
        if (result.data.refresh_token) {
          console.log('🔄 Refresh token también disponible');
        }
        console.log('🔐 === FIN TOKEN INFO ===\n');
      }

      res.status(200).json(result);

    } catch (error) {
      console.error('Error en login:', error);
      
      let statusCode = 500;
      if (error.message.includes('Credenciales inválidas')) {
        statusCode = 401;
      } else if (error.message.includes('Demasiados intentos')) {
        statusCode = 429;
      }
      
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Error interno del servidor',
        code: 'LOGIN_ERROR'
      });
    }
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'Token de refresco requerido',
          code: 'MISSING_REFRESH_TOKEN'
        });
      }

      const result = await authService.refreshToken(refresh_token);

      // 🔍 MOSTRAR NUEVO TOKEN JWT CRUDO EN CONSOLA (SOLO PARA DEBUGGING)
      if (result.success && result.data && result.data.access_token) {
        console.log('🔄 === TOKEN REFRESCADO ===');
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
        console.log('🎫 NUEVO JWT TOKEN CRUDO:');
        console.log('─'.repeat(80));
        console.log(result.data.access_token);
        console.log('─'.repeat(80));
        console.log(`📝 Token type: ${result.data.token_type || 'Bearer'}`);
        console.log(`⏱️ Expires in: ${result.data.expires_in || 'No especificado'} segundos`);
        console.log('🔄 === FIN REFRESH TOKEN INFO ===\n');
      }

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al refrescar token:', error);
      
      res.status(401).json({
        success: false,
        error: error.message || 'Error al refrescar token',
        code: 'REFRESH_TOKEN_ERROR'
      });
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(req, res) {
    try {
      const auth0Id = req.user.sub; // Viene del middleware JWT

      const result = await authService.getProfile(auth0Id);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Error al obtener perfil',
        code: 'PROFILE_ERROR'
      });
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const auth0Id = req.user.sub;
      const { name, nickname, locale } = req.body;

      const result = await authService.updateProfile(auth0Id, {
        name,
        nickname,
        locale
      });

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Error al actualizar perfil',
        code: 'UPDATE_PROFILE_ERROR'
      });
    }
  }

  /**
   * Envía email de verificación
   */
  async sendVerificationEmail(req, res) {
    try {
      const auth0Id = req.user.sub;

      const result = await authService.sendVerificationEmail(auth0Id);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al enviar email de verificación:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error al enviar email de verificación',
        code: 'VERIFICATION_EMAIL_ERROR'
      });
    }
  }

  /**
   * Solicita cambio de contraseña
   */
  async requestPasswordReset(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { email } = req.body;

      const result = await authService.requestPasswordReset(email);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error al solicitar cambio de contraseña:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error al solicitar cambio de contraseña',
        code: 'PASSWORD_RESET_ERROR'
      });
    }
  }

  /**
   * Logout (elimina sesión del lado del cliente)
   */
  async logout(req, res) {
    try {
      // Auth0 maneja el logout del lado del cliente
      // Aquí podríamos invalidar tokens si fuera necesario
      
      res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        code: 'LOGOUT_ERROR'
      });
    }
  }
}

module.exports = new AuthController();
