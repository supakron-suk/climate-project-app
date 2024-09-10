import json
import math

def calculate_grid(coordinates, grid_size=1, num_grids=100):
    # Calculate bounding box for the province
    lats = [coord[1] for coord in coordinates[0]]
    lons = [coord[0] for coord in coordinates[0]]
    min_lat, max_lat = min(lats), max(lats)
    min_lon, max_lon = min(lons), max(lons)
    
    # Calculate grid dimensions
    grid_count = int(math.sqrt(num_grids))
    lat_step = (max_lat - min_lat) / grid_count
    lon_step = (max_lon - min_lon) / grid_count
    
    # Generate grid coordinates
    grids = {}
    for i in range(grid_count):
        for j in range(grid_count):
            grid_key = f"Grid_{i+1}_{j+1}"
            grids[grid_key] = [
                [min_lon + j * lon_step, min_lat + i * lat_step],
                [min_lon + (j + 1) * lon_step, min_lat + i * lat_step],
                [min_lon + (j + 1) * lon_step, min_lat + (i + 1) * lat_step],
                [min_lon + j * lon_step, min_lat + (i + 1) * lat_step]
            ]
    
    return grids

def add_grids_to_json(input_file, output_file, grid_size=1, num_grids=100):
    # Load the JSON data
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Iterate through each feature and add grid data
    for feature in data['features']:
        if feature['geometry']['type'] == 'Polygon':
            coords = feature['geometry']['coordinates']
            grids = calculate_grid(coords, grid_size, num_grids)
            feature['properties']['Grid'] = grids
    
    # Save the modified data to a new JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Usage
input_file_path = 'src/Geo-data/thailand-Geo.json'  # ใส่ชื่อไฟล์ JSON ของคุณที่นี่
output_file_path = 'src/Python/thailand-Geo-with-grids-2.json'  # ชื่อไฟล์ที่ต้องการบันทึก
add_grids_to_json(input_file_path, output_file_path)




