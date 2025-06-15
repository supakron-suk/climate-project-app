# region_w_avg.py
import numpy as np

# ฟังก์ชันที่คำนวณ weighted average สำหรับภูมิภาค
def calculate_weighted_average_region(shapefile, data, region_geom):
    # คำนวณพื้นที่ของภูมิภาคที่กำหนด
    region_area = region_geom.area
    # เลือกกริดที่มีการตัดกันกับภูมิภาค
    grid_in_region = data[data.geometry.intersects(region_geom)]

    # ตัวแปรสำหรับเก็บค่าผลลัพธ์ที่คำนวณได้
    total_weighted_pre = 0
    total_weighted_tmin = 0
    total_weighted_tmax = 0
    total_weighted_txx = 0
    total_weighted_tnn = 0
    total_weighted_rx1day = 0
    total_percentage = 0

    # ลูปผ่านกริดในภูมิภาคที่เลือก
    for idx, grid in grid_in_region.iterrows():
        # คำนวณพื้นที่ที่กริดตัดกับภูมิภาค
        intersect_area = grid.geometry.intersection(region_geom).area
        # คำนวณน้ำหนักโดยใช้พื้นที่ที่ตัดกันหารด้วยพื้นที่ทั้งหมดของภูมิภาค
        weight = (intersect_area / region_area) * 100

        # คำนวณค่าเฉลี่ยถ่วงน้ำหนักของตัวแปรต่างๆ
        total_weighted_pre += np.nan_to_num(grid.get('pre', 0.0), nan=0.0) * weight
        total_weighted_tmin += np.nan_to_num(grid.get('tmin', 0.0), nan=0.0) * weight
        total_weighted_tmax += np.nan_to_num(grid.get('tmax', 0.0), nan=0.0) * weight
        total_weighted_txx += np.nan_to_num(grid.get('txx', 0.0), nan=0.0) * weight
        total_weighted_tnn += np.nan_to_num(grid.get('tnn', 0.0), nan=0.0) * weight
        total_weighted_rx1day += np.nan_to_num(grid.get('rx1day', 0.0), nan=0.0) * weight
        total_percentage += weight  # รวมค่าน้ำหนักทั้งหมด

    # ถ้า total_percentage เป็น 0 หมายความว่าไม่มีข้อมูลหรือพื้นที่ในภูมิภาค
    if total_percentage == 0:
        return None, region_geom

    # คำนวณค่าเฉลี่ยถ่วงน้ำหนักของตัวแปรต่างๆ
    average_data = {
        "pre": total_weighted_pre / total_percentage,
        "tmin": total_weighted_tmin / total_percentage,
        "tmax": total_weighted_tmax / total_percentage,
        "txx": total_weighted_txx / total_percentage,
        "tnn": total_weighted_tnn / total_percentage,
        "rx1day": total_weighted_rx1day / total_percentage,
    }

    return average_data, region_geom  # คืนค่าผลลัพธ์ที่คำนวณและภูมิภาค

# ฟังก์ชันคำนวณค่าเฉลี่ยรายเดือนถ่วงน้ำหนักสำหรับภูมิภาค
def calculate_monthly_averages_region(data, region_geom):
    # ตัวแปรที่ใช้คำนวณค่าเฉลี่ยรายเดือน
    variables = ["pre", "tmin", "tmax"]
    monthly_data = {var: [] for var in variables}  # สร้าง dictionary สำหรับเก็บค่าเฉลี่ยรายเดือน

    # เลือกกริดที่มีการตัดกันกับภูมิภาค
    grid_in_region = data[data.geometry.intersects(region_geom)]
    # คำนวณพื้นที่ของภูมิภาค
    region_area = region_geom.area

    # ลูปผ่านตัวแปรที่ต้องการคำนวณ
    for var in variables:
        # ลูปผ่านเดือนที่ 1 ถึง 12
        for m in range(1, 13):
            # เลือกข้อมูลที่อยู่ในเดือนนั้น
            month_data = grid_in_region[grid_in_region["month"] == m]
            total = 0
            total_weight = 0
            # ลูปผ่านกริดในเดือนนั้น
            for _, grid in month_data.iterrows():
                # คำนวณพื้นที่ที่กริดตัดกับภูมิภาค
                area = grid.geometry.intersection(region_geom).area
                # คำนวณน้ำหนัก (พื้นที่ที่ตัดกัน / พื้นที่ทั้งหมดของภูมิภาค)
                weight = area / region_area
                # ค่าของตัวแปรในกริดนั้น
                value = np.nan_to_num(grid.get(var, 0.0), nan=0.0)
                total += value * weight  # คำนวณผลรวมของค่าที่ถ่วงน้ำหนัก
                total_weight += weight  # รวมค่าน้ำหนักทั้งหมด
            # คำนวณค่าเฉลี่ยรายเดือนของเดือนนั้น
            avg = total / total_weight if total_weight > 0 else None
            # เก็บค่าเฉลี่ยในลิสต์
            monthly_data[var].append(round(avg, 2) if avg is not None else None)

    return monthly_data  # คืนค่าผลลัพธ์ค่าเฉลี่ยรายเดือน




    
