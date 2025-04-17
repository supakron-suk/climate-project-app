import os
import shutil

def move_and_rename_json_files(start_year=1960, end_year=1965):
    base_dir = "src/Geo-data/Era-Dataset"
    
    for year in range(start_year, end_year + 1):
        old_filename = f"era_data_polygon_{year}.json"
        old_path = os.path.join(base_dir, old_filename)
        
        # สร้างโฟลเดอร์ปี ถ้ายังไม่มี
        year_folder = os.path.join(base_dir, str(year))
        os.makedirs(year_folder, exist_ok=True)
        
        # กำหนดชื่อใหม่ของไฟล์
        new_filename = f"province_data_{year}.json"
        new_path = os.path.join(year_folder, new_filename)
        
        # ตรวจสอบว่าไฟล์ต้นทางมีจริงก่อนจะย้าย
        if os.path.exists(old_path):
            shutil.move(old_path, new_path)
            print(f"Moved: {old_filename} → {new_path}")
        else:
            print(f"File not found: {old_path}")

# เรียกใช้ฟังก์ชัน
move_and_rename_json_files(1960, 1965)
