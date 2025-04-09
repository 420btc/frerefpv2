# Instrucciones para Subir a GitHub

## Preparación Inicial

### 1. Asegúrate de tener Git y Git LFS instalados

```bash
# Verificar instalación de Git
git --version

# Instalar Git LFS (si no está instalado)
# Para Windows: Descargar de https://git-lfs.github.com/
# Para Mac: brew install git-lfs
# Para Linux: sudo apt install git-lfs
```

### 2. Configuración de Git

```bash
# Configurar nombre y email
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@example.com"
```

## Opción 1: Subir el proyecto desde Replit

1. Ejecuta el script de preparación:
```bash
./upload_to_github.sh
```

2. Introduce tus credenciales de GitHub cuando te las pida.

3. Si todo va bien, el proyecto se subirá al repositorio que configuraste.

## Opción 2: Subir proyecto desde tu computadora local

Si la Opción 1 falla debido al tamaño de los archivos, puedes:

1. Crear un repositorio vacío en GitHub llamado "freirefpv".

2. Clonar el repositorio vacío a tu computadora:
```bash
git clone https://github.com/420btc/freirefpv.git
cd freirefpv
```

3. Descargar los archivos del proyecto desde Replit:
   - Descarga todo el proyecto como ZIP desde el menú de Replit
   - Descomprime el archivo en tu computadora

4. Configura Git LFS:
```bash
git lfs install
git lfs track "*.mp4" "*.mov" "*.gif" "*.png" "*.jpg" "*.jpeg"
```

5. Copia todos los archivos del proyecto descomprimido a la carpeta del repositorio.

6. Sube los archivos al repositorio:
```bash
git add .
git commit -m "Commit inicial del proyecto"
git push -u origin main
```

## Solución a Problemas Comunes

### Error: "File exceeds GitHub's file size limit of 100.00 MB"

Esto ocurre cuando un archivo es demasiado grande y no está configurado para usar Git LFS.

**Solución**:
1. Asegúrate de que Git LFS está configurado correctamente:
```bash
git lfs track "*.EXTENSION_DEL_ARCHIVO"
```

2. Actualiza .gitattributes y haz commit:
```bash
git add .gitattributes
git commit -m "Configurar LFS para archivos grandes"
```

3. Vuelve a añadir y hacer commit del archivo grande:
```bash
git add ARCHIVO_GRANDE
git commit -m "Añadir archivo grande con LFS"
```

### Error al subir por tamaño total del repositorio

Si el repositorio es muy grande, puedes dividir la subida:

1. Sube primero los archivos pequeños:
```bash
git push -u origin main --no-verify
```

2. Luego, sube los archivos grandes uno por uno:
```bash
git add ARCHIVO_GRANDE
git commit -m "Añadir archivo grande XYZ"
git push
```

## Recuperación del Repositorio

Para recuperar el repositorio en otro ordenador o servidor:

```bash
git clone https://github.com/420btc/freirefpv.git
cd freirefpv
git lfs pull  # Asegura que los archivos grandes se descarguen correctamente
```