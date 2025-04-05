import geopandas as gpd
import matplotlib.pyplot as plt
from province import province_coord  

# โหลดข้อมูล GeoJSON
data = gpd.read_file('src/Geo-data/Era-Dataset/era_data_grid_1960.json')
shapefile = gpd.read_file('src/Geo-data/thailand-Geo.json')

# รวม geometry ของทั้งประเทศ
thailand_geom = shapefile.geometry.unary_union

# กรอง grid ที่อยู่ภายในประเทศไทย
grid_in_thailand = data[data.geometry.intersects(thailand_geom)]

# ==== Plot 1: ทั้งประเทศ ====
fig, ax = plt.subplots(figsize=(10, 10))
shapefile.plot(ax=ax, color='white', edgecolor='black', alpha=1, label='Thailand Boundary')
grid_in_thailand.plot(ax=ax, color='red', edgecolor='black', alpha=0.05, label='Grid in Thailand')
plt.title('Grid Thailand', fontsize=16)
plt.xlabel('Longitude')
plt.ylabel('Latitude')
plt.legend()
plt.show()

# ==== Plot 2: Subplots แยกภูมิภาค ====
region_coords = province_coord()

# เตรียม subplot: มี 6 ภูมิภาค → แถวละ 3 คอลัมน์
fig, axs = plt.subplots(2, 3, figsize=(18, 12))
axs = axs.flatten()

region_names = ["North", "North East", "South", "Center", "East", "West"]

for i, region in enumerate(region_coords):
    # รวม geometry ของทั้ง region
    region_geom = gpd.GeoSeries([g[1] for g in region]).unary_union
    
    # หาว่า grid ไหนตัดกับ region นี้
    grid_in_region = data[data.geometry.intersects(region_geom)]
    
    # Plot
    shapefile.plot(ax=axs[i], color='white', edgecolor='black')
    grid_in_region.plot(ax=axs[i], color='red', edgecolor='black', alpha=0.05)
    
    axs[i].set_title(f"{region_names[i]}")

plt.tight_layout()
plt.show()

# import geopandas as gpd
# import json  # ใช้สำหรับแปลง JSON string เป็น dictionary

# # โหลด GeoJSON
# geojson_file = "src/Geo-data/Era-Dataset/1960/contry_data_1960.json"
# gdf = gpd.read_file(geojson_file)

# # ดึง geometry และข้อมูล climate
# geom = gdf.iloc[0].geometry
# annual = gdf.iloc[0]['annual']  # ดึงข้อมูล annual
# year = gdf.iloc[0]['year']

# # ตรวจสอบประเภทของ annual
# print("Type of annual:", type(annual))  # ตรวจสอบว่าเป็น string หรือ dictionary

# # ถ้า annual เป็น string, แปลงเป็น dictionary
# if isinstance(annual, str):
#     annual = json.loads(annual)  # แปลง JSON string เป็น dictionary

# # แสดงค่า annual ทั้งหมด
# print("Annual Data:", annual)

# # วนลูปผ่านทุกค่าใน annual และแสดงผล
# for key, value in annual.items():
#     print(f"Annual '{key}': {value}")


# import geopandas as gpd
# import json
# import matplotlib.pyplot as plt

# # โหลด GeoJSON
# geojson_file = "src/Geo-data/Era-Dataset/1960/contry_data_1960.json"
# gdf = gpd.read_file(geojson_file)

# # ดึง geometry และข้อมูล climate
# geom = gdf.iloc[0].geometry
# annual = gdf.iloc[0]['annual'] 
# monthly = gdf.iloc[0]['monthly']  
# year = gdf.iloc[0]['year']  

# # ตรวจสอบประเภทของ monthly
# print("Type of monthly:", type(monthly))  # ตรวจสอบว่าเป็น string หรือ dictionary

# # ถ้า monthly เป็น string, แปลงเป็น dictionary
# if isinstance(monthly, str):
#     monthly = json.loads(monthly)  # แปลง JSON string เป็น dictionary

# # แสดงข้อมูล monthly
# print("Monthly Data:", monthly)

# # เตรียมข้อมูลสำหรับ plot
# months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

# # สร้าง figure และ subplot 3 ตัว (แต่ละตัวแปรจะอยู่ในกราฟต่างหาก)
# fig, axes = plt.subplots(3, 1, figsize=(10, 12))

# # Plot สำหรับ Precipitation (Pre)
# axes[0].plot(months, monthly['pre'], label='Precipitation (Pre)', marker='o', color='b')
# axes[0].set_title('Monthly Precipitation (Pre)', fontsize=14)
# axes[0].set_xlabel('Month', fontsize=12)
# axes[0].set_ylabel('Precipitation (mm)', fontsize=12)
# axes[0].grid(True)

# # Plot สำหรับ Minimum Temperature (Tmin)
# axes[1].plot(months, monthly['tmin'], label='Minimum Temperature (Tmin)', marker='o', color='g')
# axes[1].set_title('Monthly Minimum Temperature (Tmin)', fontsize=14)
# axes[1].set_xlabel('Month', fontsize=12)
# axes[1].set_ylabel('Temperature (°C)', fontsize=12)
# axes[1].grid(True)

# # Plot สำหรับ Maximum Temperature (Tmax)
# axes[2].plot(months, monthly['tmax'], label='Maximum Temperature (Tmax)', marker='o', color='r')
# axes[2].set_title('Monthly Maximum Temperature (Tmax)', fontsize=14)
# axes[2].set_xlabel('Month', fontsize=12)
# axes[2].set_ylabel('Temperature (°C)', fontsize=12)
# axes[2].grid(True)

# # ปรับระยะห่างระหว่างกราฟ
# plt.tight_layout()

# # แสดงกราฟทั้งหมด
# plt.show()






