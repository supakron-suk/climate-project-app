import cartopy.feature as cfeature
import cartopy.crs as ccrs
import matplotlib.pyplot as plt
import xarray as xr
import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Point

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')

# แปลง 'time' ให้เป็น Datetime เพื่อกรองปีได้ง่ายขึ้น
ds['time'] = pd.to_datetime(ds['time'].values)

# เลือกปีที่ต้องการพล็อต
year = 2000  # คุณสามารถปรับปีนี้ได้

# เลือกข้อมูลเฉพาะพื้นที่ประเทศไทย และเฉพาะปีที่เลือก
temp = ds.sel(lon=slice(96, 106), lat=slice(5.5, 20.5), time=str(year))

# คำนวณค่าเฉลี่ยของข้อมูลในปีที่เลือก
data_avg = temp['tmp'].mean(dim='time')

# โหลด shapefile ของประเทศไทยจาก GeoPandas
gdf = gpd.read_file("src/Geo-data/shapefile-thailand.json") 

# # ขยายพื้นที่ของ mask โดยใช้ buffer() เพื่อรวมพื้นที่ขอบของประเทศไทย
# buffer_distance = 0.3  # ระยะห่างในการขยายขอบประเทศ (ปรับได้ตามต้องการ)
# thailand_shape = gdf.geometry.unary_union.buffer(buffer_distance)

# # ฟังก์ชันสำหรับสร้าง mask: ตรวจสอบว่า grid point อยู่ในหรืออยู่นอกประเทศไทย
# def create_mask(lon, lat, shape):
#     mask = np.zeros(lon.shape, dtype=bool)  # สร้าง mask เปล่าที่มีขนาดเท่ากับข้อมูล grid
#     for i in range(lon.shape[0]):
#         for j in range(lon.shape[1]):
#             point = Point(lon[i, j], lat[i, j])  # สร้างจุดจากพิกัด (lon, lat)
#             mask[i, j] = point.within(shape)  # ตรวจสอบว่าจุดอยู่ภายในประเทศไทยหรือไม่
#     return mask

# # สร้าง mask สำหรับข้อมูลใน NetCDF
# lon_2d, lat_2d = np.meshgrid(data_avg.lon, data_avg.lat)
# mask = create_mask(lon_2d, lat_2d, thailand_shape)

# # ใช้ mask เพื่อกรองข้อมูล
# data_avg_masked = np.where(mask, data_avg.values, np.nan)

# สร้างกริดของข้อมูลที่ต้องการพล็อต
x = data_avg.lon
y = data_avg.lat

# สร้าง figure สำหรับการพล็อต
fig, ax = plt.subplots(figsize=(10, 8), subplot_kw={'projection': ccrs.PlateCarree()})

# สร้าง pcolormesh เพื่อแสดง heatmap โดยใช้ข้อมูลที่ผ่านการ mask
mp = ax.pcolormesh(x, y, data_avg, cmap='jet', shading='auto', alpha=0.7)

# กำหนดขอบเขตแผนที่ให้แสดงเฉพาะประเทศไทย
ax.set_extent([96, 106, 5.5, 20.5], crs=ccrs.PlateCarree())

# เพิ่มชื่อแผนที่
ax.set_title(f'Average Temperature ({year})', fontsize=14)

# วาดเส้นกรอบประเทศไทยโดยใช้ GeoPandas
gdf.boundary.plot(ax=ax, edgecolor='black', linewidth=2)

# เพิ่มกริดไลน์
gl = ax.gridlines(draw_labels=True, alpha=0.5)
gl.top_labels = False
gl.right_labels = False

# เพิ่มแถบสี
cbar = fig.colorbar(mp, ax=ax, orientation='vertical', fraction=0.05, pad=0.1)
cbar.set_label('Temperature (°C)')

# จัดการ layout ให้อ่านง่าย
plt.tight_layout()

# แสดงผล
plt.show()








