import geopandas as gpd
import numpy as np
from shapely.geometry import mapping
import json
from province import province_coord 
from gridcal import calculate_weighted_temperature  

# กำหนดช่วงปีที่ต้องการ
start_year = 1960
end_year = 1980

# โหลดข้อมูล shapefile จังหวัด
shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

for year in range(start_year, end_year + 1):
    # โหลดข้อมูล Grid Cell GeoJSON ของปีนั้น
    grid_file = f"src/Geo-data/Era-Dataset/era_data_grid_{year}.json"
    grid_data = gpd.read_file(grid_file)

    # เตรียมโครงสร้าง GeoJSON สำหรับบันทึกผลลัพธ์ของปีนั้น
    geojson_data = {
        "type": "FeatureCollection",
        "features": []
    }

    # เริ่มคำนวณรายเดือน
    for month in range(1, 13):
        # เลือกข้อมูล Grid Cell สำหรับเดือนนี้
        monthly_data = grid_data[grid_data['month'] == month]
        print(f"Processing Year {year}, Month {month}: {len(monthly_data)} grid cells found")

        # เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
        for region in province_coord():
            for province in region:
                name, geometry, region_name = province
                average_data, province_shape = calculate_weighted_temperature(name, shapefile, monthly_data)

                if average_data is not None and province_shape is not None:
                    feature = {
                        "type": "Feature",
                        "geometry": mapping(geometry),
                        "properties": {
                            "name": name,
                            "region": region_name,
                            "month": month,
                            "pre": float(f"{average_data['pre']:.2f}"),
                            "tmin": float(f"{average_data['tmin']:.2f}"),
                            "tmax": float(f"{average_data['tmax']:.2f}"),
                            "txx": float(f"{average_data['txx']:.2f}"),  # เพิ่ม TXx
                            "tnn": float(f"{average_data['tnn']:.2f}"),  # เพิ่ม TNn
                            "rx1day": float(f"{average_data['rx1day']:.2f}"),  # เพิ่ม RX1d
                        }
                    }
                    geojson_data["features"].append(feature)

                    # พิมพ์ผลลัพธ์ที่ถูกบันทึก
                    # print(f"  Province: {name} | Region: {region_name} | Month: {month} | "
                    #       f"Temperature: {average_data['temperature']:.2f} | DTR: {average_data['dtr']:.2f}")
                else:
                    # พิมพ์แจ้งเตือนถ้าข้อมูลหายไป
                    print(f"  WARNING: No data for Province: {name} | Region: {region_name} | Month: {month}")

    # บันทึก GeoJSON ของปีนี้
    output_file = f"src/Geo-data/Era-Dataset/era_data_polygon_{year}.json"
    with open(output_file, 'w') as f:
        json.dump(geojson_data, f, indent=2)
    print(f"Finished Year {year}. Results saved to {output_file}")


#--------------------------------------------------------
# import geopandas as gpd
# import numpy as np
# from shapely.geometry import mapping
# import json
# from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py
# from gridcal import calculate_weighted_temperature  # ฟังก์ชันคำนวณค่าเฉลี่ยถ่วงน้ำหนัก

# # กำหนดช่วงปีที่ต้องการ
# start_year = 1901
# end_year = 1910

# # โหลดข้อมูล shapefile จังหวัด
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# for year in range(start_year, end_year + 1):
#     # โหลดข้อมูล Grid Cell GeoJSON ของปีนั้น
#     grid_file = f"src/Geo-data/Year-Dataset/data_grid_index_{year}.json"
#     grid_data = gpd.read_file(grid_file)

#     # เตรียมโครงสร้าง GeoJSON สำหรับบันทึกผลลัพธ์ของปีนั้น
#     geojson_data = {
#         "type": "FeatureCollection",
#         "features": []
#     }

#     # เริ่มคำนวณรายเดือน
#     for month in range(1, 13):
#         # เลือกข้อมูล Grid Cell สำหรับเดือนนี้
#         monthly_data = grid_data[grid_data['month'] == month]
#         print(f"Processing Year {year}, Month {month}: {len(monthly_data)} grid cells found")

#         # เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
#         for region in province_coord():
#             for province in region:
#                 name, geometry, region_name = province
#                 average_data, province_shape = calculate_weighted_temperature(name, shapefile, monthly_data)

#                 if average_data is not None and province_shape is not None:
#                     feature = {
#                         "type": "Feature",
#                         "geometry": mapping(geometry),
#                         "properties": {
#                             "name": name,
#                             "region": region_name,
#                             "month": month,
#                             "temperature": float(f"{average_data['temperature']:.2f}"),
#                             "dtr": float(f"{average_data['dtr']:.2f}"),
#                             "pre": float(f"{average_data['pre']:.2f}"),
#                             "tmin": float(f"{average_data['tmin']:.2f}"),
#                             "tmax": float(f"{average_data['tmax']:.2f}"),
#                         }
#                     }
#                     geojson_data["features"].append(feature)

#                     # พิมพ์ผลลัพธ์ที่ถูกบันทึก
#                     print(f"  Province: {name} | Region: {region_name} | Month: {month} | "
#                           f"Temperature: {average_data['temperature']:.2f} | DTR: {average_data['dtr']:.2f}")
#                 else:
#                     # พิมพ์แจ้งเตือนถ้าข้อมูลหายไป
#                     print(f"  WARNING: No data for Province: {name} | Region: {region_name} | Month: {month}")

#     # บันทึก GeoJSON ของปีนี้
#     output_file = f"src/Geo-data/Year-Dataset/data_index_polygon_{year}.json"
#     with open(output_file, 'w') as f:
#         json.dump(geojson_data, f, indent=2)
#     print(f"Finished Year {year}. Results saved to {output_file}")
#----------------------------------------------------------------------------------------------------------

# import geopandas as gpd
# import numpy as np
# from shapely.geometry import mapping
# import json
# from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py
# from gridcal import calculate_weighted_temperature  # ฟังก์ชันคำนวณค่าเฉลี่ยถ่วงน้ำหนัก

# # กำหนดช่วงปีที่ต้องการ
# start_year = 1901
# end_year = 1905

# # โหลดข้อมูล shapefile จังหวัด
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# for year in range(start_year, end_year + 1):
#     # โหลดข้อมูล Grid Cell GeoJSON ของปีนั้น
#     grid_file = f"src/Geo-data/Year-Dataset/data_grid_index_{year}.json"
#     grid_data = gpd.read_file(grid_file)

#     # เตรียมโครงสร้าง GeoJSON สำหรับบันทึกผลลัพธ์ของปีนั้น
#     geojson_data = {
#         "type": "FeatureCollection",
#         "features": []
#     }

#     count = 0

#     # เริ่มคำนวณรายเดือน
#     for month in range(1, 13):
#         # เลือกข้อมูล Grid Cell สำหรับเดือนนี้
#         monthly_data = grid_data[grid_data['month'] == month]
#         print(f"Processing Year {year}, Month {month}: {len(monthly_data)} entries")

#         # เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
#         for region in province_coord():
#             for province in region:
#                  name, geometry, region_name = province
#                  average_data, province_shape = calculate_weighted_temperature(name, shapefile, monthly_data)

#             if average_data is not None and province_shape is not None:
#                 feature = {
#                     "type": "Feature",
#                     "geometry": mapping(geometry),
#                     "properties": {
#                         "name": name,
#                         "region": region_name,
#                         "month": month,
#                         # เพิ่มตัวแปรใหม่ใน GeoJSON
#                         "temperature": float(f"{average_data['temperature']:.2f}"),
#                         "dtr": float(f"{average_data['dtr']:.2f}"),
#                         "pre": float(f"{average_data['pre']:.2f}"),
#                         "tmin": float(f"{average_data['tmin']:.2f}"),
#                         "tmax": float(f"{average_data['tmax']:.2f}"),
#                     }
#                 }
#                 geojson_data["features"].append(feature)
#         # for region in province_coord():  # ดึงข้อมูลจังหวัดในแต่ละภาค
#         #     for province in region:
#         #         name, geometry, region_name = province
#         #         avg_temp, province_shape = calculate_weighted_temperature(name, shapefile, monthly_data)

#         #         # ตรวจสอบว่าค่าคำนวณเสร็จสิ้นและไม่ใช่ค่า None
#         #         if avg_temp is not None and province_shape is not None:
#         #             # สร้างฟีเจอร์สำหรับจังหวัดและเดือนนี้
#         #             feature = {
#         #                 "type": "Feature",
#         #                 "geometry": mapping(geometry),  # ใช้ mapping ของรูปทรงจังหวัดโดยตรง
#         #                 "properties": {
#         #                     "name": name,
#         #                     "temperature": float(f"{avg_temp:.2f}"),  # ค่าอุณหภูมิเฉลี่ยถ่วงน้ำหนัก
#         #                     "region": region_name,  # เพิ่มข้อมูลภูมิภาค
#         #                     "month": month  # เพิ่มข้อมูลเดือน
#         #                 }
#         #             }
#         #             geojson_data["features"].append(feature)

#                 # แสดงสถานะการคำนวณ
#                 #count += 1
#                 #print(f"{count}: Year {year}, Month {month}, Province: {name}, Avg Temp: {avg_temp:.3f}")

#     # บันทึกข้อมูล GeoJSON ของปีนั้นลงไฟล์
#     output_geojson_path = f"src/Geo-data/Year-Dataset/data_index_polygon_{year}.json"
#     with open(output_geojson_path, 'w', encoding='utf-8') as geojson_file:
#         json.dump(geojson_data, geojson_file, indent=2, ensure_ascii=False)

#     print(f"GeoJSON data for Year {year} saved successfully.")

#ss
# import xarray as xr
# import pandas as pd
# import json
# import geopandas as gpd
# import numpy as np
# from shapely.geometry import mapping
# from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py
# from gridcal import calculate_weighted_temperature

# data = gpd.read_file(f"C:/Users/konla/OneDrive/Desktop/Final_test/src/json_series/province_all_{year}.json")  # ข้อมูลทั้งหมดรวมทุกเดือน
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

#     geojson_data = {
#         "type": "FeatureCollection",
#         "features": []
#     }

#     count = 0

#     for month in range(1, 13):
        
#         monthly_data = data[data['month'] == month]
#         print(f"Processing data for Month {month}: {len(monthly_data)} entries")

#         # เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
#         for region in province_coord():  # ดึงข้อมูลจังหวัดในแต่ละภาค
#             for province in region:
#                 name, geometry, region_name = province
#                 avg_temp, province_shape = calculate_weighted_temperature(name, shapefile, monthly_data)

#                 if avg_temp is not None and province_shape is not None:
#                     feature = {
#                         "type": "Feature",
#                         "geometry": mapping(geometry), 
#                         "properties": {
#                             "name": name,
#                             "temperature": float(f"{avg_temp:.2f}"),  
#                             "region": region_name,
#                             "month": month  
#                         }
#                     }
#                     geojson_data["features"].append(feature)

#                 count += 1
#                 print(f"{count}: Month {month}, Province: {name}, Avg Temp: {avg_temp:.3f}")

#     output_geojson_path = f"C:/Users/konla/OneDrive/Desktop/Final_test/src/json_series/province_all_{year}.json"
#     with open(output_geojson_path, 'w', encoding='utf-8') as geojson_file:
#         json.dump(geojson_data, geojson_file, indent=2, ensure_ascii=False)

#     print("GeoJSON data saved successfully.")


# # ds = xr.open_dataset('./cru_ts4.08.1901.2023.tmp.dat.nc')
# ds = xr.open_dataset('src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc')

# def create_grid_polygon(lon_center, lat_center, lon_step, lat_step):
#     return [
#         [float(lon_center - lon_step / 2), float(lat_center - lat_step / 2)],  # มุมล่างซ้าย
#         [float(lon_center + lon_step / 2), float(lat_center - lat_step / 2)],  # มุมล่างขวา
#         [float(lon_center + lon_step / 2), float(lat_center + lat_step / 2)],  # มุมบนขวา
#         [float(lon_center - lon_step / 2), float(lat_center + lat_step / 2)],  # มุมบนซ้าย
#         [float(lon_center - lon_step / 2), float(lat_center - lat_step / 2)]   # ปิดกรอบ
#     ]
# # print(str(ds['time'].values[0])[0:4])
# # for i in range(0, 123):
# for i in range(0, 10):
#     year = 1901 + i
#     temp = ds.sel(lon=slice(96, 106), lat=slice(4, 21), time=str(year))

#     time_values = temp['time'].values
#     time_dates = pd.to_datetime(time_values)

#     lon = temp['lon'].values
#     lat = temp['lat'].values
#     lon_step = float(lon[1] - lon[0])
#     lat_step = float(lat[1] - lat[0])

#     features = []
#     for time_index, time in enumerate(time_dates):  
#         month = time.month
#         temp_in_month = temp.isel(time=time_index) 
#         temp_values = temp_in_month['tmp'].values 
        
#         for i, lon_value in enumerate(lon):
#             for j, lat_value in enumerate(lat):
#                 temperature = temp_values[j, i]  
#                 if not pd.isnull(temperature):
#                     grid_polygon = create_grid_polygon(lon_value, lat_value, lon_step, lat_step)
#                     features.append({
#                         "type": "Feature",
#                         "geometry": {
#                             "type": "Polygon",
#                             "coordinates": [grid_polygon]
#                         },
#                         "properties": {
#                             "temperature": float(temperature),  # แปลง float32 เป็น float
#                             "month": month  # เพิ่มข้อมูลเดือน
#                         }
#                     })

#     geojson_data = {
#         "type": "FeatureCollection",
#         "features": features
#     }
#     # output_file = f"C:/Users/konla/OneDrive/Desktop/Final_test/src/json_series/json_{str(times)[0:10]}.json"
#     output_file = f"C:/Users/konla/OneDrive/Desktop/Final_test/src/json_series/province_all_{year}.json"
#     with open(output_file, 'w', encoding='utf-8') as f:
#         json.dump(geojson_data, f, ensure_ascii=False, indent=4)

#     print(f"Save to location : {output_file}")

    # data = gpd.read_file(f"C:/Users/konla/OneDrive/Desktop/Final_test/src/json_series/province_all_{year}.json")  # ข้อมูลทั้งหมดรวมทุกเดือน
    # shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

    # geojson_data = {
    #     "type": "FeatureCollection",
    #     "features": []
    # }

    # count = 0

    # for month in range(1, 13):
        
    #     monthly_data = data[data['month'] == month]
    #     print(f"Processing data for Month {month}: {len(monthly_data)} entries")

    #     # เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
    #     for region in province_coord():  # ดึงข้อมูลจังหวัดในแต่ละภาค
    #         for province in region:
    #             name, geometry, region_name = province
    #             avg_temp, province_shape = calculate_weighted_temperature(name, shapefile, monthly_data)

    #             if avg_temp is not None and province_shape is not None:
    #                 feature = {
    #                     "type": "Feature",
    #                     "geometry": mapping(geometry), 
    #                     "properties": {
    #                         "name": name,
    #                         "temperature": float(f"{avg_temp:.2f}"),  
    #                         "region": region_name,
    #                         "month": month  
    #                     }
    #                 }
    #                 geojson_data["features"].append(feature)

    #             count += 1
    #             print(f"{count}: Month {month}, Province: {name}, Avg Temp: {avg_temp:.3f}")

    # output_geojson_path = f"C:/Users/konla/OneDrive/Desktop/Final_test/src/json_series/province_all_{year}.json"
    # with open(output_geojson_path, 'w', encoding='utf-8') as geojson_file:
    #     json.dump(geojson_data, geojson_file, indent=2, ensure_ascii=False)

    # print("GeoJSON data saved successfully.")

