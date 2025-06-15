# import geopandas as gpd
# import matplotlib.pyplot as plt
# from province import province_coord  

# # โหลดข้อมูล GeoJSON
# data = gpd.read_file('src/Geo-data/Era-Dataset/era_data_grid_1960.json')
# shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# # รวม geometry ของทั้งประเทศ
# thailand_geom = shapefile.geometry.unary_union

# # กรอง grid ที่อยู่ภายในประเทศไทย
# grid_in_thailand = data[data.geometry.intersects(thailand_geom)]

# # ==== Plot 1: ทั้งประเทศ ====
# fig, ax = plt.subplots(figsize=(10, 10))
# shapefile.plot(ax=ax, color='white', edgecolor='black', alpha=1, label='Thailand Boundary')
# grid_in_thailand.plot(ax=ax, color='red', edgecolor='black', alpha=0.05, label='Grid in Thailand')
# plt.title('Grid inside Thailand', fontsize=16)
# plt.xlabel('Longitude')
# plt.ylabel('Latitude')
# plt.legend()
# plt.show()

# # ==== Plot 2: Subplots แยกภูมิภาค ====
# region_coords = province_coord()

# # เตรียม subplot: มี 6 ภูมิภาค → แถวละ 3 คอลัมน์
# fig, axs = plt.subplots(2, 3, figsize=(18, 12))
# axs = axs.flatten()

# region_names = ["North", "East", "Northeast", "Central", "South East", "South West",]

# for i, region in enumerate(region_coords):
#     # รวม geometry ของทั้ง region
#     region_geom = gpd.GeoSeries([g[1] for g in region]).unary_union
    
#     # หาว่า grid ไหนตัดกับ region นี้
#     grid_in_region = data[data.geometry.intersects(region_geom)]
    
#     # Plot
#     shapefile.plot(ax=axs[i], color='white', edgecolor='black')
#     grid_in_region.plot(ax=axs[i], color='red', edgecolor='black', alpha=0.05)
    
#     axs[i].set_title(f"Grid in {region_names[i]} Region")
#     axs[i].set_xlabel("Longitude")
#     axs[i].set_ylabel("Latitude")

# plt.tight_layout()
# plt.show()

import geopandas as gpd
import matplotlib.pyplot as plt

# โหลดข้อมูล GeoJSON
data = gpd.read_file('src/Geo-data/Era-Dataset/era_data_grid_1960.json')
shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# รวม geometry ของทั้งประเทศ
thailand_geom = shapefile.geometry.unary_union

# กรอง grid ที่อยู่ภายในประเทศไทย
grid_in_thailand = data[data.geometry.intersects(thailand_geom)]

# === แสดงจำนวน Grid ===
print(f"ประเทศไทยมี grid ที่ intersect กับขอบเขตประเทศทั้งหมด {len(grid_in_thailand)} จุด")

# ==== Plot: ประเทศไทย + grid ====
fig, ax = plt.subplots(figsize=(10, 10))
shapefile.plot(ax=ax, color='white', edgecolor='black', alpha=1, label='Thailand Boundary')
grid_in_thailand.plot(ax=ax, color='red', edgecolor='black', alpha=0.05, label='Grid in Thailand')
plt.title('Grid inside Thailand', fontsize=16)
plt.xlabel('Longitude')
plt.ylabel('Latitude')
plt.legend()
plt.show()
