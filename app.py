import os
import logging
import requests
import json
from datetime import datetime
from flask import Flask, render_template, jsonify, request
import time

# Set up logging for easier debugging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "freire-fpv-secret-key")

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
        can_fly = True
        no_fly_reason = ""
        
        # Si hay lluvia o la descripción indica lluvia, no se puede volar
        if current_rain > 0 or 'lluvia' in current_description.lower() or 'rain' in current_weather.get('main', '').lower():
            can_fly = False
            no_fly_reason = "Condiciones de lluvia"
        
        # Si el viento es mayor a 30 km/h, no se puede volar
        elif current_wind > 30:
            can_fly = False
            no_fly_reason = "Viento demasiado fuerte"
        
        # Asignar estado al vuelo (óptimo, posible, o no recomendable)
        if can_fly:
            if current_wind < 15:
                flight_status = "optimal"  # Verde - Óptimo para volar
                status_text = "Óptimo para volar"
            else:
                flight_status = "possible"  # Amarillo - Posible pero con precaución
                status_text = "Posible con precaución"
        else:
            flight_status = "not_recommended"  # Rojo - No recomendable
            status_text = f"No recomendable: {no_fly_reason}"
        
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
            'formatted_time': datetime.fromtimestamp(current['dt']).strftime('%H:%M')
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
            
            # Determinar si es posible volar este día
            can_fly_day = True
            
            # Si hay lluvia o la descripción indica lluvia, no se puede volar
            if rain_amount > 0.5 or 'lluvia' in description.lower() or 'rain' in weather.get('main', '').lower():
                can_fly_day = False
            
            # Si el viento es mayor a 30 km/h, no se puede volar
            elif wind > 30:
                can_fly_day = False
            
            # Asignar estado al vuelo para este día
            if can_fly_day:
                if wind < 15:
                    day_flight_status = "optimal"  # Verde
                else:
                    day_flight_status = "possible"  # Amarillo
            else:
                day_flight_status = "not_recommended"  # Rojo
            
            daily_forecast.append({
                'date': dt.strftime('%d/%m'),
                'day_name': get_day_name(dt.weekday()),
                'temp': round(temp),
                'description': description.capitalize(),
                'icon': icon,
                'wind': round(wind),
                'humidity': humidity,
                'rain_amount': rain_amount,
                'is_rainy': rain_amount > 0.5 or 'lluvia' in description.lower() or 'rain' in weather.get('main', '').lower(),
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
    return render_template("quienes-somos.html", emailjs_public_key=emailjs_public_key)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
