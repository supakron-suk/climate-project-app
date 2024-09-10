
import netCDF4

# เปิดไฟล์
dataset = netCDF4.Dataset('src/dataset-nc/tmax.day.ltm.1991-2020.nc')

# แสดงประเภทของไฟล์
print(dataset)

dataset.close()
