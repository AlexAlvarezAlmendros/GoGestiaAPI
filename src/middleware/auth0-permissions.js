/**
 * Middleware de permisos simplificado - Solo validación de token Auth0
 * Sin base de datos, sin auto-registro
 */

// Middleware simple que solo requiere token válido
const requireAuth = (req, res, next) => {
  // Si llegamos aquí, significa que checkJwt ya validó el token
  // y req.user contiene la información decodificada del JWT
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token de acceso requerido',
      code: 'MISSING_TOKEN'
    });
  }

  // Token válido, continuar
  next();
};

// Middleware para verificar permisos específicos en el token Auth0
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token de acceso requerido',
        code: 'MISSING_TOKEN'
      });
    }

    // Verificar si el usuario tiene el permiso en el token
    const userPermissions = req.user.permissions || req.user.scope?.split(' ') || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Acceso denegado. Permiso requerido: ${permission}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermission: permission,
        userPermissions: userPermissions
      });
    }

    // Usuario tiene el permiso necesario
    next();
  };
};

// Middleware para verificar roles específicos en el token Auth0
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token de acceso requerido',
        code: 'MISSING_TOKEN'
      });
    }

    // Debug: Log de información del usuario
    console.log('🔍 DEBUG - Verificando rol:', role);
    console.log('👤 Usuario del token:', {
      sub: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      roles_claim1: req.user.roles,
      roles_claim2: req.user['https://gogestia.com/roles'],
      permissions: req.user.permissions,
      scope: req.user.scope,
      full_token: req.user
    });

    // Verificar si el usuario tiene el rol en el token
    // Buscar roles en múltiples ubicaciones posibles del JWT
    const userRoles = req.user.roles || 
                     req.user['https://gogestia.com/roles'] || 
                     req.user['https://your-domain.com/roles'] ||
                     req.user['app_metadata']?.roles ||
                     req.user['user_metadata']?.roles ||
                     req.user.permissions ||
                     req.user.scope?.split(' ') ||
                     [];
    
    console.log('🎭 Roles del usuario:', userRoles);
    console.log('🎯 Rol requerido:', role);
    console.log('🔍 DEBUG - Ubicaciones de roles buscadas:', {
      'req.user.roles': req.user.roles,
      'req.user["https://gogestia.com/roles"]': req.user['https://gogestia.com/roles'],
      'req.user.app_metadata?.roles': req.user.app_metadata?.roles,
      'req.user.user_metadata?.roles': req.user.user_metadata?.roles,
      'req.user.permissions': req.user.permissions,
      'req.user.scope': req.user.scope
    });
    
    if (!userRoles.includes(role)) {
      console.log('❌ Acceso denegado - rol insuficiente');
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Acceso denegado. Rol requerido: ${role}`,
        code: 'INSUFFICIENT_ROLE',
        requiredRole: role,
        userRoles: userRoles,
        debug: {
          tokenClaims: Object.keys(req.user),
          userSub: req.user.sub
        }
      });
    }

    console.log('✅ Acceso permitido - rol verificado');
    // Usuario tiene el rol necesario
    next();
  };
};

// Middleware para verificar cualquiera de varios roles
const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token de acceso requerido',
        code: 'MISSING_TOKEN'
      });
    }

    // Debug: Mostrar el token JWT completo
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🎫 TOKEN JWT COMPLETO:', token);
      
      // Decodificar el payload del token (sin verificar la firma)
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log('📄 PAYLOAD DEL TOKEN:', JSON.stringify(payload, null, 2));
      } catch (error) {
        console.log('❌ Error decodificando payload:', error.message);
      }
    }

    // Debug: Log de información del usuario
    console.log('🔍 DEBUG - Verificando cualquier rol de:', roles);
    console.log('👤 Usuario del token:', {
      sub: req.user.sub,
      email: req.user.email,
      name: req.user.name
    });

    const userRoles = req.user.roles || 
                     req.user['https://gogestia.com/roles'] || 
                     req.user['https://your-domain.com/roles'] ||
                     req.user['app_metadata']?.roles ||
                     req.user['user_metadata']?.roles ||
                     req.user.permissions ||
                     req.user.scope?.split(' ') ||
                     [];
    const hasAnyRole = roles.some(role => userRoles.includes(role));
    
    console.log('🎭 Roles del usuario:', userRoles);
    console.log('🎯 Roles permitidos:', roles);
    console.log('✅ Tiene algún rol:', hasAnyRole);
    console.log('🔍 DEBUG - Ubicaciones de roles buscadas:', {
      'req.user.roles': req.user.roles,
      'req.user["https://gogestia.com/roles"]': req.user['https://gogestia.com/roles'],
      'req.user.app_metadata?.roles': req.user.app_metadata?.roles,
      'req.user.user_metadata?.roles': req.user.user_metadata?.roles,
      'req.user.permissions': req.user.permissions,
      'req.user.scope': req.user.scope
    });
    
    if (!hasAnyRole) {
      console.log('❌ Acceso denegado - roles insuficientes');
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Acceso denegado. Se requiere uno de estos roles: ${roles.join(', ')}`,
        code: 'INSUFFICIENT_ROLE',
        requiredRoles: roles,
        userRoles: userRoles,
        debug: {
          tokenClaims: Object.keys(req.user),
          userSub: req.user.sub
        }
      });
    }

    console.log('✅ Acceso permitido - rol verificado');
    next();
  };
};

// Middleware para obtener información del usuario desde el token
const getUserInfo = (req, res, next) => {
  if (req.user) {
    // Debug: Log completo del token
    console.log('🔍 DEBUG - Token JWT completo:', JSON.stringify(req.user, null, 2));
    
    // Extraer información básica del token
    req.userInfo = {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      nickname: req.user.nickname,
      picture: req.user.picture,
      roles: req.user.roles || 
             req.user['https://gogestia.com/roles'] || 
             req.user['https://your-domain.com/roles'] ||
             req.user['app_metadata']?.roles ||
             req.user['user_metadata']?.roles ||
             req.user.permissions ||
             req.user.scope?.split(' ') ||
             [],
      permissions: req.user.permissions || req.user.scope?.split(' ') || []
    };
    
    console.log('👤 Información del usuario extraída:', req.userInfo);
  }
  next();
};

module.exports = {
  requireAuth,
  requirePermission,
  requireRole,
  requireAnyRole,
  getUserInfo
};
