import cartopy.feature as cfeature
import cartopy.crs as ccrs
import matplotlib.pyplot as plt
import xarray as xr
import geopandas as gpd
import pandas as pd
import numpy as np


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