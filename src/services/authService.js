const { authClient, managementClient } = require('../config/auth0');
const { User, Role } = require('../models');
const roleService = require('./roleService');
const axios = require('axios');

class AuthService {
  
  /**
   * Registra un nuevo usuario en Auth0 y en la base de datos local
   */
  async register(userData) {
    try {
      const { email, password, name, nickname, role = 'viewer' } = userData;

      // Verificar que el rol existe
      const roleRecord = await Role.findOne({ where: { name: role, isActive: true } });
      if (!roleRecord) {
        throw new Error(`El rol '${role}' no existe`);
      }

      // 1. Crear usuario en Auth0
      const auth0User = await managementClient.users.create({
        connection: 'Username-Password-Authentication',
        email,
        password,
        name,
        nickname: nickname || name,
        email_verified: false,
        app_metadata: {
          roles: [role]
        }
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
        isActive: true,
        defaultRoleId: roleRecord.id
      });

      // 3. Asignar rol al usuario
      await roleService.assignRoleToUser(localUser.id, roleRecord.id);

      // 4. Actualizar metadata en Auth0 con roles
      await managementClient.users.update(
        { id: auth0User.user_id },
        {
          app_metadata: {
            roles: [role],
            permissions: roleRecord.permissions
          }
        }
      );

      return {
        success: true,
        user: {
          id: localUser.id,
          auth0Id: localUser.auth0Id,
          email: localUser.email,
          name: localUser.name,
          nickname: localUser.nickname,
          picture: localUser.picture,
          emailVerified: localUser.emailVerified,
          role: role,
          permissions: roleRecord.permissions
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
      
      throw new Error(error.message || 'Error interno del servidor durante el registro');
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
      let localUser = await User.findOne({ 
        where: { auth0Id: userInfo.sub },
        include: [
          {
            model: Role,
            as: 'roles',
            through: { where: { isActive: true } },
            attributes: ['id', 'name', 'description', 'permissions']
          },
          {
            model: Role,
            as: 'defaultRole',
            attributes: ['id', 'name', 'description', 'permissions']
          }
        ]
      });
      
      if (!localUser) {
        // Si el usuario no existe localmente, crearlo con rol viewer por defecto
        const defaultRole = await Role.findOne({ where: { name: 'viewer', isActive: true } });
        
        localUser = await User.create({
          auth0Id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          nickname: userInfo.nickname,
          picture: userInfo.picture,
          emailVerified: userInfo.email_verified,
          locale: userInfo.locale || 'es',
          isActive: true,
          defaultRoleId: defaultRole ? defaultRole.id : null
        });

        // Asignar rol por defecto
        if (defaultRole) {
          await roleService.assignRoleToUser(localUser.id, defaultRole.id);
        }

        // Recargar usuario con roles
        localUser = await User.findOne({ 
          where: { auth0Id: userInfo.sub },
          include: [
            {
              model: Role,
              as: 'roles',
              through: { where: { isActive: true } },
              attributes: ['id', 'name', 'description', 'permissions']
            },
            {
              model: Role,
              as: 'defaultRole',
              attributes: ['id', 'name', 'description', 'permissions']
            }
          ]
        });
      } else {
        // Actualizar última fecha de login
        await localUser.update({
          lastLogin: new Date(),
          picture: userInfo.picture, // Actualizar foto de perfil si cambió
          emailVerified: userInfo.email_verified
        });
      }

      // Obtener todos los permisos del usuario
      const allPermissions = new Set();
      
      // Permisos de roles asignados
      localUser.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(permission => allPermissions.add(permission));
        }
      });

      // Permisos del rol por defecto
      if (localUser.defaultRole && localUser.defaultRole.permissions) {
        localUser.defaultRole.permissions.forEach(permission => allPermissions.add(permission));
      }

      const roleNames = localUser.roles.map(role => role.name);
      if (localUser.defaultRole) {
        roleNames.push(localUser.defaultRole.name);
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
          locale: localUser.locale,
          isActive: localUser.isActive,
          lastLogin: localUser.lastLogin,
          roles: roleNames.filter((role, index, self) => self.indexOf(role) === index), // Eliminar duplicados
          permissions: Array.from(allPermissions).sort()
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
        include: [
          {
            model: Role,
            as: 'roles',
            through: { where: { isActive: true } },
            attributes: ['id', 'name', 'description', 'permissions']
          },
          {
            model: Role,
            as: 'defaultRole',
            attributes: ['id', 'name', 'description', 'permissions']
          }
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Obtener todos los permisos del usuario
      const allPermissions = new Set();
      
      // Permisos de roles asignados
      user.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(permission => allPermissions.add(permission));
        }
      });

      // Permisos del rol por defecto
      if (user.defaultRole && user.defaultRole.permissions) {
        user.defaultRole.permissions.forEach(permission => allPermissions.add(permission));
      }

      const roleNames = user.roles.map(role => role.name);
      if (user.defaultRole) {
        roleNames.push(user.defaultRole.name);
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
          isActive: user.isActive,
          roles: roleNames.filter((role, index, self) => self.indexOf(role) === index), // Eliminar duplicados
          permissions: Array.from(allPermissions).sort()
        }
      };

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw new Error('Error al obtener el perfil del usuario');
    }
  }

  /**
   * Obtiene o crea un usuario basado en la información de Auth0
   */
  async getOrCreateUserFromAuth0(auth0Id) {
    try {
      // 1. Intentar encontrar el usuario en la BD local
      let localUser = await User.findOne({
        where: { auth0Id },
        include: [{
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }]
      });

      // 2. Si el usuario ya existe, devolverlo
      if (localUser) {
        return localUser;
      }

      console.log(`🔄 Usuario no encontrado en BD local, auto-registrando: ${auth0Id}`);

      // 3. Si no existe, obtener información de Auth0
      let auth0User;
      try {
        auth0User = await managementClient.users.get({ id: auth0Id });
      } catch (auth0Error) {
        console.error('Error al obtener usuario de Auth0:', auth0Error.message);
        throw new Error(`Usuario no existe en Auth0: ${auth0Id}`);
      }

      // 4. Crear usuario en BD local con rol de viewer por defecto
      const defaultRole = await Role.findOne({ 
        where: { name: 'viewer', isActive: true } 
      });

      if (!defaultRole) {
        throw new Error('Rol de viewer no encontrado. Ejecute la inicialización de roles');
      }

      localUser = await User.create({
        auth0Id: auth0User.user_id,
        email: auth0User.email,
        name: auth0User.name || auth0User.nickname || 'Usuario',
        nickname: auth0User.nickname || auth0User.name || 'Usuario',
        picture: auth0User.picture,
        emailVerified: auth0User.email_verified || false,
        locale: 'es',
        isActive: true,
        defaultRoleId: defaultRole.id
      });

      // 5. Asignar rol de viewer
      await roleService.assignRoleToUser(localUser.id, defaultRole.id);

      // 6. Recargar usuario con roles
      localUser = await User.findOne({
        where: { auth0Id },
        include: [{
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }]
      });

      console.log(`✅ Usuario auto-registrado: ${auth0User.email} (${auth0Id})`);
      
      return localUser;

    } catch (error) {
      console.error('Error al obtener/crear usuario de Auth0:', error);
      throw new Error(`Error al obtener información del usuario: ${error.message}`);
    }
  }

  /**
   * Obtiene el perfil del usuario por Auth0 ID para uso interno
   */
  async getUserProfile(auth0Id) {
    try {
      // Usar la nueva función para obtener o crear el usuario automáticamente
      const user = await this.getOrCreateUserFromAuth0(auth0Id);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Obtener todos los permisos del usuario
      const allPermissions = new Set();
      
      // Permisos de roles asignados
      user.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(permission => allPermissions.add(permission));
        }
      });

      // Permisos del rol por defecto
      if (user.defaultRole && user.defaultRole.permissions) {
        user.defaultRole.permissions.forEach(permission => allPermissions.add(permission));
      }

      const roleNames = user.roles.map(role => role.name);
      if (user.defaultRole) {
        roleNames.push(user.defaultRole.name);
      }

      return {
        id: user.id,
        auth0Id: user.auth0Id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        picture: user.picture,
        emailVerified: user.emailVerified,
        locale: user.locale,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        roles: roleNames.filter((role, index, self) => self.indexOf(role) === index), // Eliminar duplicados
        permissions: Array.from(allPermissions).sort()
      };

    } catch (error) {
      console.error('Error al obtener perfil del usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(auth0Id, updateData) {
    try {
      const { name, nickname, locale } = updateData;

      // 1. Actualizar en Auth0
      await managementClient.users.update(
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
      await managementClient.jobs.verifyEmail({ user_id: auth0Id });

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
