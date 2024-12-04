import xarray as xr
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.1910.wet.dat.nc")

# กรองข้อมูลให้เลือกช่วงเวลาที่ต้องการ (เช่น ปี 1901-1910)
# ในกรณีนี้ ค่าเฉลี่ยของข้อมูลทั้งหมด
#print(ds)
data_avg = ds['wet'].mean(dim='time').dt.days

# สร้างกราฟแผนที่
fig = plt.figure(figsize=(10, 6))
ax = plt.axes(projection=ccrs.PlateCarree())

# เพิ่มพื้นฐานแผนที่ (เช่น เส้นขอบทวีป)
ax.add_feature(cfeature.COASTLINE)

# สร้างแผนที่แสดงข้อมูล
c = ax.pcolormesh(ds['lon'], ds['lat'], data_avg, cmap='viridis', transform=ccrs.PlateCarree())

# เพิ่มแถบสี (color bar)
plt.colorbar(c, ax=ax, label='tmp Day Frequency (days)')

# ตั้งชื่อกราฟ
plt.title("Average tmp Day Frequency (1901-1910)")

# แสดงผล
plt.show()






