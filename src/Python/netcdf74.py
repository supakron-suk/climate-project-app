import xarray as xr
import geopandas as gpd
from shapely.geometry import Polygon, Point
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import climate

ds = xr.open_dataset('src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc')

data_filtered = ds.sel(time=slice('2022-01-01', '2023-12-31'))

thai_shape = gpd.read_file("src/shapefile/gadm41_THA_1.shp")
thai_source = gpd.read_file("src/Geo-data/nc_to_json_2000_1.json")
thailand = gpd.read_file("src/Geo-data/thailand-Geo.json")
thai_grid = gpd.read_file('src/shapefile/ThaiGrid.shp')
gdf_shapefile = gpd.read_file('src/Geo-data/shapefile-lv1-thailand.json')

fig, ax = plt.subplots(figsize=(10, 10))

# thai_source.plot(column='temperature', cmap='jet', linewidth=0.5, ax=ax, edgecolor='black', legend=True)

gdf_tmp_thailand = thai_source.cx[97.5:105.5, 5:21]
gdf_shapefile_thailand = gdf_shapefile.cx[97.5:105.5, 5:21]

gdf_tmp_clipped = gdf_tmp_thailand.clip(gdf_shapefile_thailand)
# gdf_tmp_clipped = gdf_tmp_thailand.clip(thai_source)

# gdf_shapefile_thailand.boundary.plot(ax=ax, edgecolor='black', linewidth=0.3)
# print(thai_grid)

# print(thai_source)

# print(gdf_tmp_clipped)

gdf_tmp_clipped.plot(column='temperature', ax=ax, legend=True, cmap='jet', legend_kwds={'label': "Temperature (°C)", 'orientation': "horizontal"})

shp_int = climate.intersection_shp(thai_shape, thai_grid)

#shp_geometry = shp_int.drop(columns=['geometry_1', 'geometry_2', 'bbox', 'sidx'])

shp_geometry = shp_int[['geometry']]

print(shp_geometry)

shp_int.geometry.boundary.plot(ax=ax, color=None,edgecolor='k',linewidth = 0.25)

# บันทึก shp_int เป็น GeoJSON
shp_geometry.to_file("src/Geo-data/shp_geo_clipped.json", driver="GeoJSON")

plt.xlabel('Lon')
plt.ylabel('Lat')
plt.show()

# geo_data = gpd.read_file("src/Geo-data/shp_geo_clipped.json")

# # แสดงผลข้อมูล
# geo_data.plot(column='AINT', cmap='viridis', legend=True)
# plt.show()