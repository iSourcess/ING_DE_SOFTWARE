from flask import Flask, request, jsonify, send_file, url_for
import os
from werkzeug.utils import secure_filename
import time
import pdfkit

app = Flask(__name__)

# Configuración
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'static/pdfs'
ALLOWED_EXTENSIONS = {'html', 'htm', 'txt', 'md', 'docx'}

# Crear directorios si no existen
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/convert', methods=['POST'])
def convert_file():
    # Verificar si hay un archivo en la solicitud
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No se encontró ningún archivo'})
    
    file = request.files['file']
    
    # Si el usuario no selecciona un archivo
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No se seleccionó ningún archivo'})
    
    if file and allowed_file(file.filename):
        # Guardar el archivo con un nombre seguro
        timestamp = int(time.time())
        filename = secure_filename(file.filename)
        base_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], base_filename)
        file.save(file_path)
        
        # Generar nombre para el archivo PDF de salida
        output_filename = f"{os.path.splitext(base_filename)[0]}.pdf"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        try:
            # Convertir a PDF usando pdfkit
            pdfkit.from_file(file_path, output_path)
            
            # Generar URL para descargar el PDF
            download_url = url_for('download_file', filename=output_filename, _external=True)
            
            return jsonify({
                'success': True, 
                'download_url': download_url
            })
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})
        finally:
            # Limpiar el archivo temporal
            if os.path.exists(file_path):
                os.remove(file_path)
    
    return jsonify({'success': False, 'error': 'Tipo de archivo no permitido'})

@app.route('/download/<filename>')
def download_file(filename):
    return send_file(os.path.join(app.config['OUTPUT_FOLDER'], filename), 
                     as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)