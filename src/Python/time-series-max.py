import xarray as xr
import plotly.graph_objects as go
import pandas as pd
from cftime import num2date

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/tmax.day.ltm.1991-2020.nc")

# ระบุตำแหน่งละติจูดและลองจิจูดที่ต้องการ เช่น กรุงเทพฯ (13.75°N, 100.5°E)
selected_lat = 13.75
selected_lon = 100.5

# ค้นหาค่าละติจูดและลองจิจูดที่ใกล้ที่สุดใน dataset
nearest_point = ds['tmax'].sel(lat=selected_lat, lon=selected_lon, method="nearest")

# แปลงเวลาให้เป็น Datetime ที่สามารถทำงานได้
time_index = num2date(ds['time'].values, units=ds['time'].units, calendar=ds['time'].calendar)

# แปลงเป็นรูปแบบ datetime ที่ pandas และ Plotly ใช้งานได้
time_index = pd.to_datetime([t.isoformat() for t in time_index])

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
    name='Max Temperature over Time'
))

fig.update_layout(
    title=f'Time Series of Max Temperature at ({selected_lat}, {selected_lon})',
    xaxis_title='Time',
    yaxis_title='Max Temperature (°C)'
)

# บันทึกกราฟเป็นไฟล์ HTML
fig.write_html("src/HTML/tmax_time_series.html")

print("กราฟถูกบันทึกแล้วที่ src/HTML/tmax_time_series.html")





