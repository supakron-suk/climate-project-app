import geopandas as gpd
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# กำหนดช่วงปีที่ต้องการดึงข้อมูล
years = range(1960, 1981)  # 1960 - 1970
spi_columns = ['spi3', 'spi6', 'spi12', 'spi24']  # SPI Scales

# สร้าง DataFrame เปล่าเพื่อเก็บผลลัพธ์
all_data = []

# อ่านไฟล์ JSON ตามปี
for year in years:
    file_path = f'src/Geo-data/Era-Dataset/era_data_polygon_{year}.json'
    try:
        data = gpd.read_file(file_path)
        data['year'] = year
        all_data.append(data[['year', 'month'] + spi_columns])  # ดึงเฉพาะคอลัมน์ที่ต้องการ
    except Exception as e:
        print(f"Error loading {file_path}: {e}")

# รวมข้อมูลทุกปี
if all_data:
    combined_data = pd.concat(all_data, ignore_index=True)
    spi_avg = combined_data.groupby(['year', 'month'])[spi_columns].mean()

    # Plot
    fig, axes = plt.subplots(len(spi_columns), 1, figsize=(12, 8), sharex=True)
    fig.suptitle("Average SPI (1960-1970)", fontsize=16)
    
    spi_avg = spi_avg.reset_index()
    spi_avg["year_month"] = spi_avg["year"] + spi_avg["month"] / 12.0  # เช่น 1960 + (1/12) = 1960.08

    for i, spi in enumerate(spi_columns):
        ax = axes[i]
        ax.bar(spi_avg["year_month"], spi_avg[spi], color=np.where(spi_avg[spi] >= 0, 'blue', 'red'), width=0.08)
        ax.axhline(0, color='black', linewidth=0.8)  # เส้นกลางที่ 0
        ax.set_ylabel("SPI", fontsize=10)
        ax.set_title(f"{spi.upper()}", fontsize=12)
    
    plt.xlabel("Year-Month", fontsize=10)
    plt.xticks(rotation=45)
    plt.tight_layout(rect=[0, 0, 1, 0.97])  # ปรับ layout
    plt.show()

else:
    print("No data available.")




