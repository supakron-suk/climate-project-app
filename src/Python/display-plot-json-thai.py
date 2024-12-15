

# import geopandas as gpd
# import matplotlib.pyplot as plt

# # โหลด GeoJSON
# geojson_file = "src/Geo-data/province_mean_temp_2000.json"
# gdf = gpd.read_file(geojson_file)

# # แสดงข้อมูล GeoJSON
# gdf.plot(figsize=(10, 10), edgecolor='black', color='lightblue')  # กำหนดให้กรอบของแต่ละจังหวัดเป็นสีดำและสีพื้นเป็นสีน้ำเงินอ่อน

# # ตั้งชื่อกราฟและแกน
# plt.title("Province Mean Temperature in 2000", fontsize=16)
# plt.xlabel("Longitude", fontsize=12)
# plt.ylabel("Latitude", fontsize=12)

# # แสดงแผนที่
# plt.show()
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# สร้างข้อมูลตัวอย่างที่มี 3 ปี
data = {
    "Year": [2001]*12 + [2002]*12 + [2003]*12 + [2004]*12 , 
    "Month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] * 4,
    "Temperature": [
        25.5, 26.0, 28.0, 30.5, 32.0, 33.5, 33.0, 32.5, 31.0, 29.5, 27.0, 26.0,  # ปี 2001
        25.0, 26.5, 27.5, 30.0, 31.5, 33.0, 32.5, 32.0, 30.5, 29.0, 27.5, 26.5,  # ปี 2002
        24.5, 26.2, 28.5, 29.8, 31.0, 32.8, 32.3, 31.7, 30.2, 28.8, 27.2, 26.2,
        27.2, 25.6, 30.5, 31.7, 32.1, 34.5, 33.5, 31.0, 30.9, 28.1, 26.5, 25.2,# ปี 2003
    ],
}

# สร้าง DataFrame
df = pd.DataFrame(data)

# กำหนดลำดับของเดือน
month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
df["Month"] = pd.Categorical(df["Month"], categories=month_order, ordered=True)

# คำนวณค่าเฉลี่ยอุณหภูมิในแต่ละเดือน โดยการใช้ groupby ตาม 'Month' และคำนวณค่าเฉลี่ย
monthly_avg = df.groupby("Month")["Temperature"].mean()

# แสดงผลลัพธ์
print(monthly_avg)

# ดูข้อมูลที่ใช้ในแต่ละเดือน
monthly_data = df.groupby("Month")["Temperature"].apply(list)

# แสดงข้อมูลที่ใช้สำหรับการคำนวณค่าเฉลี่ยในแต่ละเดือน
print(monthly_data)


# แสดงกราฟ Seasonal Cycle
# plt.figure(figsize=(10, 6))
# plt.plot(monthly_avg.index, monthly_avg.values, marker='o', label='Average Monthly Temperature')

# # แสดงข้อมูลการเปลี่ยนแปลงอุณหภูมิ
# plt.title("Seasonal Cycle of Temperature (Average for Each Month)", fontsize=16)
# plt.xlabel("Month", fontsize=14)
# plt.ylabel("Temperature (°C)", fontsize=14)
# plt.grid(True, linestyle='--', alpha=0.7)
# plt.xticks(rotation=45)
# plt.legend()
# plt.show()






# # ตรวจสอบและแสดงข้อมูล CRS
# print("GeoJSON CRS:", gdf.crs)
# print(gdf.head())
# print(gdf.geometry.is_empty.sum())

# # โหลด shapefile
# shapefile_path = "src/Geo-data/province_mean_temp_all_provinces.json"
# shapefile = gpd.read_file(shapefile_path)

# # ตรวจสอบและแสดงข้อมูล CRS ของ shapefile
# print("Shapefile CRS:", shapefile.crs)

# # ตรวจสอบว่า CRS ของทั้งสองไฟล์ตรงกันหรือไม่ หากไม่ตรงให้แปลง CRS ของ shapefile ให้ตรงกับ GeoJSON
# #if shapefile.crs != gdf.crs:
# #    shapefile = shapefile.to_crs(gdf.crs)
# #    print("Shapefile CRS converted to:", shapefile.crs)

# # สร้างแผนที่
#fig, ax = plt.subplots(figsize=(13, 11))

# # วาดข้อมูลจาก GeoJSON
#gdf.plot(column='temperature', ax=ax, legend=True, cmap='jet', markersize=50, alpha=0.7)

# # วาด shapefile ลงในแผนที่
# shapefile.plot(ax=ax, edgecolor='black', facecolor='none', linewidth=1)

# # เพิ่มกริดลงในแผนที่
# ax.grid(color='gray', linestyle='--', linewidth=0.5)

# # กำหนดขอบเขตแผนที่ให้แสดงเฉพาะประเทศไทย
# ax.set_xlim([97.5, 106.5])
# ax.set_ylim([5.5, 21.5])
# ax.set_title(' Thailand Temp 2000 ', fontsize=14)

# แสดงผล
#plt.tight_layout()
#plt.show()

