# gridcal.py
import numpy as np

def calculate_weighted_temperature(province_name, shapefile, data):
    # เลือกจังหวัดที่ต้องการ
    province_coord = shapefile[shapefile['NAME_1'] == province_name]
    
    # ตรวจสอบว่ามีข้อมูลจังหวัดหรือไม่
    if province_coord.empty:
        print(f"No data in province: {province_name}")
        return None, None  # Return None if no data
    
    # กรองเฉพาะกริดที่ตัดกับเขตของจังหวัด
    grid_in_province = data[data.geometry.intersects(province_coord.geometry.union_all())]
    
    # พื้นที่ของจังหวัด
    province_area = province_coord.geometry.union_all().area
    
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
    
    # คำนวณค่าอุณหภูมิเฉลี่ยถ่วงน้ำหนักสำหรับจังหวัด
    average_temperature = total_weighted_temp / total_percentage #if total_percentage != 0 else None
    return average_temperature, province_coord.geometry
