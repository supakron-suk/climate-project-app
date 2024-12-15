
import numpy as np

# ตัวอย่างข้อมูล
years = np.array([1901, 1902, 1903, 1904, 1905])
temps = np.array([28.45, 29.45, 27.00, 25.14, 26.72])

# คำนวณ Slope ด้วย numpy.polyfit
m, _ = np.polyfit(years, temps, 1)
print(f"Slope (Trend): {m:.3f} °C/ปี")
