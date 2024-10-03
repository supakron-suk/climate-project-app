import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.affinity import translate

# โหลด GeoJSON
geojson_file = "src/Geo-data/test_temperature_thailand_2000.json"
gdf = gpd.read_file(geojson_file)

# ตรวจสอบข้อมูล
print(gdf.head())
print(gdf.geometry.is_empty.sum())  # ตรวจสอบว่ามีพอยต์ว่างอยู่หรือไม่

# โหลด shapefile
#shapefile_path = "src/shapefile/gadm41_THA_0.shp"  # เปลี่ยนเส้นทางให้ตรงกับไฟล์ shapefile ของคุณ
#shapefile = gpd.read_file(shapefile_path)

# ย้าย shapefile ตามที่ต้องการ (ตัวอย่างการย้าย 0.5 องศาในทิศตะวันออกและ 0.5 องศาในทิศเหนือ)
#shapefile = shapefile.translate(xoff=0.2, yoff=0.2)

# สร้างแผนที่
fig, ax = plt.subplots(figsize=(13, 11))

# วาดข้อมูลจาก GeoJSON
gdf.plot(column='temperature', ax=ax, legend=True, cmap='jet', markersize=50, alpha=0.7)

# วาด shapefile ลงในแผนที่
#shapefile.plot(ax=ax, edgecolor='black', facecolor='none', linewidth=0.5)

# เพิ่มกริดลงในแผนที่
ax.grid(color='gray', linestyle='--', linewidth=0.5)

# กำหนดขอบเขตแผนที่ให้แสดงเฉพาะประเทศไทย
ax.set_xlim([97.5, 106.5])
ax.set_ylim([5.5, 21.5])
ax.set_title(' Thailand Temp Heatmap (2000)', fontsize=14)

# แสดงผล
plt.tight_layout()
plt.show()
