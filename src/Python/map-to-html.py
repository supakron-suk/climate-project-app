import cartopy.crs as ccrs
import plotly.graph_objects as go
import xarray as xr
import numpy as np

# เปิดไฟล์ NetCDF และดึงข้อมูลอุณหภูมิ
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.2021.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')
x = data_var.lon
y = data_var.lat
im_data = data_var.isel(time=1).values

# สร้างกราฟโดยใช้ Plotly
fig = go.Figure(go.Heatmap(
    z=im_data,
    x=x,
    y=y,
    colorscale='Jet',
    colorbar=dict(title="Temperature (°C)", len=0.8, x=1.05)
))

# ตั้งค่าพิกัดของแผนที่
fig.update_layout(
    title="Temperature at 2 M",
    xaxis=dict(title="Longitude"),
    yaxis=dict(title="Latitude"),
    geo=dict(
        projection=go.layout.geo.Projection(type="equirectangular")
    )
)

# บันทึกเป็นไฟล์ HTML
fig.write_html("src/HTML/temp_map.html")

# แสดงผล
fig.show()
