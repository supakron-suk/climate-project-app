# import geopandas as gpd
# import numpy as np
# from shapely.geometry import Polygon, MultiPolygon, mapping
# import json
# from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py
# from gridcal import calculate_weighted_temperature

# # สร้าง GeoJSON ในรูปแบบ FeatureCollection
# geojson_data = {
#     "type": "FeatureCollection",
#     "features": []
# }

# count = 0
# year = 2001  # กำหนดปี


# data_file = "src/Geo-data/Year-Dataset/data_year_2001.json"  # หากไฟล์เก็บข้อมูลทุกเดือนในไฟล์เดียว ใช้โค้ดนี้
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')
# data = gpd.read_file(data_file)
# months = data['month']
# print(months)

import geopandas as gpd
import numpy as np
from shapely.geometry import mapping
import json
from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py
from gridcal import calculate_weighted_temperature

# โหลดข้อมูล GeoJSON
data = gpd.read_file('src/Geo-data/Year-Dataset/data_year_2001.json')  # ข้อมูลทั้งหมดรวมทุกเดือน
shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')


geojson_data = {
    "type": "FeatureCollection",
    "features": []
}

count = 0
year = 2001


for month in range(1, 13):
    
    monthly_data = data[data['month'] == month]
    print(f"Processing data for Month {month}: {len(monthly_data)} entries")

    # เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
    for region in province_coord():  # ดึงข้อมูลจังหวัดในแต่ละภาค
        for province in region:
            name, geometry, region_name = province
            avg_temp, province_shape = calculate_weighted_temperature(name, shapefile, monthly_data)

            # ตรวจสอบว่าค่าคำนวณเสร็จสิ้นและไม่ใช่ค่า None
            if avg_temp is not None and province_shape is not None:
                # สร้างฟีเจอร์สำหรับจังหวัดและเดือนนี้
                feature = {
                    "type": "Feature",
                    "geometry": mapping(geometry),  # ใช้ mapping ของรูปทรงจังหวัดโดยตรง
                    "properties": {
                        "name": name,
                        "temperature": float(f"{avg_temp:.2f}"),  # ค่าอุณหภูมิเฉลี่ยถ่วงน้ำหนัก
                        "region": region_name,  # เพิ่มข้อมูลภูมิภาค
                        "month": month  # เพิ่มข้อมูลเดือน
                    }
                }
                geojson_data["features"].append(feature)

            # แสดงสถานะการคำนวณ
            count += 1
            print(f"{count}: Month {month}, Province: {name}, Avg Temp: {avg_temp:.3f}")

# บันทึกข้อมูล GeoJSON ลงไฟล์
output_geojson_path = "src/Geo-data/Year-Dataset/province_all_2001.json"
with open(output_geojson_path, 'w', encoding='utf-8') as geojson_file:
    json.dump(geojson_data, geojson_file, indent=2, ensure_ascii=False)

print("GeoJSON data saved successfully.")


# import geopandas as gpd
# import numpy as np
# from shapely.geometry import Polygon, MultiPolygon, mapping
# import json
# from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py
# from gridcal import calculate_weighted_temperature

# # สร้าง GeoJSON ในรูปแบบ FeatureCollection
# geojson_data = {
#     "type": "FeatureCollection",
#     "features": []
# }

# count = 0
# year = 2001  # กำหนดปี

# # เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัดและทุกเดือน
# for month in range(1, 13):  # เดือนที่ 1 ถึง 12
#     # โหลดข้อมูลสำหรับเดือนนั้น
#     data_file = "src/Geo-data/Year-Dataset/data_year_2001.json"  # หากไฟล์เก็บข้อมูลทุกเดือนในไฟล์เดียว ใช้โค้ดนี้
#     shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')
#     data = gpd.read_file(data_file)
    
#     for region in province_coord():  # เรียกใช้ข้อมูลจังหวัดจาก province_coord
#         for province in region:
#             name, geometry, region_name = province
#             avg_temp, province_shape = calculate_weighted_temperature(name, shapefile, data)
            
#             # ตรวจสอบว่าค่าคำนวณเสร็จสิ้นและไม่ใช่ค่า None
#             if avg_temp is not None and province_shape is not None:
#                 # สร้างฟีเจอร์สำหรับจังหวัดนี้ โดยใช้ MultiPolygon สำหรับรูปทรง
#                 feature = {
#                     "type": "Feature",
#                     "geometry": mapping(geometry),  # ใช้ mapping ของรูปทรงจังหวัดโดยตรง
#                     "properties": {
#                         "name": name,
#                         "temperature": float(f"{avg_temp:.2f}"),  # ค่าอุณหภูมิเฉลี่ยถ่วงน้ำหนัก
#                         "region": region_name,  # เพิ่มข้อมูลภูมิภาค
#                         "month": month  # เพิ่มข้อมูลเดือน
#                     }
#                 }
#                 geojson_data["features"].append(feature)
            
#             # พิมพ์ชื่อจังหวัดและค่า avg_temp ที่คำนวณได้
#             count += 1
#             print(f"{count}: province name: {name}, month: {month}, average temp: {avg_temp:.3f}")

# # บันทึกข้อมูล GeoJSON ลงไฟล์
# output_geojson_path = f"src/Geo-data/Year-Dataset/province_all_{year}.json"
# with open(output_geojson_path, 'w', encoding='utf-8') as geojson_file:
#     json.dump(geojson_data, geojson_file, indent=2, ensure_ascii=False)

# print("GeoJSON data saved successfully.")


# import geopandas as gpd
# import numpy as np
# from shapely.geometry import Polygon, MultiPolygon, mapping
# import json
# from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py
# from gridcal import calculate_weighted_temperature

# # โหลดข้อมูล GeoJSON
# data = gpd.read_file('src/Geo-data/nc_to_json_2001.json')
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# # สร้าง GeoJSON ในรูปแบบ FeatureCollection
# geojson_data = {
#     "type": "FeatureCollection",
#     "features": []
# }

# count = 0
# # เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
# for region in province_coord():  # เรียกใช้ข้อมูลจังหวัดจาก province_coord
#     for province in region:
#         #print(province)
#         name, geometry, region_name = province
#         avg_temp, province_shape = calculate_weighted_temperature(name, shapefile, data)
        
#         # ตรวจสอบว่าค่าคำนวณเสร็จสิ้นและไม่ใช่ค่า None
#         if avg_temp is not None and province_shape is not None:
#             # สร้างฟีเจอร์สำหรับจังหวัดนี้ โดยใช้ MultiPolygon สำหรับรูปทรง
#             feature = {
#                 "type": "Feature",
#                 "geometry": mapping(geometry),  # ใช้ mapping ของรูปทรงจังหวัดโดยตรง
#                 "properties": {
#                     "name": name,
#                     "temperature": float(f"{avg_temp:.2f}"),  # ค่าอุณหภูมิเฉลี่ยถ่วงน้ำหนัก
#                     "region": region_name  # เพิ่มข้อมูลภูมิภาค
#                 }
#             }
#             geojson_data["features"].append(feature)
        
#         # พิมพ์ชื่อจังหวัดและค่า avg_temp ที่คำนวณได้
#         count += 1
#         print(f"{count}: province name: {name}, average temp: {avg_temp:.3f}")

# # บันทึกข้อมูล GeoJSON ลงไฟล์
# output_geojson_path = "src/Geo-data/province_mean_temp_2001.json"
# with open(output_geojson_path, 'w', encoding='utf-8') as geojson_file:
#     json.dump(geojson_data, geojson_file, indent=2, ensure_ascii=False)

# print("GeoJSON data saved successfully.")