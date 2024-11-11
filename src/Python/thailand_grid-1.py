import matplotlib.pyplot as plt
import pandas as pd
import geopandas as gpd
import numpy as np
import xarray as xr
import cartopy.feature as cfeature
import cartopy.crs as ccrs
from shapely.geometry import box
import candex 

if __name__ == '__main__':
    ds = xr.open_dataset('src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc')
    data_var = ds.metpy.parse_cf('tmp')

    ds['time'] = pd.to_datetime(ds['time'].values)
    data_filtered = ds.sel(time=slice('2022-01-01', '2023-12-31'))

    fig, axs = plt.subplots(nrows=1, ncols=1, figsize=(18, 12), subplot_kw={'projection': ccrs.PlateCarree()})

    year = 2023
    # เลือกข้อมูลเฉพาะพิกัดประเทศไทยและเฉลี่ยข้อมูล
    temp = data_filtered.sel(lon=slice(96, 106), lat=slice(4, 21), time=str(year))
    data_avg = temp['tmp'].mean(dim='time')

    x = temp.lon
    y = temp.lat

    ax = axs
    mp = ax.imshow(data_avg, extent=(x.min(), x.max(), y.min(), y.max()), cmap='jet', origin='lower')
    
    ax.set_extent([96, 106, 4, 21], crs=ccrs.PlateCarree())

    plt.title('Average Temperature for Thailand in ' + str(year), fontsize=12)
    states_provinces = cfeature.NaturalEarthFeature(
        category='cultural',
        name='admin_1_states_provinces_lines',
        scale='10m',
        facecolor='none'
    )

    # Load shapefiles
    shp_target = gpd.read_file('src/shapefile/gadm41_THA_1.shp')
    shp_source = gpd.read_file('src/shapefile/ThaiGrid.shp')
    shp_source = shp_source.set_crs("EPSG:4326")

    # Perform intersection and select only the geometry column
    shp_int = candex.intersection_shp(shp_target, shp_source)
    shp_int = shp_int[['geometry']]

    #ax.add_feature(states_provinces, edgecolor='gray')
    shp_int.geometry.boundary.plot(ax=ax, color=None, edgecolor='k', linewidth=0.5, figsize=(20,20))

    gl = ax.gridlines(draw_labels=True, alpha=0.1)
    gl.top_labels = False
    gl.right_labels = False
    cbar = fig.colorbar(mp, ax=axs, orientation='horizontal', fraction=0.05, pad=0.1, shrink=0.3)
    cbar.set_label('Temperature (°C)')

    plt.show()
