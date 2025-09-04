const { authClient, managementClient } = require('../config/auth0');
const { User } = require('../models');
const axios = require('axios');

class AuthService {
  
  /**
   * Registra un nuevo usuario en Auth0 y en la base de datos local
   */
  async register(userData) {
    try {
      const { email, password, name, nickname } = userData;

      // 1. Crear usuario en Auth0
      const auth0User = await managementClient.createUser({
        connection: 'Username-Password-Authentication',
        email,
        password,
        name,
        nickname: nickname || name,
        email_verified: false
      });

      // 2. Crear usuario en la base de datos local
      const localUser = await User.create({
        auth0Id: auth0User.user_id,
        email: auth0User.email,
        name: auth0User.name,
        nickname: auth0User.nickname,
        picture: auth0User.picture,
        emailVerified: auth0User.email_verified,
        locale: 'es',
        isActive: true
      });

      return {
        success: true,
        user: {
          id: localUser.id,
          auth0Id: localUser.auth0Id,
          email: localUser.email,
          name: localUser.name,
          nickname: localUser.nickname,
          picture: localUser.picture,
          emailVerified: localUser.emailVerified
        },
        message: 'Usuario registrado exitosamente'
      };

    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar errores específicos de Auth0
      if (error.statusCode === 409) {
        throw new Error('El email ya está registrado');
      }
      
      if (error.statusCode === 400) {
        throw new Error('Datos de registro inválidos');
      }
      
      throw new Error('Error interno del servidor durante el registro');
    }
  }

  /**
   * Autentica un usuario usando Auth0
   */
  async login(credentials) {
    try {
      const { email, password } = credentials;

      // 1. Autenticar con Auth0
      const authResult = await authClient.passwordGrant({
        username: email,
        password: password,
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email'
      });

      // 2. Obtener información del usuario de Auth0
      const userInfo = await authClient.getProfile(authResult.access_token);

      // 3. Buscar o crear usuario en la base de datos local
      let localUser = await User.findOne({ where: { auth0Id: userInfo.sub } });
      
      if (!localUser) {
        // Si el usuario no existe localmente, crearlo
        localUser = await User.create({
          auth0Id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          nickname: userInfo.nickname,
          picture: userInfo.picture,
          emailVerified: userInfo.email_verified,
          locale: userInfo.locale || 'es',
          isActive: true
        });
      } else {
        // Actualizar última fecha de login
        await localUser.update({
          lastLogin: new Date(),
          picture: userInfo.picture, // Actualizar foto de perfil si cambió
          emailVerified: userInfo.email_verified
        });
      }

      return {
        success: true,
        tokens: {
          accessToken: authResult.access_token,
          refreshToken: authResult.refresh_token,
          idToken: authResult.id_token,
          tokenType: authResult.token_type,
          expiresIn: authResult.expires_in
        },
        user: {
          id: localUser.id,
          auth0Id: localUser.auth0Id,
          email: localUser.email,
          name: localUser.name,
          nickname: localUser.nickname,
          picture: localUser.picture,
          emailVerified: localUser.emailVerified,
          locale: localUser.locale
        },
        message: 'Login exitoso'
      };

    } catch (error) {
      console.error('Error en login:', error);
      
      // Manejar errores específicos de Auth0
      if (error.statusCode === 401 || error.statusCode === 403) {
        throw new Error('Credenciales inválidas');
      }
      
      if (error.statusCode === 429) {
        throw new Error('Demasiados intentos de login. Intenta más tarde');
      }
      
      throw new Error('Error interno del servidor durante el login');
    }
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(refreshToken) {
    try {
      const result = await authClient.refreshToken({
        refresh_token: refreshToken
      });

      return {
        success: true,
        tokens: {
          accessToken: result.access_token,
          idToken: result.id_token,
          tokenType: result.token_type,
          expiresIn: result.expires_in
        }
      };

    } catch (error) {
      console.error('Error al refrescar token:', error);
      throw new Error('Token de refresco inválido');
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(auth0Id) {
    try {
      const user = await User.findOne({ 
        where: { auth0Id },
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        user: {
          id: user.id,
          auth0Id: user.auth0Id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          picture: user.picture,
          emailVerified: user.emailVerified,
          locale: user.locale,
          lastLogin: user.lastLogin,
          isActive: user.isActive
        }
      };

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw new Error('Error al obtener el perfil del usuario');
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(auth0Id, updateData) {
    try {
      const { name, nickname, locale } = updateData;

      // 1. Actualizar en Auth0
      await managementClient.updateUser(
        { id: auth0Id },
        {
          name,
          nickname
        }
      );

      // 2. Actualizar en la base de datos local
      const [updatedRows] = await User.update(
        { name, nickname, locale },
        { where: { auth0Id } }
      );

      if (updatedRows === 0) {
        throw new Error('Usuario no encontrado');
      }

      const updatedUser = await User.findOne({ where: { auth0Id } });

      return {
        success: true,
        user: {
          id: updatedUser.id,
          auth0Id: updatedUser.auth0Id,
          email: updatedUser.email,
          name: updatedUser.name,
          nickname: updatedUser.nickname,
          picture: updatedUser.picture,
          emailVerified: updatedUser.emailVerified,
          locale: updatedUser.locale
        },
        message: 'Perfil actualizado exitosamente'
      };

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw new Error('Error al actualizar el perfil');
    }
  }

  /**
   * Envía email de verificación
   */
  async sendVerificationEmail(auth0Id) {
    try {
      await managementClient.sendEmailVerification({ user_id: auth0Id });

      return {
        success: true,
        message: 'Email de verificación enviado'
      };

    } catch (error) {
      console.error('Error al enviar email de verificación:', error);
      throw new Error('Error al enviar email de verificación');
    }
  }

  /**
   * Solicita cambio de contraseña
   */
  async requestPasswordReset(email) {
    try {
      await authClient.requestChangePasswordEmail({
        email,
        connection: 'Username-Password-Authentication'
      });

      return {
        success: true,
        message: 'Email de recuperación enviado'
      };

    } catch (error) {
      console.error('Error al solicitar cambio de contraseña:', error);
      throw new Error('Error al solicitar cambio de contraseña');
    }
  }
}

module.exports = new AuthService();
