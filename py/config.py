# config.py
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Configuración básica
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    # Configuración JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    
    # Configuración de la base de datos MySQL
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración de la aplicación
    DEBUG = os.getenv('FLASK_DEBUG', 'False') == 'True'
    TEMPLATES_FOLDER = 'templates'
    STATIC_FOLDER = 'static'
    
    # Configuración de CORS
    CORS_HEADERS = 'Content-Type'