import geopandas as gpd
import matplotlib.pyplot as plt
import numpy as np
# นำเข้าฟังก์ชัน province_coord จากไฟล์ province.py
from province import province_coord

# เรียกใช้งานฟังก์ชัน province_coord เพื่อรับข้อมูลพิกัดจังหวัด
region_coords = province_coord()

# โหลดข้อมูล GeoJSON
data = gpd.read_file('src/Geo-data/nc_to_json_2001.json')
shapefile = gpd.read_file('src/Geo-data/shapefile-lv1-thailand.json')

def calculate_weighted_temperature(province_name):
    # เลือกจังหวัดที่ต้องการ
    province_coord = shapefile[shapefile['NAME_1'] == province_name]
    
    # ตรวจสอบว่ามีข้อมูลจังหวัดหรือไม่
    if province_coord.empty:
        print(f"ไม่พบข้อมูลสำหรับจังหวัด {province_name}")
        return None
    
    # กรองเฉพาะกริดที่ตัดกับเขตของจังหวัด
    grid_in_province = data[data.geometry.intersects(province_coord.geometry.union_all())]
    
    # พื้นที่ของจังหวัด
    province_area = province_coord.geometry.union_all().area
    
    # สร้างแผนที่
    fig, ax = plt.subplots(figsize=(10, 10))
    province_coord.plot(ax=ax, color='white', edgecolor='black', alpha=1, label=province_name)
    grid_in_province.plot(ax=ax, color='red', edgecolor='black', alpha=0.5, label='Grid in ' + province_name)
    
    # คำนวณสัดส่วนและอุณหภูมิเฉลี่ยแบบถ่วงน้ำหนัก
    total_weighted_temp = 0
    total_percentage = 0
    
    for idx, grid in grid_in_province.iterrows():
        # พื้นที่ที่ตัดกันกับเขตจังหวัด
        intersection_area = grid.geometry.intersection(province_coord.geometry.union_all()).area
        
        # คำนวณสัดส่วนการตัดกันของกริดที่เทียบกับพื้นที่จังหวัด
        intersection_percentage_of_province = (intersection_area / province_area) * 100
        
        # ค่า temperature ในกริด
        temperature_value = grid['temperature']
        
        temperature_value = np.nan_to_num(temperature_value, nan=0.0)
        
        # คำนวณค่าอุณหภูมิเฉลี่ยแบบถ่วงน้ำหนัก
        weighted_temp = temperature_value * intersection_percentage_of_province
        total_weighted_temp += weighted_temp
        total_percentage += intersection_percentage_of_province
        
        # แสดงสัดส่วนของกริดที่ตัดกันบนแผนที่
        x, y = grid.geometry.centroid.x, grid.geometry.centroid.y
        ax.text(x, y, f'{intersection_percentage_of_province:.2f}%\nTemp: {temperature_value:.2f}', 
                fontsize=8, ha='center', color='black')
    
    # คำนวณค่าอุณหภูมิเฉลี่ยถ่วงน้ำหนักสำหรับจังหวัด
    average_temperature = total_weighted_temp / total_percentage if total_percentage != 0 else None
    print(f'Average Temperature in {province_name}: {average_temperature:.2f}' if average_temperature else "No temperature data available")
    

# เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
for region in region_coords:
    for province in region:
        name, geometry, region_name = province
        calculate_weighted_temperature(name)