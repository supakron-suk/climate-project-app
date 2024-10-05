import geopandas as gpd
import matplotlib.pyplot as plt
from pyproj import CRS
from dbfread import DBF

# เปิดไฟล์ Shapefile (ใส่ path ของ Shapefile ที่คุณมี)
shapefile_path = "src/shapefile/gadm41_THA_0.shp"
gdf = gpd.read_file(shapefile_path)


print(gdf.head())

# print("----------------ข้อมูล geometry----------------")
# print(gdf.geometry)
# print("----------------attribute ที่เก็บใน .dbf----------------")
# print(gdf.columns)

output_geojson_path = "src/Geo-data/shapefile-thailand.json"
gdf.to_file(output_geojson_path, driver="GeoJSON")

# # พล็อตแผนที่
# gdf.plot()
# plt.title("Thailand Shapefile")
# plt.show()

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