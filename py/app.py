# app.py
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from py.models import db, User
from py.config import Config
import re
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__,
            template_folder=Config.TEMPLATES_FOLDER,
            static_folder=Config.STATIC_FOLDER)

# Configuración
app.config.from_object(Config)
jwt = JWTManager(app)

# Inicializar extensiones
CORS(app)
db.init_app(app)

def validate_email(email):
    pattern = r'^[a-zA-Z]+\.[a-zA-Z]+@academicos\.udg\.mx$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 8

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validación de campos requeridos
    required_fields = ['name', 'lastname', 'email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Todos los campos son requeridos'}), 400
    
    # Validación de email
    if not validate_email(data['email']):
        return jsonify({'error': 'Formato de email inválido'}), 400
    
    # Validación de contraseña
    if not validate_password(data['password']):
        return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres'}), 400
    
    # Verificar si el email ya existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El email ya está registrado'}), 400
    
    try:
        user = User(
            name=data['name'],
            lastname=data['lastname'],
            email=data['email'],
            password=generate_password_hash(data['password'])
        )
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'Usuario registrado exitosamente'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al registrar usuario'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'error': 'Email y contraseña son requeridos'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    # Actualizar último login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Crear token JWT
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(user.to_dict()), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Recurso no encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Error interno del servidor'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=Config.DEBUG)