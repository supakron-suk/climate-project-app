#json_func.py
import json
import geopandas as gpd
import matplotlib.pyplot as plt
import seaborn as sns
import random


shapefile = gpd.read_file("src/Geo-data/thailand-Geo.json")

def read_json(file_path, shapefile_path=None):
    """อ่านไฟล์ JSON หรือ GeoJSON และแยก geometry กับ properties ตามประเภทของข้อมูล"""
    try:
        if file_path.endswith(".json"):
            try:
                # ลองอ่านเป็น GeoJSON
                gdf = gpd.read_file(file_path)
                print("GeoJSON detected!")

                # ตรวจสอบประเภทของ Geometry
                classify_geometry_type(gdf)

                # แยก geometry และ properties
                geometry = gdf["geometry"]
                all_properties = gdf.drop(columns="geometry")

                # แยก properties ที่เป็นตัวเลข -> climate_properties
                climate_properties = all_properties.select_dtypes(include=["number"])

                # แสดงจำนวน grid ของ geometry ในแต่ละ climate property
                count_climate_grids(gdf, climate_properties)

                # นับจำนวน geometry ที่มีพิกัดไม่ซ้ำกัน
                unique_count = count_unique_geometries(gdf)
                # print(f"Total Geometry: {unique_count}")


                return {
                    "geometry": geometry.to_json(),
                    "climate_properties": climate_properties.to_dict(orient="records"),
                    "total_geometry_count": unique_count,
                }

            except Exception as e:
                print(f"Error reading GeoJSON: {e}")

    except Exception as e:
        print(f"Error reading JSON file: {e}")
        return None


def classify_geometry_type(gdf):
    """ตรวจสอบว่า Geometry เป็น Grid Type หรือ Polygon Province"""
    is_grid = True  # สมมติว่าทุก Polygon เป็น Grid ก่อน
    for geom in gdf.geometry:
        if geom.geom_type == "Polygon":
            num_points = len(geom.exterior.coords)  # จำนวนจุดของ Polygon

            if num_points > 5:  
                is_grid = False  # ถ้าพบ Polygon ที่มีมากกว่า 5 จุด แสดงว่าเป็น Province

    if is_grid:
        print("----------------------------------------")
        print("GEOJSON Grid Polygon Type")
        print("----------------------------------------")
    else:
        print("----------------------------------------")
        print("GEOJSON Province Polygon Type")
        print("----------------------------------------")


def count_climate_grids(gdf, climate_properties):
    """แสดงจำนวน geometry ของข้อมูลในแต่ละประเภทของ properties"""
    # num_geometries = len(gdf)
    # print(f"Total geometry: {num_geometries}")
    unique_count = count_unique_geometries(gdf)
    print(f"Total Geometry: {unique_count}")

    # จัดประเภทของ properties
    time_properties = ["month", "year"]
    categorical_properties = ["name", "region"]

    # Climate (ตัวเลขที่ไม่ใช่เวลา)
    climate_features = [
        col for col in climate_properties.columns
        if col not in time_properties + categorical_properties
    ]

    # Time properties
    time_features = [col for col in climate_properties.columns if col in time_properties]

    # Categorical properties
    text_features = [col for col in climate_properties.columns if col in categorical_properties]

    # แสดงผลแบบจัดกลุ่ม
    if climate_features:
        print("\n Climate Properties:")
        for prop in climate_features:
            print(f"  - {prop}")

    if time_features:
        print("\n Time Properties:")
        for prop in time_features:
            print(f"  - {prop}")

    if text_features:
        print("\n Text Properties:")
        for prop in text_features:
            print(f"  - {prop}")


def count_unique_geometries(gdf):
    """นับจำนวน Geometry ที่มีพิกัดไม่ซ้ำกัน"""
    unique_coords = set()  # ใช้ Set เก็บพิกัดที่ไม่ซ้ำกัน
    
    for geom in gdf.geometry:
        if geom.is_empty:
            continue  # ข้าม geometry ที่ว่างเปล่า

        centroid = geom.centroid  # หาจุดศูนย์กลางของ Polygon
        coord = (round(centroid.x, 6), round(centroid.y, 6))  # ปัดค่าให้เหลือ 6 ตำแหน่ง

        unique_coords.add(coord)  # เพิ่มลง Set

    return len(unique_coords)  # คืนค่าจำนวน geometry ที่ไม่ซ้ำกัน









