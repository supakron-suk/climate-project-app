// TrendMap.js
export const TrendMap = (dataByYear, startYear, endYear, region) => {
  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year.");
    return;
  }

  const filterByRegion = (features, region) => {
    if (region === 'All') {
      return features;
    }
    return features.filter((feature) => feature.properties.region === region);
  };

  const trends = []; // เก็บข้อมูลของแต่ละปีและพื้นที่

  for (let year = startYear; year <= endYear; year++) {
    const geojson = dataByYear[year];
    if (!geojson) {
      console.warn(`No data available for year ${year}`);
      continue;
    }

    const filteredFeatures = filterByRegion(geojson.features, region);

    // สำหรับแต่ละพื้นที่ เก็บข้อมูล temperature, month และ year
    filteredFeatures.forEach((feature) => {
      const { temperature, month, area } = feature.properties;
      if (typeof temperature === 'number' && month >= 1 && month <= 12) {
        trends.push({
          year,
          month,
          area,
          temperature,
        });
      }
    });
  }

  // แสดงผลข้อมูลใน Console
  console.log("Temperature Data by Area and Month:", trends);
};


