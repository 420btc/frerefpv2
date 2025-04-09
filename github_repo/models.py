from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Pedido(db.Model):
    """Modelo para los pedidos de servicios de grabación"""
    id = db.Column(db.Integer, primary_key=True)
    tipo_servicio = db.Column(db.String(100), nullable=False)
    precio_base = db.Column(db.String(50), nullable=False)
    ubicacion = db.Column(db.String(200), nullable=False)
    duracion = db.Column(db.String(100), nullable=False)
    nombre = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    telefono = db.Column(db.String(50), nullable=False)
    mensaje = db.Column(db.Text, nullable=True)
    fecha_solicitud = db.Column(db.DateTime, default=datetime.utcnow)
    estado = db.Column(db.String(50), default='Pendiente')

class Contacto(db.Model):
    """Modelo para los mensajes de contacto"""
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    telefono = db.Column(db.String(50), nullable=False)
    asunto = db.Column(db.String(200), nullable=False)
    mensaje = db.Column(db.Text, nullable=False)
    fecha_contacto = db.Column(db.DateTime, default=datetime.utcnow)
    respondido = db.Column(db.Boolean, default=False)