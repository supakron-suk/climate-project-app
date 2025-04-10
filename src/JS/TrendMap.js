// Trendmap.js
export const TrendMap = (dataByYear, startYear, endYear, region, province, valueKey) => {
  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year.");
    return null;
  }

  const numberOfYears = endYear - startYear;
  console.log(`🔍 TrendMap: Years requested = ${numberOfYears} years (${startYear} to ${endYear})`);
  // ฟกรองข้อมูลตามภูมิภาค
  const filterByRegion = (features, region) => {
    if (region === 'Thailand') return features; 
    return features.filter((feature) => feature.properties.region === region);
  };

  // ฟังก์ชันสำหรับกรองข้อมูลตามจังหวัด
  const filterByProvince = (features, province) => {
    if (!province) return features; // ถ้าไม่ได้ระบุจังหวัด ให้คืนค่าทุกจังหวัด
    return features.filter((feature) => feature.properties.name === province);
  };

  const trends = []; // ใช้เก็บข้อมูลเทรนด์
  const geometryMap = {}; // ใช้เก็บข้อมูลตำแหน่งทางภูมิศาสตร์ (geometry)

  // วนลูปปีที่อยู่ในช่วงที่กำหนด
  for (let year = startYear; year <= endYear; year++) {
    const geojson = dataByYear[year]; // ดึงข้อมูล GeoJSON ตามปี
    if (!geojson) continue; // ข้ามปีที่ไม่มีข้อมูล

    // กรองข้อมูลตามภูมิภาคและจังหวัด
    let filteredFeatures = filterByRegion(geojson.features, region);
    filteredFeatures = filterByProvince(filteredFeatures, province);

    // วนลูปข้อมูลที่กรองแล้ว
    filteredFeatures.forEach((feature) => {
      const { [valueKey]: value, month, name, region: featureRegion } = feature.properties;

      // ตรวจสอบว่าข้อมูล value และเดือนมีค่าถูกต้อง
      if (typeof value === 'number' && month >= 1 && month <= 12) {
        trends.push({ year, name, value, month, region: featureRegion });
        // เก็บข้อมูลตำแหน่งทางภูมิศาสตร์ของแต่ละพื้นที่
        if (!geometryMap[name]) geometryMap[name] = feature.geometry;
      }
    });
  }

  // ถ้าไม่มีข้อมูลเทรนด์ แจ้งเตือนและคืนค่า null
  if (trends.length === 0) {
    console.warn("No trends data available.");
    return null;
  }

  // จัดกลุ่มข้อมูลเทรนด์ตามพื้นที่ (name)
  const groupedTrends = trends.reduce((acc, curr) => {
    const key = curr.name; // ใช้ชื่อพื้นที่เป็นคีย์
    if (!acc[key]) acc[key] = [];
    acc[key].push({ year: curr.year, value: curr.value, month: curr.month }); // เก็บปี, value, และเดือน
    return acc;
  }, {});

  // คำนวณค่าเฉลี่ยของ value ในแต่ละปี
  const yearlyTrends = Object.entries(groupedTrends).map(([area, data]) => {
    const yearlyData = {};
    
    // เฉลี่ยข้อมูล value รายเดือนเป็นรายปี
    data.forEach(({ year, value }) => {
      if (!yearlyData[year]) {
        yearlyData[year] = { sum: 0, count: 0 };
      }
      yearlyData[year].sum += value;
      yearlyData[year].count += 1;
    });

    // คำนวณค่าเฉลี่ยในแต่ละปี
    const yearlyAverages = Object.entries(yearlyData).map(([year, { sum, count }]) => {
      return { year: parseInt(year), value: sum / count };
    });

    return { area, yearlyAverages };
  });

  // คำนวณค่า slope ของแต่ละพื้นที่ และสร้างข้อมูล GeoJSON
  const features = yearlyTrends.map(({ area, yearlyAverages }) => {
    const slope = calculateModifiedTheilSenSlope(yearlyAverages, 'value'); // คำนวณ slope จากข้อมูลที่เป็นรายปี
    const roundedSlope = parseFloat(slope.toFixed(2)); // ปัดค่า slope ให้มีทศนิยม 2 ตำแหน่ง
    return {
      type: "Feature", // ระบุประเภทข้อมูล GeoJSON
      geometry: geometryMap[area], // นำข้อมูลตำแหน่งทางภูมิศาสตร์มาใส่
      properties: {
        name: area, // ชื่อพื้นที่
        slope_value: roundedSlope, // ค่า slope
        region: trends.find((t) => t.name === area).region, // ระบุภูมิภาค
      },
    };
  });

  // สร้างข้อมูล GeoJSON สำหรับเทรนด์
  const geojson_Trendmap = {
    type: "FeatureCollection", // ระบุประเภทข้อมูลเป็น FeatureCollection
    features, // ใส่ข้อมูล Feature ที่สร้างไว้
  };

  return {
    geojson: geojson_Trendmap,
    numberOfYears: numberOfYears
  };
  
};

// ฟังก์ชันสำหรับคำนวณ Modified Theil-Sen Slope
const calculateModifiedTheilSenSlope = (data, valueKey) => {
  const n = data.length; // จำนวนข้อมูล
  const slopes = []; // เก็บค่าความชัน (slope)

  // วนลูปข้อมูลแบบจับคู่สองจุด
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const { year: x1, [valueKey]: y1 } = data[i];
      const { year: x2, [valueKey]: y2 } = data[j];
      const slope = (y2 - y1) / (x2 - x1); // คำนวณความชันระหว่างจุดสองจุด
      slopes.push(slope); // เก็บค่าความชันในอาเรย์
    }
  }

  // จัดเรียงค่าความชันจากน้อยไปมาก
  slopes.sort((a, b) => a - b);

  // คำนวณค่า median ของค่าความชัน
  const mid = Math.floor(slopes.length / 2);
  return slopes.length % 2 === 0 ? (slopes[mid - 1] + slopes[mid]) / 2 : slopes[mid];
};

