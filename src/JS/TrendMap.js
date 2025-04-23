// Trendmap.js

// ไม่ต้อง import configData ถ้ามีใน app.js
export const TrendMap = (
  dataByYear,
  startYear,
  endYear,
  region,
  province,
  valueKey,
  configData,
  isRegionView
) => {
  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year.");
    return null;
  }

  const trends = [];
  const geometryMap = {};

  for (let year = startYear; year <= endYear; year++) {
    const yearData = dataByYear[year];
    const geojson = isRegionView
      ? yearData?.region
      : yearData?.province;

    if (!geojson || !geojson.features) continue;

    let filteredFeatures = geojson.features;

      if (isRegionView) {
    if (region !== "Thailand_region") {
      filteredFeatures = filteredFeatures.filter(
        (feature) => feature.properties.region_name === region
      );
    }
  } else {
    if (province && province !== "Thailand" && province !== "Thailand_province") {
      filteredFeatures = filteredFeatures.filter(
        (feature) => feature.properties.name === province
      );
    }
  }


    filteredFeatures.forEach((feature) => {
      const name = isRegionView
        ? feature.properties.region_name
        : feature.properties.name;

      const value = isRegionView
        ? feature.properties.annual?.[valueKey]
        : feature.properties[valueKey];

      if (typeof value === 'number') {
        trends.push({ year, name, value });
        if (!geometryMap[name]) geometryMap[name] = feature.geometry;
      }
    });
  }

  if (trends.length === 0) {
    console.warn("No trends data available.");
    return null;
  }

  const groupedTrends = trends.reduce((acc, { year, name, value }) => {
    if (!acc[name]) acc[name] = [];
    acc[name].push({ year, value });
    return acc;
  }, {});

  const yearlyTrends = Object.entries(groupedTrends).map(([area, data]) => {
    const yearlyData = {};
    data.forEach(({ year, value }) => {
      if (!yearlyData[year]) yearlyData[year] = { sum: 0, count: 0 };
      yearlyData[year].sum += value;
      yearlyData[year].count++;
    });

    const yearlyAverages = Object.entries(yearlyData).map(([year, { sum, count }]) => ({
      year: parseInt(year),
      value: sum / count,
    }));

    return { area, yearlyAverages };
  });

  const features = yearlyTrends.map(({ area, yearlyAverages }) => {
    const slope = calculateModifiedTheilSenSlope(yearlyAverages, 'value');
    const roundedSlope = parseFloat(slope.toFixed(2));
    return {
      type: "Feature",
      geometry: geometryMap[area],
      properties: {
        name: area,
        slope_value: roundedSlope,
        level: isRegionView ? "region" : "province",
      },
    };
  });

    const levelSet = new Set(features.map(f => f.properties.level));
  // console.log("📈 TrendMap level types in features:", [...levelSet]);
  // console.log("📈 TrendMap feature count:", features.length);

  return {
    geojson: {
      type: "FeatureCollection",
      features,
    },
    numberOfYears: endYear - startYear,
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

