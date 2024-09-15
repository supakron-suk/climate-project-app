import geopandas as gpd
import matplotlib.pyplot as plt

# เปิดไฟล์ Shapefile (ใส่ path ของ Shapefile ที่คุณมี)
shapefile_path = "src/shapefile/gadm41_THA_0.shp"
gdf = gpd.read_file(shapefile_path)

# แสดงข้อมูลเบื้องต้น
print(gdf.head())

# พล็อตแผนที่
gdf.plot()
plt.title("Thailand Shapefile")
plt.show()
