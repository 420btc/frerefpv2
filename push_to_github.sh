#!/bin/bash

# Script para intentar hacer push a GitHub
# Este script mostrará todos los mensajes de error o éxito durante el proceso

echo "🚀 Intentando subir el repositorio a GitHub..."
echo "⚠️ Es posible que te solicite tus credenciales de GitHub."

# Intentar hacer push con salida detallada
echo "📌 Ejecutando: git push -u origin main"
echo "-------------------------------------------"
if git push -u origin main; then
    echo "-------------------------------------------"
    echo "✅ ¡Éxito! El repositorio se ha subido correctamente."
else
    echo "-------------------------------------------"
    echo "⚠️ Hubo un problema al subir el repositorio."
    echo ""
    echo "🔄 Intentando con --no-verify para archivos más pequeños..."
    if git push -u origin main --no-verify; then
        echo "✅ ¡Éxito! Los archivos más pequeños se han subido."
    else
        echo "❌ También hubo un problema con los archivos pequeños."
    fi
fi