import xarray as xr  # นำเข้าไลบรารี xarray สำหรับการจัดการข้อมูลหลายมิติ เช่น NetCDF
import plotly.graph_objects as go  # นำเข้าไลบรารี Plotly สำหรับการสร้างกราฟและการพล็อตข้อมูล

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.2021.2023.tmp.dat.nc")  # เปิดไฟล์ NetCDF ที่มีข้อมูลอุณหภูมิในช่วงปี 2021-2023 และแปลงให้อยู่ในรูปแบบของ xarray Dataset
data_var = ds.metpy.parse_cf('tmp')  # ดึงตัวแปร 'tmp' จาก Dataset และแปลงเป็น DataArray พร้อมตีความ Metadata โดยใช้ metpy

# ระบุตำแหน่งละติจูดและลองจิจูดที่ต้องการ เช่น กรุงเทพฯ (13.75°N, 100.5°E)
selected_lat = 13.75  # กำหนดละติจูดที่ต้องการดึงข้อมูล ซึ่งในที่นี้คือกรุงเทพฯ
selected_lon = 100.5  # กำหนดลองจิจูดที่ต้องการดึงข้อมูล ซึ่งในที่นี้คือกรุงเทพฯ

# ค้นหาค่าละติจูดและลองจิจูดที่ใกล้ที่สุดใน dataset
nearest_point = data_var.sel(lat=selected_lat, lon=selected_lon, method="nearest")  # เลือกข้อมูลอุณหภูมิที่จุดที่ใกล้เคียงกับพิกัดที่ระบุ โดยใช้วิธีการค้นหา 'nearest'

# ดึงข้อมูลอุณหภูมิในทุกช่วงเวลา ณ ตำแหน่งที่เลือก
time_series = nearest_point.values  # นำค่าของข้อมูลอุณหภูมิในตำแหน่งที่เลือกมาเก็บในตัวแปร time_series
time = ds['time'].values  # นำค่าของข้อมูลเวลาจาก Dataset มาเก็บในตัวแปร time สำหรับการพล็อตกราฟ

# สร้าง Time Series Plot ด้วย Plotly
fig = go.Figure()  # สร้าง object Figure สำหรับเก็บข้อมูลกราฟ

fig.add_trace(go.Scatter(
    x=time,  # ใช้ข้อมูลเวลาที่ดึงมาเป็นแกน x
    y=time_series,  # ใช้ข้อมูลอุณหภูมิเป็นแกน y
    mode='lines+markers',  # กำหนดให้กราฟเป็นแบบเส้นต่อเนื่องและมีจุดบนกราฟ
    name='Temperature over Time'  # ตั้งชื่อให้กับกราฟนี้
))

fig.update_layout(
    title=f'Temperature Time Series at bangkok)',  # ตั้งชื่อกราฟว่า 'Temperature Time Series at Bangkok'
    xaxis_title='Time',  # ตั้งชื่อแกน x ว่า 'Time'
    yaxis_title='Temperature (°C)'  # ตั้งชื่อแกน y ว่า 'Temperature (°C)'
)

# บันทึกเป็นไฟล์ HTML
fig.write_html("src/HTML/temp_time_series.html")  # บันทึกกราฟที่สร้างในรูปแบบไฟล์ HTML ในตำแหน่งที่กำหนด
print(ds['time'])  # พิมพ์ข้อมูลเวลาใน Dataset ออกมาเพื่อเช็คความถูกต้อง




