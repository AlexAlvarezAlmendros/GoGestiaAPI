# Build script para Render
echo "🚀 Iniciando build para producción..."

# Verificar Node.js version
node --version
npm --version

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --only=production

# Verificar que todas las dependencias están instaladas
echo "✅ Verificando instalación..."
npm list --depth=0

# Linting del código
echo "🔍 Verificando calidad del código..."
npm run lint

echo "✅ Build completado exitosamente!"
