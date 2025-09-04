const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Configuración de usuario de prueba
const testUser = {
  email: 'test.auth0@ejemplo.com',
  password: 'TestPassword123!',
  name: 'Usuario Test Auth0',
  nickname: 'testauth0'
};

let accessToken = null;
let refreshToken = null;

async function testAuth0Implementation() {
  console.log('🔐 Iniciando pruebas de Auth0...\n');

  try {
    // 1. Probar Health Check
    await testHealthCheck();
    
    // 2. Probar Registro
    await testRegister();
    
    // 3. Probar Login
    await testLogin();
    
    // 4. Probar endpoint protegido
    await testProtectedEndpoint();
    
    // 5. Probar obtener perfil
    await testGetProfile();
    
    // 6. Probar actualizar perfil
    await testUpdateProfile();
    
    // 7. Probar refresh token
    await testRefreshToken();
    
    // 8. Probar logout
    await testLogout();
    
    console.log('\n✅ Todas las pruebas de Auth0 completadas exitosamente!');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    process.exit(1);
  }
}

async function testHealthCheck() {
  console.log('1️⃣ Probando Health Check...');
  try {
    const response = await axios.get(`${API_BASE}/api/health`);
    console.log('   ✅ Health Check OK:', response.data.status);
  } catch (error) {
    throw new Error(`Health Check falló: ${error.message}`);
  }
}

async function testRegister() {
  console.log('\n2️⃣ Probando Registro...');
  try {
    const response = await axios.post(`${API_BASE}/api/auth/register`, testUser);
    
    if (response.status === 201) {
      console.log('   ✅ Registro exitoso');
      console.log(`   📧 Email: ${response.data.user.email}`);
      console.log(`   👤 Nombre: ${response.data.user.name}`);
      console.log(`   🆔 Auth0 ID: ${response.data.user.auth0Id}`);
    }
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('   ⚠️  Usuario ya existe (esto es normal en pruebas repetidas)');
    } else {
      throw new Error(`Registro falló: ${error.response?.data?.error || error.message}`);
    }
  }
}

async function testLogin() {
  console.log('\n3️⃣ Probando Login...');
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.status === 200) {
      accessToken = response.data.tokens.accessToken;
      refreshToken = response.data.tokens.refreshToken;
      
      console.log('   ✅ Login exitoso');
      console.log(`   🔑 Access Token recibido: ${accessToken.substring(0, 20)}...`);
      console.log(`   🔄 Refresh Token recibido: ${refreshToken.substring(0, 20)}...`);
      console.log(`   👤 Usuario: ${response.data.user.name}`);
    }
  } catch (error) {
    throw new Error(`Login falló: ${error.response?.data?.error || error.message}`);
  }
}

async function testProtectedEndpoint() {
  console.log('\n4️⃣ Probando endpoint protegido (/api/auth/me)...');
  try {
    const response = await axios.get(`${API_BASE}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 200) {
      console.log('   ✅ Endpoint protegido accesible');
      console.log(`   👤 Usuario autenticado: ${response.data.user.sub}`);
    }
  } catch (error) {
    throw new Error(`Endpoint protegido falló: ${error.response?.data?.error || error.message}`);
  }
}

async function testGetProfile() {
  console.log('\n5️⃣ Probando obtener perfil...');
  try {
    const response = await axios.get(`${API_BASE}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 200) {
      console.log('   ✅ Perfil obtenido exitosamente');
      console.log(`   📧 Email: ${response.data.user.email}`);
      console.log(`   👤 Nombre: ${response.data.user.name}`);
      console.log(`   🌍 Locale: ${response.data.user.locale}`);
    }
  } catch (error) {
    throw new Error(`Obtener perfil falló: ${error.response?.data?.error || error.message}`);
  }
}

async function testUpdateProfile() {
  console.log('\n6️⃣ Probando actualizar perfil...');
  try {
    const updateData = {
      name: 'Usuario Test Auth0 Actualizado',
      nickname: 'testauth0updated',
      locale: 'en'
    };
    
    const response = await axios.put(`${API_BASE}/api/auth/profile`, updateData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 200) {
      console.log('   ✅ Perfil actualizado exitosamente');
      console.log(`   👤 Nuevo nombre: ${response.data.user.name}`);
      console.log(`   🏷️  Nuevo nickname: ${response.data.user.nickname}`);
      console.log(`   🌍 Nuevo locale: ${response.data.user.locale}`);
    }
  } catch (error) {
    throw new Error(`Actualizar perfil falló: ${error.response?.data?.error || error.message}`);
  }
}

async function testRefreshToken() {
  console.log('\n7️⃣ Probando refresh token...');
  try {
    const response = await axios.post(`${API_BASE}/api/auth/refresh-token`, {
      refresh_token: refreshToken
    });
    
    if (response.status === 200) {
      console.log('   ✅ Token refrescado exitosamente');
      console.log(`   🔑 Nuevo Access Token: ${response.data.tokens.accessToken.substring(0, 20)}...`);
      accessToken = response.data.tokens.accessToken; // Actualizar token
    }
  } catch (error) {
    throw new Error(`Refresh token falló: ${error.response?.data?.error || error.message}`);
  }
}

async function testLogout() {
  console.log('\n8️⃣ Probando logout...');
  try {
    const response = await axios.post(`${API_BASE}/api/auth/logout`);
    
    if (response.status === 200) {
      console.log('   ✅ Logout exitoso');
      console.log('   📝 Nota: Auth0 maneja logout del lado del cliente');
    }
  } catch (error) {
    throw new Error(`Logout falló: ${error.response?.data?.error || error.message}`);
  }
}

// Ejecutar pruebas
if (require.main === module) {
  testAuth0Implementation()
    .then(() => {
      console.log('\n🎉 Todas las pruebas completadas!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en las pruebas:', error.message);
      process.exit(1);
    });
}

module.exports = testAuth0Implementation;
