import xarray as xr
import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/tmax.day.ltm.1991-2020.nc")

# ดึงข้อมูล tmax
tmax_data = ds['tmax']

# ระบุตำแหน่งละติจูดและลองจิจูดที่ต้องการ เช่น กรุงเทพฯ (13.75°N, 100.5°E)
selected_lat = 13.75
selected_lon = 100.5

# ค้นหาค่าละติจูดและลองจิจูดที่ใกล้ที่สุดใน dataset
nearest_point = tmax_data.sel(lat=selected_lat, lon=selected_lon, method="nearest")

# แปลง cftime ให้เป็น datetime64 โดยใช้ฟังก์ชัน cftime_to_datetime
time_index = xr.coding.cftimeindex.cftime_to_nptime(nearest_point.indexes['time'])

# สร้าง DataFrame สำหรับอุณหภูมิและเวลา
df = pd.DataFrame({
    'time': time_index,
    'temperature': nearest_point.values
})

# สร้าง Time Series Plot ด้วย Plotly
fig = go.Figure()

fig.add_trace(go.Scatter(
    x=df['time'],
    y=df['temperature'],
    mode='lines+markers',
    name='Max Temperature'
))

fig.update_layout(
    title=f'Max Daily Temperature at ({selected_lat}, {selected_lon})',
    xaxis_title='Time',
    yaxis_title='Max Temperature (°C)'
)

# บันทึกเป็นไฟล์ HTML
pio.write_html(fig, file='src/HTML/tmax_time_series.html', auto_open=True)







