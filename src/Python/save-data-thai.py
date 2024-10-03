import json
from shapely.geometry import Point
import cartopy.feature as cfeature
import cartopy.crs as ccrs
import matplotlib.pyplot as plt
import xarray as xr
import geopandas as gpd  # ใช้สำหรับจัดการ shapefile
import pandas as pd
import numpy as np

# เปิดไฟล์ NetCDF
ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')

# แปลง 'time' ให้เป็น Datetime เพื่อกรองปีได้ง่ายขึ้น
ds['time'] = pd.to_datetime(ds['time'].values)

# เลือกข้อมูลเฉพาะปี 2000 ถึง 2005
data_filtered = ds.sel(time=slice('2000-01-01', '2005-12-31'))

# โหลด shapefile ของประเทศไทยจาก GeoPandas
gdf = gpd.read_file("src/shapefile/gadm41_THA_0.shp")

# สร้าง mask จาก shapefile
# ใช้ geometry ที่เก็บขอบเขตของประเทศไทย
# ขยายพื้นที่ของ mask โดยใช้ buffer() เพื่อรวมพื้นที่ขอบของประเทศไทย
buffer_distance = 0.1  # ระยะห่างในการขยายขอบประเทศ (ปรับได้ตามต้องการ)
thailand_mask = gdf.geometry.unary_union.buffer(buffer_distance)
#thailand_mask = gdf.geometry.unary_union

# สร้าง figure และ subplots สำหรับแต่ละปี
fig, axs = plt.subplots(nrows=2, ncols=3, figsize=(18, 12), subplot_kw={'projection': ccrs.PlateCarree()})
axs = axs.flatten()  # แปลง array เป็น 1D เพื่อง่ายต่อการจัดการ

# วนลูปพล็อต heatmap สำหรับแต่ละปี
for i, year in enumerate(range(2000, 2006)):
    # กรองข้อมูลตามปี
    data_year = data_filtered.sel(time=str(year))

    # คำนวณค่าเฉลี่ยสำหรับปีนั้น
    data_avg = data_year['tmp'].mean(dim='time')

    # สร้างกริดของข้อมูลที่ต้องการพล็อต
    x = data_avg.lon
    y = data_avg.lat

    # ใช้ GeoPandas เพื่อตัดข้อมูลที่อยู่นอกประเทศไทย
    # สร้าง DataArray ของข้อมูลที่มีค่า True เฉพาะภายในประเทศไทย
    lon2d, lat2d = np.meshgrid(x, y)
    coords = np.vstack([lon2d.ravel(), lat2d.ravel()]).T
    points = gpd.GeoDataFrame(geometry=gpd.points_from_xy(coords[:, 0], coords[:, 1]))

    # ตรวจสอบว่าแต่ละพิกัดอยู่ในประเทศไทยหรือไม่
    mask = points.within(thailand_mask).values.reshape(lon2d.shape)

    # ทำการกรองข้อมูลที่อยู่นอกประเทศไทย
    data_avg = xr.where(mask, data_avg, np.nan)

    # สร้างรายการพิกัดและค่าอุณหภูมิ
    geojson_polygons = []
    grid_size = 0.1  # กำหนดขนาดกริด (0.1 องศา)

    for i in range(len(x)):
        for j in range(len(y)):
            temp_value = data_avg[j, i].item()  # ใช้ .item() เพื่อแปลงเป็น float
            if not np.isnan(temp_value):  # ตรวจสอบว่าไม่ใช่ NaN
                # คำนวณมุมทั้งสี่ของสี่เหลี่ยม
                lon = x[i].item()
                lat = y[j].item()
                geojson_polygons.append({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [[
                            [lon, lat],
                            [lon + grid_size, lat],
                            [lon + grid_size, lat + grid_size],
                            [lon, lat + grid_size],
                            [lon, lat]  # กลับมาที่จุดเริ่มต้น
                        ]]
                    },
                    'properties': {
                        'temperature': float(temp_value)  # แปลงเป็น float
                    }
                })

    # สร้าง GeoJSON
    geojson_data = {
        'type': 'FeatureCollection',
        'features': geojson_polygons
    }

    # บันทึกลงไฟล์ .json สำหรับแต่ละปี
    with open(f"src/Geo-data/temperature_thailand_{year}.json", "w") as f:
        json.dump(geojson_data, f, indent=4)

# ปิด Dataset
ds.close()







#     # พล็อตแผนที่ใน subplot
#     ax = axs[i]
#     mp = ax.imshow(data_avg, extent=(x.min(), x.max(), y.min(), y.max()), cmap='jet', origin='lower')

#     # กำหนดขอบเขตแผนที่ให้แสดงเฉพาะประเทศไทย
#     ax.set_extent([97.5, 105.5, 5.5, 20.5], crs=ccrs.PlateCarree())

#     # เพิ่มชื่อแผนที่
#     ax.set_title(f'Average Temperature ({year})', fontsize=14)

#     # วาดเส้นกรอบประเทศไทยโดยใช้ GeoPandas
#     gdf.boundary.plot(ax=ax, edgecolor='black', linewidth=2)

#     # เพิ่มกริดไลน์
#     gl = ax.gridlines(draw_labels=True, alpha=0.5)
#     gl.top_labels = False
#     gl.right_labels = False

# # เพิ่มแถบสี (สีเดียวกันสำหรับทุกปี)
# #cbar = fig.colorbar(mp, ax=axs, orientation='vertical', fraction=0.05, pad=0.1)
# #cbar.set_label('Temperature (°C)')

# # จัดการ layout ให้อ่านง่าย
# plt.tight_layout()

# # แสดงผล
# plt.show()


