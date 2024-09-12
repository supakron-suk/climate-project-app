import xarray as xr

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/tmax.day.ltm.1991-2020.nc")

# ดึงข้อมูล tmax
tmax_data = ds['tmax']

# ระบุตำแหน่งละติจูดและลองจิจูดที่ต้องการ เช่น กรุงเทพฯ (13.75°N, 100.5°E)
selected_lat = 13.75
selected_lon = 100.5

# ค้นหาค่าละติจูดและลองจิจูดที่ใกล้ที่สุดใน dataset
nearest_point = tmax_data.sel(lat=selected_lat, lon=selected_lon, method="nearest")

# ดึงข้อมูล time และ tmax ที่ละติจูดและลองจิจูดที่เลือก
time_values = nearest_point['time'].values  # ดึงค่าเวลาจาก nearest_point
temperature_values = nearest_point.values   # ดึงค่า tmax

# แสดงผลลัพธ์ค่า time และ tmax พร้อมกัน
for time, temp in zip(time_values, temperature_values):
    print(f"Time: {time}, Max Temperature: {temp}°C")




