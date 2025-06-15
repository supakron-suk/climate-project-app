# import cartopy.feature as cfeature
# import cartopy.crs as ccrs
# import matplotlib.pyplot as plt
# import xarray as xr
# import geopandas as gpd
# import pandas as pd
# import numpy as np
# from shapely.geometry import Point, Polygon, MultiPolygon, mapping
# import json
# from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py

# # เปิดไฟล์ NetCDF
# ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")
# data_var = ds.metpy.parse_cf('tmp')

# # แปลง 'time' เป็น Datetime
# ds['time'] = pd.to_datetime(ds['time'].values)

# # เลือกปีที่ต้องการ
# year = 2000

# # เลือกข้อมูลเฉพาะพื้นที่ประเทศไทย และเฉพาะปีที่เลือก
# temp = ds.sel(lon=slice(96, 106), lat=slice(5.5, 20.5), time=str(year))

# # คำนวณค่าเฉลี่ยของข้อมูลในปีที่เลือก
# data_avg = temp['tmp'].mean(dim='time')

# # โหลด shapefile ของประเทศไทย
# gdf = gpd.read_file("src/Geo-data/thailand-Geo.json")

# ######################## ทุกจังหวัด ###############################
# region_coord_shape = province_coord()  # ใช้ฟังก์ชันดึงข้อมูลพิกัดจาก province.py

# # สร้าง GeoJSON ในรูปแบบ FeatureCollection สำหรับแต่ละจังหวัด
# geojson_data = {
#     "type": "FeatureCollection",
#     "features": []
# }

# # ฟังก์ชันสำหรับสร้าง mask โดยใช้ Polygon
# def create_mask_with_polygon(lon, lat, polygon):
#     points = [Point(lon[i, j], lat[i, j]) for i in range(lon.shape[0]) for j in range(lon.shape[1])]
#     mask = np.array([polygon.contains(point) or polygon.touches(point) for point in points])
#     return mask.reshape(lon.shape)

# # สร้างกริดของพิกัด
# lon_2d, lat_2d = np.meshgrid(data_avg.lon, data_avg.lat)

# for province_group in region_coord_shape:
#     for province in province_group:
#         # ตรวจสอบว่า province เป็น tuple ที่มีชื่อและรูปทรง
#         if isinstance(province, tuple) and len(province) >= 2:
#             province_name, province_shape = province[0], province[1]
            
#             # ตรวจสอบว่า province_shape เป็น Polygon หรือ MultiPolygon
#             if isinstance(province_shape, Polygon):
#                 province_shape = MultiPolygon([province_shape])

#             # คำนวณค่าเฉลี่ยอุณหภูมิสำหรับจังหวัดนี้
#             province_mask = create_mask_with_polygon(lon_2d, lat_2d, province_shape)
#             province_data = data_avg.values[province_mask]

#             # ข้ามจังหวัดที่ไม่มีข้อมูล grid (ค่า NaN ทั้งหมด)
#             if np.isnan(province_data).all():
#                 continue
            
#             # หากมีข้อมูล grid ให้คำนวณค่าเฉลี่ย
#             province_mean_temp = np.nanmean(province_data)

#             # สร้างฟีเจอร์สำหรับจังหวัดนี้
#             feature = {
#                 "type": "Feature",
#                 "geometry": {
#                     "type": "MultiPolygon",
#                     "coordinates": mapping(province_shape)['coordinates']
#                 },
#                 "properties": {
#                     "name": province_name,
#                     "temperature": float(f"{province_mean_temp:.2f}")
#                 }
#             }

#             # เพิ่มฟีเจอร์เข้าไปใน GeoJSON data
#             geojson_data["features"].append(feature)

# # บันทึกข้อมูล GeoJSON ลงไฟล์
# output_geojson_path = "src/Geo-data/province_mean_temp_2000.json"
# with open(output_geojson_path, 'w') as geojson_file:
#     json.dump(geojson_data, geojson_file, indent=2)

# print("บันทึก GeoJSON เสร็จเรียบร้อยแล้ว")


# # แสดงแผนที่
# plt.show()
import geopandas as gpd
import numpy as np
from shapely.geometry import Point, Polygon, MultiPolygon, mapping
import json
from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py
from gridcal import calculate_weighted_temperature

# โหลดข้อมูล GeoJSON
data = gpd.read_file('src/Geo-data/nc_to_json_2000_1.json')
shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# สร้าง GeoJSON ในรูปแบบ FeatureCollection
geojson_data = {
    "type": "FeatureCollection",
    "features": []
}
count = 0
# เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
for region in province_coord():
    for province in region:
        name, geometry, region_name = province
        avg_temp, province_shape = calculate_weighted_temperature(name, shapefile, data)
        count = count+1
        print(f'{count}:province name: {name} average temp: {avg_temp:.3f}')
        

        
        
        
# def calculate_weighted_temperature(province_name):
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
#     average_temperature = total_weighted_temp / total_percentage if total_percentage != 0 else None
#     return average_temperature, province_coord.geometry

# เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
# for region in province_coord():
#     for province in region:
#         name, geometry, region_name = province
#         avg_temp, province_shape = calculate_weighted_temperature(name)
        
#         # ตรวจสอบว่าค่าคำนวณเสร็จสิ้นและไม่ใช่ค่า None
#         if avg_temp is not None:
#             # สร้างฟีเจอร์สำหรับจังหวัดนี้ โดยใช้ MultiPolygon สำหรับรูปทรง
#             feature = {
#                 "type": "Feature",
#                 "geometry": {
#                     "type": "MultiPolygon",
#                     "coordinates": mapping(province_shape.values[0])['coordinates']  # ใช้ mapping ของรูปทรงจังหวัด
#                 },
#                 "properties": {
#                     "name": name,
#                     "region": region_name,
#                     "temperature": float(f"{avg_temp:.2f}")  # ค่าอุณหภูมิเฉลี่ยถ่วงน้ำหนัก
#                 }
#             }
#             geojson_data["features"].append(feature)

# # บันทึกข้อมูล GeoJSON ลงไฟล์
# output_geojson_path = "src/Geo-data/province_mean_temp_2000.json"
# with open(output_geojson_path, 'w', encoding='utf-8') as geojson_file:
#     json.dump(geojson_data, geojson_file, indent=2, ensure_ascii=False)

# print("บันทึก GeoJSON เสร็จเรียบร้อยแล้ว")


