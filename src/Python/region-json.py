import xarray as xr
import pandas as pd
import json
import xclim

ds_tmax = xr.open_dataset("../dataset-nc/TH_tmax_ERA5_day.1960-2022.nc")
ds_tmin = xr.open_dataset("../dataset-nc/TH_tmin_ERA5_day.1960-2022.nc")
ds_pr = xr.open_dataset("../dataset-nc/TH_pr_ERA5_day.1960-2022.nc")

def create_grid_polygon(lon_center, lat_center, lon_step, lat_step):
    return [
        [float(lon_center - lon_step / 2), float(lat_center - lat_step / 2)],
        [float(lon_center + lon_step / 2), float(lat_center - lat_step / 2)],
        [float(lon_center + lon_step / 2), float(lat_center + lat_step / 2)],
        [float(lon_center - lon_step / 2), float(lat_center + lat_step / 2)],
        [float(lon_center - lon_step / 2), float(lat_center - lat_step / 2)]
    ]

lon_step = float(ds_tmax['longitude'][1] - ds_tmax['longitude'][0])
lat_step = float(ds_tmax['latitude'][1] - ds_tmax['latitude'][0])

for year in range(1960, 1966):
    data_tmax_year = ds_tmax.sel(time=str(year))
    data_tmin_year = ds_tmin.sel(time=str(year))
    data_pr_year = ds_pr.sel(time=str(year))
    
    tmax_monthly = data_tmax_year['mx2t'].resample(time='M').mean() - 273.15
    tmin_monthly = data_tmin_year['mn2t'].resample(time='M').mean() - 273.15
    pr_monthly = data_pr_year['tp'].resample(time='M').sum() * 1000
    
    pre = data_pr_year.tp
    pre.attrs['units'] = 'mm/day'
    
    rx1day = xclim.indices.max_1day_precipitation_amount(data_pr_year.tp, freq='M') * 1000
    
    
    txx_monthly = xclim.indices.tx_max(data_tmax_year['mx2t'], freq='M') - 273.15
    tnn_monthly = xclim.indices.tn_min(data_tmin_year['mn2t'], freq='M') - 273.15
    
    features = []
    lon, lat = tmax_monthly['longitude'].values, tmax_monthly['latitude'].values

    for month_idx, month in enumerate(tmax_monthly['time'].values):
        tmax_values = tmax_monthly.isel(time=month_idx).values
        tmin_values = tmin_monthly.isel(time=month_idx).values
        pr_values = pr_monthly.isel(time=month_idx).values
        rx1day_values = rx1day.isel(time=month_idx).values
        txx_values = txx_monthly.isel(time=month_idx).values
        tnn_values = tnn_monthly.isel(time=month_idx).values

        for i, lon_value in enumerate(lon):
            for j, lat_value in enumerate(lat):
                tmax = tmax_values[j, i]
                tmin = tmin_values[j, i]
                pr = pr_values[j, i]
                rx = rx1day_values[j, i]
                txx = txx_values[j, i]
                tnn = tnn_values[j, i]
                
                if not pd.isnull(tmax) and not pd.isnull(tmin) and not pd.isnull(pr):
                    grid_polygon = create_grid_polygon(lon_value, lat_value, lon_step, lat_step)
                    features.append({
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [grid_polygon]
                        },
                        "properties": {
                            "tmax": float(tmax),
                            "tmin": float(tmin),
                            "pre": float(pr),
                            "txx": float(txx),
                            "tnn": float(tnn),
                            "rx1day": float(rx),
                            "month": pd.Timestamp(month).month
                        }
                    })

    geojson_data = {
        "type": "FeatureCollection",
        "features": features
    }

    output_file = f"../Geo-data/Era-Dataset/era_data_grid_{year}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(geojson_data, f, ensure_ascii=False, indent=4)
    
    print(f"Data year {year} has been saved file in folder {output_file}")


# # นำเข้าห้องสมุดที่จำเป็น
# import geopandas as gpd
# import matplotlib.pyplot as plt
# import xarray as xr
# import pandas as pd
# import numpy as np
# import matplotlib

# # ตั้งค่าฟอนต์ให้เป็น Times New Roman
# font = {'family': 'Times New Roman',
#         'weight': 'bold',
#         'size': 20}
# matplotlib.rc('font', **font)

# # กำหนดไฟล์ netCDF และตัวแปรที่ใช้
# name_of_nc = "src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc"
# name_of_variable = 'tmp'  # ตัวอย่างตัวแปรในไฟล์ netCDF
# name_of_lon_var = 'lon'
# name_of_lat_var = 'lat'
# box_values = np.array([5.5, 20.5, 96, 106])  # ขอบเขตประเทศไทย
# correct_360 = False

# # อ่านข้อมูล netCDF
# ds = xr.open_dataset(name_of_nc)
# data_var = ds.metpy.parse_cf(name_of_variable)

# # แปลง 'time' เป็น Datetime
# ds['time'] = pd.to_datetime(ds['time'].values)

# # เลือกปีที่ต้องการและเฉลี่ยข้อมูลรายปี
# year = 2000
# temp = ds.sel(lon=slice(box_values[2], box_values[3]), 
#               lat=slice(box_values[0], box_values[1]), 
#               time=str(year))
# data_avg = temp[name_of_variable].mean(dim='time')

# # โหลด shapefile ของประเทศไทยจาก GeoJSON และคำนวณ centroid
# gdf = gpd.read_file("src/Geo-data/shapefile-lv1-thailand.json")
# gdf['lat'] = gdf.centroid.y
# gdf['lon'] = gdf.centroid.x

# # แสดงข้อมูลตัวอย่างและชื่อคอลัมน์
# print(gdf[['lat', 'lon']].head())
# print("-" * 50)
# print(gdf.columns)

# # แสดงขอบเขต shapefile ของประเทศไทย
# gdf.boundary.plot(color=None, edgecolor='k', linewidth=0.5, figsize=(10, 10))
# plt.xlabel('Longitude')
# plt.ylabel('Latitude')
# plt.title('Boundaries of Thailand')
# plt.show()








# import cartopy.feature as cfeature
# import cartopy.crs as ccrs
# import matplotlib.pyplot as plt
# import xarray as xr
# import geopandas as gpd
# import pandas as pd
# import numpy as np
# from shapely.geometry import Point, Polygon, MultiPolygon, mapping
# import json
# from province import province_coord  # ดึงข้อมูลพิกัดของจังหวัดในแต่ละภาคจาก province.py

# เปิดไฟล์ NetCDF
# ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")
# data_var = ds.metpy.parse_cf('tmp')

# # แปลง 'time' เป็น Datetime
# ds['time'] = pd.to_datetime(ds['time'].values)

# # เลือกปีที่ต้องการ
# year = 2000

# # เลือกข้อมูลเฉพาะพื้นที่ประเทศไทย และเฉพาะปีที่เลือก
# temp = ds.sel(lon=slice(96, 106), lat=slice(5.5, 20.5), time=str(year))

# # คำนวณค่าเฉลี่ยของข้อมูลในปีที่เลือก
# data_avg = temp['tmp'].mean(dim='time')

# # โหลด shapefile ของประเทศไทย
# gdf = gpd.read_file("src/Geo-data/thailand-Geo.json")






