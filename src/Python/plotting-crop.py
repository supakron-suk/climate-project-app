# import geopandas as gpd
# import matplotlib.pyplot as plt


# data = gpd.read_file('src/Geo-data/nc_to_json_2000_1.json')
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')


# korat_coord = shapefile[shapefile['NAME_1'] == 'Nakhon Ratchasima']
# print(korat_coord)


# grid_in_korat = data[data.geometry.intersects(korat_coord.geometry.unary_union)]
# print("grid in Korat:", grid_in_korat)


# fig, ax = plt.subplots(figsize=(10, 10))


# korat_coord.plot(ax=ax, color='white', edgecolor='black', alpha=1, label='Nakhon Ratchasima')


# grid_in_korat.plot(ax=ax, color='red', edgecolor='black', alpha=0.5, label='Grid in Korat')


# plt.title('Grid in Nakhon Ratchasima', fontsize=16)
# plt.xlabel('Longitude')
# plt.ylabel('Latitude')


# plt.legend()


# plt.show()


# import geopandas as gpd
# import matplotlib.pyplot as plt
# import seaborn as sns

# # โหลดข้อมูล GeoJSON
# data = gpd.read_file('src/Geo-data/Year-Dataset/data_index_polygon_1901.json')
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# # สร้าง plot
# fig, ax = plt.subplots(figsize=(10, 8))

# # แสดงผลข้อมูลพื้นที่ด้วย GeoPandas
# data.plot(column='temperature', cmap='jet', linewidth=0.5, ax=ax, edgecolor='black', legend=True)

# shapefile.geometry.boundary.plot(ax=ax, color='black', linewidth=1)

# # ปรับแต่งการแสดงผลเพิ่มเติม
# plt.title('Shapefile Geo in Grid Geo')
# plt.xlabel('Longitude')
# plt.ylabel('Latitude')

# plt.show()


# import geopandas as gpd
# import matplotlib.pyplot as plt
# import seaborn as sns

# # โหลดข้อมูล GeoJSON
# data = gpd.read_file('src/Geo-data/Year-Dataset/data_index_polygon_1901.json')
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# # กำหนด min, max ที่ต้องการ
# vmin, vmax = 18, 28  

# # สร้าง plot
# fig, ax = plt.subplots(figsize=(10, 8))

# # แสดงผลข้อมูลพื้นที่ด้วย GeoPandas พร้อมกำหนด vmin, vmax
# im = data.plot(
#     column='temperature', cmap='jet', linewidth=0.5, 
#     ax=ax, edgecolor='black', legend=True, vmin=vmin, vmax=vmax
# )

# # แสดงขอบเขตของ shapefile
# shapefile.geometry.boundary.plot(ax=ax, color='black', linewidth=0.5)

# # ปรับแต่งการแสดงผลเพิ่มเติม
# plt.title('Grid to Polygon Thailand')
# plt.xlabel('Longitude')
# plt.ylabel('Latitude')

# # ปรับแต่ง colorbar
# # cbar = im.get_figure().colorbar(im.get_children()[0], ax=ax)
# # cbar.set_label('Temperature (°C)')
# # cbar.set_ticks(range(vmin, vmax + 1))  # ปรับ tick ให้แสดงค่าจาก 20 - 28

# plt.show()




# import geopandas as gpd
# import matplotlib.pyplot as plt
# import seaborn as sns

# # อ่านไฟล์ GeoJSON (ข้อมูล tmp)
# gdf_tmp = gpd.read_file('src/Geo-data/output_tmp_2000.json')

# # อ่านไฟล์ Shapefile (ข้อมูลขอบเขตของประเทศไทย)
# gdf_shapefile = gpd.read_file('src/Geo-data/shapefile-lv1-thailand.json')  # ปรับ path ให้ตรงกับไฟล์ Shapefile ของคุณ

# # กรองข้อมูล GeoDataFrame สำหรับประเทศไทย (ใช้พิกัดที่เหมาะสม)
# # พิกัดของประเทศไทย (longitude: 97.5 - 105.5, latitude: 5 - 21)
# gdf_tmp_thailand = gdf_tmp.cx[97.5:105.5, 5:21]
# gdf_shapefile_thailand = gdf_shapefile.cx[97.5:106.5, 5:21]

# # ตั้งค่ารูปแบบการแสดงผลสี
# sns.set(style="whitegrid")

# # สร้าง plot โดยใช้ geopandas
# fig, ax = plt.subplots(figsize=(10, 18))

# # Plot Shapefile (ขอบเขตของประเทศไทย)
# gdf_shapefile_thailand.boundary.plot(ax=ax, edgecolor='black', linewidth=2)

# # Plot GeoJSON (ข้อมูล tmp) โดยใช้สีตามค่า 'tmp'
# gdf_tmp_thailand.plot(column='tmp', ax=ax, legend=True, cmap='jet', 
#                      legend_kwds={'label': "Temperature (°C)", 'orientation': "horizontal"})

# # แสดง plot
# plt.title('Temperature Heatmap for 2000 in Thailand with Shapefile Overlay')
# plt.show()

# import matplotlib.pyplot as plt
# import pandas as pd
# import geopandas as gpd
# import xarray as xr
# import cartopy.crs as ccrs

# # โหลดข้อมูล NetCDF
# ds = xr.open_dataset('src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc')
# data_var = ds.metpy.parse_cf('tmp')

# # แปลงคอลัมน์ 'time' ให้เป็นวันที่
# ds['time'] = pd.to_datetime(ds['time'].values)
# data_filtered = ds.sel(time=slice('2022-01-01', '2023-12-31'))

# # สร้าง plot และตั้งค่าพารามิเตอร์พื้นฐาน
# fig, ax = plt.subplots(figsize=(14, 12), subplot_kw={'projection': ccrs.PlateCarree()})
# year = 2023
# #temp = data_filtered.sel
# temp = data_filtered.sel(lon=slice(96, 106), lat=slice(4, 21), time=str(year))
# data_avg = temp['tmp'].mean(dim='time')

# x = temp.lon
# y = temp.lat

# # แสดงอุณหภูมิ
# mp = ax.imshow(data_avg, extent=(x.min(), x.max(), y.min(), y.max()), cmap='jet', origin='lower', interpolation='none')

# # ตั้งค่าแสดงผลของพิกัดในประเทศไทย
# ax.set_extent([96, 106, 4, 21], crs=ccrs.PlateCarree())

# # เพิ่ม gridlines ให้ชัดเจนขึ้น
# gl = ax.gridlines(draw_labels=True, alpha=0.5)  # ความโปร่งใสของเส้นกริด
# gl.top_labels = False
# gl.right_labels = False

# # วาดขอบเขตของประเทศไทย
# gdf = gpd.read_file("src/Geo-data/shapefile-lv1-thailand.json")
# gdf.geometry.boundary.plot(ax=ax, color='black', linewidth=1)  # ความหนาของเส้น boundary

# # สร้างช่องตาราง cell จาก grid ข้อมูล
# # ปรับขนาด cell โดยการคำนึงถึงค่าของ x, y
# # for i in range(len(x)-1):
# #     for j in range(len(y)-1):
# #         # ปรับเส้นกริดให้ตรงกับขนาดของข้อมูล
# #         ax.plot([x[i], x[i+1]], [y[j], y[j]], color='black', linewidth=0.5)  # เส้นแนวนอน
# #         ax.plot([x[i], x[i]], [y[j], y[j+1]], color='black', linewidth=0.5)  # เส้นแนวตั้ง

# plt.title('Average Temperature for Thailand in ' + str(year), fontsize=12)
# plt.colorbar(mp, label='Temperature (°C)')

# # แสดงผล
# plt.show()

# import geopandas as gpd
# import matplotlib.pyplot as plt

# # โหลดข้อมูล GeoJSON
# data = gpd.read_file('src/Geo-data/nc_to_json_2000_1.json')
# shapefile = gpd.read_file('src/Geo-data/shapefile-lv1-thailand.json')

# # เลือกจังหวัดที่ต้องการ (เช่น จังหวัด "Nakhon Ratchasima")
# korat_coord = shapefile[shapefile['NAME_1'] == 'Nakhon Ratchasima']
# print(korat_coord)

# # ตรวจสอบการตัดกันระหว่างกริดใน data กับเขตจังหวัดนครราชสีมา
# # ทำการกรองเฉพาะกริดที่ตัดกับจังหวัดนครราชสีมา
# grid_in_korat = data[data.geometry.intersects(korat_coord.geometry.unary_union)]
# print("grid in Korat:", grid_in_korat)

# # สร้างแผนที่
# fig, ax = plt.subplots(figsize=(10, 10))

# # Plot เส้นเขตจังหวัดนครราชสีมา
# korat_coord.plot(ax=ax, color='white', edgecolor='black', alpha=1, label='Nakhon Ratchasima')

# # Plot กริดที่ตัดกับจังหวัดนครราชสีมา
# grid_in_korat.plot(ax=ax, color='red', edgecolor='black', alpha=0.5, label='Grid in Korat')

# # ปรับแต่งการแสดงผลเพิ่มเติม
# plt.title('Grid in Nakhon Ratchasima', fontsize=16)
# plt.xlabel('Longitude')
# plt.ylabel('Latitude')

# # แสดงคำอธิบาย (legend)
# plt.legend()

# # แสดงผลแผนที่
# plt.show()

# import geopandas as gpd
# import matplotlib.pyplot as plt
# import numpy as np
# # นำเข้าฟังก์ชัน province_coord จากไฟล์ province.py
# from province import province_coord

# # เรียกใช้งานฟังก์ชัน province_coord เพื่อรับข้อมูลพิกัดจังหวัด
# region_coords = province_coord()

# # โหลดข้อมูล GeoJSON
# data = gpd.read_file('src/Geo-data/nc_to_json_2000_1.json')
# shapefile = gpd.read_file('src/Geo-data/shapefile-lv1-thailand.json')

# def calculate_weighted_temperature(province_name):
#     # เลือกจังหวัดที่ต้องการ
#     province_coord = shapefile[shapefile['NAME_1'] == province_name]
    
#     # ตรวจสอบว่ามีข้อมูลจังหวัดหรือไม่
#     if province_coord.empty:
#         print(f"ไม่พบข้อมูลสำหรับจังหวัด {province_name}")
#         return None
    
#     # กรองเฉพาะกริดที่ตัดกับเขตของจังหวัด
#     grid_in_province = data[data.geometry.intersects(province_coord.geometry.union_all())]
    
#     # พื้นที่ของจังหวัด
#     province_area = province_coord.geometry.union_all().area
    
#     # สร้างแผนที่
#     fig, ax = plt.subplots(figsize=(10, 10))
#     province_coord.plot(ax=ax, color='white', edgecolor='black', alpha=1, label=province_name)
#     grid_in_province.plot(ax=ax, color='red', edgecolor='black', alpha=0.5, label='Grid in ' + province_name)
    
#     # คำนวณสัดส่วนและอุณหภูมิเฉลี่ยแบบถ่วงน้ำหนัก
#     total_weighted_temp = 0
#     total_percentage = 0
    
#     for idx, grid in grid_in_province.iterrows():
#         # พื้นที่ที่ตัดกันกับเขตจังหวัด
#         intersection_area = grid.geometry.intersection(province_coord.geometry.union_all()).area
        
#         # คำนวณสัดส่วนการตัดกันของกริดที่เทียบกับพื้นที่จังหวัด
#         intersection_percentage_of_province = (intersection_area / province_area) * 100
        
#         # ค่า temperature ในกริด
#         temperature_value = grid['temperature']
        
#         temperature_value = np.nan_to_num(temperature_value, nan=0.0)
        
#         # คำนวณค่าอุณหภูมิเฉลี่ยแบบถ่วงน้ำหนัก
#         weighted_temp = temperature_value * intersection_percentage_of_province
#         total_weighted_temp += weighted_temp
#         total_percentage += intersection_percentage_of_province
        
#         # แสดงสัดส่วนของกริดที่ตัดกันบนแผนที่
#         x, y = grid.geometry.centroid.x, grid.geometry.centroid.y
#         ax.text(x, y, f'{intersection_percentage_of_province:.2f}%\nTemp: {temperature_value:.2f}', 
#                 fontsize=8, ha='center', color='black')
    
#     # คำนวณค่าอุณหภูมิเฉลี่ยถ่วงน้ำหนักสำหรับจังหวัด
#     average_temperature = total_weighted_temp / total_percentage if total_percentage != 0 else None
#     print(f'Average Temperature in {province_name} (Tmp Means): {average_temperature:.2f}' if average_temperature else "No temperature data available")
    
#     # # ปรับแต่งการแสดงผลเพิ่มเติม
#     # plt.title(f'Grid in {province_name}', fontsize=16)
#     # plt.xlabel('Longitude')
#     # plt.ylabel('Latitude')
#     # plt.legend()
#     # plt.show()

# # เรียกใช้ฟังก์ชัน calculate_weighted_temperature สำหรับทุกจังหวัด
# for region in region_coords:
#     for province in region:
#         name, geometry, region_name = province
#         calculate_weighted_temperature(name)
#หา grid ที่อยู่ในพิกัดของจังหวัดนี้
# import geopandas as gpd
# import matplotlib.pyplot as plt
# import numpy as np

# # โหลดข้อมูล GeoJSON
# data = gpd.read_file('src/Geo-data/nc_to_json_2001.json')
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')


# # เลือกจังหวัดที่ต้องการ (เช่น จังหวัด "Nakhon Ratchasima")
# korat_coord = shapefile[shapefile['NAME_1'] == 'Nakhon Ratchasima']

# # ตรวจสอบการตัดกันระหว่างกริดใน data กับเขตจังหวัดนครราชสีมา
# # ทำการกรองเฉพาะกริดที่ตัดกับจังหวัดนครราชสีมา
# grid_in_korat = data[data.geometry.intersects(korat_coord.geometry.union_all())]

# # พื้นที่ของจังหวัดนครราชสีมา
# korat_area = korat_coord.geometry.union_all().area
# print("korea area", korat_area)

# # สร้างแผนที่
# fig, ax = plt.subplots(figsize=(10, 10))

# # Plot เส้นเขตจังหวัดนครราชสีมา
# korat_coord.plot(ax=ax, color='white', edgecolor='black', alpha=1, label='Nakhon Ratchasima')

# # Plot กริดที่ตัดกับจังหวัดนครราชสีมา
# grid_in_korat.plot(ax=ax, color='red', edgecolor='black', alpha=0.5, label='Grid in Korat')
# total = 0
# #tmp_mean = 
# # คำนวณสัดส่วนของพื้นที่กริดที่ตัดกับจังหวัดนครราชสีมา
# for idx, grid in grid_in_korat.iterrows():
#     # พื้นที่ที่ตัดกันกับจังหวัดนครราชสีมา
#     intersection_area = grid.geometry.intersection(korat_coord.geometry.union_all()).area
#     #print("--", grid.geometry)
#     #print("-----------------")
#     #print(intersection_area,"---")
    
#     # คำนวณสัดส่วนการตัดกันของกริดที่เทียบกับพื้นที่จังหวัด
#     intersection_percentage_of_korat = (intersection_area / korat_area) * 100
    
#     # ค่า temperature ในกริด
#     temperature_value = grid['temperature']
    
    # ค่า tmp เฉลี่ย
    
    # แสดงสัดส่วนของกริดที่ตัดกันบนแผนที่
    # กำหนดตำแหน่งของข้อความบนกริด
# import geopandas as gpd
# import matplotlib.pyplot as plt
# import matplotlib.colors as mcolors
# import numpy as np

# # โหลดข้อมูล GeoJSON
# data = gpd.read_file('src/Geo-data/Era-Dataset/era_data_polygon_1960.json')
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# # กำหนดคอลัมน์ที่ต้องการ plot (ตัวอย่าง: tmin)
# column = 'tmax'

# # สีสำหรับการแสดงผล (เลือก colormap)
# colormap = 'turbo'

# # กำหนดช่วงค่าที่ต้องการใน color bar (30 ถึง 17)
# vmin, vmax = 17, 30
# norm = mcolors.Normalize(vmin=vmin, vmax=vmax)

# # สร้าง plot
# fig, ax = plt.subplots(1, 1, figsize=(10, 8))  # สร้าง subplot แค่ 1 รูป

# # แสดงผลข้อมูลพื้นที่
# data.plot(column=column, cmap=colormap, linewidth=0.5, ax=ax, edgecolor='black', legend=False, norm=norm)

# # เพิ่ม color bar
# sm = plt.cm.ScalarMappable(cmap=colormap, norm=norm)
# cbar = fig.colorbar(sm, ax=ax, orientation="vertical", ticks=np.arange(17, 31, 1))  # เพิ่มช่วง 17 ถึง 30
# cbar.ax.set_ylabel('Value (°C)', fontsize=9)  # ชื่อแกนของ color bar

# # แสดงพรมแดนของประเทศไทย
# shapefile.geometry.boundary.plot(ax=ax, color='black', linewidth=0.5)

# # ปรับแต่งการแสดงผลเพิ่มเติม
# ax.set_title(f'{column.capitalize()} Map Thailand', fontsize=12)
# ax.set_xlabel('Longitude', fontsize=9)
# ax.set_ylabel('Latitude', fontsize=9)

# # แสดงค่าเฉลี่ยของคอลัมน์ใน properties
# avg_value = data[column].mean()
# avg_text = f"Avg {column}: {avg_value:.2f}°C"
# ax.text(0.5, -0.1, avg_text, transform=ax.transAxes, fontsize=10, ha='center', va='center')

# # แสดงผล
# plt.tight_layout()
# plt.show()


import geopandas as gpd
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np

# โหลดข้อมูล GeoJSON
data = gpd.read_file('src/Geo-data/Era-Dataset/era_data_polygon_1960.json')
shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# กำหนดคอลัมน์ที่ต้องการ plot
columns = ['tmin', 'tmax', 'pre', 'txx', 'tnn']  
colormaps = {'tmin': 'turbo', 'tmax': 'turbo', 'pre': 'Blues', 'txx': 'turbo', 'tnn': 'turbo'}  

# กำหนดช่วง color bar ที่ต้องการ (ใช้เหมือนกันสำหรับทุก subplot)
vmin, vmax = 10, 35
pre_vmin, pre_vmax = 1, 10 # คำนวณช่วงของ pre

# สร้าง subplot (1 แถว x จำนวนคอลัมน์)
fig, axes = plt.subplots(1, len(columns), figsize=(18, 6))  # กำหนด subplot ตามจำนวนคอลัมน์
fig.suptitle('All Value in Properties in 1960 Year', fontsize=16)  # Header ของ plot

# Loop สำหรับสร้าง plot แต่ละค่า
for i, column in enumerate(columns):
    ax = axes[i]  # เลือก subplot

    # สร้าง normalize สำหรับค่าแต่ละคอลัมน์
    if column == 'pre':
        norm = mcolors.Normalize(vmin=pre_vmin, vmax=pre_vmax)  # กำหนดช่วงของ pre
    else:
        norm = mcolors.Normalize(vmin=vmin, vmax=vmax)

    # แสดงผลข้อมูลพื้นที่
    data.plot(column=column, cmap=colormaps.get(column, 'turbo'), linewidth=0.5, ax=ax, edgecolor='black', legend=False, norm=norm)

    # เพิ่ม color bar
    sm = plt.cm.ScalarMappable(cmap=colormaps.get(column, 'turbo'), norm=norm)
    cbar = fig.colorbar(sm, ax=ax, orientation="vertical", fraction=0.08, pad=0.04, ticks=np.linspace(norm.vmin, norm.vmax, 6))
    cbar.ax.set_ylabel('Value', fontsize=7)  # ชื่อแกนของ color bar
    cbar.ax.tick_params(labelsize=6)  # ปรับขนาดตัวเลขของ color bar

    # แสดงพรมแดนของประเทศไทย
    shapefile.geometry.boundary.plot(ax=ax, color='black', linewidth=0.5)

    # ปรับแต่งการแสดงผลเพิ่มเติม
    ax.set_title(f'{column.capitalize()} Value', fontsize=10)
    ax.set_xlabel('Longitude', fontsize=7)
    ax.set_ylabel('Latitude', fontsize=7)
    ax.tick_params(axis='both', which='major', labelsize=6)

# ปรับ layout ให้ subplot ไม่ทับกัน
plt.tight_layout(rect=[0, 0, 1, 0.95])
plt.show()







