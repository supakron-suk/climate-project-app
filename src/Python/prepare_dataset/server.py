from flask import Flask, jsonify
from flask_cors import CORS
import os
import json
import xarray as xr
import geopandas as gpd
import threading
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
DATASET_FOLDER = os.path.join(BASE_DIR, "Python/prepare_dataset/dataset")  # ที่เก็บ dataset
os.makedirs(DATASET_FOLDER, exist_ok=True)

latest_file = None
dataset_info = {}

# อ่าน NetCDF & JSON (GeoJSON)
def read_dataset(file_path):
    global dataset_info
    try:
        if file_path.endswith(".nc"):
            # ใช้ xarray อ่านไฟล์ NetCDF และแสดงผลทั้งหมด
            ds = xr.open_dataset(file_path)
            # แสดงข้อมูล NetCDF โดยไม่ต้องแสดงข้อความเพิ่มเติม
            print(ds)
            # แปลงข้อมูล xarray เป็น dictionary เพื่อให้สามารถแสดงในรูปแบบ JSON ได้
            dataset_info = ds.to_dict()
        elif file_path.endswith(".json"):
            # ตรวจสอบว่าไฟล์ JSON เป็น GeoJSON หรือไม่
            if file_path.endswith(".json"):
                # ใช้ geopandas อ่านไฟล์ GeoJSON และแสดงผล
                gdf = gpd.read_file(file_path)
                # แสดงข้อมูล GeoJSON โดยไม่ต้องแสดงข้อความเพิ่มเติม
                print(gdf)
                # แปลงข้อมูล GeoDataFrame เป็น dictionary (JSON format)
                # dataset_info = gdf.to_dict()
            else:
                # อ่านไฟล์ JSON ปกติ
                with open(file_path, "r", encoding="utf-8") as f:
                    dataset_info = json.load(f)
        else:
            print(f"Unsupported file type: {file_path}")
    except Exception as e:
        print(f"Error reading dataset: {e}")

# ตรวจจับไฟล์ใหม่
class DatasetHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory or not (event.src_path.endswith(".nc") or event.src_path.endswith(".json")):
            return
        global latest_file
        latest_file = event.src_path
        read_dataset(latest_file)

# เริ่ม Watchdog
def start_watcher():
    event_handler = DatasetHandler()
    observer = Observer()
    observer.schedule(event_handler, DATASET_FOLDER, recursive=False)
    observer.start()
    print("Watching dataset folder for new files...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

# API ดึงข้อมูล Dataset
@app.route("/dataset-info", methods=["GET"])
def get_dataset_info():
    # ส่งคืนข้อมูล dataset ที่อ่านได้
    return jsonify(dataset_info)

# รัน Flask
if __name__ == "__main__":
    threading.Thread(target=start_watcher, daemon=True).start()  # เริ่ม Watchdog
    app.run(debug=True, port=5000)  # รัน Flask ที่พอร์ต 5000


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








