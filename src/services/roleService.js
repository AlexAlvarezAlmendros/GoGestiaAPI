const { Role, User, UserRole } = require('../models');
const { Op } = require('sequelize');

class RoleService {
  
  /**
   * Obtiene todos los roles disponibles
   */
  async getAllRoles() {
    try {
      const roles = await Role.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'description', 'permissions'],
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        roles
      };
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw new Error('Error al obtener los roles');
    }
  }

  /**
   * Crea un nuevo rol
   */
  async createRole(roleData) {
    try {
      const { name, description, permissions = [] } = roleData;

      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        throw new Error('Ya existe un rol con ese nombre');
      }

      const role = await Role.create({
        name,
        description,
        permissions,
        isActive: true
      });

      return {
        success: true,
        role: {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions
        },
        message: 'Rol creado exitosamente'
      };
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  }

  /**
   * Asigna un rol a un usuario
   */
  async assignRoleToUser(userId, roleId, assignedBy = null) {
    try {
      // Verificar que el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar que el rol existe
      const role = await Role.findByPk(roleId);
      if (!role) {
        throw new Error('Rol no encontrado');
      }

      // Verificar si ya tiene ese rol asignado
      const existingAssignment = await UserRole.findOne({
        where: { userId, roleId, isActive: true }
      });

      if (existingAssignment) {
        throw new Error('El usuario ya tiene ese rol asignado');
      }

      // Asignar el rol
      const userRole = await UserRole.create({
        userId,
        roleId,
        assignedBy,
        isActive: true
      });

      return {
        success: true,
        userRole: {
          id: userRole.id,
          userId: userRole.userId,
          roleId: userRole.roleId,
          assignedAt: userRole.assignedAt
        },
        message: 'Rol asignado exitosamente'
      };
    } catch (error) {
      console.error('Error al asignar rol:', error);
      throw error;
    }
  }

  /**
   * Remueve un rol de un usuario
   */
  async removeRoleFromUser(userId, roleId) {
    try {
      const userRole = await UserRole.findOne({
        where: { userId, roleId, isActive: true }
      });

      if (!userRole) {
        throw new Error('El usuario no tiene ese rol asignado');
      }

      await userRole.update({ isActive: false });

      return {
        success: true,
        message: 'Rol removido exitosamente'
      };
    } catch (error) {
      console.error('Error al remover rol:', error);
      throw error;
    }
  }

  /**
   * Obtiene los roles de un usuario
   */
  async getUserRoles(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: {
              where: { isActive: true },
              attributes: ['assignedAt', 'expiresAt']
            },
            attributes: ['id', 'name', 'description', 'permissions']
          },
          {
            model: Role,
            as: 'defaultRole',
            attributes: ['id', 'name', 'description', 'permissions']
          }
        ]
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        roles: user.roles,
        defaultRole: user.defaultRole
      };
    } catch (error) {
      console.error('Error al obtener roles del usuario:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async hasPermission(userId, permission) {
    try {
      const userRoles = await this.getUserRoles(userId);
      
      if (!userRoles.success) {
        return false;
      }

      // Verificar en roles asignados
      for (const role of userRoles.roles) {
        if (role.permissions && role.permissions.includes(permission)) {
          return true;
        }
      }

      // Verificar en rol por defecto
      if (userRoles.defaultRole && userRoles.defaultRole.permissions) {
        return userRoles.defaultRole.permissions.includes(permission);
      }

      return false;
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }

  /**
   * Verifica si un usuario tiene un rol específico
   */
  async hasRole(userId, roleName) {
    try {
      const userRoles = await this.getUserRoles(userId);
      
      if (!userRoles.success) {
        return false;
      }

      // Verificar en roles asignados
      const hasAssignedRole = userRoles.roles.some(role => role.name === roleName);
      
      // Verificar en rol por defecto
      const hasDefaultRole = userRoles.defaultRole && userRoles.defaultRole.name === roleName;

      return hasAssignedRole || hasDefaultRole;
    } catch (error) {
      console.error('Error al verificar rol:', error);
      return false;
    }
  }

  /**
   * Obtiene usuarios por rol
   */
  async getUsersByRole(roleName) {
    try {
      const role = await Role.findOne({
        where: { name: roleName, isActive: true },
        include: [
          {
            model: User,
            as: 'users',
            through: {
              where: { isActive: true },
              attributes: ['assignedAt']
            },
            attributes: ['id', 'email', 'name', 'nickname', 'isActive']
          }
        ]
      });

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      return {
        success: true,
        role: {
          id: role.id,
          name: role.name,
          description: role.description
        },
        users: role.users
      };
    } catch (error) {
      console.error('Error al obtener usuarios por rol:', error);
      throw error;
    }
  }

  /**
   * Inicializa roles por defecto
   */
  async initializeDefaultRoles() {
    try {
      const defaultRoles = [
        {
          name: 'admin',
          description: 'Full administrative access to all resources',
          permissions: [
            'read:users', 'edit:users', 'create:users', 'delete:users',
            'read:roles', 'edit:roles', 'create:roles', 'delete:roles',
            'read:posts', 'edit:posts', 'create:posts', 'delete:posts',
            'read:categories', 'edit:categories', 'create:categories', 'delete:categories',
            'read:tags', 'edit:tags', 'create:tags', 'delete:tags',
            'read:comments', 'edit:comments', 'create:comments', 'delete:comments',
            'system:backup', 'system:restore', 'system:config'
          ]
        },
        {
          name: 'editor',
          description: 'Can create, read and update all resources',
          permissions: [
            'read:posts', 'edit:posts', 'create:posts',
            'read:categories', 'edit:categories', 'create:categories',
            'read:tags', 'edit:tags', 'create:tags',
            'read:comments', 'edit:comments', 'create:comments',
            'read:users'
          ]
        },
        {
          name: 'viewer',
          description: 'Read-only access to all resources',
          permissions: [
            'read:posts',
            'read:categories',
            'read:tags',
            'read:comments',
            'read:users'
          ]
        }
      ];

      const createdRoles = [];

      for (const roleData of defaultRoles) {
        const existingRole = await Role.findOne({ where: { name: roleData.name } });
        
        if (!existingRole) {
          const role = await Role.create(roleData);
          createdRoles.push(role);
        }
      }

      return {
        success: true,
        message: `${createdRoles.length} roles inicializados`,
        roles: createdRoles
      };
    } catch (error) {
      console.error('Error al inicializar roles:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario (por Auth0 ID) tiene un permiso específico
   */
  async userHasPermission(auth0Id, permission) {
    try {
      const authService = require('./authService');
      const userProfile = await authService.getUserProfile(auth0Id);
      
      return userProfile.permissions && userProfile.permissions.includes(permission);
    } catch (error) {
      console.error('Error al verificar permiso del usuario:', error);
      return false;
    }
  }

  /**
   * Verifica si un usuario (por Auth0 ID) tiene un rol específico
   */
  async userHasRole(auth0Id, roleName) {
    try {
      const authService = require('./authService');
      const userProfile = await authService.getUserProfile(auth0Id);
      
      return userProfile.roles && userProfile.roles.includes(roleName);
    } catch (error) {
      console.error('Error al verificar rol del usuario:', error);
      return false;
    }
  }

  /**
   * Obtiene los roles de un usuario por Auth0 ID
   */
  async getUserRoles(auth0Id) {
    try {
      const authService = require('./authService');
      const userProfile = await authService.getUserProfile(auth0Id);
      
      return userProfile.roles || [];
    } catch (error) {
      console.error('Error al obtener roles del usuario:', error);
      return [];
    }
  }

  /**
   * Obtiene los permisos de un usuario por Auth0 ID
   */
  async getUserPermissions(auth0Id) {
    try {
      const authService = require('./authService');
      const userProfile = await authService.getUserProfile(auth0Id);
      
      return userProfile.permissions || [];
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      return [];
    }
  }
}

module.exports = new RoleService();
