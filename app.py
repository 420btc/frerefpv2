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

# Sin base de datos - aplicación estática

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
        
        # Procesar los datos diarios primero para obtener la información del día actual
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
            
            # Determinar el estado del vuelo usando las reglas
            # - Verde (óptimo): Lluvia entre 0mm y 0.5mm Y viento menor a 15km/h
            # - Amarillo (posible): Lluvia entre 0mm y 0.5mm Y viento entre 15-30km/h
            # - Naranja (por determinar): Lluvia entre 0.6mm y 1.5mm
            # - Rojo (no operable): Lluvia mayor a 1.5mm O viento mayor a 30km/h
            
            day_flight_status = ""
            day_status_text = ""
            
            # Condiciones no operables (rojo)
            if rain_amount > 1.5 or wind > 30:
                day_flight_status = "not-recommended"  # Rojo
                if rain_amount > 1.5:
                    day_status_text = "No operable: Lluvia excesiva"
                else:
                    day_status_text = "No operable: Viento demasiado fuerte"
            
            # Condiciones por determinar (naranja)
            elif rain_amount > 0.5 and rain_amount <= 1.5:
                day_flight_status = "caution"  # Naranja
                day_status_text = "Por determinar situación meteorológica"
            
            # Condiciones óptimas (verde) o con precaución (amarillo)
            else:
                if wind < 15:
                    day_flight_status = "optimal"  # Verde - Óptimo
                    day_status_text = "Óptimo para volar"
                else:
                    day_flight_status = "possible"  # Amarillo - Posible con precaución
                    day_status_text = "Posible con precaución"
            
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
                'flight_status': day_flight_status,
                'status_text': day_status_text
            })
        
        # Usar el estado de vuelo del día actual para el panel de clima actual
        if daily_forecast:
            # Tomar el estado de vuelo del primer elemento (día de hoy)
            flight_status = daily_forecast[0]['flight_status']
            status_text = daily_forecast[0]['status_text']
        else:
            # Respaldo por si no hay datos de pronóstico diario
            flight_status = "caution"
            status_text = "No se pudo determinar el estado"
        
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
    # Sin base de datos - los testimonios se cargan via JavaScript
    return render_template("quienes-somos.html", 
                          emailjs_public_key=emailjs_public_key,
                          testimonios=[])

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

# API simplificada para testimonios (sin base de datos)
@app.route("/api/testimonios", methods=["GET"])
def get_testimonios():
    """API para obtener testimonios estáticos"""
    # Testimonios estáticos predefinidos
    testimonios_estaticos = [
        {
            "id": 1,
            "nombre": "Carlos Mendoza",
            "ocupacion": "Director de Eventos",
            "texto": "Increíble trabajo de Freire FPV. Las tomas aéreas de nuestro evento corporativo fueron espectaculares.",
            "fecha_creacion": "2024-01-15"
        },
        {
            "id": 2,
            "nombre": "Ana García",
            "ocupacion": "Organizadora de Bodas",
            "texto": "Profesionalismo y calidad excepcional. Recomiendo totalmente sus servicios para cualquier celebración.",
            "fecha_creacion": "2024-01-10"
        },
        {
            "id": 3,
            "nombre": "Miguel Torres",
            "ocupacion": "Arquitecto",
            "texto": "Las grabaciones de nuestros proyectos inmobiliarios han sido fundamentales para nuestras presentaciones.",
            "fecha_creacion": "2024-01-05"
        }
    ]
    return jsonify({
        "success": True,
        "testimonios": testimonios_estaticos
    })

@app.route("/api/testimonios", methods=["POST"])
def add_testimonio():
    """API simulada para añadir testimonios (sin persistencia)"""
    return jsonify({
        "success": True,
        "mensaje": "Gracias por tu testimonio. Será revisado y publicado pronto."
    })

@app.route("/api/testimonios/<token>", methods=["DELETE"])
def delete_testimonio(token):
    """API simulada para eliminar testimonios"""
    return jsonify({
        "success": True,
        "mensaje": "Testimonio eliminado correctamente"
    })

# Para Vercel, no necesitamos app.run() aquí
# La aplicación se exporta directamente
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
