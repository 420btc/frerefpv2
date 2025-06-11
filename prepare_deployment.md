# Preparación para Deployment

## Pasos para preparar tu proyecto:

### 1. Crear repositorio en GitHub
```bash
git init
git add .
git commit -m "Initial commit - FreireFPV project"
git branch -M main
git remote add origin https://github.com/tu-usuario/freire-fpv.git
git push -u origin main
```

### 2. Configurar base de datos (Neon - Gratis)
1. Ve a https://neon.tech
2. Crea una cuenta gratuita
3. Crea una nueva base de datos
4. Copia la URL de conexión (DATABASE_URL)

### 3. Deploy en Vercel (Opción recomendada)
1. Ve a https://vercel.com
2. Conecta tu cuenta de GitHub
3. Importa tu repositorio
4. En "Environment Variables" agrega:
   - `DATABASE_URL`: La URL de tu base de datos Neon
   - `SESSION_SECRET`: Una clave secreta aleatoria (ej: `mi-clave-super-secreta-123`)
   - `EMAILJS_PUBLIC_KEY`: Tu clave de EmailJS (opcional)

### 4. Alternativas si Vercel no funciona:

#### Railway (Muy fácil):
1. Ve a https://railway.app
2. Conecta GitHub
3. Selecciona tu repositorio
4. Agrega las variables de entorno
5. Deploy automático

#### Render (Gratuito):
1. Ve a https://render.com
2. Conecta GitHub
3. Selecciona "Web Service"
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `gunicorn app:app`
6. Agrega variables de entorno

### 5. Problemas comunes y soluciones:

**Error: "No module named 'os'"**
- ✅ Ya solucionado en el código

**Error de base de datos:**
- Asegúrate de que DATABASE_URL esté configurada
- Usa una base de datos PostgreSQL externa (Neon recomendado)

**Archivos estáticos no cargan:**
- ✅ Ya configurado en vercel.json

**Error 500:**
- Revisa las variables de entorno
- Verifica que la base de datos esté accesible

### 6. Costos estimados:
- **Vercel**: Gratis para proyectos personales
- **Neon (DB)**: Gratis hasta 0.5GB
- **Railway**: Gratis con límites, luego $5/mes
- **Render**: Gratis con limitaciones

### 7. Ventajas vs Replit:
- ✅ Gratis (vs $27/mes en Replit)
- ✅ Mejor rendimiento
- ✅ Dominio personalizado gratuito
- ✅ SSL automático
- ✅ CDN global

¡Tu proyecto debería funcionar perfectamente en cualquiera de estas plataformas!