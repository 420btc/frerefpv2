#!/bin/bash

# Script para crear un ZIP ligero del proyecto sin archivos multimedia pesados
# Útil para descargar rápidamente y luego añadir manualmente los archivos multimedia

# Crear directorio temporal para el nuevo ZIP
TEMP_DIR="freire_fpv_small"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

echo "🔄 Creando estructura de carpetas..."
# Copiar los archivos esenciales (código fuente)
mkdir -p "$TEMP_DIR/templates"
cp -r templates/* "$TEMP_DIR/templates/"

# Copiar estructura de carpetas static pero sin archivos pesados
mkdir -p "$TEMP_DIR/static"
mkdir -p "$TEMP_DIR/static/css"
mkdir -p "$TEMP_DIR/static/js"
mkdir -p "$TEMP_DIR/static/img"
mkdir -p "$TEMP_DIR/static/img/icons"
mkdir -p "$TEMP_DIR/static/img/equipment"
mkdir -p "$TEMP_DIR/static/img/servicios"
mkdir -p "$TEMP_DIR/static/img/preload"
mkdir -p "$TEMP_DIR/static/video"

# Copiar archivos CSS y JS
cp -r static/css/* "$TEMP_DIR/static/css/"
cp -r static/js/* "$TEMP_DIR/static/js/"

# Copiar archivos críticos pequeños (iconos, logos, etc.)
find static/img/icons -type f -size -500k -exec cp {} "$TEMP_DIR/static/img/icons/" \; 2>/dev/null
find static/img/equipment -type f -size -500k -exec cp {} "$TEMP_DIR/static/img/equipment/" \; 2>/dev/null
find static/img/servicios -type f -size -500k -exec cp {} "$TEMP_DIR/static/img/servicios/" \; 2>/dev/null

# Crear archivos README en carpetas que contenían archivos grandes
echo "# Videos\nArchivos grandes excluidos del ZIP. Añádelos manualmente." > "$TEMP_DIR/static/video/README.md"
echo "# GIFs de precarga\nArchivos grandes excluidos del ZIP. Añádelos manualmente." > "$TEMP_DIR/static/img/preload/README.md"

# Copiar archivos del proyecto
cp *.py "$TEMP_DIR/"
cp *.toml "$TEMP_DIR/" 2>/dev/null
cp *.json "$TEMP_DIR/" 2>/dev/null
cp *.nix "$TEMP_DIR/" 2>/dev/null
cp .gitignore "$TEMP_DIR/" 2>/dev/null
cp .gitattributes "$TEMP_DIR/" 2>/dev/null
cp README.md "$TEMP_DIR/" 2>/dev/null
cp upload_to_github.sh "$TEMP_DIR/" 2>/dev/null
cp github_upload.md "$TEMP_DIR/" 2>/dev/null

# Incluir una lista de archivos multimedia faltantes
echo "Creando lista de archivos grandes..."
find . -type f -size +5M | sort > "$TEMP_DIR/archivos_grandes.txt"

# Crear un archivo requirements.txt para facilitar la instalación
echo "📄 Creando archivo requirements.txt..."
cat > "$TEMP_DIR/requirements.txt" << EOL
email-validator==2.1.0.post1
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
gunicorn==21.2.0
psycopg2-binary==2.9.9
requests==2.31.0
sendgrid==6.10.0
SQLAlchemy==2.0.23
Werkzeug==3.0.1
EOL

# Crear archivo de instrucciones
cat > "$TEMP_DIR/INSTRUCCIONES.md" << EOL
# Instrucciones para Freire FPV

Este ZIP contiene una versión ligera del proyecto, sin los archivos multimedia pesados.

## Configuración Inicial

1. Instala las dependencias:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Archivos multimedia faltantes:
   - Revisa el archivo \`archivos_grandes.txt\` para ver qué archivos multimedia no están incluidos
   - Cópialos manualmente desde Replit o desde un backup

3. Para subir a GitHub:
   - Sigue las instrucciones en \`github_upload.md\`
   - Usa el script \`upload_to_github.sh\` para configurar Git LFS

## Estructura del Proyecto

- \`app.py\`: Archivo principal de la aplicación
- \`main.py\`: Punto de entrada para Gunicorn
- \`models.py\`: Modelos de base de datos
- \`templates/\`: Plantillas HTML
- \`static/\`: Archivos estáticos (CSS, JS, imágenes)
EOL

# Crear ZIP
echo "📦 Creando archivo ZIP..."
zip -r "freire_fpv_small.zip" "$TEMP_DIR"

# Limpiar directorio temporal
rm -rf "$TEMP_DIR"

FILESIZE=$(du -h "freire_fpv_small.zip" | cut -f1)

echo "✅ ZIP creado correctamente: freire_fpv_small.zip ($FILESIZE)"
echo "Este archivo contiene el código del proyecto sin los archivos multimedia pesados."
echo "Descárgalo desde el panel de archivos de Replit."