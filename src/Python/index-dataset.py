import json
import numpy as np
# โหลดไฟล์ GeoJSON
with open('src/Geo-data/Year-Dataset/data_index_polygon_1901.json', 'r') as f:
    data = json.load(f)

# สร้าง dictionary เพื่อจัดเก็บ TXx และ TNn ตามจังหวัด
province_data = {}
province_count = 0

# วนลูปผ่านแต่ละ feature ใน GeoJSON
for feature in data['features']:
    province_name = feature['properties']['name']
    tmax = feature['properties']['tmax']
    tmin = feature['properties']['tmin']
    
    # หากยังไม่มีข้อมูลสำหรับจังหวัดนี้ ให้สร้างใหม่
    if province_name not in province_data:
        province_data[province_name] = {'TXx': tmax, 'TNn': tmin}
    else:
        # อัปเดต TXx และ TNn หากพบค่าที่สูงหรือต่ำกว่า
        province_data[province_name]['TXx'] = max(province_data[province_name]['TXx'], tmax)
        province_data[province_name]['TNn'] = min(province_data[province_name]['TNn'], tmin)

# แสดงผลลัพธ์ TXx และ TNn ของแต่ละจังหวัด
for province, values in province_data.items():
    province_count += 1 
    print(f"Province {province_count},: {province}, TXx: {values['TXx']}, TNn: {values['TNn']}")

