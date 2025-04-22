# import geopandas as gpd
# import matplotlib.pyplot as plt

# # โหลดไฟล์ GeoJSON ที่สร้างไว้
# region_gdf = gpd.read_file("src/Geo-data/regions_simple_manual.json")

# # พล็อตแบบรวมทุก Region ใช้สีตามชื่อ region
# fig, ax = plt.subplots(figsize=(10, 12))
# region_gdf.plot(ax=ax, column="region", cmap="tab20", edgecolor="black", legend=True)

# # ใส่ label ของแต่ละ region (centroid)
# for idx, row in region_gdf.iterrows():
#     centroid = row.geometry.centroid
#     ax.text(centroid.x, centroid.y, row["region"], fontsize=9, ha='center', va='center', color='black')

# plt.title("Thailand Regions (From GeoJSON)", fontsize=16)
# plt.axis("off")
# plt.tight_layout()
# plt.show()


# import geopandas as gpd
# import matplotlib.pyplot as plt
# from shapely.geometry import MultiPolygon, Polygon, mapping
# import json
# import os

# # โหลด shapefile ของประเทศไทย
# gdf = gpd.read_file("src/Geo-data/thailand-Geo.json")

# # กำหนดกลุ่มจังหวัดในแต่ละภูมิภาค
# regions = {
#     "North": [
#         "Kamphaeng Phet", "Chiang Rai", "Chiang Mai", "Tak", "Nan", "Phayao",
#         "Phichit", "Phitsanulok", "Phetchabun", "Phrae", "Mae Hong Son",
#         "Lampang", "Lamphun", "Sukhothai", "Uttaradit"
#     ],
#     "East": [
#         "Chanthaburi", "Chachoengsao", "Chon Buri", "Trat", "Nakhon Nayok",
#         "Prachin Buri", "Rayong", "Sa Kaeo"
#     ],
#     "Northeast": [
#         "Kalasin", "Khon Kaen", "Chaiyaphum", "Nakhon Phanom", "Nakhon Ratchasima",
#         "Bueng Kan", "Buri Ram", "Maha Sarakham", "Mukdahan", "Yasothon",
#         "Roi Et", "Loei", "Si Sa Ket", "Sakon Nakhon", "Surin",
#         "Nong Khai", "Nong Bua Lam Phu", "Udon Thani", "Ubon Ratchathani", "Amnat Charoen"
#     ],
#     "Central": [
#         "Bangkok Metropolis", "Kanchanaburi", "Chai Nat", "Nakhon Pathom",
#         "Nakhon Sawan", "Nonthaburi", "Pathum Thani", "Phra Nakhon Si Ayutthaya",
#         "Ratchaburi", "Lop Buri", "Samut Prakan", "Samut Songkhram",
#         "Samut Sakhon", "Saraburi", "Sing Buri", "Suphan Buri", "Ang Thong", "Uthai Thani"
#     ],
#     "South_East": [
#         "Chumphon", "Nakhon Si Thammarat", "Narathiwat", "Prachuap Khiri Khan",
#         "Pattani", "Phatthalung", "Phetchaburi", "Yala", "Songkhla", "Surat Thani"
#     ],
#     "South_West": [
#         "Krabi", "Trang", "Phangnga", "Phuket", "Ranong", "Satun"
#     ]
# }

# # รวมขอบเขตจังหวัดเป็น MultiPolygon (แยก polygon ไม่ละลาย)
# features = []
# for region_name, provinces in regions.items():
#     region_provinces = gdf[gdf['NAME_1'].isin(provinces)]

#     polygons = []
#     for geom in region_provinces.geometry:
#         if isinstance(geom, Polygon):
#             polygons.append(geom)
#         elif isinstance(geom, MultiPolygon):
#             polygons.extend(geom.geoms)  # แยก MultiPolygon ออกเป็น Polygons
    
#     multipolygon = MultiPolygon(polygons)
    
#     features.append({
#         "type": "Feature",
#         "geometry": mapping(multipolygon),
#         "properties": {
#             "region": region_name
#         }
#     })

# # GeoJSON Object
# geojson_obj = {
#     "type": "FeatureCollection",
#     "features": features
# }

# # Save ไฟล์
# os.makedirs("src/Geo-data/", exist_ok=True)
# with open("src/Geo-data/regions_simple_manual.json", "w", encoding="utf-8") as f:
#     json.dump(geojson_obj, f, ensure_ascii=False, indent=2)

# print("✅ สร้าง GeoJSON พร้อมขอบเขตจังหวัดในแต่ละ Region สำเร็จ")







regions = {
    "North": [
        "Kamphaeng Phet", "Chiang Rai", "Chiang Mai", "Tak", "Nan", "Phayao",
        "Phichit", "Phitsanulok", "Phetchabun", "Phrae", "Mae Hong Son",
        "Lampang", "Lamphun", "Sukhothai", "Uttaradit"
    ],
    "East": [
        "Chanthaburi", "Chachoengsao", "Chon Buri", "Trat", "Nakhon Nayok",
        "Prachin Buri", "Rayong", "Sa Kaeo"
    ],
    "Northeast": [
        "Kalasin", "Khon Kaen", "Chaiyaphum", "Nakhon Phanom", "Nakhon Ratchasima",
        "Bueng Kan", "Buri Ram", "Maha Sarakham", "Mukdahan", "Yasothon",
        "Roi Et", "Loei", "Si Sa Ket", "Sakon Nakhon", "Surin",
        "Nong Khai", "Nong Bua Lam Phu", "Udon Thani", "Ubon Ratchathani", "Amnat Charoen"
    ],
    "Central": [
        "Bangkok Metropolis", "Kanchanaburi", "Chai Nat", "Nakhon Pathom",
        "Nakhon Sawan", "Nonthaburi", "Pathum Thani", "Phra Nakhon Si Ayutthaya",
        "Ratchaburi", "Lop Buri", "Samut Prakan", "Samut Songkhram",
        "Samut Sakhon", "Saraburi", "Sing Buri", "Suphan Buri", "Ang Thong", "Uthai Thani"
    ],
    "South_East": [
        "Chumphon", "Nakhon Si Thammarat", "Narathiwat", "Prachuap Khiri Khan",
        "Pattani", "Phatthalung", "Phetchaburi", "Yala", "Songkhla", "Surat Thani"
    ],
    "South_West": [
        "Krabi", "Trang", "Phangnga", "Phuket", "Ranong", "Satun"
    ]
}





import json
import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.geometry import shape

# ฟังก์ชันในการอ่านไฟล์ region_data_{year}.json
def load_region_data(year):
    file_path = f'src/Geo-data/Era-Dataset/{year}/era_region_{year}.json'
    with open(file_path, 'r') as f:
        data = json.load(f)
        return data['features']

# ฟังก์ชันพล็อต geometry และใส่ชื่อ region ลงในแผนที่
def plot_geometry(geometry, region_name):
    gdf = gpd.GeoDataFrame(geometry=[shape(geometry)], crs="EPSG:4326")

    ax = gdf.plot(figsize=(8, 8), edgecolor='black', facecolor='lightblue', alpha=0.5)
    ax.set_title(f'Region Geometry: {region_name}', fontsize=15)
    
    # คำนวณจุดกึ่งกลางของ geometry เพื่อวาง label
    centroid = gdf.geometry.centroid.iloc[0]
    ax.annotate(region_name, xy=(centroid.x, centroid.y), ha='center', fontsize=12, color='red')
    
    plt.axis('off')
    plt.tight_layout()
    plt.show()

# แสดงข้อมูล properties และพล็อต geometry ของแต่ละ feature
def display_properties_and_plot(region_data_list):
    for i, feature in enumerate(region_data_list):
        print(f"\nFeature {i+1} Properties:")
        if 'properties' in feature:
            properties = feature['properties']
            region_name = properties.get('region_name', 'Unknown Region')
            
            # แสดงชื่อภูมิภาค
            print(f"\n--- Annual Data of Region: {region_name} ---")
            annual_data = properties.get('annual', {})
            print(f"Precipitation: {annual_data.get('pre', 'N/A')}")
            print(f"Tmin: {annual_data.get('tmin', 'N/A')}")
            print(f"Tmax: {annual_data.get('tmax', 'N/A')}")
            print(f"TXX: {annual_data.get('txx', 'N/A')}")
            print(f"TNN: {annual_data.get('tnn', 'N/A')}")
            print(f"RX1DAY: {annual_data.get('rx1day', 'N/A')}")
            
            # แสดงข้อมูล Monthly
            print(f"\n--- Monthly Data for Region: {region_name} ---")
            monthly_data = properties.get('monthly', {})
            if monthly_data:
                print(f"Precipitation: {monthly_data.get('pre', 'N/A')}")
                print(f"Tmin: {monthly_data.get('tmin', 'N/A')}")
                print(f"Tmax: {monthly_data.get('tmax', 'N/A')}")
            else:
                print("Monthly data not found.")
            
            # พล็อต geometry พร้อมชื่อ region
            geometry = feature.get('geometry', {})
            if geometry:
                plot_geometry(geometry, region_name)
            else:
                print("No geometry data found.")
        else:
            print(f"No 'properties' found in Feature {i+1}")

# ใช้งานจริง
year = 1960
region_data_list = load_region_data(year)
display_properties_and_plot(region_data_list)




