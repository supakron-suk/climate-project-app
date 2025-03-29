from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import os
from watcher import start_watcher

app = Flask(__name__)
CORS(app)

# เก็บข้อมูลที่ได้รับจาก watcher
dataset_info = {}

# API endpoint สำหรับรับข้อมูลจาก watcher
@app.route('/upload-dataset', methods=['POST'])
def upload_dataset():
    """รับข้อมูลจาก watcher และเก็บไว้ใน dataset_info"""
    global dataset_info

    try:
        # รับข้อมูลจาก request body
        data = request.get_json()

        # ตรวจสอบว่าได้รับข้อมูลหรือไม่
        if not data:
            return jsonify({"message": "No data received"}), 400

        # เก็บข้อมูลที่ได้รับ
        dataset_info = data
        print("Dataset received and stored.")

        # ส่งกลับว่าได้รับข้อมูลแล้ว
        return jsonify({"message": "Data successfully received"}), 200
    except Exception as e:
        print(f"Error while processing data: {e}")
        return jsonify({"message": "Failed to process data"}), 500

# API endpoint สำหรับส่งข้อมูล dataset_info
@app.route('/dataset-info', methods=['GET'])
def get_dataset_info():
    """ส่งข้อมูล dataset_info ให้ React"""
    global dataset_info

    if not dataset_info:
        return jsonify({"message": "No dataset available"}), 404

    return jsonify(dataset_info), 200

# ตรวจสอบว่าเป็น process หลักของ Flask
if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    # เริ่มต้น watcher ใน thread แยก
    threading.Thread(target=start_watcher, daemon=True).start()

if __name__ == "__main__":
    app.run(debug=True, port=5000)


#-------------------------------------------------------------------------

# from flask import Flask, jsonify
# from flask_cors import CORS
# import threading
# import os
# from watcher import start_watcher  

# app = Flask(__name__)
# CORS(app)

# # ตรวจสอบว่าเป็น process หลักของ Flask
# if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
#     threading.Thread(target=start_watcher, daemon=True).start()

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)

    
    
# dataset_info = {}

# API ดึงข้อมูล Dataset
# @app.route("/dataset-info", methods=["GET"])
# def get_dataset_info():
#     return jsonify(dataset_info)




# from flask import Flask, jsonify
# from flask_cors import CORS
# import os
# import json
# import xarray as xr
# import geopandas as gpd
# import threading
# import time
# import matplotlib.pyplot as plt
# import seaborn as sns
# import pandas as pd
# from watchdog.observers import Observer
# from watchdog.events import FileSystemEventHandler

# app = Flask(__name__)
# CORS(app)

# BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
# DATASET_FOLDER = os.path.join(BASE_DIR, "Python/prepare_dataset/dataset")  # ที่เก็บ dataset
# os.makedirs(DATASET_FOLDER, exist_ok=True)

# latest_file = None
# dataset_info = {}

# # อ่าน NetCDF & JSON (GeoJSON)
# def read_dataset(file_path):
#     global dataset_info
#     try:
#         if file_path.endswith(".nc"):
#             # ใช้ xarray อ่านไฟล์ NetCDF และแสดงผลทั้งหมด
#             ds = xr.open_dataset(file_path)
#             print(ds)
#             # แปลงข้อมูล xarray เป็น dictionary เพื่อให้สามารถแสดงในรูปแบบ JSON ได้
#             dataset_info = ds.to_dict()
#         elif file_path.endswith(".json"):
#             # ตรวจสอบว่าไฟล์ JSON เป็น GeoJSON หรือไม่
#             if file_path.endswith(".json"):
#                 # ใช้ geopandas อ่านไฟล์ GeoJSON และแสดงผล
#                 gdf = gpd.read_file(file_path)
#                 print(gdf)
#                 # แปลงข้อมูล GeoDataFrame เป็น dictionary (JSON format)
#                 dataset_info = gdf.to_dict()
#             else:
#                 # อ่านไฟล์ JSON ปกติ
#                 with open(file_path, "r", encoding="utf-8") as f:
#                     dataset_info = json.load(f)
#         else:
#             print(f"Unsupported file type: {file_path}")
        
#         # รีเซ็ต dataset_info หลังจากแสดงข้อมูลแล้ว
#         dataset_info = {}

#     except Exception as e:
#         print(f"Error reading dataset: {e}")

# # ตรวจจับไฟล์ใหม่
# class DatasetHandler(FileSystemEventHandler):
#     def on_created(self, event):
#         if event.is_directory or not (event.src_path.endswith(".nc") or event.src_path.endswith(".json")):
#             return
#         global latest_file
#         latest_file = event.src_path
#         read_dataset(latest_file)

# # เริ่ม Watchdog
# def start_watcher():
#     event_handler = DatasetHandler()
#     observer = Observer()
#     observer.schedule(event_handler, DATASET_FOLDER, recursive=False)
#     observer.start()
#     print("Watching dataset folder for new files...")
#     try:
#         while True:
#             time.sleep(1)
#     except KeyboardInterrupt:
#         observer.stop()
#     observer.join()

# # ฟังก์ชั่นสำหรับ plot
# def plot_data(data):
#     # กรองข้อมูลไม่ให้มี 'month'
#     filtered_data = {k: v for k, v in data.items() if k != 'month'}

#     # สร้าง subplot
#     fig, axes = plt.subplots(len(filtered_data), 1, figsize=(10, len(filtered_data)*5))
    
#     if len(filtered_data) == 1:  # กรณีมีแค่ตัวแปรเดียว
#         axes = [axes]

#     # วาดกราฟสำหรับแต่ละตัวแปร
#     for i, (var_name, var_data) in enumerate(filtered_data.items()):
#         ax = axes[i]
        
#         if isinstance(var_data, list):
#             ax.plot(var_data, label=var_name)
#         elif isinstance(var_data, dict):  # ถ้ามีการแปลงเป็น dict ให้แสดงข้อมูล
#             for key, value in var_data.items():
#                 ax.plot(value, label=key)

#         ax.set_title(var_name)
#         ax.legend()

#     # แสดงกราฟโดยตรง
#     plt.tight_layout()
#     plt.show()

# # API ดึงข้อมูล Dataset
# @app.route("/dataset-info", methods=["GET"])
# def get_dataset_info():
#     # ส่งคืนข้อมูล dataset ที่อ่านได้
#     return jsonify(dataset_info)

# # API สำหรับแสดงกราฟ
# @app.route("/plot", methods=["GET"])
# def plot():
#     plot_data(dataset_info)
#     return "Plot displayed successfully!"

# # รัน Flask
# if __name__ == "__main__":
#     threading.Thread(target=start_watcher, daemon=True).start()  
#     app.run(debug=True, port=5000)





 # รัน Flask ที่พอร์ต 5000


# from flask import Flask, request, jsonify
# from werkzeug.utils import secure_filename
# from flask_cors import CORS
# import os
# import json
# import pandas as pd
# import xarray as xr
# import weight_area  # นำเข้าไฟล์ weight_area.py

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

#     print(f"Received file: {filename}" , flush=True)  

#     # ตรวจสอบประเภทไฟล์
#     if filename.endswith('.json'):
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
#                 file_content[var] = ds[var].values.tolist()  
#         except Exception as e:
#             return jsonify({"error": f"Error reading .nc file: {str(e)}"}), 500

#     else:
#         return jsonify({"error": "Unsupported file format"}), 400

#     # ส่งข้อมูลไปยัง weight_area.py
#     try:
#         weight_area_result = weight_area.calculate_weighted_average(file_content)  # ฟังก์ชันใน weight_area.py
#         print(f"Processed weighted average: {weight_area_result}" , flush=True)  # แสดงค่า weighted average ที่คำนวณได้
#     except Exception as e:
#         return jsonify({"error": f"Error processing with weight_area: {str(e)}"}), 500

#     return jsonify({
#         "message": "File uploaded and processed successfully",
#         "file_path": file_path,
#         "file_content_preview": file_content
#     })

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)








