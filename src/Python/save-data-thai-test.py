import json
from shapely.geometry import Point
import cartopy.feature as cfeature
import cartopy.crs as ccrs
import matplotlib.pyplot as plt
import xarray as xr
import geopandas as gpd  # ใช้สำหรับจัดการ shapefile
import pandas as pd
import numpy as np

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')

# แปลง 'time' ให้เป็น Datetime เพื่อกรองปีได้ง่ายขึ้น
ds['time'] = pd.to_datetime(ds['time'].values)

# เลือกข้อมูลเฉพาะปี 2000
data_year = ds.sel(time='2000')

# คำนวณค่าเฉลี่ยสำหรับปีนั้น
data_avg = data_year['tmp'].mean(dim='time')

# สร้างกริดของข้อมูลที่ต้องการพล็อต
x = data_avg.lon
y = data_avg.lat

# โหลด shapefile ของประเทศไทยจาก GeoPandas
gdf = gpd.read_file("src/shapefile/gadm41_THA_0.shp")

# สร้าง mask จาก shapefile
# ขยายพื้นที่ของ mask โดยใช้ buffer() เพื่อรวมพื้นที่ขอบของประเทศไทย
buffer_distance = 0.1  # ระยะห่างในการขยายขอบประเทศ (ปรับได้ตามต้องการ)
thailand_mask = gdf.geometry.unary_union.buffer(buffer_distance)

# ใช้ GeoPandas เพื่อตัดข้อมูลที่อยู่นอกประเทศไทย
lon2d, lat2d = np.meshgrid(x, y)
coords = np.vstack([lon2d.ravel(), lat2d.ravel()]).T
points = gpd.GeoDataFrame(geometry=gpd.points_from_xy(coords[:, 0], coords[:, 1]))

# ตรวจสอบว่าแต่ละพิกัดอยู่ในประเทศไทยหรือไม่
mask = points.within(thailand_mask).values.reshape(lon2d.shape)

# ทำการกรองข้อมูลที่อยู่นอกประเทศไทย
data_avg = xr.where(mask, data_avg, np.nan)

# สร้างรายการพิกัดและค่าอุณหภูมิ
geojson_polygons = []
grid_size = 0.45  # กำหนดขนาดกริด (ปรับขนาดที่นี่)

for i in range(len(x)):
    for j in range(len(y)):
        temp_value = data_avg[j, i].item()  # ใช้ .item() เพื่อแปลงเป็น float
        if not np.isnan(temp_value):  # ตรวจสอบว่าไม่ใช่ NaN
            # คำนวณมุมทั้งสี่ของสี่เหลี่ยม
            lon = x[i].item()
            lat = y[j].item()
            geojson_polygons.append({
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [lon, lat],
                        [lon + grid_size, lat],
                        [lon + grid_size, lat + grid_size],
                        [lon, lat + grid_size],
                        [lon, lat]  # กลับมาที่จุดเริ่มต้น
                    ]]
                },
                'properties': {
                    'temperature': float(temp_value)  # แปลงเป็น float
                }
            })

# สร้าง GeoJSON
geojson_data = {
    'type': 'FeatureCollection',
    'features': geojson_polygons
}

# บันทึกลงไฟล์ .json สำหรับปี 2000
with open("src/Geo-data/test_temperature_thailand_2000.json", "w") as f:
    json.dump(geojson_data, f, indent=4)

# ปิด Dataset
ds.close()
