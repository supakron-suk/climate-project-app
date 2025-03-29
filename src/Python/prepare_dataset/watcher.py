import json
import os
import time
import sys
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from nc_func import read_netcdf
from json_func import read_json
from tqdm import tqdm  # ใช้สำหรับ Progress Bar

DATASET_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "dataset"))
latest_file = None
dataset_info = {}
is_processing = False  # เพิ่มตัวแปรสถานะ

def show_progress(duration=5):
    """แสดง Progress Bar เป็นเวลา duration วินาที"""
    with tqdm(total=duration, desc="Processing file", bar_format="{l_bar}{bar} {remaining} sec") as pbar:
        for _ in range(duration):
            time.sleep(1)
            pbar.update(1)

def send_data_to_flask(dataset_info):
    """ส่งข้อมูลไปยัง Flask API"""
    url = "http://localhost:5000/upload-dataset"  # URL ของ API Flask ที่จะรับข้อมูล
    headers = {'Content-Type': 'application/json'}
    
    # ส่งข้อมูล dataset_info ไปยัง API ของ Flask
    try:
        response = requests.post(url, data=json.dumps(dataset_info), headers=headers)
        if response.status_code == 200:
            print("Data successfully sent to Flask.")
        else:
            print(f"Failed to send data: {response.status_code}")
    except Exception as e:
        print(f"Error sending data to Flask: {e}")

# ตรวจจับไฟล์ใหม่
class DatasetHandler(FileSystemEventHandler):
    def on_created(self, event):
        global latest_file, dataset_info, is_processing

        if event.is_directory or not (event.src_path.endswith(".nc") or event.src_path.endswith(".json")):
            return

        # ป้องกันการประมวลผลซ้ำหลายรอบ
        if latest_file == event.src_path and is_processing:
            print(f"Duplicate file detected, skipping: {latest_file}")
            return
        
        # หน่วงเวลา 1 วินาทีก่อนเริ่มอ่าน
        time.sleep(0.5)

        latest_file = event.src_path
        print(f"New file detected: {latest_file}")

        if is_processing:
            print(f"Already processing another file. Waiting for completion...")
            return

        is_processing = True  # ตั้งสถานะว่ากำลังประมวลผล
        print(f"Processing file: {latest_file}")

        show_progress(duration=5)  # จำลองเวลาในการประมวลผล

        try:
            if latest_file.endswith(".nc"):
                dataset_info = read_netcdf(latest_file)
            elif latest_file.endswith(".json"):
                dataset_info = read_json(latest_file)

            # ส่งข้อมูลที่ได้ไปยัง Flask API
            send_data_to_flask(dataset_info)

            print(f"Finished processing: {latest_file}")

        except Exception as e:
            print(f"Error processing file {latest_file}: {e}")

        is_processing = False  # รีเซ็ตสถานะ

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




# import os
# import time
# import sys
# from watchdog.observers import Observer
# from watchdog.events import FileSystemEventHandler
# from nc_func import read_netcdf
# from json_func import read_json
# from tqdm import tqdm  # ใช้สำหรับ Progress Bar

# DATASET_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "dataset"))
# latest_file = None
# dataset_info = {}
# is_processing = False  # เพิ่มตัวแปรสถานะ

# def show_progress(duration=5):
#     """แสดง Progress Bar เป็นเวลา duration วินาที"""
#     with tqdm(total=duration, desc="Processing file", bar_format="{l_bar}{bar} {remaining} sec") as pbar:
#         for _ in range(duration):
#             time.sleep(1)
#             pbar.update(1)

# # ตรวจจับไฟล์ใหม่
# class DatasetHandler(FileSystemEventHandler):
#     def on_created(self, event):
#         global latest_file, dataset_info, is_processing

#         if event.is_directory or not (event.src_path.endswith(".nc") or event.src_path.endswith(".json")):
#             return

#         # ป้องกันการประมวลผลซ้ำหลายรอบ
#         if latest_file == event.src_path and is_processing:
#             print(f"Duplicate file detected, skipping: {latest_file}")
#             return
        
#         # หน่วงเวลา 1 วินาทีก่อนเริ่มอ่าน
#         time.sleep(0.5)

#         latest_file = event.src_path
#         print(f"New file detected: {latest_file}")

#         if is_processing:
#             print(f"Already processing another file. Waiting for completion...")
#             return

#         is_processing = True  # ตั้งสถานะว่ากำลังประมวลผล
#         print(f"Processing file: {latest_file}")

#         show_progress(duration=5)  # จำลองเวลาในการประมวลผล

#         try:
#             if latest_file.endswith(".nc"):
#                 dataset_info = read_netcdf(latest_file)
#             elif latest_file.endswith(".json"):
#                 dataset_info = read_json(latest_file)

#             print(f"Finished processing: {latest_file}")

#         except Exception as e:
#             print(f"Error processing file {latest_file}: {e}")

#         is_processing = False  # รีเซ็ตสถานะ

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



