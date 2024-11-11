import geopandas as gpd
import matplotlib.pyplot as plt
from pyproj import CRS
from dbfread import DBF

# เปิดไฟล์ Shapefile (ใส่ path ของ Shapefile ที่คุณมี)
shapefile_path = "src/shapefile/gadm41_THA_1.shp"
gdf = gpd.read_file(shapefile_path)

print(gdf)
# # พล็อตแผนที่
gdf.geometry.boundary.plot( color=None,edgecolor='k',linewidth = 0.5, figsize=(20,20))
plt.title("Thailand Shapefile")
plt.show()



# # แสดงข้อมูลใน shapefile
# print("First 10 rows of the GeoDataFrame:")
# print(gdf.head(10))  # แสดง 10 แถวแรก

# # แสดงชื่อคอลัมน์ทั้งหมด
# print("\nColumns in the GeoDataFrame:")
# print(gdf.columns)

# # แสดงข้อมูลสถิติเบื้องต้น (เฉพาะคอลัมน์ที่เป็นตัวเลข)
# print("\nStatistics of numeric columns:")
# print(gdf.describe())

# # แสดงจำนวนแถวทั้งหมด
# print("\nTotal number of rows:")
# print(len(gdf))

# # แสดงระบบพิกัด (CRS) ของ shapefile
# print("\nCoordinate Reference System (CRS):")
# print(gdf.crs)

# # แสดงข้อมูลแต่ละคอลัมน์
# for column in gdf.columns:
#     print(f"\nUnique values in column '{column}':")
#     print(gdf[column].unique())


# print("----------------ข้อมูล geometry----------------")
# print(gdf.geometry)
# print("----------------attribute ที่เก็บใน .dbf----------------")
# print(gdf.columns)

#output_geojson_path = "src/shapefile/ThaiGrid.shp"
#gdf.to_file(output_geojson_path, driver="GeoJSON")

# # พล็อตแผนที่

#เปิดไฟล์ .prj
# with open('src/shapefile/gadm41_THA_0.prj', 'r') as prj_file:
#     prj_data = prj_file.read()

# # แปลงข้อมูลพิกัดเป็นรูปแบบอ่านง่าย
# crs = CRS.from_wkt(prj_data)
# print("----------------ข้อมูลจาก .prj----------------")
# print(crs)

# table = DBF('src/shapefile/gadm41_THA_0.dbf')
# print("----------------ข้อมูลจาก .dbf----------------")
# for record in table:
#     print(record)