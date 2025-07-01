import geopandas as gpd
import numpy as np
from decimal import Decimal, ROUND_HALF_UP
from shapely.geometry import Polygon, MultiPolygon

def custom_round(num, decimals):
    factor = Decimal('1.' + '0' * decimals)
    rounded_value = Decimal(str(num)).quantize(factor, rounding=ROUND_HALF_UP)
    return float(rounded_value)

class ModuleTest:
    def __init__(self):
        pass

    def create_grid_polygon(lon_center, lat_center, lon_step, lat_step):
        return [
            [float(lon_center - lon_step / 2), float(lat_center - lat_step / 2)],  # bottom left
            [float(lon_center + lon_step / 2), float(lat_center - lat_step / 2)],  # bottom right
            [float(lon_center + lon_step / 2), float(lat_center + lat_step / 2)],  # top right
            [float(lon_center - lon_step / 2), float(lat_center + lat_step / 2)],  # top left
            [float(lon_center - lon_step / 2), float(lat_center - lat_step / 2)]   # bottom left
        ]
    
    
    def create_grid_json(lon, lat, lon_step, lat_step, value):
        features = []
        for i, lon_value in enumerate(lon):
            for j, lat_value in enumerate(lat):
                variable = value[j, i]
                grid_polygon = ModuleTest.create_grid_json(lon_value, lat_value, lon_step, lat_step)
                features.append({
                    "type":"Feature",
                    "geometry":{
                        "type":"Polygon",
                        "coordinates":[grid_polygon]
                    },
                    "properties":{
                            "variable":variable,
                        }
                    })

    def calculate_weighted_average_country(shapefile, arg, data):
        country_geometry = shapefile.geometry.union_all()
        grid_in_country = data[data.geometry.intersects(country_geometry)]
        country_area = country_geometry.area
        total_weight = []
        for i in arg:
            total_weight.append(0)
        total_percentage = 0
        for idx, grid in grid_in_country.iterrows():
            intersect_area = grid.geometry.intersection(country_geometry).area
            weight = (intersect_area / country_area) *  100
            for i, index in enumerate(arg):
                grid_value = 0
                if grid.get(index, 0.0) == None:
                    grid_value
                else:
                    grid_value = grid.get(index, 0.0)
                total_weight[i] += np.nan_to_num(grid_value, nan=0.0) * weight
            total_percentage += weight
        if total_percentage == 0:
            return None, country_geometry
        average_data = {}
        for i, index in enumerate(arg):
            average_data.update({f"{index}": custom_round(total_weight[i]/total_percentage, 10)})
        return average_data, country_geometry

    def calculate_weighted_average_region(geometry, arg, data):
        region_area = geometry.area
        grid_in_region = data[data.geometry.intersects(geometry)]
        total_weight = []
        for i in arg:
            total_weight.append(0)
        total_percentage = 0
        for _, grid in grid_in_region.iterrows():
            intersect_area = grid.geometry.intersection(geometry).area
            weight = (intersect_area / region_area) * 100
            for i, index in enumerate(arg):
                grid_value = 0
                if grid.get(index, 0.0) == None:
                    grid_value = 0
                else:
                    grid_value = grid.get(index, 0.0)
                total_weight[i] += np.nan_to_num(grid_value, nan=0.0) * weight
            total_percentage += weight
        if total_percentage == 0:
            return None, geometry
        average_data = {}
        for i, index in enumerate(arg):
            average_data.update({f"{index}": custom_round(total_weight[i]/total_percentage, 10)})
        return average_data, geometry

    def calculate_weighted_average_province(province_name, shapefile, arg, data):
        province_coord = shapefile[shapefile['NAME_1'] == province_name]
        if province_coord.empty:
            print(f"No data in province : {province_name}")
            return None
        grid_in_province = data[data.geometry.intersects(province_coord.geometry.union_all())]
        province_area = province_coord.geometry.union_all().area
        total_weight = []
        total_percentage = 0
        for i in arg:
            total_weight.append(0)
        for idx, grid in grid_in_province.iterrows():
            intersection_area = grid.geometry.intersection(province_coord.geometry.union_all()).area
            intersection_percentage_of_pervince = (intersection_area/province_area)*100
            for i, index in enumerate(arg):
                if(index != ""):
                    grid_value = grid[index]
                else:
                    print("you select something wrong try again")
                    break
                if(grid.get(index, 0.0)) == None:
                    grid_value = 0
                else:
                    grid_value = grid.get(index, 0.0)
                total_weight[i] += np.nan_to_num(grid_value, nan=0.0) * intersection_percentage_of_pervince
            total_percentage += intersection_percentage_of_pervince
        if total_percentage == 0:
            return None, province_coord
        average_data = {}
        for i, index in enumerate(arg):
            average_data.update({f"{index}": custom_round(total_weight[i]/total_percentage, 10)})
        return average_data, province_coord.geometry.union_all()

    def calculate_monthly_averages(variables, data, geometry):
        monthly_data = {var: [] for var in variables}
        grid_in = data[data.geometry.intersects(geometry)]
        geometry_area = geometry.area
        for var in variables:
            for m in range(1, 13):
                month_data = grid_in[grid_in['month'] == m]
                total = 0
                total_weight = 0
                for _, grid in month_data.iterrows():
                    area = grid.geometry.intersection(geometry).area
                    weight = area / geometry_area
                    grid_value = 0
                    if grid.get(var, 0.0) == None:
                        grid_value = 0
                    else:
                        grid_value = grid.get(var, 0.0)
                    value = np.nan_to_num(grid_value, nan=0.0)
                    total += value * weight
                    total_weight += weight
                avg = total / total_weight if total_weight > 0 else None
                monthly_data[var].append(custom_round(avg, 10) if avg is not None else None)
        return monthly_data

    def generate_geojson_for_country(avg_data, monthly_data, country_geom, year):
        
        return{
            'type': 'Feature',
            'geometry': country_geom.__geo_interface__,
            'properties':{
                'year':year,
                'annual':{key: custom_round(val,10) for key, val in avg_data.items()},
                'monthly':monthly_data
            }
        }

    def generate_geojson_for_region(avg_data, monthly_data, region_geom, region_name, year):
        return{
            'type':'Feature',
            'geometry': region_geom.__geo_interface__,
            'properties':{
                'year': year,
                'region_name': region_name,
                'annual': {key: custom_round(val,10) for key, val in avg_data.items()},
                'monthly': monthly_data
            }
        }

    def generate_geojson_for_province(avg_data, monthly_data, province_geom, province_name, year):
        return{
            'type':'Feature',
            'geometry': province_geom.__geo_interface__,
            'properties':{
                'year': year,
                'province_name': province_name,
                'annual': {key: custom_round(val,10) for key, val in avg_data.items()},
                'monthly': monthly_data
            }
        }
        
def test_TC01_create_grid_polygon():
    # Input
    lon_center = 100.0
    lat_center = 15.0
    lon_step = 1.0
    lat_step = 1.0

    # Expected Output
    expected_output = [
        [99.5, 14.5],
        [100.5, 14.5],
        [100.5, 15.5],
        [99.5, 15.5],
        [99.5, 14.5]
    ]

    # Actual Output
    actual_output = ModuleTest.create_grid_polygon(lon_center, lat_center, lon_step, lat_step)

    # Assertion
    assert actual_output == expected_output, f"Test Failed! \nExpected: {expected_output} \nGot: {actual_output}"
    print("TC01 Passed - create_grid_polygon returns correct coordinates.")

# เรียกใช้ฟังก์ชันทดสอบ
test_TC01_create_grid_polygon()