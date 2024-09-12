import xarray as xr
import pandas as pd

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
temperature_values = nearest_point.values   # ดึงค่า tmax

# สร้าง DataFrame เพื่อจัดเก็บค่าอุณหภูมิสำหรับทุกปีในช่วง 1991-2020
years = range(1991, 2021)  # ปีตั้งแต่ 1991 ถึง 2020
days_per_year = len(temperature_values)     # จำนวนวันใน dataset (เช่น 365 วัน)

# สร้าง DataFrame ที่จะเก็บผลลัพธ์ในแต่ละปี
df_list = []

for year in years:
    # สร้างช่วงเวลาสำหรับปีนั้น
    time_values_converted = pd.date_range(start=f'{year}-01-01', periods=days_per_year, freq='D')

    # สร้าง DataFrame สำหรับปีนั้น ๆ
    df_year = pd.DataFrame({
        'Time': time_values_converted,
        'Max Temperature (°C)': temperature_values
    })

    # เก็บ DataFrame แต่ละปีในลิสต์
    df_list.append(df_year)

# รวม DataFrame ของทุกปีเข้าด้วยกัน
df_all_years = pd.concat(df_list, ignore_index=True)

# บันทึก DataFrame ลงในไฟล์ CSV
df_all_years.to_csv("src/csv-file/tmax_time_series_1991-2020.csv", index=False)

print("Data saved to tmax_time_series_1991-2020.csv")



