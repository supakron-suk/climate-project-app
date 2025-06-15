import xarray as xr
import geopandas as gpd
import numpy as np
from shapely.geometry import Point, Polygon, MultiPolygon
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import pandas as pd
from scipy.interpolate import griddata


# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')

# แปลง 'time' ให้เป็น Datetime เพื่อกรองปีได้ง่ายขึ้น
ds['time'] = pd.to_datetime(ds['time'].values)

# เลือกปีที่ต้องการพล็อต
year = 2000  # คุณสามารถปรับปีนี้ได้
temp = ds.sel(lon=slice(96, 106), lat=slice(5.5, 20.5), time=str(year))

# คำนวณค่าเฉลี่ยของข้อมูลในปีที่เลือก
data_avg = temp['tmp'].mean(dim='time')

# โหลด shapefile ของประเทศไทยจาก GeoPandas
gdf = gpd.read_file("src/Geo-data/shapefile-lv1-thailand.json") 

#------------จังหวัดของประเทศไทยใน shapefile----------------- 
amnat_charoen = gdf[gdf['NAME_1'] == 'Amnat Charoen']

# ตรวจสอบว่าพบข้อมูลหรือไม่
if not amnat_charoen.empty:
    # ดึงเฉพาะพิกัดของจังหวัดอำนาจเจริญ
    amnat_charoen_coords = amnat_charoen.geometry.iloc[0].__geo_interface__['coordinates']
    
    # สร้าง Polygon จากพิกัด
    if amnat_charoen.geometry.iloc[0].geom_type == 'Polygon':
        amnat_charoen_polygon = Polygon(amnat_charoen_coords[0])
    elif amnat_charoen.geometry.iloc[0].geom_type == 'MultiPolygon':
        amnat_charoen_polygon = Polygon(amnat_charoen_coords[0][0])  # ใช้ MultiPolygon แรก

else:
    print("ไม่พบจังหวัดอำนาจเจริญในไฟล์ GeoJSON")
#-------------------------------------------------------------------
# สร้าง grid points จากข้อมูล NetCDF
lons, lats = np.meshgrid(data_avg.lon.values, data_avg.lat.values)
points = np.array([Point(lon, lat) for lon, lat in zip(lons.flatten(), lats.flatten())])

# สร้าง GeoDataFrame จาก grid points
gdf_points = gpd.GeoDataFrame(geometry=points, crs=gdf.crs)
gdf_points['temperature'] = data_avg.values.flatten()

# ตรวจสอบจุดที่อยู่ภายในจังหวัดอำนาจเจริญ
gdf_points_in_amnat_charoen = gdf_points[gdf_points.geometry.apply(lambda geom: amnat_charoen_polygon.contains(geom))]
# พิมพ์พิกัด (latitude, longitude) ของจุดที่อยู่ในจังหวัดอำนาจเจริญ
for index, row in gdf_points_in_amnat_charoen.iterrows():
    print(f"Point {index}: Latitude: {row.geometry.y}, Longitude: {row.geometry.x}, Temperature: {row['temperature']}")


# จำนวนจุดข้อมูลที่อยู่ภายในจังหวัดอำนาจเจริญ
num_points_in_amnat_charoen = gdf_points_in_amnat_charoen.shape[0]
print(f"จำนวนจุดข้อมูลที่เป็น grid ภายในจังหวัดอำนาจเจริญ: {num_points_in_amnat_charoen}")

# สร้างแผนที่ heatmap จากข้อมูล grid ที่อยู่ภายใน shapefile
fig, ax = plt.subplots(figsize=(10, 8), subplot_kw={'projection': ccrs.PlateCarree()})

# พล็อต heatmap โดยใช้จุดที่อยู่ภายใน shapefile
sc = ax.scatter(
    gdf_points.geometry.x, 
    gdf_points.geometry.y, 
    c=gdf_points['temperature'], 
    cmap='jet', 
    s=10, 
    alpha=0.7
)

# วาดเส้นกรอบจังหวัดอำนาจเจริญ
#if not amnat_charoen.empty:
#    gpd.GeoSeries(amnat_charoen_polygon).plot(ax=ax, edgecolor='blue', linewidth=2, label='Amnat Charoen', alpha=0.5)

# วาดวงกลมรอบจุดข้อมูลที่อยู่ในจังหวัดอำนาจเจริญ
for point in gdf_points_in_amnat_charoen.geometry:
    circle = plt.Circle((point.x, point.y), radius=0.1, color='red', fill=False, linewidth=1)  # วาดวงกลมรอบจุด
    ax.add_artist(circle)

# กำหนดขอบเขตแผนที่ให้แสดงเฉพาะประเทศไทย
ax.set_extent([96, 106, 5.5, 20.5], crs=ccrs.PlateCarree())

# เพิ่มชื่อแผนที่
ax.set_title(f'Average Temperature in Amnat Charoen ({year})', fontsize=14)

# วาดเส้นกรอบประเทศไทยโดยใช้ GeoPandas
gdf.boundary.plot(ax=ax, edgecolor='black', linewidth=2)

# เพิ่มแถบสี
cbar = fig.colorbar(sc, ax=ax, orientation='vertical', fraction=0.05, pad=0.1)
cbar.set_label('Temperature (°C)')

# จัดการ layout ให้อ่านง่าย
plt.tight_layout()

# แสดงผล
plt.show()
 
