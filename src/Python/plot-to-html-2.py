import xarray as xr
import plotly.graph_objects as go
import pandas as pd

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.2021.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')

# คำนวณค่าเฉลี่ยอุณหภูมิรายปี (ในกรณีนี้ format เวลาของ dataset ต้องสอดคล้องกับการคำนวณรายปี)
# Convert time coordinate to datetime for easier grouping
ds['time'] = pd.to_datetime(ds['time'].values, origin='1900-01-01', unit='D')

# Group by year and compute the mean temperature for each year
mean_temp_yearly = data_var.groupby('time.year').mean(dim=('lat', 'lon'))

# ดึงข้อมูลปีและค่าเฉลี่ยอุณหภูมิในแต่ละปี
years = mean_temp_yearly['year'].values
mean_temperature = mean_temp_yearly.values

# สร้าง Time Series Plot ด้วย Plotly
fig = go.Figure()

fig.add_trace(go.Scatter(
    x=years,
    y=mean_temperature,
    mode='lines+markers',
    name='Mean Global Temperature per Year'
))

fig.update_layout(
    title='Mean Global Temperature Time Series',
    xaxis_title='Year',
    yaxis_title='Mean Temperature (°C)'
)

# บันทึกเป็นไฟล์ HTML
fig.write_html("src/HTML/output_mean_temp_time_series.html")

