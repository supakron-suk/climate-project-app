import json
import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.geometry import shape

# ฟังก์ชันในการอ่านไฟล์ region_data_{year}.json
def load_region_data(year):
    file_path = f'src/Geo-data/Era-Dataset/{year}/region_data_{year}.json'
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




