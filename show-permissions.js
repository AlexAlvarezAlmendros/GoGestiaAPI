const roleService = require('./src/services/roleService');

/**
 * Script para mostrar los permisos del sistema de manera organizada
 */
async function showPermissions() {
  console.log('🔐 Sistema de Permisos GoGestia API\n');
  
  try {
    // Obtener todos los roles
    const rolesResponse = await roleService.getAllRoles();
    const roles = rolesResponse.roles || rolesResponse;
    
    if (!roles || roles.length === 0) {
      console.log('❌ No se encontraron roles en el sistema');
      return;
    }

    console.log('📋 Roles y Permisos:\n');

    roles.forEach((role, index) => {
      console.log(`${index + 1}. 👤 ${role.name.toUpperCase()}`);
      console.log(`   📝 ${role.description}`);
      console.log(`   🔑 Permisos (${role.permissions?.length || 0}):`);
      
      if (role.permissions && role.permissions.length > 0) {
        // Agrupar permisos por recurso
        const permissionsByResource = {};
        
        role.permissions.forEach(permission => {
          const [action, resource] = permission.split(':');
          if (!permissionsByResource[resource]) {
            permissionsByResource[resource] = [];
          }
          permissionsByResource[resource].push(action);
        });

        Object.entries(permissionsByResource).forEach(([resource, actions]) => {
          console.log(`      📁 ${resource}:`);
          actions.forEach(action => {
            const actionName = getActionName(action);
            console.log(`         - ${action} (${actionName})`);
          });
        });
      } else {
        console.log('      ⚠️  Sin permisos asignados');
      }
      
      console.log(''); // Línea en blanco
    });

    console.log('🔖 Leyenda de Acciones:');
    console.log('   read   - Leer/Ver contenido');
    console.log('   edit   - Editar/Modificar contenido existente');
    console.log('   create - Crear nuevo contenido');
    console.log('   delete - Eliminar contenido');
    console.log('   system - Operaciones del sistema');
    console.log('');

    console.log('📊 Resumen:');
    console.log(`   Total de roles: ${roles.length}`);
    
    const totalPermissions = roles.reduce((sum, role) => 
      sum + (role.permissions?.length || 0), 0
    );
    console.log(`   Total de permisos asignados: ${totalPermissions}`);

    const uniquePermissions = new Set();
    roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(permission => uniquePermissions.add(permission));
      }
    });
    console.log(`   Permisos únicos en el sistema: ${uniquePermissions.size}`);

    console.log('\n🔐 Permisos únicos disponibles:');
    Array.from(uniquePermissions).sort().forEach(permission => {
      const [action, resource] = permission.split(':');
      const actionName = getActionName(action);
      console.log(`   ${permission} - ${actionName} ${resource}`);
    });

  } catch (error) {
    console.error('❌ Error al obtener permisos:', error.message);
  }
}

/**
 * Obtiene el nombre descriptivo de una acción
 */
function getActionName(action) {
  const actionNames = {
    'read': 'Leer',
    'edit': 'Editar', 
    'create': 'Crear',
    'delete': 'Eliminar',
    'system': 'Sistema'
  };
  
  return actionNames[action] || action;
}

/**
 * Muestra la matriz de permisos en formato tabla
 */
async function showPermissionMatrix() {
  try {
    console.log('\n📊 Matriz de Permisos:\n');
    
    const rolesResponse = await roleService.getAllRoles();
    const roles = rolesResponse.roles || rolesResponse;
    
    if (!roles || roles.length === 0) {
      console.log('❌ No se encontraron roles');
      return;
    }

    // Obtener todos los permisos únicos
    const allPermissions = new Set();
    roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(permission => allPermissions.add(permission));
      }
    });

    const permissionList = Array.from(allPermissions).sort();
    
    // Crear encabezado
    const header = ['Permiso'.padEnd(20)];
    roles.forEach(role => {
      header.push(role.name.padEnd(10));
    });
    console.log(header.join(' | '));
    
    // Línea separadora
    const separator = Array(header.length).fill('').map((_, i) => 
      i === 0 ? ''.padEnd(20, '-') : ''.padEnd(10, '-')
    );
    console.log(separator.join('-|-'));

    // Filas de permisos
    permissionList.forEach(permission => {
      const row = [permission.padEnd(20)];
      
      roles.forEach(role => {
        const hasPermission = role.permissions && role.permissions.includes(permission);
        row.push((hasPermission ? '✅' : '❌').padEnd(10));
      });
      
      console.log(row.join(' | '));
    });

  } catch (error) {
    console.error('❌ Error al crear matriz de permisos:', error.message);
  }
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
  showPermissions()
    .then(() => showPermissionMatrix())
    .then(() => {
      console.log('\n✅ Visualización de permisos completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { showPermissions, showPermissionMatrix };
