import geopandas as gpd
import matplotlib.pyplot as plt
import matplotlib
import numpy as np

shp = gpd.read_file("src/shapefile/gadm41_THA_1.shp")

print(shp.head()) # print the first five row of the shapefile
print(shp.columns) # print existing fields in the shapefile

# plotting
shp.geometry.boundary.plot(color=None,edgecolor='k',linewidth = .5, figsize=(20,20))
plt.xlabel('Lon')
plt.ylabel('Lat')