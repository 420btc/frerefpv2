# Freire FPV - Plataforma de Servicios de Drones

![Freire FPV](static/img/icons/logo.svg)

## Descripción

Plataforma web profesional para Freire FPV, servicio de fotografía y videografía con drones FPV. El sitio incluye presentación de servicios, gestión de pedidos, información de equipamiento, contacto y previsión meteorológica para evaluar condiciones de vuelo.

## Características

- Información detallada de servicios de fotografía y videografía con drones
- Formulario de contacto y solicitud de servicios con EmailJS
- Integración con OpenWeather para mostrar condiciones meteorológicas
- Mapa interactivo con Mapbox para mostrar zonas de servicio
- Sección de equipamiento con información técnica
- Diseño completamente responsivo

## Requisitos

- Python 3.8+
- Flask y extensiones (Flask-SQLAlchemy)
- PostgreSQL
- Librerías JavaScript (EmailJS, Mapbox GL)

## Instalación

1. Clona este repositorio:
```bash
git clone https://github.com/420btc/freirefpv.git
cd freirefpv
```

2. Crea un entorno virtual e instala las dependencias:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configura las variables de entorno:
```bash
# Crea un archivo .env con las siguientes variables
DATABASE_URL=postgresql://user:password@localhost/freirefpv
FLASK_SECRET_KEY=tu_clave_secreta
OPENWEATHER_API_KEY=tu_clave_api
MAPBOX_TOKEN=tu_token_mapbox
EMAILJS_PUBLIC_KEY=tu_clave_emailjs
EMAILJS_SERVICE_ID=tu_servicio_emailjs
EMAILJS_TEMPLATE_ID=tu_plantilla_emailjs
```

4. Inicializa la base de datos:
```bash
flask db upgrade
```

5. Ejecuta la aplicación:
```bash
flask run
```

## Estructura del Proyecto

- **app.py**: Configuración principal de Flask y SQLAlchemy
- **main.py**: Punto de entrada para el servidor Gunicorn
- **models.py**: Modelos de base de datos (Pedidos, Contactos)
- **templates/**: Plantillas HTML (Jinja2)
- **static/**: Archivos estáticos (CSS, JavaScript, imágenes)

## Recursos Multimedia

Algunos archivos multimedia no están incluidos en este repositorio debido a su tamaño. Para obtener la experiencia completa:

1. Solicita los archivos multimedia al desarrollador original
2. Colócalos en las siguientes carpetas:
   - Videos: `static/video/` 
   - GIFs animados: `static/img/preload/`
   - Imágenes de alta resolución: `static/img/`

## API Externas

- **OpenWeather API**: Usado para previsión meteorológica
- **Mapbox GL**: Visualización de mapas interactivos
- **EmailJS**: Sistema de envío de emails para formularios

## Licencia

Todos los derechos reservados.

## Contacto

Para más información, contacta con Carlos Freire:
- Email: carlosfreire777@gmail.com