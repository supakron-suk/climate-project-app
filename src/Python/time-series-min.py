import xarray as xr
import plotly.graph_objects as go
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

# กรองข้อมูลเฉพาะปี 2021
df_2021 = df[df['time'].dt.year == 2021]

# จัดกลุ่มตามวัน แล้วหาค่าอุณหภูมิต่ำสุดในแต่ละวัน
min_temp_per_day = df_2021.groupby(df_2021['time'].dt.to_period('D'))['temperature'].min().reset_index()

# แปลง `time` กลับเป็น datetime สำหรับการแสดงผล
min_temp_per_day['time'] = min_temp_per_day['time'].dt.to_timestamp()

# สร้าง Time Series Plot ด้วย Plotly
fig = go.Figure()

fig.add_trace(go.Scatter(
    x=min_temp_per_day['time'],
    y=min_temp_per_day['temperature'],
    mode='lines+markers',
    name='Min Temperature per Day in 2021'
))

fig.update_layout(
    title=f'Min Daily Temperature in 2021 at ({selected_lat}, {selected_lon})',
    xaxis_title='Time',
    yaxis_title='Min Temperature (°C)'
)

# บันทึกเป็นไฟล์ HTML
fig.write_html("src/HTML/time_series_2021.html")

