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

# เลือกข้อมูลเฉพาะปี 2000 ถึง 2005
data_filtered = ds.sel(time=slice('2000-01-01', '2005-12-31'))

# โหลด shapefile ของประเทศไทยจาก GeoPandas
gdf = gpd.read_file("src/shapefile/gadm41_THA_0.shp")

# สร้าง mask จาก shapefile
# ขยายพื้นที่ของ mask โดยใช้ buffer() เพื่อรวมพื้นที่ขอบของประเทศไทย
buffer_distance = 0.1  # ระยะห่างในการขยายขอบประเทศ (ปรับได้ตามต้องการ)
thailand_mask = gdf.geometry.unary_union.buffer(buffer_distance)

# คำนวณค่าเฉลี่ยอุณหภูมิสำหรับปี 2000 ถึง 2005 ตาม grid
# คำนวณค่าเฉลี่ยรวมในแต่ละ grid จากหลายปี
data_avg = data_filtered['tmp'].groupby('time.year').mean(dim='time').mean(dim='year')
print(data_avg)


# สร้างกริดของข้อมูลที่ต้องการพล็อต
x = data_avg.lon
y = data_avg.lat

# ใช้ GeoPandas เพื่อตัดข้อมูลที่อยู่นอกประเทศไทย
lon2d, lat2d = np.meshgrid(x, y)
coords = np.vstack([lon2d.ravel(), lat2d.ravel()]).T
points = gpd.GeoDataFrame(geometry=gpd.points_from_xy(coords[:, 0], coords[:, 1]))

# ตรวจสอบว่าแต่ละพิกัดอยู่ในประเทศไทยหรือขอบพื้นที่ที่ขยาย
mask = points.within(thailand_mask).values.reshape(lon2d.shape)

# ทำการกรองข้อมูลที่อยู่นอกพื้นที่ (แต่ไม่ตัดขอบพื้นที่ออก)
data_avg = xr.where(mask, data_avg, np.nan)

# สร้าง figure และพล็อต heatmap สำหรับค่าเฉลี่ยของปี 2000-2005
fig, ax = plt.subplots(figsize=(10, 8), subplot_kw={'projection': ccrs.PlateCarree()})

# พล็อตแผนที่
mp = ax.imshow(data_avg, extent=(x.min(), x.max(), y.min(), y.max()), cmap='jet', origin='lower')

# กำหนดขอบเขตแผนที่ให้แสดงเฉพาะประเทศไทย
ax.set_extent([97.5, 105.5, 5.5, 20.5], crs=ccrs.PlateCarree())

# เพิ่มชื่อแผนที่
ax.set_title('Average Temperature (2000-2005)', fontsize=14)

# วาดเส้นกรอบประเทศไทยโดยใช้ GeoPandas
gdf.boundary.plot(ax=ax, edgecolor='black', linewidth=2)

# เพิ่มกริดไลน์
gl = ax.gridlines(draw_labels=True, alpha=0.5)
gl.top_labels = False
gl.right_labels = False

# เพิ่มแถบสี (Colorbar)
cbar = fig.colorbar(mp, ax=ax, orientation='vertical', fraction=0.05, pad=0.1)
cbar.set_label('Temperature (°C)')

# จัดการ layout ให้อ่านง่าย
plt.tight_layout()

# แสดงผล
plt.show()
