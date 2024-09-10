import json
import pandas as pd

# อ่านข้อมูลจาก JSON
with open('src/Geo-data/cru_ts4.08.20212023.tmp.dat.json', 'r') as f:
    data = json.load(f)

# สร้าง list เพื่อเก็บข้อมูลที่จะใส่ใน DataFrame
data_list = []

# วนลูปเพื่อสร้างข้อมูลในรูปแบบที่เหมาะสมกับ DataFrame
for time_index, time in enumerate(data['variables']['time']['data']):
    for lat_index, lat in enumerate(data['variables']['lat']['data']):
        for lon_index, lon in enumerate(data['variables']['lon']['data']):
            temp = data['variables']['tmp']['data'][time_index][lat_index][lon_index]
            data_list.append([time, lat, lon, temp])

# สร้าง DataFrame
df = pd.DataFrame(data_list, columns=['time', 'lat', 'lon', 'tmp'])

# บันทึกเป็น CSV
df.to_csv('src/Python/output.csv', index=False)