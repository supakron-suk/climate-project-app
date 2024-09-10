import cartopy.feature as cfeature
import cartopy.crs as ccrs
import matplotlib.pyplot as plt
import xarray as xr
import numpy as np
import pandas as pd
from metpy.cbook import get_test_data

ds = xr.open_dataset("src/nc-file/cru_ts4.08.2021.2023.tmp.dat.nc")
data_var = ds.metpy.parse_cf('tmp')
x = data_var.lon
y = data_var.lat
im_data = data_var.isel(time=1)
print(im_data)

fig = plt.figure(figsize=(64, 64))
ax = fig.add_subplot(1, 1, 1, projection=ccrs.PlateCarree())
mp = ax.imshow(im_data, extent=(x.min(), x.max(), y.min(), y.max()), cmap='jet', origin='lower')
plt.title('TEMP at 2 M', fontsize=12)
states_provinces = cfeature.NaturalEarthFeature(
    category='cultural',
    name='admin_1_states_provinces_lines',
    scale='10m',
    facecolor='none'
    )
# ax.add_feature(cfeature.BORDERS, edgecolor='blue')
# ax.add_feature(states_provinces, edgecolor='blue')
# ax.add_feature(cfeature.LAND)
# ax.add_feature(cfeature.COASTLINE)
# ax.add_feature(cfeature.LAND)
# ax.add_feature(cfeature.OCEAN)
# ax.add_feature(cfeature.COASTLINE)
# ax.add_feature(cfeature.LAKES, alpha=0.5)
# ax.add_feature(cfeature.RIVERS)

# adding colorbar and adjust the size
cbar = fig.colorbar(mp, shrink=0.3)
# cbar.minorticks_on()

# adding the long lat grids and enabling the tick labels
gl = ax.gridlines(draw_labels=True, alpha=0.1)
gl.top_labels = False
gl.right_label = False
# plt.savefig('WRF_test1.jpg', dpi=330)
plt.show()