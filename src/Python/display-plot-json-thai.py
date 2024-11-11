import geopandas as gpd
import matplotlib.pyplot as plt

# โหลด GeoJSON
geojson_file = "src/Geo-data/province_mean_temp_test1.json"
gdf = gpd.read_file(geojson_file)

# ตรวจสอบและแสดงข้อมูล CRS
print("GeoJSON CRS:", gdf.crs)
print(gdf.head())
print(gdf.geometry.is_empty.sum())

# โหลด shapefile
shapefile_path = "src/Geo-data/province_mean_temp_all_provinces.json"
shapefile = gpd.read_file(shapefile_path)

# ตรวจสอบและแสดงข้อมูล CRS ของ shapefile
print("Shapefile CRS:", shapefile.crs)

# ตรวจสอบว่า CRS ของทั้งสองไฟล์ตรงกันหรือไม่ หากไม่ตรงให้แปลง CRS ของ shapefile ให้ตรงกับ GeoJSON
#if shapefile.crs != gdf.crs:
#    shapefile = shapefile.to_crs(gdf.crs)
#    print("Shapefile CRS converted to:", shapefile.crs)

# สร้างแผนที่
fig, ax = plt.subplots(figsize=(13, 11))

# วาดข้อมูลจาก GeoJSON
gdf.plot(column='temperature', ax=ax, legend=True, cmap='jet', markersize=50, alpha=0.7)

# วาด shapefile ลงในแผนที่
shapefile.plot(ax=ax, edgecolor='black', facecolor='none', linewidth=1)

# เพิ่มกริดลงในแผนที่
ax.grid(color='gray', linestyle='--', linewidth=0.5)

# กำหนดขอบเขตแผนที่ให้แสดงเฉพาะประเทศไทย
ax.set_xlim([97.5, 106.5])
ax.set_ylim([5.5, 21.5])
ax.set_title(' Thailand Temp 2000 ', fontsize=14)

# แสดงผล
plt.tight_layout()
plt.show()

