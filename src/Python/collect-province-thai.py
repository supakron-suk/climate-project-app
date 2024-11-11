import cartopy.feature as cfeature
import cartopy.crs as ccrs
import matplotlib.pyplot as plt
import xarray as xr
import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Point, Polygon, MultiPolygon, mapping
import json
from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')

# แปลง 'time' เป็น Datetime
ds['time'] = pd.to_datetime(ds['time'].values)

# เลือกปีที่ต้องการ
year = 2000

# เลือกข้อมูลเฉพาะพื้นที่ประเทศไทย และเฉพาะปีที่เลือก
temp = ds.sel(lon=slice(96, 106), lat=slice(5.5, 20.5), time=str(year))

# คำนวณค่าเฉลี่ยของข้อมูลในปีที่เลือก
data_avg = temp['tmp'].mean(dim='time')

# โหลด shapefile ของประเทศไทย
gdf = gpd.read_file("src/Geo-data/thailand-Geo.json")

######################## ทุกจังหวัด ###############################
region_coord_shape = province_coord()  # ใช้ฟังก์ชันดึงข้อมูลพิกัดจาก province.py

# สร้าง GeoJSON ในรูปแบบ FeatureCollection สำหรับแต่ละจังหวัด
geojson_data = {
    "type": "FeatureCollection",
    "features": []
}

# ฟังก์ชันสำหรับสร้าง mask โดยใช้ Polygon
def create_mask_with_polygon(lon, lat, polygon):
    points = [Point(lon[i, j], lat[i, j]) for i in range(lon.shape[0]) for j in range(lon.shape[1])]
    mask = np.array([polygon.contains(point) or polygon.touches(point) for point in points])
    return mask.reshape(lon.shape)

# สร้างกริดของพิกัด
lon_2d, lat_2d = np.meshgrid(data_avg.lon, data_avg.lat)

for province_group in region_coord_shape:
    for province in province_group:
        # ตรวจสอบว่า province เป็น tuple ที่มีชื่อและรูปทรง
        if isinstance(province, tuple) and len(province) >= 2:
            province_name, province_shape = province[0], province[1]
            
            # ตรวจสอบว่า province_shape เป็น Polygon หรือ MultiPolygon
            if isinstance(province_shape, Polygon):
                province_shape = MultiPolygon([province_shape])

            # คำนวณค่าเฉลี่ยอุณหภูมิสำหรับจังหวัดนี้
            province_mask = create_mask_with_polygon(lon_2d, lat_2d, province_shape)
            province_data = data_avg.values[province_mask]

            # ข้ามจังหวัดที่ไม่มีข้อมูล grid (ค่า NaN ทั้งหมด)
            if np.isnan(province_data).all():
                continue
            
            # หากมีข้อมูล grid ให้คำนวณค่าเฉลี่ย
            province_mean_temp = np.nanmean(province_data)

            # สร้างฟีเจอร์สำหรับจังหวัดนี้
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "MultiPolygon",
                    "coordinates": mapping(province_shape)['coordinates']
                },
                "properties": {
                    "name": province_name,
                    "temperature": float(f"{province_mean_temp:.2f}")
                }
            }

            # เพิ่มฟีเจอร์เข้าไปใน GeoJSON data
            geojson_data["features"].append(feature)

# บันทึกข้อมูล GeoJSON ลงไฟล์
output_geojson_path = "src/Geo-data/province_mean_temp_2000.json"
with open(output_geojson_path, 'w') as geojson_file:
    json.dump(geojson_data, geojson_file, indent=2)

print("บันทึก GeoJSON เสร็จเรียบร้อยแล้ว")


# # แสดงผลแผนที่
# fig, ax = plt.subplots(figsize=(10, 8), subplot_kw={'projection': ccrs.PlateCarree()})

# # แสดงข้อมูลเป็น scatter plot 
# sc = ax.scatter(lon_2d[province_mask], lat_2d[province_mask], c=province_data, cmap='jet', s=20, edgecolor='black', alpha=0.7)

# # ตั้งขอบเขตของแผนที่ประเทศไทย
# ax.set_extent([96, 106, 5.5, 20.5], crs=ccrs.PlateCarree())

# # ตั้งชื่อแผนที่
# ax.set_title(f'Average Temperature ({year}) in Thailand', fontsize=14)

# # วาดเส้นกรอบประเทศไทยและขอบเขตจังหวัด
# gdf.boundary.plot(ax=ax, edgecolor='black', linewidth=2)

# # เพิ่ม gridline
# gl = ax.gridlines(draw_labels=True, alpha=0.5)
# gl.top_labels = False
# gl.right_labels = False

# # เพิ่มแถบสี
# cbar = fig.colorbar(sc, ax=ax, orientation='vertical', fraction=0.05, pad=0.1)
# cbar.set_label('Temperature (°C)')

# # จัด layout ให้อ่านง่าย
# plt.tight_layout()

# # แสดงแผนที่
# plt.show()

