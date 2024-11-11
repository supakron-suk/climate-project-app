# นำเข้าห้องสมุดที่จำเป็น
import geopandas as gpd
import matplotlib.pyplot as plt
import xarray as xr
import pandas as pd
import numpy as np
import matplotlib

# ตั้งค่าฟอนต์ให้เป็น Times New Roman
font = {'family': 'Times New Roman',
        'weight': 'bold',
        'size': 20}
matplotlib.rc('font', **font)

# กำหนดไฟล์ netCDF และตัวแปรที่ใช้
name_of_nc = "src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc"
name_of_variable = 'tmp'  # ตัวอย่างตัวแปรในไฟล์ netCDF
name_of_lon_var = 'lon'
name_of_lat_var = 'lat'
box_values = np.array([5.5, 20.5, 96, 106])  # ขอบเขตประเทศไทย
correct_360 = False

# อ่านข้อมูล netCDF
ds = xr.open_dataset(name_of_nc)
data_var = ds.metpy.parse_cf(name_of_variable)

# แปลง 'time' เป็น Datetime
ds['time'] = pd.to_datetime(ds['time'].values)

# เลือกปีที่ต้องการและเฉลี่ยข้อมูลรายปี
year = 2000
temp = ds.sel(lon=slice(box_values[2], box_values[3]), 
              lat=slice(box_values[0], box_values[1]), 
              time=str(year))
data_avg = temp[name_of_variable].mean(dim='time')

# โหลด shapefile ของประเทศไทยจาก GeoJSON และคำนวณ centroid
gdf = gpd.read_file("src/Geo-data/shapefile-lv1-thailand.json")
gdf['lat'] = gdf.centroid.y
gdf['lon'] = gdf.centroid.x

# แสดงข้อมูลตัวอย่างและชื่อคอลัมน์
print(gdf[['lat', 'lon']].head())
print("-" * 50)
print(gdf.columns)

# แสดงขอบเขต shapefile ของประเทศไทย
gdf.boundary.plot(color=None, edgecolor='k', linewidth=0.5, figsize=(10, 10))
plt.xlabel('Longitude')
plt.ylabel('Latitude')
plt.title('Boundaries of Thailand')
plt.show()








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

# เปิดไฟล์ NetCDF
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






