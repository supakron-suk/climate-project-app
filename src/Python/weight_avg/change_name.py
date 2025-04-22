
# import os
# import shutil

# def move_and_rename_geojson(start_year=1960, end_year=1970):
#     src_base = "src/Geo-data/Year-Dataset"
#     dest_base = "public/Geo-data/Year-Dataset"

#     total_years = end_year - start_year + 1

#     for idx, year in enumerate(range(start_year, end_year + 1), start=1):
#         progress = int((idx / total_years) * 100)

#         src_filename = f"cru_country_{year}.json"
#         src_path = os.path.join(src_base, src_filename)

#         if not os.path.exists(src_path):
#             print(f"[{progress}%] ❌ Source file not found: {src_path}")
#             continue

#         # เตรียม path ใหม่
#         dest_folder = os.path.join(dest_base, str(year))
#         os.makedirs(dest_folder, exist_ok=True)

#         dest_filename = f"country_data_{year}.json"
#         dest_path = os.path.join(dest_folder, dest_filename)

#         # คัดลอกและเปลี่ยนชื่อ
#         shutil.copy2(src_path, dest_path)

#         print(f"[{progress}%] ✅ Moved: {src_path} -> {dest_path}")

# # เรียกใช้
# move_and_rename_geojson(1901, 1910)


import os
import shutil

def move_and_rename_region_files(start_year=1901, end_year=1910):
    src_base = "src/Geo-data/Year-Dataset"
    dest_base = "public/Geo-data/Year-Dataset"

    total_years = end_year - start_year + 1

    for idx, year in enumerate(range(start_year, end_year + 1), start=1):
        progress = int((idx / total_years) * 100)

        src_filename = f"cru_region_{year}.json"
        src_path = os.path.join(src_base, src_filename)

        if not os.path.exists(src_path):
            print(f"[{progress}%] ❌ Source file not found: {src_path}")
            continue

        # สร้างโฟลเดอร์ตามปี
        dest_folder = os.path.join(dest_base, str(year))
        os.makedirs(dest_folder, exist_ok=True)

        dest_filename = f"region_data_{year}.json"
        dest_path = os.path.join(dest_folder, dest_filename)

        # คัดลอกไฟล์
        shutil.copy2(src_path, dest_path)

        print(f"[{progress}%] ✅ Moved: {src_path} -> {dest_path}")

# เรียกใช้
move_and_rename_region_files(1901, 1910)



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



