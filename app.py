import os
import logging
import requests
import json
import uuid
from datetime import datetime
from flask import Flask, render_template, jsonify, request, redirect, url_for
import time

# Set up logging for easier debugging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "freire-fpv-secret-key")

# Configuración de la base de datos
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Inicialización de la base de datos
from models import db, Testimonio
db.init_app(app)

# Crear tablas si no existen
with app.app_context():
    db.create_all()

# Filtro personalizado para formatear la hora
@app.template_filter('strftime')
def _jinja2_filter_datetime(format):
    return datetime.now().strftime(format)

# Configuración de EmailJS y OpenWeather
emailjs_public_key = os.environ.get("EMAILJS_PUBLIC_KEY")
openweather_api_key = "5ae0c9a3137234e18e032e3d6024629e"  # API key proporcionada por el usuario

# Función para obtener los datos del tiempo de Málaga
def get_weather_data():
    try:
        # Coordenadas de Málaga
        lat = 36.72
        lon = -4.42
        
        # Obtener pronóstico usando la API OneCall 3.0
        url = f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly&appid={openweather_api_key}&units=metric&lang=es"
        
        response = requests.get(url)
        data = response.json()
        
        if response.status_code != 200:
            app.logger.error(f"Error al obtener datos del clima: {data.get('message', 'Error desconocido')}")
            return None
        
        result = {}
        
        # Procesar datos del tiempo actual
        current = data['current']
        current_weather = current['weather'][0]
        current_temp = current['temp']
        current_description = current_weather['description']
        current_icon = current_weather['icon']
        current_wind = current['wind_speed']
        current_humidity = current['humidity']
        current_uvi = current.get('uvi', 0)
        current_pressure = current.get('pressure', 0)
        current_rain = 0
        
        if 'rain' in current and '1h' in current['rain']:
            current_rain = current['rain']['1h']
        
        # Determinar si es posible volar según las condiciones actuales
        # Nuevas reglas:
        # - Verde (óptimo): Lluvia entre 0mm y 0.5mm Y viento menor a 30km/h
        # - Naranja (por determinar): Lluvia entre 0.6mm y 1.5mm
        # - Rojo (no operable): Lluvia mayor a 1.5mm O viento mayor a 30km/h
        
        flight_status = ""
        status_text = ""
        
        # Condiciones no operables (rojo)
        if current_rain > 1.5 or current_wind > 30:
            flight_status = "not-recommended"  # Rojo - No recomendable
            
            if current_rain > 1.5:
                no_fly_reason = "Lluvia excesiva"
            else:
                no_fly_reason = "Viento demasiado fuerte"
                
            status_text = f"No operable: {no_fly_reason}"
        
        # Condiciones por determinar (naranja)
        elif current_rain > 0.5 and current_rain <= 1.5:
            flight_status = "caution"  # Naranja - Por determinar
            status_text = "Por determinar situación meteorológica"
        
        # Condiciones óptimas (verde)
        else:
            if current_wind < 15:
                flight_status = "optimal"  # Verde - Óptimo para volar
                status_text = "Óptimo para volar"
            else:
                flight_status = "possible"  # Amarillo - Posible pero con precaución
                status_text = "Posible con precaución"
        
        # Datos del tiempo actual
        result['current'] = {
            'temp': round(current_temp),
            'description': current_description.capitalize(),
            'icon': current_icon,
            'wind': round(current_wind),
            'humidity': current_humidity,
            'rain_amount': current_rain,
            'uvi': current_uvi,
            'pressure': current_pressure,
            'flight_status': flight_status,
            'status_text': status_text,
            'timestamp': current['dt'],
            'formatted_time': datetime.fromtimestamp(current['dt'] + 7200).strftime('%H:%M') # Ajustado a GMT+2 (horario de verano)
        }
        
        # Procesar los datos de la API OneCall (formato diferente)
        daily_forecast = []
        
        # Recorrer los datos diarios (hasta 5 días)
        for i, day_data in enumerate(data['daily']):
            if i >= 5:  # Limitamos a 5 días
                break
                
            dt = datetime.fromtimestamp(day_data['dt'])
            weather = day_data['weather'][0]
            temp = day_data['temp']['day']  # Temperatura durante el día
            description = weather['description']
            icon = weather['icon']
            wind = day_data['wind_speed']
            humidity = day_data['humidity']
            
            # Comprobar si hay previsión de lluvia
            rain_amount = day_data.get('rain', 0)
            
            # Determinar el estado del vuelo usando las nuevas reglas
            # - Verde (óptimo): Lluvia entre 0mm y 0.5mm Y viento menor a 30km/h
            # - Naranja (por determinar): Lluvia entre 0.6mm y 1.5mm
            # - Rojo (no operable): Lluvia mayor a 1.5mm O viento mayor a 30km/h
            
            # Inicializar estado del vuelo
            day_flight_status = ""
            
            # Condiciones no operables (rojo)
            if rain_amount > 1.5 or wind > 30:
                day_flight_status = "not-recommended"  # Rojo
            
            # Condiciones por determinar (naranja)
            elif rain_amount > 0.5 and rain_amount <= 1.5:
                day_flight_status = "caution"  # Naranja
            
            # Condiciones óptimas (verde)
            else:
                if wind < 15:
                    day_flight_status = "optimal"  # Verde - Óptimo
                else:
                    day_flight_status = "possible"  # Amarillo - Posible con precaución
            
            daily_forecast.append({
                'date': dt.strftime('%d/%m'),
                'day_name': get_day_name(dt.weekday()),
                'temp': round(temp),
                'description': description.capitalize(),
                'icon': icon,
                'wind': round(wind),
                'humidity': humidity,
                'rain_amount': rain_amount,
                'is_rainy': rain_amount > 0.1 or 'lluvia' in description.lower() or 'rain' in weather.get('main', '').lower(),
                'flight_status': day_flight_status
            })
        
        result['daily'] = daily_forecast
        return result
    
    except Exception as e:
        app.logger.error(f"Error al procesar datos del clima: {str(e)}")
        return None

# Función auxiliar para obtener el nombre del día en español
def get_day_name(weekday):
    days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    return days[weekday]

# Routes
@app.route("/")
def intro():
    return render_template("intro.html", emailjs_public_key=emailjs_public_key)

@app.route("/inicio")
def index():
    return render_template("index.html", emailjs_public_key=emailjs_public_key)

@app.route("/servicios")
def servicios():
    return render_template("servicios.html", emailjs_public_key=emailjs_public_key)

@app.route("/quienes-somos")
def quienes_somos():
    # Obtener todos los testimonios aprobados de la base de datos
    testimonios = Testimonio.query.filter_by(aprobado=True).order_by(Testimonio.fecha_creacion.desc()).all()
    return render_template("quienes-somos.html", 
                          emailjs_public_key=emailjs_public_key,
                          testimonios=testimonios)

@app.route("/mi-equipo")
def mi_equipo():
    return render_template("mi-equipo.html", emailjs_public_key=emailjs_public_key)

@app.route("/contacto")
def contacto():
    # Obtener datos del tiempo para mostrar en la página de contacto
    weather_data = get_weather_data()
    return render_template("contacto.html", 
                          emailjs_public_key=emailjs_public_key,
                          weather_data=weather_data)

@app.route("/api/weather/refresh", methods=["GET"])
def refresh_weather():
    """API endpoint para actualizar los datos del tiempo bajo demanda"""
    weather_data = get_weather_data()
    if weather_data:
        return jsonify({"success": True, "data": weather_data})
    else:
        return jsonify({"success": False, "error": "No se pudieron obtener los datos del tiempo"}), 500

@app.route("/emailjs-setup")
def emailjs_setup():
    return render_template("emailjs-setup.html", emailjs_public_key=emailjs_public_key)

# Rutas para las páginas detalladas de equipamiento
@app.route("/equipamiento/drones")
def equipamiento_drones():
    return render_template("equipamiento/drones.html", emailjs_public_key=emailjs_public_key)

@app.route("/equipamiento/camaras")
def equipamiento_camaras():
    return render_template("equipamiento/camaras.html", emailjs_public_key=emailjs_public_key)

@app.route("/equipamiento/baterias")
def equipamiento_baterias():
    return render_template("equipamiento/baterias.html", emailjs_public_key=emailjs_public_key)

@app.route("/equipamiento/software")
def equipamiento_software():
    return render_template("equipamiento/software.html", emailjs_public_key=emailjs_public_key)

# API para testimonios
@app.route("/api/testimonios", methods=["GET"])
def get_testimonios():
    """API para obtener todos los testimonios aprobados"""
    testimonios = Testimonio.query.filter_by(aprobado=True).order_by(Testimonio.fecha_creacion.desc()).all()
    return jsonify({
        "success": True,
        "testimonios": [testimonio.to_dict() for testimonio in testimonios]
    })

@app.route("/api/testimonios", methods=["POST"])
def add_testimonio():
    """API para añadir un nuevo testimonio"""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "error": "No se recibieron datos"}), 400
        
        # Validar datos obligatorios
        if not all(key in data for key in ['nombre', 'ocupacion', 'texto']):
            return jsonify({"success": False, "error": "Faltan campos obligatorios"}), 400
        
        # Obtener la IP del cliente
        ip_address = request.remote_addr
        
        # Verificar si ya hay un testimonio reciente de esta IP
        last_testimonio = Testimonio.query.filter_by(ip_address=ip_address).order_by(Testimonio.fecha_creacion.desc()).first()
        
        if last_testimonio:
            # Calcular días desde el último testimonio
            days_passed = (datetime.utcnow() - last_testimonio.fecha_creacion).days
            if days_passed < 7:
                return jsonify({
                    "success": False, 
                    "error": f"Solo puedes añadir un testimonio cada 7 días. Te quedan {7 - days_passed} días."
                }), 429
        
        # Generar un token único para identificación del testimonio
        token = str(uuid.uuid4())
        
        # Crear nuevo testimonio
        testimonio = Testimonio(
            nombre=data['nombre'],
            ocupacion=data['ocupacion'],
            texto=data['texto'],
            ip_address=ip_address,
            token=token,
            aprobado=True  # Por defecto aprobado
        )
        
        db.session.add(testimonio)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "mensaje": "Testimonio añadido correctamente",
            "testimonio": testimonio.to_dict(),
            "token": token
        })
    
    except Exception as e:
        app.logger.error(f"Error al añadir testimonio: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/testimonios/<token>", methods=["DELETE"])
def delete_testimonio(token):
    """API para eliminar un testimonio por su token"""
    try:
        testimonio = Testimonio.query.filter_by(token=token).first()
        
        if not testimonio:
            return jsonify({"success": False, "error": "Testimonio no encontrado"}), 404
        
        db.session.delete(testimonio)
        db.session.commit()
        
        return jsonify({"success": True, "mensaje": "Testimonio eliminado correctamente"})
    
    except Exception as e:
        app.logger.error(f"Error al eliminar testimonio: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
