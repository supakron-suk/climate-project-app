import xarray as xr

def read_netcdf(file_path):
    """อ่านไฟล์ NetCDF ด้วย xarray และแปลงเป็น dictionary"""
    try:
        ds = xr.open_dataset(file_path)
        print(ds)  
        return ds.to_dict() 
    except Exception as e:
        print(f"Error reading NetCDF file: {e}")
        return None
