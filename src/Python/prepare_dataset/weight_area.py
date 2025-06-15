# weight_area.py

import numpy as np
import geopandas as gpd
import matplotlib.pyplot as plt
import json
from shapely.geometry import Polygon
import matplotlib.colors as mcolors
import cartopy.crs as ccrs

def calculate_weighted_average(data, index="txx"):
    """
    รับ JSON dataset และ plot Grid Polygon โดยใช้ CRS และสีโทนที่เหมาะสม
    พร้อมแสดงค่าจาก indices ที่กำหนด (เช่น "txx")
    """
    try:
        # แปลง Grid Polygon จาก JSON เป็น GeoDataFrame
        grid_geometries = []
        property_values = []  # เก็บค่าของ properties

        for feature in data['features']:
            coords = feature['geometry']['coordinates']
            polygon = Polygon(coords[0])  # ใช้ Polygon จาก shapely
            grid_geometries.append(polygon)

            # ตรวจสอบว่า property ที่เราต้องการมีอยู่หรือไม่
            properties = feature['properties']
            value = properties.get(index, np.nan)  # ใช้ค่า NaN ถ้าไม่มี index
            property_values.append(value)

        # สร้าง GeoDataFrame
        grid_gdf = gpd.GeoDataFrame(geometry=grid_geometries, crs="EPSG:4326")

        # ใช้สี coolwarm ตามค่าข้อมูล
        cmap = plt.cm.get_cmap("coolwarm")
        norm = mcolors.Normalize(vmin=np.nanmin(property_values), vmax=np.nanmax(property_values))

        # ตั้งค่าการ plot
        fig, ax = plt.subplots(figsize=(8, 8), subplot_kw={'projection': ccrs.PlateCarree()})

        # Plot Grid Polygon
        grid_gdf.plot(ax=ax, color=cmap(norm(property_values)), alpha=0.7, edgecolor="black")

        # เพิ่ม Colorbar
        cbar = plt.colorbar(plt.cm.ScalarMappable(cmap=cmap, norm=norm), ax=ax, orientation="vertical")
        cbar.set_label(f"{index} Values", rotation=270, labelpad=15)

        # ตั้งชื่อแผนที่
        ax.set_title(f"Grid Data Visualization ({index})")
        ax.set_xlabel("Longitude")
        ax.set_ylabel("Latitude")

        plt.show()

    except Exception as e:
        return {"error": str(e)}



# import numpy as np
# import geopandas as gpd
# from tqdm import tqdm  # ใช้แสดง progress bar

# # โหลดข้อมูล GeoJSON ของประเทศไทย
# thailand_geo_path = "src/Geo-data/thailand-Geo.json"
# thailand_gdf = gpd.read_file(thailand_geo_path)

# def calculate_weighted_average(data):
#     """
#     คำนวณค่าเฉลี่ยถ่วงน้ำหนักของค่าต่างๆ จาก Grid ที่ตัดกับพื้นที่ของจังหวัดใน GeoJSON
#     และแสดง Progress Bar ระหว่างการคำนวณ

#     Parameters:
#     - data: ข้อมูล GeoJSON ที่มี Grid พร้อม properties

#     Returns:
#     - dict: Dictionary ที่เก็บค่า weighted average ของ indices ต่างๆ ในจังหวัดที่เลือก
#     """
#     try:
#         # เลือกจังหวัดจาก GeoJSON แบบสุ่ม
#         province_name = np.random.choice(thailand_gdf["NAME_1"].dropna().unique())

#         # ดึงขอบเขตของจังหวัดที่เลือก
#         province_coord = thailand_gdf[thailand_gdf['NAME_1'] == province_name]
#         if province_coord.empty:
#             raise ValueError(f"No data found for province: {province_name}")

#         province_geometry = province_coord.geometry.iloc[0]
#         province_area = province_geometry.area

#         total_weighted_values = {
#             "pre": 0, "tmin": 0, "tmax": 0,
#             "txx": 0, "tnn": 0, "rx1day": 0
#         }
#         total_percentage = 0

#         total_features = len(data['features'])  # จำนวน Grid ทั้งหมด

#         # ใช้ tqdm แสดงความคืบหน้าของการประมวลผล Grid
#         for feature in tqdm(data['features'], desc=f"Processing {province_name}", unit="grid"):
#             properties = feature['properties']
#             coordinates = feature['geometry']['coordinates']

#             # แปลงพิกัดของ grid เป็นจุด GeoDataFrame
#             grid_geometry = gpd.GeoDataFrame(
#                 geometry=gpd.points_from_xy([coordinates[0][0][0]], [coordinates[0][0][1]]),
#                 crs="EPSG:4326"
#             )

#             # ตรวจสอบว่า grid อยู่ในจังหวัดที่เลือกหรือไม่
#             if province_geometry.contains(grid_geometry.geometry.iloc[0]):
#                 intersection_area = grid_geometry.geometry.iloc[0].intersection(province_geometry).area
#                 intersection_percentage = (intersection_area / province_area) * 100  

#                 # คำนวณ weighted average ของแต่ละตัวแปร
#                 for key in total_weighted_values.keys():
#                     value = np.nan_to_num(properties.get(key, 0.0))
#                     total_weighted_values[key] += value * intersection_percentage

#                 total_percentage += intersection_percentage

#         if total_percentage == 0:
#             return {"province": province_name, "error": "No intersecting data found."}

#         # คำนวณค่าเฉลี่ยถ่วงน้ำหนัก
#         weighted_averages = {
#             key: total / total_percentage for key, total in total_weighted_values.items()
#         }

#         return {"province": province_name, "weighted_averages": weighted_averages}

#     except Exception as e:
#         return {"error": str(e)}


# import numpy as np
# import geopandas as gpd
# import random

# # โหลดข้อมูล GeoJSON ของประเทศไทยเป็น base 
# thailand_geo_path = "src/Geo-data/thailand-Geo.json"  
# thailand_gdf = gpd.read_file(thailand_geo_path)

# def calculate_weighted_average(data):
#     try:
#         #  สุ่ม 3 grid จากข้อมูลทั้งหมดใน features
#         sampled_features = random.sample(data['features'], 3)

#         print("\n--- Sampled Grid Indices ---")
#         for feature in sampled_features:
#             properties = feature['properties']  

#             print(f"Properties for the sampled grid:")
#             for key, value in properties.items():
#                 if isinstance(value, (int, float)):  
#                     print(f"{key}: {value:.2f}")

#             print("")  

#         # เลือกจังหวัดจาก GeoJSON
#         province_name = random.choice(thailand_gdf["NAME_1"].dropna().unique().tolist())

#         # แสดงชื่อจังหวัดที่เลือก
#         print(f"\n--- Selected Province: {province_name} ---")

#     except Exception as e:
#         raise ValueError(f"Error: {str(e)}")


# import numpy as np
# import geopandas as gpd
# import random

# # โหลดข้อมูล GeoJSON ของประเทศไทยเป็น base สำหรับคำนวณ
# thailand_geo_path = "src/Geo-data/thailand-Geo.json"  
# thailand_gdf = gpd.read_file(thailand_geo_path)

# def calculate_weighted_average(data):
#     try:
#         province_weighted_values = {}  # เก็บค่า weighted average ของแต่ละจังหวัด

#         for feature in data['features']:
#             properties = feature['properties']  # ดึงข้อมูล properties ทั้งหมด
#             coordinates = feature['geometry']['coordinates']  

#             # แปลงข้อมูลจุดให้เป็น GeoDataFrame
#             point_gdf = gpd.GeoDataFrame(geometry=gpd.points_from_xy([coordinates[0][0][0]], [coordinates[0][0][1]]), crs="EPSG:4326")

#             # หา province ที่จุดนั้นอยู่ใน shapefile
#             matched_province = thailand_gdf[thailand_gdf.contains(point_gdf.geometry.iloc[0])]

#             if not matched_province.empty:
#                 province_name = matched_province.iloc[0]['NAME_1']
#                 province_area = matched_province.iloc[0].geometry.area  

#                 # คำนวณพื้นที่ที่จุดอยู่ในจังหวัด
#                 intersection_area = point_gdf.geometry.iloc[0].intersection(matched_province.iloc[0].geometry).area
#                 intersection_percentage = (intersection_area / province_area) * 100  # เปลี่ยนพื้นที่เป็นเปอร์เซ็นต์

#                 if province_name not in province_weighted_values:
#                     province_weighted_values[province_name] = {}

#                 # คำนวณ weighted average สำหรับทุกตัวแปรใน properties
#                 for key, value in properties.items():
#                     if isinstance(value, (int, float)):  # ตรวจสอบว่าเป็นตัวเลข
#                         weighted_value = np.nan_to_num(value, nan=0.0) * intersection_percentage

#                         if key not in province_weighted_values[province_name]:
#                             province_weighted_values[province_name][key] = {"total_weighted": 0, "total_percentage": 0}

#                         province_weighted_values[province_name][key]["total_weighted"] += weighted_value
#                         province_weighted_values[province_name][key]["total_percentage"] += intersection_percentage

#         # คำนวณ weighted average ของทุกจังหวัดสำหรับทุกตัวแปร
#         weighted_averages = {}
#         for province, variables in province_weighted_values.items():
#             weighted_averages[province] = {}
#             for key, values in variables.items():
#                 if values["total_percentage"] > 0:
#                     weighted_averages[province][key] = values["total_weighted"] / values["total_percentage"]

#         # **สุ่ม 3-4 จังหวัด** เพื่อแสดงผลใน terminal
#         sampled_provinces = random.sample(list(weighted_averages.keys()), min(4, len(weighted_averages)))

#         print("\n--- Sampled Weighted Averages ---")
#         for province in sampled_provinces:
#             print(f"Province: {province}")
#             index_counter = 1  # ตัวแปรนับเพื่อแสดง index 1-8
#             for key, value in weighted_averages[province].items():
#                 print(f"{key}: {value:.2f}")
#                 index_counter += 1  # เพิ่มค่า index หลังจากแสดงแต่ละค่า

#             # ถ้าจำนวน index ที่ได้ไม่ถึง 8 ให้เติมค่าให้ครบ
#             while index_counter <= 8:
#                 print(f"index {index_counter}: 0.00")
#                 index_counter += 1

#             print("")  # เพิ่มบรรทัดว่างหลังจากแสดงค่าของแต่ละจังหวัด

#         return weighted_averages

#     except Exception as e:
#         raise ValueError(f"Error in calculating weighted average: {str(e)}")







# import numpy as np
# import geopandas as gpd
# import random

# # โหลดข้อมูล GeoJSON ของประเทศไทยเป็น base สำหรับคำนวณ
# thailand_geo_path = "src/Geo-data/thailand-Geo.json"  
# thailand_gdf = gpd.read_file(thailand_geo_path)

# def calculate_weighted_average(data):
#     try:
#         province_weighted_values = {}  # เก็บค่า weighted average ของแต่ละจังหวัด

#         for feature in data['features']:
#             properties = feature['properties']  # ดึงข้อมูล properties ทั้งหมด
#             coordinates = feature['geometry']['coordinates']  

#             # แปลงข้อมูลจุดให้เป็น GeoDataFrame
#             point_gdf = gpd.GeoDataFrame(geometry=gpd.points_from_xy([coordinates[0][0][0]], [coordinates[0][0][1]]), crs="EPSG:4326")

#             # หา province ที่จุดนั้นอยู่ใน shapefile
#             matched_province = thailand_gdf[thailand_gdf.contains(point_gdf.geometry.iloc[0])]

#             if not matched_province.empty:
#                 province_name = matched_province.iloc[0]['NAME_1']
#                 province_area = matched_province.iloc[0].geometry.area  

#                 # คำนวณพื้นที่ที่จุดอยู่ในจังหวัด
#                 intersection_area = point_gdf.geometry.iloc[0].intersection(matched_province.iloc[0].geometry).area
#                 intersection_percentage = (intersection_area / province_area) * 100  # เปลี่ยนพื้นที่เป็นเปอร์เซ็นต์

#                 if province_name not in province_weighted_values:
#                     province_weighted_values[province_name] = {}

#                 # คำนวณ weighted average สำหรับทุกตัวแปรใน properties
#                 for key, value in properties.items():
#                     if isinstance(value, (int, float)):  # ตรวจสอบว่าเป็นตัวเลข
#                         weighted_value = np.nan_to_num(value, nan=0.0) * intersection_percentage

#                         if key not in province_weighted_values[province_name]:
#                             province_weighted_values[province_name][key] = {"total_weighted": 0, "total_percentage": 0}

#                         province_weighted_values[province_name][key]["total_weighted"] += weighted_value
#                         province_weighted_values[province_name][key]["total_percentage"] += intersection_percentage

#         # คำนวณ weighted average ของทุกจังหวัดสำหรับทุกตัวแปร
#         weighted_averages = {}
#         for province, variables in province_weighted_values.items():
#             weighted_averages[province] = {}
#             for key, values in variables.items():
#                 if values["total_percentage"] > 0:
#                     weighted_averages[province][key] = values["total_weighted"] / values["total_percentage"]

#         # **สุ่ม 3 จังหวัด** เพื่อแสดงผลใน terminal
#         sampled_provinces = random.sample(list(weighted_averages.keys()), min(3, len(weighted_averages)))

#         print("\n--- Sampled Weighted Averages ---")
#         for province in sampled_provinces:
#             print(f"Province: {province}")
#             index_counter = 1  # ตัวแปรนับเพื่อแสดง index 1-8
#             for key, value in weighted_averages[province].items():
#                 print(f"index {index_counter}: {value:.2f}")
#                 index_counter += 1  # เพิ่มค่า index หลังจากแสดงแต่ละค่า

#             # ถ้าจำนวน index ที่ได้ไม่ถึง 8 ให้เติมค่าให้ครบ
#             while index_counter <= 8:
#                 print(f"index {index_counter}: 0.00")
#                 index_counter += 1

#             print("")  # เพิ่มบรรทัดว่างหลังจากแสดงค่าของแต่ละจังหวัด

#         return weighted_averages

#     except Exception as e:
#         raise ValueError(f"Error in calculating weighted average: {str(e)}")





