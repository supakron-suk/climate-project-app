import geopandas as gpd
import numpy as np
from shapely.geometry import mapping
import json
from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py
from gridcal import calculate_weighted_temperature  # ฟังก์ชันคำนวณค่าเฉลี่ยถ่วงน้ำหนัก

# กำหนดช่วงปีที่ต้องการ
start_year = 1960
end_year = 1965

# โหลดข้อมูล shapefile จังหวัด
shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

for year in range(start_year, end_year + 1):
    # โหลดข้อมูล Grid Cell GeoJSON ของปีนั้น
    grid_file = f"src/Geo-data/Era-Dataset/era_data_grid_{year}.json"
    with open(grid_file, 'r', encoding='utf-8') as f:
        grid_data = json.load(f)

    # เตรียมโครงสร้าง GeoJSON สำหรับบันทึกผลลัพธ์ของปีนั้น
    geojson_data = {
        "type": "FeatureCollection",
        "features": []
    }

    # เริ่มคำนวณรายเดือน
    for month in range(1, 13):
        # เลือกข้อมูล Grid Cell สำหรับเดือนนี้
        monthly_data = [feature for feature in grid_data['features'] if feature['properties']['month'] == month]
        print(f"Processing Year {year}, Month {month}: {len(monthly_data)} grid cells found")

        # เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
        for region in province_coord():
            for province in region:
                name, geometry, region_name = province
                # ฟังก์ชัน calculate_weighted_temperature จะรับข้อมูล 'monthly_data' ที่กรองตามเดือน
                average_data, province_shape = calculate_weighted_temperature(name, shapefile, monthly_data)

                if average_data is not None and province_shape is not None:
                    feature = {
                        "type": "Feature",
                        "geometry": mapping(geometry),
                        "properties": {
                            "name": name,
                            "region": region_name,
                            "month": month,
                            "tmax": float(f"{average_data['tmax']:.2f}"),
                            "tmin": float(f"{average_data['tmin']:.2f}"),
                            "pre": float(f"{average_data['pre']:.2f}"),
                        }
                    }
                    geojson_data["features"].append(feature)

                    # พิมพ์ผลลัพธ์ที่ถูกบันทึก
                    print(f"  Province: {name} | Region: {region_name} | Month: {month} | "
                          f"Tmax: {average_data['tmax']:.2f} | Tmin: {average_data['tmin']:.2f}")
                else:
                    # พิมพ์แจ้งเตือนถ้าข้อมูลหายไป
                    print(f"  WARNING: No data for Province: {name} | Region: {region_name} | Month: {month}")

    # บันทึก GeoJSON ของปีนี้
    output_file = f"src/Geo-data/Era-Dataset/era-data-polygon_{year}.json"
    with open(output_file, 'w') as f:
        json.dump(geojson_data, f, indent=2)
    print(f"Finished Year {year}. Results saved to {output_file}")
