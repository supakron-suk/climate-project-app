import geopandas as gpd
import matplotlib.pyplot as plt
import seaborn as sns

# อ่านไฟล์ GeoJSON (ข้อมูล tmp)
gdf_tmp = gpd.read_file('src/Geo-data/output_tmp_2000.json')

# อ่านไฟล์ Shapefile (ข้อมูลขอบเขตของประเทศไทย)
gdf_shapefile = gpd.read_file('src/Geo-data/shapefile-lv1-thailand.json')  # ปรับ path ให้ตรงกับไฟล์ Shapefile ของคุณ

# กรองข้อมูล GeoDataFrame สำหรับประเทศไทย (ใช้พิกัดที่เหมาะสม)
# พิกัดของประเทศไทย (longitude: 97.5 - 105.5, latitude: 5 - 21)
gdf_tmp_thailand = gdf_tmp.cx[97.5:105.5, 5:21]
gdf_shapefile_thailand = gdf_shapefile.cx[97.5:105.5, 5:21]

# ใช้ฟังก์ชัน clip เพื่อคลิปข้อมูลใน gdf_tmp ให้อยู่ภายในขอบเขตของประเทศไทย
gdf_tmp_clipped = gdf_tmp_thailand.clip(gdf_shapefile_thailand)

# ตั้งค่ารูปแบบการแสดงผลสี
sns.set(style="whitegrid")

# สร้าง plot โดยใช้ geopandas
fig, ax = plt.subplots(figsize=(10, 10))

# Plot Shapefile (ขอบเขตของประเทศไทย)
gdf_shapefile_thailand.boundary.plot(ax=ax, edgecolor='black', linewidth=0.3)

# Plot GeoJSON (ข้อมูล tmp) โดยใช้สีตามค่า 'tmp'
gdf_tmp_clipped.plot(column='tmp', ax=ax, legend=True, cmap='jet', 
                     legend_kwds={'label': "Temperature (°C)", 'orientation': "horizontal"})

# แสดง plot
plt.title('Tmp Value year 2000 ')
plt.show()


# import cartopy.feature as cfeature
# import cartopy.crs as ccrs
# import matplotlib.pyplot as plt
# import xarray as xr
# import geopandas as gpd
# import pandas as pd
# import rioxarray  # ต้องติดตั้งด้วย pip install rioxarray

# # โหลด dataset สภาพอากาศ
# ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")
# data_var = ds.metpy.parse_cf('tmp')

# # ตั้งค่าให้ข้อมูล time เป็นรูปแบบ datetime
# ds['time'] = pd.to_datetime(ds['time'].values)

# # เลือกปีที่ต้องการ
# year = 2000  
# temp = ds.sel(lon=slice(96, 106), lat=slice(5.5, 20.5), time=str(year))

# # คำนวณค่าเฉลี่ยของข้อมูลอุณหภูมิ
# data_avg = temp['tmp'].mean(dim='time')

# # โหลดข้อมูล shapefile ของประเทศไทย
# gdf = gpd.read_file("src/Geo-data/thailand-Geo.json")

# # สร้าง MultiPolygon ของประเทศไทยจาก shapefile
# thailand_shape = gdf.geometry.unary_union  # unary_union จะรวมทุก polygon เข้าด้วยกัน

# # ใช้ rioxarray เพื่อจัดการกับข้อมูลพิกัด lat/lon และตัดข้อมูลตาม shapefile
# data_avg.rio.set_spatial_dims(x_dim="lon", y_dim="lat", inplace=True)  # ระบุว่าใช้ lat/lon เป็นพิกัด
# data_avg.rio.write_crs("EPSG:4326", inplace=True)  # กำหนด CRS ให้ตรงกับ shapefile (WGS84)

# # ตัดข้อมูลอุณหภูมิที่เฉพาะส่วนที่อยู่ในประเทศไทย
# data_avg_masked = data_avg.rio.clip([thailand_shape], ds.rio.crs)

# # สร้างแผนที่แสดงข้อมูลอุณหภูมิในประเทศไทย
# fig, ax = plt.subplots(figsize=(10, 8), subplot_kw={'projection': ccrs.PlateCarree()})
# sc = ax.pcolormesh(data_avg_masked['lon'], data_avg_masked['lat'], data_avg_masked, cmap='jet')

# # ตั้งค่า extent ของแผนที่ตามขอบเขต lat/lon ที่สนใจ
# ax.set_extent([96, 106, 5.5, 20.5], crs=ccrs.PlateCarree())

# # เพิ่มขอบเขตของประเทศไทยลงในแผนที่
# gdf.boundary.plot(ax=ax, edgecolor='black', linewidth=2)

# # ตั้งค่า title
# ax.set_title(f'Average Temperature ({year})', fontsize=14)

# # เพิ่ม gridline บนแผนที่
# gl = ax.gridlines(draw_labels=True, alpha=0.5)
# gl.top_labels = False
# gl.right_labels = False

# # เพิ่ม color bar แสดงค่าอุณหภูมิ
# cbar = fig.colorbar(sc, ax=ax, orientation='vertical', fraction=0.05, pad=0.1)
# cbar.set_label('Temperature (°C)')

# plt.tight_layout()

# # แสดงแผนที่
# plt.show()











