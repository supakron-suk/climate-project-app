# json-format.py
import json
import geopandas as gpd
import os
from contry_w_avg import calculate_weighted_average_country, calculate_monthly_averages # ดึง func มาจากไฟล์ contry_w_avg
from region_w_avg import calculate_weighted_average_region, calculate_monthly_averages_region # ดึง func มาจากไฟล์ region_w_avg
from province import province_coord  # ดึงการจัดชื่อจังหวัดในแต่ละภูมิภาคเพื่อรวมพื้นที่ในภูมิภาคนั้นอย่างถูกต้อง

# ฟังก์ชันสร้าง GeoJSON สำหรับภูมิภาค
def generate_geojson_for_region(avg_data, monthly_data, region_geom, region_name, year):
    # สร้าง GeoJSON Feature สำหรับภูมิภาค โดยมีข้อมูลทั้งปีและรายเดือน
    return {
        "type": "Feature",
        "geometry": region_geom.__geo_interface__,  # แปลง MultiPolygon ของภูมิภาค
        "properties": {
            "year": year,  # ปีที่กำหนด
            "region_name": region_name,  # ชื่อภูมิภาค
            "annual": {key: round(val, 2) for key, val in avg_data.items()},  # ค่าตัวแปรเฉลี่ยทั้งปี (ถ่วงน้ำหนัก)
            "monthly": monthly_data  # ค่าตัวแปรเฉลี่ยรายเดือน
        }
    }

# ฟังก์ชันสร้าง GeoJSON สำหรับประเทศ
def generate_geojson_for_country(avg_data, monthly_data, country_geom, year):
    # สร้าง GeoJSON Feature สำหรับประเทศ โดยมีข้อมูลทั้งปีและรายเดือน
    return {
        "type": "Feature",
        "geometry": country_geom.__geo_interface__,  # แปลง MultiPolygon ของประเทศ
        "properties": {
            "year": year,  # ปีที่กำหนด
            "annual": {key: round(val, 2) for key, val in avg_data.items()},  # ค่าตัวแปรเฉลี่ยทั้งปี (ถ่วงน้ำหนัก)
            "monthly": monthly_data  # ค่าตัวแปรเฉลี่ยรายเดือน
        }
    }

# ฟังก์ชันหลักสำหรับประมวลผลข้อมูลปีที่กำหนด
def process_year(year):
    print(f"Processing year: {year}")
    
    # อ่านข้อมูลจากไฟล์ GeoJSON ของปีที่กำหนด
    data_path = f"src/Geo-data/Era-Dataset/era_data_grid_{year}.json"
    data = gpd.read_file(data_path)  # ข้อมูลกริดจาก Era-Dataset
    shapefile = gpd.read_file("src/Geo-data/thailand-Geo.json")  # ข้อมูลรูปแบบภูมิศาสตร์ของประเทศไทย

    # คำนวณค่าเฉลี่ยทั้งปีและรายเดือนสำหรับประเทศ
    avg_data_country, country_geom = calculate_weighted_average_country(shapefile, data)  # คำนวณค่าเฉลี่ยสำหรับประเทศ
    monthly_data_country = calculate_monthly_averages(data, country_geom)  # คำนวณค่าเฉลี่ยรายเดือนสำหรับประเทศ
    
    # สร้าง GeoJSON สำหรับประเทศ
    country_feature = generate_geojson_for_country(avg_data_country, monthly_data_country, country_geom, year)
    
    # เตรียมข้อมูลภูมิภาค
    region_coords = province_coord()  # ฟังก์ชันที่ให้พิกัดของภูมิภาค
    region_names = ["North", "East", "Northeast", "Central", "South East", "South West"]  # ชื่อภูมิภาค

    region_features = []  # รายการเก็บฟีเจอร์ของภูมิภาคทั้งหมด

    # ลูปผ่านแต่ละภูมิภาค
    for i, region in enumerate(region_coords):
        region_geom = gpd.GeoSeries([g[1] for g in region]).unary_union  # รวมพิกัดภูมิภาคเป็น GeoSeries
        
        # คำนวณค่าเฉลี่ยทั้งปีและรายเดือนสำหรับภูมิภาคนี้
        avg_data_region, _ = calculate_weighted_average_region(shapefile, data, region_geom)  # คำนวณค่าเฉลี่ยสำหรับภูมิภาค
        monthly_data_region = calculate_monthly_averages_region(data, region_geom)  # คำนวณค่าเฉลี่ยรายเดือนสำหรับภูมิภาค
        
        # สร้าง GeoJSON สำหรับภูมิภาค
        region_feature = generate_geojson_for_region(avg_data_region, monthly_data_region, region_geom, region_names[i], year)
        
        # เพิ่มฟีเจอร์ภูมิภาคลงในรายการ
        region_features.append(region_feature)

    # === สร้างโฟลเดอร์ output ถ้ายังไม่มี ===
    output_dir = f"src/Geo-data/Era-Dataset/{year}/"
    os.makedirs(output_dir, exist_ok=True)  # สร้างโฟลเดอร์ output สำหรับปีนั้น ๆ

    # === บันทึกไฟล์ GeoJSON สำหรับภูมิภาคทั้งหมด ===
    with open(os.path.join(output_dir, f"region_data_{year}.json"), "w", encoding="utf-8") as f:
        # เก็บฟีเจอร์ทั้งหมดสำหรับภูมิภาคลงในไฟล์ GeoJSON
        json.dump({
            "type": "FeatureCollection",
            "features": region_features  # ฟีเจอร์ทั้งหมดของภูมิภาค
        }, f, ensure_ascii=False, indent=2)
    
    print(f"สร้างไฟล์ GeoJSON สำหรับภูมิภาค ปี {year}: {output_dir}region_data_{year}.json")

    # === บันทึกไฟล์ GeoJSON สำหรับประเทศ ===
    with open(os.path.join(output_dir, f"country_data_{year}.json"), "w", encoding="utf-8") as f:
        # เก็บฟีเจอร์สำหรับประเทศลงในไฟล์ GeoJSON
        json.dump({
            "type": "FeatureCollection",
            "features": [country_feature]  # ฟีเจอร์ของประเทศ
        }, f, ensure_ascii=False, indent=2)

    print(f"สร้างไฟล์ GeoJSON สำหรับประเทศ ปี {year}: {output_dir}country_data_{year}.json")

# ฟังก์ชันหลักในการประมวลผลปีที่ต้องการ
def main():
    # กำหนดช่วงปีที่ต้องการ
    start_year = 1960
    end_year = 1965
    
    # ลูปผ่านแต่ละปีในช่วงที่กำหนด
    for year in range(start_year, end_year + 1):
        process_year(year)  # เรียกใช้งานฟังก์ชันประมวลผลข้อมูลแต่ละปี

if __name__ == "__main__":
    main()  # เรียกใช้งานฟังก์ชันหลัก







# import json
# import geopandas as gpd
# from contry_w_avg import calculate_weighted_average_country, calculate_monthly_averages
# from region_w_avg import calculate_weighted_average_region, calculate_monthly_averages_region
# import os


# def generate_geojson(avg_data, monthly_data, country_geom, year):
#     return {
#         "type": "Feature",
#         "geometry": country_geom.__geo_interface__,
#         "properties": {
#             "year": year,
#             "annual": {key: round(val, 2) for key, val in avg_data.items()},
#             "monthly": monthly_data
#         }
#     }

# def main():
#     year = 1960
#     data_path = f"src/Geo-data/Era-Dataset/era_data_grid_{year}.json"
#     data = gpd.read_file(data_path)
#     shapefile = gpd.read_file("src/Geo-data/thailand-Geo.json")

#     avg_data, country_geom = calculate_weighted_average_country(shapefile, data)
#     monthly_data = calculate_monthly_averages(data, country_geom)
#     feature = generate_geojson(avg_data, monthly_data, country_geom, year)

#     # === สร้างโฟลเดอร์ output ถ้ายังไม่มี ===
#     output_dir = f"src/Geo-data/Era-Dataset/{year}/"
#     os.makedirs(output_dir, exist_ok=True)

#     # === บันทึก ===
#     with open(os.path.join(output_dir, f"contry_data_{year}.json"), "w", encoding="utf-8") as f:
#         json.dump({
#             "type": "FeatureCollection",
#             "features": [feature]
#         }, f, ensure_ascii=False, indent=2)

#     print(f"สร้างไฟล์ GeoJSON สำหรับปี {year} แล้ว: {output_dir}contry_data_{year}.json")

# if __name__ == "__main__":
#     main()
