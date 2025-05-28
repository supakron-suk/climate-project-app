import os
import shutil

# def move_and_rename_geojson(start_year=1960, end_year=1970):
#     src_base = "src/Geo-data"
#     dest_base = "public/Geo-data/Era-Dataset"

#     total_years = end_year - start_year + 1

#     for idx, year in enumerate(range(start_year, end_year + 1), start=1):
#         progress = int((idx / total_years) * 100)

#         src_filename = f"era_province_{year}.json"
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
# move_and_rename_geojson(1960, 2022)

# import os
# import shutil



#---------------------------------- rezero ----------------------------
# def move_and_rename_country_geojson(start_year=1951, end_year=1960):
#     src_base = "src/Geo-data"
#     dest_base = "public/Geo-data/Test-Dataset"

#     total_years = end_year - start_year + 1

#     for idx, year in enumerate(range(start_year, end_year + 1), start=1):
#         progress = int((idx / total_years) * 100)
#         # src_filename = f"example_country_{year}.json"
#         # src_filename = f"example_region_{year}.json"
#         src_filename = f"example_province_{year}.json"
#         src_path = os.path.join(src_base, src_filename)

#         if not os.path.exists(src_path):
#             print(f"[{progress}%] Source file not found: {src_path}")
#             continue

#         # สร้าง folder ปลายทาง เช่น public/Geo-data/Test-Dataset/1951
#         dest_folder = os.path.join(dest_base, str(year))
#         os.makedirs(dest_folder, exist_ok=True)

#         # เปลี่ยนชื่อไฟล์ใหม่เป็น country_data_{year}.json
#         # dest_filename = f"country_data_{year}.json"
#         # dest_filename = f"region_data_{year}.json"
#         dest_filename = f"province_data_{year}.json"
#         dest_path = os.path.join(dest_folder, dest_filename)

#         shutil.copy2(src_path, dest_path)

#         print(f"[{progress}%] Moved: {src_path} -> {dest_path}")

# # ตัวอย่างเรียกใช้
# move_and_rename_country_geojson(1950, 1979)




import json
import os

def load_region_data(year):
    file_path = f'public/Geo-data/Test-Dataset/{year}/province_data_{year}.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f), file_path

def rename_keys_in_feature(feature):
    if 'properties' in feature:
        props = feature['properties']

        # 🔁 เปลี่ยนชื่อ region_name ➝ areas_name
        if 'province_name' in props:
            props['p_name'] = props.pop('province_name')

        # 🔁 เปลี่ยนชื่อ annual ➝ yearly
        if 'annual' in props:
            props['yearly'] = props.pop('annual')

def process_and_save(years):
    for i, year in enumerate(years):
        try:
            data, path = load_region_data(year)
        except FileNotFoundError:
            print(f"❌ Not found: {year}")
            continue

        if 'features' in data:
            for feature in data['features']:
                rename_keys_in_feature(feature)

            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"✅ Updated {year} ({i+1}/{len(years)})")
        else:
            print(f"⚠️  Skipped {year}, no 'features' found.")

# 🔁 เรียกใช้
years = list(range(1950, 1980))
process_and_save(years)


# import os
# import json

# def update_country_annual_to_yearly(start_year=1950, end_year=1979):
#     base_path = "public/Geo-data/Test-Dataset"

#     for year in range(start_year, end_year + 1):
#         file_path = f"{base_path}/{year}/country_data_{year}.json"
        
#         if not os.path.exists(file_path):
#             print(f"❌ File not found: {file_path}")
#             continue

#         with open(file_path, "r", encoding="utf-8") as f:
#             data = json.load(f)

#         # ตรวจสอบว่า 'features' เป็น list หรือ object
#         features = data.get("features", [])

#         # ถ้าเป็น object เดี่ยว ให้แปลงเป็น list
#         if isinstance(features, dict):
#             features = [features]

#         for feature in features:
#             props = feature.get("properties", {})
#             if "annual" in props:
#                 props["yearly"] = props.pop("annual")

#         # บันทึกกลับ
#         data["features"] = features  # อัปเดตกลับเข้าไป
#         with open(file_path, "w", encoding="utf-8") as f:
#             json.dump(data, f, ensure_ascii=False, indent=2)

#         print(f"✅ Updated {year}: 'annual' ➝ 'yearly'")

# # เรียกใช้งาน
# update_country_annual_to_yearly(1950, 1979)


# import json
# import os
# from collections import OrderedDict

# def load_region_data(year):
#     file_path = f'public/Geo-data/Test-Dataset/{year}/province_data_{year}.json'
#     with open(file_path, 'r', encoding='utf-8') as f:
#         return json.load(f), file_path

# def rename_and_reorder_keys_in_feature(feature):
#     if 'properties' in feature:
#         props = feature['properties']

#         # เปลี่ยนชื่อ annual ➝ yearly
#         if 'annual' in props:
#             props['yearly'] = props.pop('annual')

#         # สร้าง OrderedDict ใหม่ เพื่อจัดเรียง key
#         new_props = OrderedDict()

#         if 'year' in props:
#             new_props['year'] = props['year']
#         if 'province_name' in props:
#             new_props['areas_name'] = props['province_name']

#         # เพิ่ม key อื่น ๆ ที่เหลือ
#         for key, value in props.items():
#             if key not in new_props:
#                 new_props[key] = value

#         feature['properties'] = new_props

# def process_and_save(years):
#     for i, year in enumerate(years):
#         try:
#             data, path = load_region_data(year)
#         except FileNotFoundError:
#             print(f"❌ Not found: {year}")
#             continue

#         if 'features' in data:
#             for feature in data['features']:
#                 rename_and_reorder_keys_in_feature(feature)

#             with open(path, 'w', encoding='utf-8') as f:
#                 json.dump(data, f, ensure_ascii=False, indent=2)

#             print(f"✅ Updated {year} ({i+1}/{len(years)})")
#         else:
#             print(f"⚠️  Skipped {year}, no 'features' found.")

# # 🔁 เรียกใช้
# years = list(range(1950, 1980))
# process_and_save(years)



# import json
# import os

# def load_region_data(year):
#     file_path = f'src/Geo-data/example_province_{year}.json'
#     with open(file_path, 'r', encoding='utf-8') as f:
#         return json.load(f), file_path

# def rename_keys_in_feature(feature):
#     if 'properties' in feature:
#         props = feature['properties']

#         # 🔁 เปลี่ยนชื่อ name_of_province ➝ areas_name
#         if 'name_of_province' in props:
#             props['areas_name'] = props.pop('name_of_province')

#         # 🔁 เปลี่ยนชื่อ province_name ➝ areas_name (กรณีชื่อเป็น province_name)
#         elif 'province_name' in props:
#             props['areas_name'] = props.pop('province_name')

#         # 🔁 เปลี่ยนชื่อ annual ➝ yearly
#         if 'annual' in props:
#             props['yearly'] = props.pop('annual')

# def process_and_save(years):
#     for i, year in enumerate(years):
#         try:
#             data, path = load_region_data(year)
#         except FileNotFoundError:
#             print(f"❌ Not found: {year}")
#             continue

#         if 'features' in data:
#             for feature in data['features']:
#                 rename_keys_in_feature(feature)

#             with open(path, 'w', encoding='utf-8') as f:
#                 json.dump(data, f, ensure_ascii=False, indent=2)

#             print(f"✅ Updated {year} ({i+1}/{len(years)})")
#         else:
#             print(f"⚠️  Skipped {year}, no 'features' found.")

# # 🔁 เรียกใช้
# years = list(range(1950, 1980))
# process_and_save(years)
