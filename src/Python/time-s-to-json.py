import xarray as xr
import json
import pandas as pd

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.2021.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')

# ระบุตำแหน่งละติจูดและลองจิจูดที่ต้องการ เช่น กรุงเทพฯ (13.75°N, 100.5°E)
selected_lat = 13.75
selected_lon = 100.5

# ค้นหาค่าละติจูดและลองจิจูดที่ใกล้ที่สุดใน dataset
nearest_point = data_var.sel(lat=selected_lat, lon=selected_lon, method="nearest")

# แปลงเวลาให้เป็น Datetime สำหรับการจัดกลุ่ม
time_index = pd.to_datetime(ds['time'].values)

# สร้าง DataFrame สำหรับอุณหภูมิและเวลา
df = pd.DataFrame({
    'time': time_index,
    'temperature': nearest_point.values
})

# จัดกลุ่มตามปีและเดือน แล้วหาค่าอุณหภูมิสูงสุด
max_temp_per_month = df.groupby([df['time'].dt.to_period('M')])['temperature'].max().reset_index()

# แปลง `time` กลับเป็น datetime สำหรับการแสดงผล
max_temp_per_month['time'] = max_temp_per_month['time'].dt.to_timestamp()

# บันทึกข้อมูลในรูปแบบ JSON สำหรับ React
max_temp_per_month.to_json("src/Geo-data/temp_time_series-2.json", orient='split')
