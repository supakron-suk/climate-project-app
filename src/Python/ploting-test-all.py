import xarray as xr
import plotly.graph_objects as go

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.2021.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')
print(ds)