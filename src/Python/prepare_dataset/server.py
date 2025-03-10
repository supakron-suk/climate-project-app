from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import json
import pandas as pd
import xarray as xr
import weight_area  # นำเข้าไฟล์ weight_area.py

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return jsonify({"message": "Flask server is running!"})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    print(f"Received file: {filename}" , flush=True)  

    # ตรวจสอบประเภทไฟล์
    if filename.endswith('.json'):
        with open(file_path, 'r', encoding='utf-8') as f:
            file_content = json.load(f)

    elif filename.endswith('.csv'):
        df = pd.read_csv(file_path)
        file_content = df.to_dict(orient="records")  # แปลงเป็น JSON

    elif filename.endswith('.nc'):
        try:
            ds = xr.open_dataset(file_path)
            file_content = {}
            for var in ds.data_vars:
                file_content[var] = ds[var].values.tolist()  
        except Exception as e:
            return jsonify({"error": f"Error reading .nc file: {str(e)}"}), 500

    else:
        return jsonify({"error": "Unsupported file format"}), 400

    # ส่งข้อมูลไปยัง weight_area.py
    try:
        weight_area_result = weight_area.calculate_weighted_average(file_content)  # ฟังก์ชันใน weight_area.py
        print(f"Processed weighted average: {weight_area_result}" , flush=True)  # แสดงค่า weighted average ที่คำนวณได้
    except Exception as e:
        return jsonify({"error": f"Error processing with weight_area: {str(e)}"}), 500

    return jsonify({
        "message": "File uploaded and processed successfully",
        "file_path": file_path,
        "file_content_preview": file_content
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)



# from flask import Flask, request, jsonify
# from werkzeug.utils import secure_filename
# from flask_cors import CORS
# import os
# import json
# import pandas as pd
# import xarray as xr

# app = Flask(__name__)
# CORS(app)

# BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
# UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# @app.route('/')
# def home():
#     return jsonify({"message": "Flask server is running!"})

# @app.route('/upload', methods=['POST'])
# def upload_file():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file provided"}), 400

#     file = request.files['file']
#     filename = secure_filename(file.filename)
#     file_path = os.path.join(UPLOAD_FOLDER, filename)
#     file.save(file_path)

#     # ตรวจสอบประเภทไฟล์
#     if filename.endswith('.json') or filename.endswith('.json'):
#         with open(file_path, 'r', encoding='utf-8') as f:
#             file_content = json.load(f)
    
#     elif filename.endswith('.csv'):
#         df = pd.read_csv(file_path)
#         file_content = df.to_dict(orient="records")  # แปลงเป็น JSON
    
#     elif filename.endswith('.nc'):
#         try:
#             ds = xr.open_dataset(file_path)
#             file_content = {}
#             for var in ds.data_vars:
#                 file_content[var] = ds[var].values.tolist()  # แปลงข้อมูลเป็น JSON
#         except Exception as e:
#             return jsonify({"error": f"Error reading .nc file: {str(e)}"}), 500
    
#     else:
#         return jsonify({"error": "Unsupported file format"}), 400

#     return jsonify({
#         "message": "File uploaded successfully",
#         "file_path": file_path,
#         "file_content_preview": file_content
#     })

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)


# from flask import Flask, request, jsonify
# from werkzeug.utils import secure_filename
# from flask_cors import CORS  
# import os

# app = Flask(__name__)
# CORS(app)  

# BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
# UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# @app.route('/')
# def home():
#     return jsonify({"message": "Flask server is running!"})

# @app.route('/upload', methods=['POST'])
# def upload_file():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file provided"}), 400

#     file = request.files['file']
#     file_content = request.form.get("content", "")

#     if file.filename == '':
#         return jsonify({"error": "No selected file"}), 400

#     filename = secure_filename(file.filename)
#     file_path = os.path.join(UPLOAD_FOLDER, filename)
#     file.save(file_path)

#     print("Received file:", filename)
#     print("File content preview:", file_content[:500])

#     return jsonify({
#         "message": "File uploaded successfully",
#         "file_path": file_path,
#         "file_content_preview": file_content[:500]
#     })

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)




