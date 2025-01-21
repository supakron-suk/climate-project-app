# gridcal.py
import numpy as np

def calculate_weighted_temperature(province_name, shapefile, data):
    province_coord = shapefile[shapefile['NAME_1'] == province_name]
    
    if province_coord.empty:
        print(f"No data in province: {province_name}")
        return None  # Return None if no data

    grid_in_province = data[data.geometry.intersects(province_coord.geometry.union_all())]
    province_area = province_coord.geometry.union_all().area

    total_weighted_pre = 0
    total_weighted_tmin = 0
    total_weighted_tmax = 0
    total_weighted_txx = 0  # เพิ่มตัวแปรสำหรับ TXx
    total_weighted_tnn = 0  # เพิ่มตัวแปรสำหรับ TNn
    total_percentage = 0

    for idx, grid in grid_in_province.iterrows():
        intersection_area = grid.geometry.intersection(province_coord.geometry.union_all()).area
        intersection_percentage_of_province = (intersection_area / province_area) * 100
        
        # อ่านค่าของแต่ละตัวแปร
        pre_value = np.nan_to_num(grid['pre'], nan=0.0)
        tmin_value = np.nan_to_num(grid['tmin'], nan=0.0)
        tmax_value = np.nan_to_num(grid['tmax'], nan=0.0)
        txx_value = np.nan_to_num(grid['txx'], nan=0.0)  # เพิ่มค่า TXx
        tnn_value = np.nan_to_num(grid['tnn'], nan=0.0)  # เพิ่มค่า TNn

        # คำนวณค่าเฉลี่ยถ่วงน้ำหนักสำหรับแต่ละตัวแปร
        total_weighted_pre += pre_value * intersection_percentage_of_province
        total_weighted_tmin += tmin_value * intersection_percentage_of_province
        total_weighted_tmax += tmax_value * intersection_percentage_of_province
        total_weighted_txx += txx_value * intersection_percentage_of_province  # ถ่วงน้ำหนักค่า TXx
        total_weighted_tnn += tnn_value * intersection_percentage_of_province  # ถ่วงน้ำหนักค่า TNn
        total_percentage += intersection_percentage_of_province

    if total_percentage == 0:
        return None  # หากไม่มีพื้นที่ที่ตัดกันเลย
    
    # คำนวณค่าเฉลี่ยถ่วงน้ำหนัก
    average_data = {
        "pre": total_weighted_pre / total_percentage,
        "tmin": total_weighted_tmin / total_percentage,
        "tmax": total_weighted_tmax / total_percentage,
        "txx": total_weighted_txx / total_percentage,  # เพิ่ม TXx
        "tnn": total_weighted_tnn / total_percentage,  # เพิ่ม TNn
    }

    return average_data, province_coord.geometry


# # gridcal.py
# import numpy as np
# def calculate_weighted_temperature(province_name, shapefile, data):
#     province_coord = shapefile[shapefile['NAME_1'] == province_name]
    
#     if province_coord.empty:
#         print(f"No data in province: {province_name}")
#         return None  # Return None if no data

#     grid_in_province = data[data.geometry.intersects(province_coord.geometry.union_all())]
#     province_area = province_coord.geometry.union_all().area

#     total_weighted_temp = 0
#     total_weighted_dtr = 0
#     total_weighted_pre = 0
#     total_weighted_tmin = 0
#     total_weighted_tmax = 0
#     total_percentage = 0

#     for idx, grid in grid_in_province.iterrows():
#         intersection_area = grid.geometry.intersection(province_coord.geometry.union_all()).area
#         intersection_percentage_of_province = (intersection_area / province_area) * 100
        
#         # อ่านค่าของแต่ละตัวแปร
#         temperature_value = np.nan_to_num(grid['temperature'], nan=0.0)
#         dtr_value = np.nan_to_num(grid['dtr'], nan=0.0)
#         pre_value = np.nan_to_num(grid['pre'], nan=0.0)
#         tmin_value = np.nan_to_num(grid['tmin'], nan=0.0)
#         tmax_value = np.nan_to_num(grid['tmax'], nan=0.0)

#         # คำนวณค่าเฉลี่ยถ่วงน้ำหนักสำหรับแต่ละตัวแปร
#         total_weighted_temp += temperature_value * intersection_percentage_of_province
#         total_weighted_dtr += dtr_value * intersection_percentage_of_province
#         total_weighted_pre += pre_value * intersection_percentage_of_province
#         total_weighted_tmin += tmin_value * intersection_percentage_of_province
#         total_weighted_tmax += tmax_value * intersection_percentage_of_province
#         total_percentage += intersection_percentage_of_province

#     if total_percentage == 0:
#         return None  # หากไม่มีพื้นที่ที่ตัดกันเลย
    
#     # คำนวณค่าเฉลี่ยถ่วงน้ำหนัก
#     average_data = {
#         "temperature": total_weighted_temp / total_percentage,
#         "dtr": total_weighted_dtr / total_percentage,
#         "pre": total_weighted_pre / total_percentage,
#         "tmin": total_weighted_tmin / total_percentage,
#         "tmax": total_weighted_tmax / total_percentage,
#     }

#     return average_data, province_coord.geometry

# import numpy as np

# def calculate_weighted_temperature(province_name, shapefile, data):
#     # เลือกจังหวัดที่ต้องการ
#     province_coord = shapefile[shapefile['NAME_1'] == province_name]
    
#     # ตรวจสอบว่ามีข้อมูลจังหวัดหรือไม่
#     if province_coord.empty:
#         print(f"No data in province: {province_name}")
#         return None, None  # Return None if no data
    
#     # กรองเฉพาะกริดที่ตัดกับเขตของจังหวัด
#     grid_in_province = data[data.geometry.intersects(province_coord.geometry.union_all())]
    
#     # พื้นที่ของจังหวัด
#     province_area = province_coord.geometry.union_all().area
    
#     total_weighted_temp = 0
#     total_percentage = 0
    
#     for idx, grid in grid_in_province.iterrows():
#         # พื้นที่ที่ตัดกันกับเขตจังหวัด
#         intersection_area = grid.geometry.intersection(province_coord.geometry.union_all()).area
        
#         # คำนวณสัดส่วนการตัดกันของกริดที่เทียบกับพื้นที่จังหวัด
#         intersection_percentage_of_province = (intersection_area / province_area) * 100
        
#         # ค่า temperature ในกริด
#         temperature_value = grid['temperature']
#         temperature_value = np.nan_to_num(temperature_value, nan=0.0)
        
#         # คำนวณค่าอุณหภูมิเฉลี่ยแบบถ่วงน้ำหนัก
#         weighted_temp = temperature_value * intersection_percentage_of_province
#         total_weighted_temp += weighted_temp
#         total_percentage += intersection_percentage_of_province
    
#     # คำนวณค่าอุณหภูมิเฉลี่ยถ่วงน้ำหนักสำหรับจังหวัด
#     average_temperature = total_weighted_temp / total_percentage #if total_percentage != 0 else None
#     return average_temperature, province_coord.geometry
