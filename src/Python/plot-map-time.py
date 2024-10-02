import cartopy.feature as cfeature
import cartopy.crs as ccrs
import matplotlib.pyplot as plt
import xarray as xr
import pandas as pd


ds = xr.open_dataset("src/dataset-nc/cru_ts4.08.1901.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')


ds['time'] = pd.to_datetime(ds['time'].values)


data_filtered = ds.sel(time=slice('2000-01-01', '2005-12-31'))


fig, axs = plt.subplots(nrows=2, ncols=3, figsize=(18, 12), subplot_kw={'projection': ccrs.PlateCarree()})
axs = axs.flatten()  


for i, year in enumerate(range(2000, 2006)):
   
    data_year = data_filtered.sel(time=str(year))

  
    data_avg = data_year['tmp'].mean(dim='time')


    global_avg_temp = data_avg.mean().item()

    
    x = data_avg.lon
    y = data_avg.lat

    
    ax = axs[i]
    mp = ax.imshow(data_avg, extent=(x.min(), x.max(), y.min(), y.max()), cmap='jet', origin='lower')

    
    ax.set_title(f'Temperature heatmap ({year})', fontsize=14)

   
    ax.text(0.05, 0.1, f'Global Avg Temp: {global_avg_temp:.2f}°C',
            transform=ax.transAxes, fontsize=12, color='white', bbox=dict(facecolor='black', alpha=0.7))

   
    gl = ax.gridlines(draw_labels=True, alpha=0.5)
    gl.top_labels = False
    gl.right_labels = False


plt.tight_layout()


plt.show()
