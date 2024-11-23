import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon, MultiPolygon, mapping
import json
from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py
from gridcal import calculate_weighted_temperature

# โหลดข้อมูล GeoJSON
data = gpd.read_file('src/Geo-data/nc_to_json_2001.json')
shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# สร้าง GeoJSON ในรูปแบบ FeatureCollection
geojson_data = {
    "type": "FeatureCollection",
    "features": []
}

count = 0
# เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
for region in province_coord():  # เรียกใช้ข้อมูลจังหวัดจาก province_coord
    for province in region:
        #print(province)
        name, geometry, region_name = province
        avg_temp, province_shape = calculate_weighted_temperature(name, shapefile, data)
        
        # ตรวจสอบว่าค่าคำนวณเสร็จสิ้นและไม่ใช่ค่า None
        if avg_temp is not None and province_shape is not None:
            # สร้างฟีเจอร์สำหรับจังหวัดนี้ โดยใช้ MultiPolygon สำหรับรูปทรง
            feature = {
                "type": "Feature",
                "geometry": mapping(geometry),  # ใช้ mapping ของรูปทรงจังหวัดโดยตรง
                "properties": {
                    "name": name,
                    "temperature": float(f"{avg_temp:.2f}"),  # ค่าอุณหภูมิเฉลี่ยถ่วงน้ำหนัก
                    "region": region_name  # เพิ่มข้อมูลภูมิภาค
                }
            }
            geojson_data["features"].append(feature)
        
        # พิมพ์ชื่อจังหวัดและค่า avg_temp ที่คำนวณได้
        count += 1
        print(f"{count}: province name: {name}, average temp: {avg_temp:.3f}")

# บันทึกข้อมูล GeoJSON ลงไฟล์
output_geojson_path = "src/Geo-data/province_mean_temp_2001.json"
with open(output_geojson_path, 'w', encoding='utf-8') as geojson_file:
    json.dump(geojson_data, geojson_file, indent=2, ensure_ascii=False)

print("GeoJSON data saved successfully.")


