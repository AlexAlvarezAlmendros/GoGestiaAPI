# Cómo obtener API Key de ImgBB

## Pasos para obtener tu API Key:

1. Ve a https://api.imgbb.com/
2. Haz clic en "Get API Key"
3. Crea una cuenta o inicia sesión
4. Una vez dentro, verás tu API Key

## Configuración:

1. Copia tu API Key de ImgBB
2. Pega la API Key en el archivo .env:
   ```
   IMGBB_API_KEY=tu_api_key_real_aqui
   ```

## Ventajas de ImgBB sobre Imgur:

- Límite más generoso: 200 uploads por hora
- No requiere autenticación OAuth
- API más simple
- Mejor para desarrollo y testing
- URLs de imagen más estables

## Cambios realizados:

1. ✅ Creado cliente ImgBB (`src/config/imgbb.js`)
2. ✅ Actualizado controlador de upload
3. ✅ Modificado middleware de seguridad
4. ✅ Actualizada documentación de endpoints
5. ✅ Configurado archivo .env

## Próximos pasos:

1. Obtén tu API Key de ImgBB
2. Actualiza el archivo .env con tu API Key real
3. Reinicia el servidor
4. Prueba el endpoint de upload

El endpoint `/api/upload/image` ahora usará ImgBB en lugar de Imgur.
