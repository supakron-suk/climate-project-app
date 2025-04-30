
# import os
# import shutil

# def move_and_rename_geojson(start_year=1960, end_year=2022):
#     src_base = "src/Geo-data/Year-Dataset"
#     dest_base = "public/Geo-data/Cru-Dataset"

#     total_years = end_year - start_year + 1

#     for idx, year in enumerate(range(start_year, end_year + 1), start=1):
#         progress = int((idx / total_years) * 100)

#         src_filename = f"cru_province_{year}.json"
#         src_path = os.path.join(src_base, src_filename)

#         if not os.path.exists(src_path):
#             print(f"[{progress}%] ❌ Source file not found: {src_path}")
#             continue

#         # เตรียม path ใหม่
#         dest_folder = os.path.join(dest_base, str(year))
#         os.makedirs(dest_folder, exist_ok=True)

#         dest_filename = f"province_data_{year}.json"
#         dest_path = os.path.join(dest_folder, dest_filename)

#         # คัดลอกและเปลี่ยนชื่อ
#         shutil.copy2(src_path, dest_path)

#         print(f"[{progress}%] ✅ Moved: {src_path} -> {dest_path}")

# # เรียกใช้
# move_and_rename_geojson(1901, 2023)

#-----------------------------------------------------------------------------------------
#----------------------------------- Country Code----------------------------------------
# import json
# import os

# def rename_keys(data):
#     features = data.get('features')
#     if isinstance(features, dict):  # ต้องเป็น dict ตามรูปแบบ GeoJSON ของคุณ
#         props = features.get('properties', {})

#         for section in ['annual', 'monthly']:
#             if section in props and isinstance(props[section], dict):
#                 section_data = props[section]
#                 # เปลี่ยนชื่อคีย์
#                 if 'tmn' in section_data:
#                     section_data['tmin'] = section_data.pop('tmn')
#                 if 'tmx' in section_data:
#                     section_data['tmax'] = section_data.pop('tmx')

#     return data

# def process_files(start_year, end_year):
#     for year in range(start_year, end_year + 1):
#         file_path = f'public/Geo-data/Era-Dataset/{year}/country_data_{year}.json'
        
#         if not os.path.exists(file_path):
#             print(f"❌ File not found for year {year}")
#             continue

#         with open(file_path, 'r', encoding='utf-8') as f:
#             data = json.load(f)

#         updated_data = rename_keys(data)

#         with open(file_path, 'w', encoding='utf-8') as f:
#             json.dump(updated_data, f, ensure_ascii=False, indent=2)

#         print(f"✅ Updated year {year}: tmn → tmin, tmx → tmax")

# # เรียกใช้งาน
# process_files(1960, 1970)
#-----------------------------------------------------------------------------------------
#----------------------------------- Country Code----------------------------------------

 
#----------------------------------- Region Code----------------------------------------
# import json
# import os

# def load_region_data(year):
#     file_path = f'public/Geo-data/Era-Dataset/{year}/region_data_{year}.json'
#     with open(file_path, 'r') as f:
#         return json.load(f), file_path  # คืน path ด้วยไว้ใช้เขียนกลับ

# def rename_keys_in_feature(feature):
#     if 'properties' in feature:
#         props = feature['properties']

#         # เปลี่ยนคีย์ใน 'annual'
#         if 'annual' in props and isinstance(props['annual'], dict):
#             props['annual'] = {
#                 ('tmin' if k == 'tmn' else 'tmax' if k == 'tmx' else k): v
#                 for k, v in props['annual'].items()
#             }

#         # เปลี่ยนคีย์ใน 'monthly'
#         if 'monthly' in props and isinstance(props['monthly'], dict):
#             props['monthly'] = {
#                 ('tmin' if k == 'tmn' else 'tmax' if k == 'tmx' else k): v
#                 for k, v in props['monthly'].items()
#             }

# def process_and_save(years):
#     for i, year in enumerate(years):
#         data, path = load_region_data(year)

#         if 'features' in data:
#             for feature in data['features']:
#                 rename_keys_in_feature(feature)

#             # เขียนกลับไฟล์
#             with open(path, 'w') as f:
#                 json.dump(data, f, indent=2)
#             print(f"✅ Updated {year} ({i+1}/{len(years)})")
#         else:
#             print(f"⚠️  Skipped {year}, no 'features' found.")

# # เรียกใช้งาน
# years = list(range(1960, 1971))  
# process_and_save(years)
#----------------------------------- Region Code----------------------------------------

import json
import os

def load_province_data(year):
    file_path = f'public/Geo-data/Cru-Dataset/{year}/province_data_{year}.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f), file_path

def rename_keys_in_feature(feature):
    if 'properties' in feature:
        props = feature['properties']

        # ✅ เปลี่ยนคีย์ region_name ➔ province_name เท่านั้น
        if 'region_name' in props:
            props['province_name'] = props.pop('region_name')

def process_and_save(years):
    for i, year in enumerate(years):
        data, path = load_province_data(year)

        if 'features' in data:
            for feature in data['features']:
                rename_keys_in_feature(feature)

            # เขียนกลับไฟล์
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"✅ Updated {year} ({i+1}/{len(years)})")
        else:
            print(f"⚠️  Skipped {year}, no 'features' found.")

# เรียกใช้งาน
years = list(range(1901, 2024))  
process_and_save(years)



# import json
# import os

# def load_province_data(year):
#     file_path = f'public/Geo-data/Cru-Dataset/{year}/province_data_{year}.json'
#     with open(file_path, 'r') as f:
#         return json.load(f), file_path  # คืน path เพื่อเขียนกลับ

# def rename_keys_in_feature(feature):
#     if 'properties' in feature:
#         props = feature['properties']

#         # เปลี่ยนคีย์ใน 'annual'
#         if 'annual' in props and isinstance(props['annual'], dict):
#             props['annual'] = {
#                 ('tmin' if k == 'tmn' else 'tmax' if k == 'tmx' else k): v
#                 for k, v in props['annual'].items()
#             }

#         # เปลี่ยนคีย์ใน 'monthly'
#         if 'monthly' in props and isinstance(props['monthly'], dict):
#             props['monthly'] = {
#                 ('tmin' if k == 'tmn' else 'tmax' if k == 'tmx' else k): v
#                 for k, v in props['monthly'].items()
#             }

# def process_and_save(years):
#     for i, year in enumerate(years):
#         data, path = load_province_data(year)

#         if 'features' in data:
#             for feature in data['features']:
#                 rename_keys_in_feature(feature)

#             # เขียนกลับไฟล์
#             with open(path, 'w', encoding='utf-8') as f:
#                 json.dump(data, f, ensure_ascii=False, indent=2)

#             print(f"✅ Updated {year} ({i+1}/{len(years)})")
#         else:
#             print(f"⚠️  Skipped {year}, no 'features' found.")

# # เรียกใช้งาน
# years = list(range(1901, 2024))  # แก้ข้อมูลปี 1960 - 1969
# process_and_save(years)







# import os
# import shutil

# def move_and_rename_region_files(start_year=1901, end_year=1910):
#     src_base = "src/Geo-data/Year-Dataset"
#     dest_base = "public/Geo-data/Year-Dataset"

#     total_years = end_year - start_year + 1

#     for idx, year in enumerate(range(start_year, end_year + 1), start=1):
#         progress = int((idx / total_years) * 100)

#         src_filename = f"cru_region_{year}.json"
#         src_path = os.path.join(src_base, src_filename)

#         if not os.path.exists(src_path):
#             print(f"[{progress}%] ❌ Source file not found: {src_path}")
#             continue

#         # สร้างโฟลเดอร์ตามปี
#         dest_folder = os.path.join(dest_base, str(year))
#         os.makedirs(dest_folder, exist_ok=True)

#         dest_filename = f"region_data_{year}.json"
#         dest_path = os.path.join(dest_folder, dest_filename)

#         # คัดลอกไฟล์
#         shutil.copy2(src_path, dest_path)

#         print(f"[{progress}%] ✅ Moved: {src_path} -> {dest_path}")

# # เรียกใช้
# move_and_rename_region_files(1901, 1910)



# import os
# import shutil

# def move_and_rename_province_files(start_year=1966, end_year=1969):
#     src_base = "src/Geo-data/Era-Dataset"
#     dest_base = "public/Geo-data/Era-Dataset"

#     total_years = end_year - start_year + 1

#     for idx, year in enumerate(range(start_year, end_year + 1), start=1):
#         progress = int((idx / total_years) * 100)

#         src_filename = f"era_data_polygon_{year}.json"
#         src_path = os.path.join(src_base, src_filename)

#         if not os.path.exists(src_path):
#             print(f"[{progress}%] ❌ Source file not found: {src_path}")
#             continue

#         # เตรียมโฟลเดอร์ปลายทาง
#         dest_folder = os.path.join(dest_base, str(year))
#         os.makedirs(dest_folder, exist_ok=True)

#         dest_filename = f"province_data_{year}.json"
#         dest_path = os.path.join(dest_folder, dest_filename)

#         # คัดลอกไฟล์และเปลี่ยนชื่อ
#         shutil.copy2(src_path, dest_path)

#         print(f"[{progress}%] ✅ Moved: {src_path} -> {dest_path}")

# # เรียกใช้
# move_and_rename_province_files(1901, 1910)



