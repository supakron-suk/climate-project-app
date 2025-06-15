# contry_w_avg.py

import numpy as np

# ฟังก์ชันคำนวณค่าเฉลี่ยถ่วงน้ำหนักสำหรับแต่ละตัวแปรในประเทศ
def calculate_weighted_average_country(shapefile, data):
    # รวมภูมิศาสตร์ของประเทศ (เช่น พื้นที่ทั้งหมดของประเทศ)
    country_geom = shapefile.geometry.unary_union
    # เลือกเฉพาะกริดที่อยู่ภายในประเทศ
    grid_in_country = data[data.geometry.intersects(country_geom)]
    # คำนวณพื้นที่รวมของประเทศ
    country_area = country_geom.area

    # ตัวแปรที่ใช้สำหรับเก็บผลลัพธ์ที่คำนวณแล้ว
    total_weighted_pre = 0
    total_weighted_tmin = 0
    total_weighted_tmax = 0
    total_weighted_txx = 0
    total_weighted_tnn = 0
    total_weighted_rx1day = 0
    total_percentage = 0
    
    #***-------เพิ่มตัวแปรในการ weight average เช่น climate indices น่าจะตรงนี้--------***

    # ลูปผ่านกริดแต่ละตัวในประเทศ
    for idx, grid in grid_in_country.iterrows():
        # คำนวณพื้นที่ของการตัดกันระหว่างกริดและประเทศ
        intersect_area = grid.geometry.intersection(country_geom).area
        # คำนวณน้ำหนักโดยใช้พื้นที่ที่ตัดกันหารด้วยพื้นที่ทั้งหมดของประเทศ
        weight = (intersect_area / country_area) * 100

        # คำนวณค่าเฉลี่ยถ่วงน้ำหนักของตัวแปรต่างๆ
        total_weighted_pre += np.nan_to_num(grid.get('pre', 0.0), nan=0.0) * weight
        total_weighted_tmin += np.nan_to_num(grid.get('tmin', 0.0), nan=0.0) * weight
        total_weighted_tmax += np.nan_to_num(grid.get('tmax', 0.0), nan=0.0) * weight
        total_weighted_txx += np.nan_to_num(grid.get('txx', 0.0), nan=0.0) * weight
        total_weighted_tnn += np.nan_to_num(grid.get('tnn', 0.0), nan=0.0) * weight
        total_weighted_rx1day += np.nan_to_num(grid.get('rx1day', 0.0), nan=0.0) * weight
        total_percentage += weight  # รวมค่าหัวน้ำหนัก

    # ถ้าหาก total_percentage เป็น 0 หมายความว่าไม่มีข้อมูล หรือพื้นที่ในประเทศ
    if total_percentage == 0:
        return None, country_geom

    # คำนวณค่าเฉลี่ยของตัวแปรต่างๆ ถ่วงน้ำหนัก
    average_data = {
        "pre": total_weighted_pre / total_percentage,
        "tmin": total_weighted_tmin / total_percentage,
        "tmax": total_weighted_tmax / total_percentage,
        "txx": total_weighted_txx / total_percentage,
        "tnn": total_weighted_tnn / total_percentage,
        "rx1day": total_weighted_rx1day / total_percentage,
    }

    return average_data, country_geom  # คืนค่าผลลัพธ์และภูมิศาสตร์ของประเทศ


# ฟังก์ชันคำนวณค่าเฉลี่ยรายเดือนถ่วงน้ำหนัก
def calculate_monthly_averages(data, country_geom):
    variables = ["pre", "tmin", "tmax"]  # ตัวแปรที่เราจะคำนวณค่าเฉลี่ย
    monthly_data = {var: [] for var in variables}  # สร้าง dictionary สำหรับเก็บข้อมูลเฉลี่ยของแต่ละตัวแปร

    # เลือกเฉพาะกริดที่อยู่ภายในประเทศ
    grid_in_country = data[data.geometry.intersects(country_geom)]
    # คำนวณพื้นที่รวมของประเทศ
    country_area = country_geom.area

    # ลูปผ่านตัวแปรที่เราต้องการคำนวณ
    for var in variables:
        # ลูปผ่านเดือนที่ 1 ถึง 12
        for m in range(1, 13):
            # เลือกข้อมูลในเดือนนั้น
            month_data = grid_in_country[grid_in_country["month"] == m]
            total = 0
            total_weight = 0
            # ลูปผ่านกริดในเดือนนั้น
            for _, grid in month_data.iterrows():
                # คำนวณพื้นที่ของการตัดกันระหว่างกริดและประเทศ
                area = grid.geometry.intersection(country_geom).area
                # คำนวณน้ำหนัก (พื้นที่ที่ตัดกัน / พื้นที่ทั้งหมดของประเทศ)
                weight = area / country_area
                # ค่าของตัวแปรในกริดนั้น
                value = np.nan_to_num(grid.get(var, 0.0), nan=0.0)
                total += value * weight  # เพิ่มค่าที่ถ่วงน้ำหนัก
                total_weight += weight  # รวมค่าน้ำหนักทั้งหมด
            # คำนวณค่าเฉลี่ยของเดือนนั้น
            avg = total / total_weight if total_weight > 0 else None
            # เก็บผลลัพธ์ใน list
            monthly_data[var].append(round(avg, 2) if avg is not None else None)

    return monthly_data  # คืนค่าผลลัพธ์เฉลี่ยรายเดือน






