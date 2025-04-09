#!/bin/bash

# Limpiar directorio anterior si existe
rm -rf github_repo

# Crear directorio temporal para el nuevo repositorio
mkdir -p github_repo

# Copiar los archivos esenciales (código fuente)
mkdir -p github_repo/templates
cp -r templates/* github_repo/templates/

# Copiar estructura de carpetas static pero sin archivos pesados
mkdir -p github_repo/static
mkdir -p github_repo/static/css
mkdir -p github_repo/static/js
mkdir -p github_repo/static/img
mkdir -p github_repo/static/img/icons
mkdir -p github_repo/static/img/equipment
mkdir -p github_repo/static/img/servicios
mkdir -p github_repo/static/img/preload
mkdir -p github_repo/static/video

# Copiar archivos CSS y JS
cp -r static/css/* github_repo/static/css/
cp -r static/js/* github_repo/static/js/

# Copiar archivos críticos pequeños (iconos, logos, etc.)
find static/img/icons -type f -size -500k -exec cp {} github_repo/static/img/icons/ \;
find static/img/equipment -type f -size -500k -exec cp {} github_repo/static/img/equipment/ \;
find static/img/servicios -type f -size -500k -exec cp {} github_repo/static/img/servicios/ \;

# Crear archivos README en carpetas que contenían archivos grandes
echo "# Videos\nArchivos grandes excluidos del repositorio GitHub. Sube estos archivos manualmente." > github_repo/static/video/README.md
echo "# GIFs de precarga\nArchivos grandes excluidos del repositorio GitHub. Sube estos archivos manualmente." > github_repo/static/img/preload/README.md

# Copiar archivos del proyecto
cp *.py github_repo/
cp *.toml github_repo/
cp *.json github_repo/
cp *.nix github_repo/
cp .gitignore github_repo/
cp .gitattributes github_repo/

# Mensaje de instrucciones
echo "======================"
echo "Repositorio preparado para GitHub"
echo "======================"
echo "1. Navega a la carpeta 'github_repo'"
echo "2. Inicializa Git: git init"
echo "3. Añade los archivos: git add ."
echo "4. Crea un commit: git commit -m 'Initial commit'"
echo "5. Añade tu repositorio de GitHub: git remote add origin URL_DE_TU_REPOSITORIO"
echo "6. Sube los cambios: git push -u origin main"
echo "======================"
echo "¡Listo! Tu código está ahora en GitHub sin los archivos multimedia pesados"