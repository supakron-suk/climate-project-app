import cartopy.crs as ccrs
import matplotlib.pyplot as plt
import xarray as xr
import geopandas as gpd
import pandas as pd
from rasterstats import zonal_stats

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')

# แปลง 'time' ให้เป็น Datetime เพื่อกรองปีได้ง่ายขึ้น
ds['time'] = pd.to_datetime(ds['time'].values)

# เลือกข้อมูลเฉพาะปี 2000 ถึง 2005
data_filtered = ds.sel(time=slice('2000-01-01', '2005-12-31'))

# คำนวณค่าเฉลี่ยของ tmp สำหรับปี 2000 ถึง 2005
data_avg = data_filtered['tmp'].mean(dim='time')

# โหลด shapefile ของประเทศไทยจาก GeoPandas
gdf = gpd.read_file("src/shapefile/gadm41_THA_0.shp")

# แปลงข้อมูล NetCDF เป็นรูปแบบ DataFrame เพื่อให้ง่ายต่อการคำนวณ
data_avg_df = data_avg.to_dataframe().reset_index()

# ใช้ rasterstats เพื่อคำนวณค่าเฉลี่ยของอุณหภูมิในกริดที่ครอบคลุมประเทศไทย
stats = zonal_stats(gdf, data_avg_df, stats="mean")

# เพิ่มค่าเฉลี่ยอุณหภูมิที่คำนวณได้ลงใน GeoDataFrame ของประเทศไทย
gdf['mean_temp'] = [stat['mean'] for stat in stats]

# แสดงผลข้อมูลค่าเฉลี่ยของแต่ละกริด
print(gdf[['mean_temp']])

# สร้างแผนที่แสดงค่าเฉลี่ยอุณหภูมิ
fig, ax = plt.subplots(figsize=(10, 8), subplot_kw={'projection': ccrs.PlateCarree()})

# พล็อตแผนที่ของประเทศไทยพร้อมกับค่าเฉลี่ยของอุณหภูมิ
gdf.boundary.plot(ax=ax, edgecolor='black', linewidth=2)
gdf.plot(column='mean_temp', cmap='coolwarm', legend=True, ax=ax)

# กำหนดขอบเขตแผนที่ให้แสดงเฉพาะประเทศไทย
ax.set_extent([97.5, 105.5, 5.5, 20.5], crs=ccrs.PlateCarree())

# เพิ่มชื่อแผนที่
ax.set_title('Average Temperature in Thailand (2000-2005)', fontsize=16)

# แสดงผลแผนที่
plt.show()

