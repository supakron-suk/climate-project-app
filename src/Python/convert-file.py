import csv
import json

# เปิดไฟล์ CSV
csv_file = 'src/csv-file/output.csv'
geojson_file = 'src/Geo-data/outtput-geo-data.json'

# เตรียมโครงสร้างพื้นฐานของ GeoJSON
geojson = {
    "type": "FeatureCollection",
    "features": []
}

# อ่านข้อมูลจาก CSV และสร้าง GeoJSON
with open(csv_file, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        # ข้ามข้อมูลที่ไม่มีค่า temperature
        if row['temperature'] == '--':
            continue

        # สร้างโครงสร้างของ Feature
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(row['longitude']), float(row['latitude'])]
            },
            "properties": {
                "temperature": float(row['temperature'])
            }
        }
        geojson['features'].append(feature)

# บันทึก GeoJSON ลงไฟล์
with open(geojson_file, 'w') as f:
    json.dump(geojson, f, indent=2)

print(f"GeoJSON ถูกสร้างเรียบร้อยแล้ว: {geojson_file}")

