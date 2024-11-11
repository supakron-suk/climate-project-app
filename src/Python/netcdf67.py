# cell 1: read candex function and load the paraemters
from climate import *
import matplotlib
import numpy as np
import geopandas as gpd

font = {'family' : 'Times New Roman',
         'weight' : 'bold',
         'size'   : 20}
matplotlib.rc('font', **font)

# cell 2: specifiying the parameter for creating the source shapefile
# name of the sample nc file (give only one if there are separaete file for each year or month)
name_of_nc = 'src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc'
# sample varibale from nc file (similar to all the dimensions for all the varibales with intend to read)
name_of_variable = 'tmp' 
# name of varibale in nc file (and not dimension) that holed the longituge values
name_of_lon_var = 'lon' 
# name of varibale in nc file (and not dimension) that holds the latitiute values
name_of_lat_var = 'lat'
# bounding box the trim the created shepefile
# it should be in form of np.array([min_lat,max_lat,min_lon,max_lon]) 
# or should be give False if there is not box
box_values =  np.array([5,21,97,106]) # or False;
# if the nc file lon is 0 to 360 and want to transfor to -180 to 180
# in the case the box_value should be in either of east or west hemisphere
correct_360 = False
# name of the shapefile that is created and saved
name_of_shp = 'src/shapefile/ThailandGrid.shp' 
# creating the shapefile and preparing the 2D lat/lon field based on shapefile for indexing
lat_2D, lon_2D = NetCDF_SHP_lat_lon(name_of_nc, name_of_variable, name_of_lat_var,
                                            name_of_lon_var, name_of_shp, box_values, correct_360)

# cell 3: plotting the created shapefile
shp_source = gpd.read_file('src/shapefile/ThailandGrid.shp') # load it
print(shp_source.head()) # show the first 5 rows
# plotting
shp_source.geometry.boundary.plot(color=None,edgecolor='k',linewidth = 0.25, figsize=(20,20))
matplotlib.pyplot.xlabel('Lon')
matplotlib.pyplot.ylabel('Lat')
matplotlib.pyplot.show()