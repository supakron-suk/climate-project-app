# import geopandas as gpd
# import matplotlib.pyplot as plt
# import seaborn as sns

# # โหลดข้อมูล GeoJSON
# data = gpd.read_file('src/Geo-data/nc_to_json_2001.json')
# # shapefile = gpd.read_file('../Geo-data/thailand-Geo.json')

# # สร้าง plot
# fig, ax = plt.subplots(figsize=(10, 8))

# # แสดงผลข้อมูลพื้นที่ด้วย GeoPandas
# data.plot(column='temperature', cmap='jet', linewidth=0.5, ax=ax, edgecolor='black', legend=True)

# # shapefile.geometry.boundary.plot(ax=ax, color='black', linewidth=1)

# # ปรับแต่งการแสดงผลเพิ่มเติม
# plt.title('Data grid Geometry')
# plt.xlabel('Longitude')
# plt.ylabel('Latitude')

# plt.show()



# import xarray as xr
# import matplotlib.pyplot as plt
# import cartopy.crs as ccrs
# import cartopy.feature as cfeature

# # เปิดไฟล์ NetCDF
# ds = xr.open_dataset("src/dataset-nc/TH_tmax_ERA5_day.1960-2022.nc")

# # กรองข้อมูลให้เลือกช่วงเวลาที่ต้องการ (เช่น ปี 1901-1910)
# # ในกรณีนี้ ค่าเฉลี่ยของข้อมูลทั้งหมด
# print(ds)


# สร้างกราฟแผนที่
# fig = plt.figure(figsize=(10, 6))
# ax = plt.axes(projection=ccrs.PlateCarree())

# # เพิ่มพื้นฐานแผนที่ (เช่น เส้นขอบทวีป)
# ax.add_feature(cfeature.COASTLINE)

# # สร้างแผนที่แสดงข้อมูล
# c = ax.pcolormesh(ds['lon'], ds['lat'], data_avg, cmap='viridis', transform=ccrs.PlateCarree())

# # เพิ่มแถบสี (color bar)
# plt.colorbar(c, ax=ax, label='tmp Day Frequency (days)')

# # ตั้งชื่อกราฟ
# plt.title("Average tmp Day Frequency (1901-1910)")

# # แสดงผล
# plt.show()


# import xarray as xr
import geopandas as gpd

gdf = gpd.read_file('src/Geo-data/Era-Dataset/era_data_grid_1960.json')


print(gdf)
# # เปิดไฟล์ NetCDF
# ds = xr.open_dataset("src/Python/prepare_dataset/dataset/tmin.day.ltm.1991-2020.nc")

# print(ds)




