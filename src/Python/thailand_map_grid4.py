# section 1 load all the necessary modules and packages
import glob
import time
import geopandas as gpd
import matplotlib.pyplot
import netCDF4 as nc4
import numpy as np
import pandas as pd
import xarray as xr
import matplotlib 
import shapefile # pyshed library
import sys
import os
import functools
from shapely.geometry import Polygon, LineString
from datetime import datetime

def NETCDF_SHP_lat_lon(name_of_nc, name_of_variable, name_of_lat_var, name_of_lon_var, name_of_shp, box_values, correct_360):
    """
    This function gets a NetCDF file the assosiated shapefile given the cordination of a given box
    if correct_360 is True then the code convert the lon values more than 180 to negative lon

    Arguments
    ---------
    name_of_nc: string, the name of the nc file
    name_of_variable: string, the name of [sample] variable from nc file
    name_of_lat_var: string, the name of the variable lat
    name_of_lon_var: string, the name of the variable lon
    name_of_shp: string, the name of the shapfile to be created
    box_values: the box to limit to a specific domain or boolean of False
    correct_360: logical, True or Flase
    Returns
    -------
    """
    # open the nc file to read
    ncid = nc4.Dataset(name_of_nc)
    # deciding which case
    # case #1 regular lat/lon
    if (len(ncid.variables[name_of_lat_var].dimensions)==1) and (len(ncid.variables[name_of_lon_var].dimensions)==1) and (len(ncid.variables[name_of_variable].dimensions)==3):
        print('case 1 - regular lat/lon')
        # get the list of dimensions for the ncid sample varibale
        list_dim_name = list(ncid.variables[name_of_variable].dimensions)
        # get the location of lat dimensions
        location_of_lat = list_dim_name.index(list(ncid.variables[name_of_lat_var].dimensions)[0])
        location_of_lon = list_dim_name.index(list(ncid.variables[name_of_lon_var].dimensions)[0])
        # det the dimensions of lat and lon
        len_of_lat = len(ncid.variables[name_of_lat_var][:])
        len_of_lon = len(ncid.variables[name_of_lon_var][:])
        print(len_of_lat, len_of_lon)
        if location_of_lon > location_of_lat:
            lat = np.zeros([len_of_lat, len_of_lon])
            lon = np.zeros([len_of_lat, len_of_lon])
            for i in np.arange(len(ncid.variables[name_of_lat_var][:])):
                lat[:,i] = ncid.variables[name_of_lat_var][:]
            for i in np.arange(len(ncid.variabels[name_of_lon_var][:])):
                lon[i,:] = ncid.variables[name_of_lon_var][:]
        else:
            lat = np.zeros([len_of_lon, len_of_lat])
            lon = np.zeros([len_of_lon, len_of_lat])
            for i in np.arange(len(ncid.variables[name_of_lon_var][:])):
                lat[i,:] = ncid.variables[name_of_lat_var][:]
            for i in np.arange(len(ncid.variables[name_of_lat_var][:])):
                lon[:,i] = ncid.variables[name_of_lon_var][:]
        # case #2 rotated lat/lon
        if (len(ncid.variables[name_of_lat_var].dimensions)==2) and (len(ncid.variables[name_of_lon_var].dimensions)==2):
            print('case 2 - rotated lat/lon')
            lat = ncid.variables[name_of_lat_var][:,:]
            lon = ncid.variables[name_of_lon_var][:,:]
        # case #3 1-D lat/lon and 2 data for irregulat shapes
        if (len(ncid.variables[name_of_lat_var].dimensions)==1) and (len(ncid.variables[name_of_lon_var].dimensions)==1) and (len(ncid.variables[name_of_variable].dimensions)==2):
            print('case 2 - regular lat/lon; shapefile should be provided')
            sys.exit("no shapfile is created, please provide the associated shapefile to the netCDF file")

        # creating/saving the shapefile
        lat_lon_SHP(name_of_shp, lat, lon, box_values, correct_360)

        # return mapped lat lon (2D lat, lon)
        return lat, lon
    
def lat_lon_SHP(name_of_shp, lat, lon, box_values, correct_360):
    """
    This function gets a 2-D lat and lon and return the shapefile given the lat and lon matrices
    The function return a shapefile within the box_values specify by the model simulation.
    correct_360 is True, then the values of more than 180 for the lon are converted to negative lon
    correct_360 is False, then the cordinates of the shapefile remain in 0 to 360 degree
    The function remove the first, last rows and colomns

    Arguments
    ---------
    lat: the 2D matrix of lat_2D [n,m,]
    lon: the 2D matrix of lon_2D [n,m,]
    box_values: a 1D array [minlat, maxlat, minlon, maxlon]
    correct_360: logical, True or Flase

    Returns
    -------
    result: a shapefile with (n-2)*(m-2) elements depicting the provided 2-D lat and lon values
    """
    # check if lat/lon that are taken in has the same dimnesion
    if ((lat.shape[0] != lon.shape[0]) or (lat.shape[1] != lon.shape[1])):
        sys.exit("no shapfile is created, please provide the associated shapefile to the netCDF file")

    # check for the shapefile covers two hemisphere
    # to be done
    if type(box_values) == bool:
        if not box_values:
            box_values = np.array([0,0,0,0])
            box_values[0] = -10**6
            box_values[1] = +10**6
            box_values[2] = -10**6
            box_values[3] = +10**6
        else:
            sys.exit('box_values should be either False or a numpy array specifying numpy.array[min_lat, max_lat, min_lon, max_lon]')
    # check if there are at the two size
    if correct_360 is True:
        print("Warming: use the bounding box to focuse on the regiong of study, avoid region close to 0 or 360")
        print("Warning: it is suggested to make your target shapefile from -180-180 to 0-360")
        idx = lon>180 # index of more than 180
        lon[idx] = lon[idx]-360 # index of point with higher than are reduced to -180 to 0 instead
    
    # get the shape
    lat_lon_shape = lat.shape

    # write the shapefile
    with shapefile.Writer(name_of_shp) as w:
        w.autoBalance = 1 # turn on function that keeps file stable if number of shapes and records don't line up
        w.field("ID_s", 'N') # create (N)umerical attribute fields, integer
        w.field("lat_s", 'F', decimal=4) # float with 4 decimals
        w.field("lon_s", 'F', decimal=4) # float with 4 decimals

        # preparing the m whcih is a couter for the shapefile arbitrary ID
        m = 0.00
        
        # itterating to create the shapes of the result shapefile ignoring the first and last rows and columns
        for i in range(1, lat_lon_shape[0] - 1):
            for j in range(1, lat_lon_shape[1] - 1):
                # checking is lat and lon is located inside the provided box
                if lat[i, j] > box_values[0] and lat[i, j] < box_values[1] and lon[i, j] > box_values[2] and lon[i, j] < box_values[3]:
                    # empty the polygon variable
                    parts = []
                    
                    # update records
                    m +=1 # ID
                    # center_lat = lat[i,j] # lat value of data point in source .nc file
                    if correct_360:
                        center_lat = lon[i, j] + 360 # lon value of data point in source .nc file should be within [0,360]
                    else:
                        center_lon = lon[i, j] # lon vaue of data point in source .nc file is within [-180,180]
                    
                    # Creating the lat of the shapefile
                    Lat_Up       = (lat[i - 1, j] + lat[i, j]) / 2
                    Lat_UpRright = (lat[i - 1, j] + lat[i - 1, j + 1] + lat[i, j + 1] + lat[i, j]) / 4
                    Lat_Right    = (lat[i, j + 1] + lat[i, j]) / 2
                    Lat_LowRight = (lat[i, j + 1] + lat[i + 1, j + 1] + lat[i + 1, j] + lat[i, j]) / 4
                    Lat_Low      = (lat[i + 1, j] + lat[i, j]) / 2
                    Lat_LowLeft  = (lat[i, j - 1] + lat[i + 1, j - 1] + lat[i + 1, j] + lat[i, j]) / 4
                    Lat_Left     = (lat[i, j - 1] + lat[i, j]) / 2
                    Lat_UpLeft   = (lat[i - 1, j - 1] + lat[i - 1, j] + lat[i, j - 1] + lat[i, j]) / 4

                    # Creating the lon of the shapefile
                    Lon_Up      = (lon[i - 1, j] + lon[i, j]) / 2
                    Lon_UpRright = (lon[i - 1, j] + lon[i - 1, j + 1] + lon[i, j + 1] + lon[i, j]) / 4
                    Lon_Right    = (lon[i, j + 1] + lon[i, j]) / 2
                    Lon_LowRight = (lon[i, j + 1] + lon[i + 1, j + 1] + lon[i + 1, j] + lon[i, j]) / 4
                    Lon_Low      = (lon[i + 1, j] + lon[i, j]) / 2
                    Lon_LowLeft  = (lon[i, j - 1] + lon[i + 1, j - 1] + lon[i + 1, j] + lon[i, j]) / 4
                    Lon_Left     = (lon[i, j - 1] + lon[i, j]) / 2
                    Lon_UpLeft   = (lon[i - 1, j - 1] + lon[i - 1, j] + lon[i, j - 1] + lon[i, j]) / 4

                    # creating the polygon given the lat and lon
                    parts.append([(Lon_Up,       Lat_Up),
                                  (Lon_UpRright, Lat_UpRright),
                                  (Lon_Right,    Lat_Right),
                                  (Lon_LowRight, Lat_LowRight),
                                  (Lon_Low,      Lat_Low),
                                  (Lon_LowLeft,  Lat_LowLeft),
                                  (Lon_Left,     Lat_Left),
                                  (Lon_UpLeft,   Lat_UpLeft),
                                  (Lon_Up,       Lat_Up)])
                    
                    # store polygon
                    w.poly(parts)

                    # update records/fields for the polygon
                    w.record(m, center_lat, center_lon)
    return


def lat_lon_2D(lat, lon):
    """
    This function gets lat and lon in one-dimension and returns a two-dimensional matrix of that lat and lon
    input for creating shapefile

    Arguments
    ---------
    lat : numpy.ndarray
        the lat values with dimension of [n,]
    lon : numpy.ndarray
        the lat values with dimension of [m,]

    Returns
    -------
    tuple[numpy.ndarray]
        lat_2D: the 2D matrix of lat_2D [n,m,]
        lon_2D: the 2D matrix of lon_2D [n,m,]
    """

    # flattening the lat and lon
    lat = lat.flatten()
    lon = lon.flatten()
    
    # return lat_2D and lon_2D
    return np.meshgrid(lat, lon)

def intersection_shp(shp_1, shp_2):
    """
    This fucntion intersect two shapefile. It keeps the fiels from the first and second shapefiles (identified by S_1_ and
    S_2_). It also creats other field including AS1 (area of the shape element from shapefile 1), IDS1 (an arbitary index
    for the shapefile 1), AS2 (area of the shape element from shapefile 1), IDS2 (an arbitary index for the shapefile 1),
    AINT (the area of teh intersected shapes), AP1 (the area of the intersected shape to the shapes from shapefile 1),
    AP2 (the area of teh intersected shape to the shapefes from shapefile 2), AP1N (the area normalized in the case AP1
    summation is not 1 for a given shape from shapefile 1, this will help to preseve mass if part of the shapefile are not
    intersected), AP2N (the area normalized in the case AP2 summation is not 1 for a given shape from shapefile 2, this
    will help to preseve mass if part of the shapefile are not intersected)

    Arguments
    ---------
    shp1: geo data frame, shapefile 1
    shp2: geo data frame, shapefile 2

    Returns
    -------
    result: a geo data frame that includes the intersected shapefile and area, percent and normalized percent of each shape
    elements in another one
    """
    # Calculating the area of every shapefile (both should be in degree or meters)
    column_names = shp_1.columns
    column_names = list(column_names)

    # removing the geometry from the column names
    column_names.remove('geometry')

    # renaming the column with S_1
    for i in range(len(column_names)):
        shp_1 = shp_1.rename(
            columns = {column_names[i]: 'S_1_' + column_names[i]})
        
    column_names = shp_2.columns
    column_names = list(column_names)

    # removing the geometry from the column names
    column_names.remove('geometry')
    
    # renaming the column with S_2
    for i in range(len(column_names)):
        shp_2 = shp_2.rename(
            columns = {column_names[i]: 'S_2_' + column_names[i]})
    
    # Caclulating the area for shp1
    shp_1['AS1'] = shp_1.area
    shp_1['IDS1'] = np.arange(shp_1.shape[0]) + 1
    # print(shp_1['AS1'])

    # Caclulating the area for shp2
    shp_2['AS2'] = shp_2.area
    shp_2['IDS2'] = np.arange(shp_2.shape[0]) + 1

    # making intesection
    result = spatial_overlays(shp_1, shp_2, how='intersection')

    # Caclulating the area for shp2
    result['AINT'] = result['geometry'].area
    result['AP1'] = result['AINT']/result['AS1']
    result['AP2'] = result['AINT']/result['AS2']
    
    # taking the part of data frame as the numpy to incread the spead
    # finding the IDs from shapefile one
    ID_S1 = np.array(result['IDS1'])
    AP1 = np.array(result['AP1'])
    AP1N = AP1 # creating the nnormalized percent area
    ID_S1_unique = np.unique(ID_S1)
    for i in ID_S1_unique:
        INDX = np.where(ID_S1==i) # getting the indeces
        AP1N[INDX] = AP1[INDX] / AP1[INDX].sum() # normalizing for that sum

    # taking the part of data frame as the numpy to incread the spead
    # finding the IDs from shapefile one
    ID_S2 = np.array(result['IDS2'])
    AP2 = np.array(result['AP2'])
    AP2N = AP2 # creating the nnormalized percent area
    ID_S2_unique = np.unique(ID_S2)
    for i in ID_S2_unique:
        INDX = np.where(ID_S2==i) # getting the indeces
        AP2N[INDX] = AP2[INDX] / AP2[INDX].sum() # normalizing for that sum

    result['AP1N'] = AP1N
    result['AP2N'] = AP2N
    
    return result

def spatial_overlays(df1, df2, how='intersection', reproject=True):
    """Perform spatial overlay between two polygons.
    Currently only supports data GeoDataFrames with polygons.
    Implements several methods that are all effectively subsets of
    the union.

    https://github.com/ozak
    https://github.com/geopandas/geopandas/pull/338
    Parameters
    ----------
    df1 : GeoDataFrame with MultiPolygon or Polygon geometry column
    df2 : GeoDataFrame with MultiPolygon or Polygon geometry column
    how : string
        Method of spatial overlay: 'intersection', 'union',
        'identity', 'symmetric_difference' or 'difference'.
    use_sindex : boolean, default True
        Use the spatial index to speed up operation if available.
    Returns
    -------
    df : GeoDataFrame
        GeoDataFrame with new set of polygons and attributes
        resulting from the overlay
    """
    df1 = df1.copy()
    df2 = df2.copy()
    df1['geometry'] = df1.geometry.buffer(0)
    df1.geometry.set_crs('EPSG:4326', inplace=True)
    df2['geometry'] = df2.geometry.buffer(0)
    df2.geometry.set_crs('EPSG:4326', inplace=True)
    if df1.crs!=df2.crs and reproject:
        print('Data has different projections.')
        print('Converted data to projection of first GeoPandas DataFrame')
        df2.to_crs(crs=df1.crs, inplace=True)
    if how=='intersection':
        # Spatial Index to create intersections
        spatial_index = df2.sindex
        df1['bbox'] = df1.geometry.apply(lambda x:x.bounds)
        df1['sidx'] = df1.bbox.apply(lambda x: list(spatial_index.intersection(x)))
        pairs = df1['sidx'].to_dict()
        nei = []
        for i, j in pairs.items():
            for k in j:
                nei.append([i, k])
        # print(nei)
        # print(df1.keys())
        # pairs = gpd.GeoDataFrame(df1, crs=df1.crs)
        pairs = pd.DataFrame(nei, columns=['idx1', 'idx2'])
        pairs = pairs.merge(df1, left_on='idx1', right_index=True)
        pairs = pairs.merge(df2, left_on='idx2', right_index=True, suffixes=['_1','_2'])
        pairs['Intersection'] = pairs.apply(lambda x:(x['geometry_1'].intersection(x['geometry_2'])).buffer(0), axis=1)
        cols = pairs.columns.tolist()
        cols.remove('geometry_1')
        cols.remove('geometry_2')
        cols.remove('sidx')
        cols.remove('bbox')
        cols.remove('Intersection')
        dfinter = gpd.GeoDataFrame(pairs)
        # dfinter = pairs[cols+['Intersection']].copy
        dfinter.rename(columns={'Intersection':'geometry'}, inplace=True)
        dfinter = gpd.GeoDataFrame(dfinter, columns=dfinter.columns)
        dfinter = dfinter.loc[dfinter.geometry.is_empty==False]
        dfinter.drop(['idx1', 'idx2'], inplace=True, axis=1)
        return dfinter


        # dfinter.geometry.boundary.plot(color=None,edgecolor='k',linewidth = 0.25, figsize=(20,20))
        # matplotlib.pyplot.plot(nei)
        # matplotlib.pyplot.xlabel('Lon')
        # matplotlib.pyplot.ylabel('Lat')
        # matplotlib.pyplot.show()

if __name__ == '__main__':
    font = {'family' : 'Times New Roman',
            'weight' : 'bold',
            'size' : 20}
    matplotlib.rc('font', **font)
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
    shp_target = gpd.read_file('src/shapefile/gadm41_THA_1.shp') # sload target shp
    shp_source = gpd.read_file('src/shapefile/ThailandGrid.shp') # load source shp
    # shp_target = gpd.read_file('./data/ERA5_SSR_at_MedicineHat/target_shp/South_Saskatchewan_MedicineHat_standard.shp') # sload target shp
    # shp_source = gpd.read_file('./data/ERA5_SSR_at_MedicineHat/source_shp/ERA5_NA.shp') # load source shp
    shp_source = shp_source.set_crs("EPSG:4326")
    shp_int = intersection_shp(shp_target, shp_source)
    # print(type(shp_int))
    # creating the shapefile and preparing the 2D lat/lon field based on shapefile for indexing
    # lat_2D, lon_2D = 
    # NETCDF_SHP_lat_lon(name_of_nc, name_of_variable, name_of_lat_var, name_of_lon_var, name_of_shp, box_values, correct_360)
    # print(lat_2D)
    shp_int.geometry.boundary.plot(color=None,edgecolor='k',linewidth = 0.25, figsize=(20,20))
    matplotlib.pyplot.xlabel('Lon')
    matplotlib.pyplot.ylabel('Lat')
    matplotlib.pyplot.show()