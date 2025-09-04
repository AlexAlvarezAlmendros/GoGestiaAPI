#!/usr/bin/env node

/**
 * Script de prueba simple para el sistema de uploads de GoGestia API
 * 
 * Uso:
 * node test-upload-simple.js [imagen.jpg]
 * 
 * Si no se proporciona archivo, genera una imagen SVG de prueba
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Función para crear imagen SVG de prueba
function createTestSVG() {
  const timestamp = new Date().toISOString();
  const svgContent = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#bg)"/>
  
  <circle cx="400" cy="200" r="50" fill="white" opacity="0.2"/>
  <circle cx="200" cy="400" r="30" fill="white" opacity="0.3"/>
  <circle cx="600" cy="450" r="40" fill="white" opacity="0.1"/>
  
  <text x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="bold"
        text-anchor="middle" fill="white">
    GoGestia API
  </text>
  
  <text x="400" y="330" font-family="Arial, sans-serif" font-size="24"
        text-anchor="middle" fill="white" opacity="0.8">
    Test Image Upload
  </text>
  
  <text x="400" y="380" font-family="Arial, sans-serif" font-size="16"
        text-anchor="middle" fill="white" opacity="0.6">
    Generado: ${timestamp}
  </text>
  
  <text x="400" y="520" font-family="Arial, sans-serif" font-size="14"
        text-anchor="middle" fill="white" opacity="0.4">
    Sistema de upload con Imgur API
  </text>
</svg>`;
  
  return Buffer.from(svgContent.trim());
}

// Función principal de upload
async function uploadImage(filePath = null) {
  console.log('🚀 GoGestia API - Test de Upload de Imágenes\n');

  try {
    let imageBuffer;
    let filename;
    let contentType;

    if (filePath && fs.existsSync(filePath)) {
      // Usar archivo proporcionado
      console.log(`📁 Usando archivo: ${filePath}`);
      imageBuffer = fs.readFileSync(filePath);
      filename = path.basename(filePath);
      
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp'
      };
      contentType = mimeTypes[ext] || 'application/octet-stream';
    } else {
      // Generar imagen de prueba
      console.log('🎨 Generando imagen SVG de prueba...');
      imageBuffer = createTestSVG();
      filename = `gogestia-test-${Date.now()}.svg`;
      contentType = 'image/svg+xml';
    }

    console.log(`📊 Tamaño del archivo: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📄 Tipo de contenido: ${contentType}\n`);

    // Preparar FormData
    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: filename,
      contentType: contentType
    });
    form.append('title', 'GoGestia Test Upload');
    form.append('description', `Imagen de prueba subida el ${new Date().toISOString()}`);

    console.log('⬆️  Subiendo imagen...');

    // Realizar upload
    const response = await axios.post(`${API_BASE_URL}/upload/image`, form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000 // 30 segundos timeout
    });

    console.log('✅ ¡Upload exitoso!\n');
    console.log('📋 Detalles de la imagen:');
    console.log(`   ID: ${response.data.id}`);
    console.log(`   Título: ${response.data.title}`);
    console.log(`   URL: ${response.data.url}`);
    console.log(`   URL de eliminación: ${response.data.deleteHash}`);
    console.log(`   Tamaño: ${response.data.size} bytes`);
    console.log(`   Tipo: ${response.data.type}`);
    
    if (response.data.width && response.data.height) {
      console.log(`   Dimensiones: ${response.data.width}x${response.data.height} px`);
    }

    console.log('\n🔗 Links útiles:');
    console.log(`   Ver imagen: ${response.data.url}`);
    console.log(`   Thumbnail: ${response.data.url.replace('.', 'm.')}`);
    
    console.log('\n⚠️  IMPORTANTE: Guarda el deleteHash para poder eliminar la imagen:');
    console.log(`   DELETE ${API_BASE_URL}/upload/image/${response.data.deleteHash}`);

    return response.data;

  } catch (error) {
    console.error('\n❌ Error durante el upload:');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensaje: ${error.response.data?.message || error.response.statusText}`);
      if (error.response.data?.details) {
        console.error(`   Detalles: ${error.response.data.details}`);
      }
    } else if (error.request) {
      console.error('   No se pudo conectar con el servidor');
      console.error('   Verifica que el servidor esté ejecutándose en http://localhost:3000');
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    process.exit(1);
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
const imagePath = args[0];

if (imagePath && !fs.existsSync(imagePath)) {
  console.error(`❌ El archivo ${imagePath} no existe`);
  process.exit(1);
}

// Ejecutar upload
uploadImage(imagePath);
