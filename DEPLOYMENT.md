# Guía de Deployment - FreireFPV

## Opción 1: Vercel (Recomendado)

### Pasos para deployar en Vercel:

1. **Preparar el repositorio:**
   - Asegúrate de que todos los archivos estén en tu repositorio de GitHub
   - El archivo `vercel.json` ya está configurado

2. **Conectar con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa tu repositorio

3. **Configurar variables de entorno en Vercel:**
   ```
   DATABASE_URL=tu_url_de_base_de_datos
   SESSION_SECRET=tu_clave_secreta
   EMAILJS_PUBLIC_KEY=tu_clave_emailjs (opcional)
   ```

4. **Deploy:**
   - Vercel detectará automáticamente que es una aplicación Python
   - El deployment será automático

### Problemas comunes en Vercel:
- **Base de datos:** Necesitarás una base de datos PostgreSQL externa (recomendado: Neon, Supabase, o Railway)
- **Archivos estáticos:** Vercel maneja automáticamente los archivos en `/static`

## Opción 2: Netlify

### Para Netlify necesitarás convertir a una aplicación estática o usar Netlify Functions:

1. **Opción A - Solo frontend:**
   - Eliminar la lógica de backend
   - Usar solo HTML/CSS/JS
   - Configurar formularios con Netlify Forms

2. **Opción B - Con Netlify Functions:**
   - Convertir las rutas de Flask a funciones serverless
   - Crear archivos en `/netlify/functions/`

## Opción 3: Railway (Alternativa recomendada)

1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Railway detectará automáticamente Flask
4. Configura las variables de entorno
5. Deploy automático

## Opción 4: Render

1. Ve a [render.com](https://render.com)
2. Conecta tu repositorio
3. Selecciona "Web Service"
4. Configura:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

## Variables de entorno necesarias:

```
DATABASE_URL=postgresql://...
SESSION_SECRET=clave-secreta-aleatoria
EMAILJS_PUBLIC_KEY=clave-emailjs (opcional)
```

## Notas importantes:

1. **Base de datos:** Tu aplicación usa PostgreSQL. Necesitarás:
   - Neon (gratis): https://neon.tech
   - Supabase (gratis): https://supabase.com
   - Railway (gratis limitado): https://railway.app

2. **Archivos de configuración creados:**
   - `vercel.json` - Configuración para Vercel
   - `netlify.toml` - Configuración para Netlify
   - `runtime.txt` - Versión de Python
   - `.env.example` - Variables de entorno de ejemplo

3. **Recomendación:** Usa Vercel + Neon para una solución completamente gratuita y fácil de configurar.