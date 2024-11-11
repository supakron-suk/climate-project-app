from osgeo import gdal, ogr
import xarray as xr
import numpy as np
import matplotlib.pyplot as plt
import cartopy.crs as ccrs

# โหลดข้อมูล NetCDF
ds = xr.open_dataset('../dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc')
temp_data = ds['tmp'].sel(time=slice('2022-01-01', '2023-12-31')).mean(dim='time')  # ข้อมูลอุณหภูมิเฉลี่ย

# แปลงข้อมูล NetCDF เป็น GeoTIFF ชั่วคราวเพื่อใช้กับ GDAL
temp_data.rio.to_raster("../csv-file/temp_data.tif")

# โหลดไฟล์ GeoTIFF
raster = gdal.Open("../csv-file/temp_data.tif")

# โหลด Shapefile ของประเทศไทยโดยใช้ OGR
shapefile = ogr.Open("../shapefile/gadm41_THA_1.shp")
layer = shapefile.GetLayer()

# ตั้งค่าการ Mask ข้อมูลด้วย GDAL โดยใช้ฟังก์ชัน Warp
output_path = "../csv-file/temp_data_thailand_masked.tif"
gdal.Warp(output_path, raster, format="GTiff", cutlineDSName="../shapefile/gadm41_THA_1.shp",
          cropToCutline=True, dstNodata=np.nan)

# โหลดไฟล์ GeoTIFF ที่ Mask แล้วกลับเข้ามาใน xarray
masked_raster = xr.open_rasterio(output_path)

# Plot ข้อมูลที่ Mask แล้ว
fig, ax = plt.subplots(figsize=(10, 8), subplot_kw={'projection': ccrs.PlateCarree()})
masked_raster.plot(ax=ax, cmap='jet', transform=ccrs.PlateCarree())
ax.set_extent([96, 106, 4, 21], crs=ccrs.PlateCarree())
ax.coastlines()

plt.title("Average Temperature for Thailand (Masked by Shapefile)")
plt.show()



# import netCDF4
# import numpy as np
# from osgeo import gdal, osr, ogr
# import matplotlib.pyplot as plt
# import xarray as xr
# import cartopy.crs as ccrs
# import cartopy.feature as cfeature
# from cartopy.io.shapereader import Reader
# from cartopy.feature import ShapelyFeature

# # function to create the mask of your shapefile
# def makeMask(lon, lat, res):
#     source_ds = ogr.Open(shapefile)
#     source_layer = source_ds.GetLayer()

#     # Create high-res raster in memory
#     mem_ds = gdal.GetDriverByName('MEM').Create('', lon.size, lat.size, gdal.GDT_Byte)
#     mem_ds.SetGeoTransform((lon.min(), res, 0, lat.max(), 0, -res))
#     band = mem_ds.GetRasterBand(1)

#     # Rasterize shapefile to grid
#     gdal.RasterizeLayer(mem_ds, [1], source_layer, burn_values=[1])

#     # Get rasterized shapefile as numpy array
#     array = band.ReadAsArray()

#     # Flush memory file
#     mem_ds = None
#     band = None
#     return array

# # Set data directories and file paths
# datadir = "src/dataset-nc/"
# shapefile = "src/shapefile/gadm41_THA_1.shp"
# infile = "cru_ts4.08.1901.2023.tmp.dat.nc"
# ncs = datadir + infile

# # Read the NetCDF data file
# ds = xr.open_dataset(ncs)
# tmp = ds['tmp'].mean(dim='time')

# # Focus on specific coordinates
# lon_slice = slice(96, 106)
# lat_slice = slice(5, 21)
# tmp_subset = tmp.sel(lon=lon_slice, lat=lat_slice)

# fig = plt.figure(figsize=(10, 6))
# ax = plt.axes(projection=ccrs.PlateCarree())

# # Set extent to focus on Thailand's region
# ax.set_extent([97.5, 105.5, 5.5, 20.5], crs=ccrs.PlateCarree())

# # Show the temperature map
# img = ax.imshow(tmp_subset, extent=[tmp_subset.lon.min(), tmp_subset.lon.max(), tmp_subset.lat.min(), tmp_subset.lat.max()],
#                 cmap='jet', origin='lower', transform=ccrs.PlateCarree())

# # Load and display the shapefile
# shape_feature = ShapelyFeature(Reader(shapefile).geometries(), ccrs.PlateCarree(), edgecolor='black', facecolor='none')
# ax.add_feature(shape_feature)

# # Add coastlines, borders, and color bar
# ax.coastlines()
# ax.add_feature(cfeature.BORDERS, linestyle=':')
# plt.colorbar(img, label="Temperature (°C)")
# plt.title("Temperature Map with Thailand Shapefile Overlay")
# plt.xlabel("Longitude")
# plt.ylabel("Latitude")

# plt.show()

# # Get the longitude and latitude information for mask creation
# lons = ds.variables['lon'][:]
# lats = ds.variables['lat'][:]
# cellsize = lons[1] - lons[0]

# # Create and show the mask
# mask = makeMask(lons, lats, cellsize)
# plt.imshow(mask, extent=[lons.min(), lons.max(), lats.min(), lats.max()], origin='upper')
# plt.title("Shapefile Mask")
# plt.show()

 


