import xarray as xr
# import rioxarray  # ต้องติดตั้งด้วยคำสั่ง `pip install rioxarray`
# from osgeo import gdal, ogr

# # โหลดข้อมูล NetCDF ด้วย xarray
# ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")

# # เลือกข้อมูลของตัวแปรที่ต้องการในปี 2000
# year = 2000
# data_var = ds['tmp'].sel(time=str(year)).mean(dim='time')  # เฉลี่ยข้อมูลทั้งปี

# # เปลี่ยนชื่อมิติจาก lat/lon เป็น y/x และตั้งค่า CRS
# data_var = data_var.rename({'lat': 'y', 'lon': 'x'})
# data_var = data_var.rio.write_crs("EPSG:4326")

# # สร้างไฟล์ชั่วคราวจากข้อมูลปี 2000
# data_var.rio.to_raster("src/csv-file/temp_raster.tif")

# # เปิดไฟล์ชั่วคราวที่สร้างขึ้นมาเพื่อแปลงเป็น Vector
# dataset = gdal.Open("src/csv-file/temp_raster.tif")
# band = dataset.GetRasterBand(1)

# # สร้างไฟล์ Vector output
# driver = ogr.GetDriverByName("GeoJSON")
# out_ds = driver.CreateDataSource("src/Geo-data/output_vector_data.json")
# out_layer = out_ds.CreateLayer("layer_name", geom_type=ogr.wkbPolygon)

# # สร้างฟิลด์สำหรับเก็บค่า
# field = ogr.FieldDefn("value", ogr.OFTReal)
# out_layer.CreateField(field)

# # แปลงข้อมูลจาก Raster เป็น Vector
# gdal.Polygonize(band, None, out_layer, 0, [], callback=None)

# # ปิดไฟล์
# out_ds = None
# dataset = None


# import matplotlib.pyplot as plt

# # เปิดไฟล์ .tif ด้วย xarray
# data = xr.open_dataarray('src/csv-file/temp_raster.tif')

# print(data)

# # Plot ข้อมูล
# data.plot(cmap='viridis')  # ใช้ colormap ที่ต้องการ
# plt.title('GeoTIFF Data')
# plt.show()




