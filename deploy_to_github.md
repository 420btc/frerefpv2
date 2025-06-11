# Subir proyecto a GitHub y deployar

## Pasos para subir a GitHub:

### 1. Inicializar repositorio local
```bash
git init
git add .
git commit -m "FreireFPV - Proyecto sin base de datos listo para deploy"
```

### 2. Conectar con el repositorio remoto
```bash
git remote add origin https://github.com/420btc/frerefpv2.git
git branch -M main
git push -u origin main
```

### 3. Deploy en Vercel (Recomendado)
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu cuenta de GitHub
3. Importa el repositorio `420btc/frerefpv2`
4. Vercel detectará automáticamente la configuración de `vercel.json`
5. ¡Deploy automático!

### 4. Variables de entorno en Vercel (Opcionales)
- `SESSION_SECRET`: Una clave secreta cualquiera
- `EMAILJS_PUBLIC_KEY`: Tu clave de EmailJS (si la tienes)

## Cambios realizados:

✅ **Eliminada la base de datos completamente**
- Sin PostgreSQL
- Sin SQLAlchemy
- Sin dependencias de base de datos

✅ **Testimonios estáticos**
- Los testimonios ahora son datos fijos en el código
- No se pueden agregar/eliminar dinámicamente
- Funciona perfectamente sin base de datos

✅ **Dependencias mínimas**
- Solo Flask, Gunicorn, Requests y Werkzeug
- Proyecto mucho más ligero

✅ **Configuración optimizada**
- `vercel.json` configurado para deployment
- `requirements.txt` limpio
- Sin variables de entorno complejas

## Alternativas de deployment:

### Netlify (Solo frontend)
Si quieres usar solo HTML/CSS/JS:
1. Elimina `app.py` y archivos Python
2. Sube solo la carpeta `static` y `templates`
3. Convierte templates a HTML estático

### Railway
1. Ve a [railway.app](https://railway.app)
2. Conecta GitHub
3. Selecciona el repositorio
4. Deploy automático

### Render
1. Ve a [render.com](https://render.com)
2. Conecta GitHub
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn app:app`

¡Tu proyecto ahora es 100% gratuito y fácil de deployar! 🚀