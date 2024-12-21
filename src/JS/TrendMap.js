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
      const { temperature, month, name } = feature.properties;
      if (typeof temperature === 'number' && month >= 1 && month <= 12) {
        trends.push({
          year,
          month,
          name,
          temperature,
        });
      }
    });
  }

  // แสดงผลข้อมูลแบบ Grouped ตามพื้นที่และปี
  const groupedByAreaAndYear = trends.reduce((acc, curr) => {
    const { year, name, temperature } = curr;
    if (!acc[name]) {
      acc[name] = {};
    }
    if (!acc[name][year]) {
      acc[name][year] = [];
    }
    acc[name][year].push(temperature);
    return acc;
  }, {});

  console.log("Grouped Temperature Data by Area and Year:", groupedByAreaAndYear);
};

// export const TrendMap = (dataByYear, startYear, endYear, region) => {
//   if (startYear > endYear) {
//     console.error("Start year must be less than or equal to end year.");
//     return;
//   }

//   const filterByRegion = (features, region) => {
//     if (region === 'All') {
//       return features;
//     }
//     return features.filter((feature) => feature.properties.region === region);
//   };

//   const trends = []; // เก็บข้อมูลของแต่ละปีและพื้นที่

//   for (let year = startYear; year <= endYear; year++) {
//     const geojson = dataByYear[year];
//     if (!geojson) {
//       console.warn(`No data available for year ${year}`);
//       continue;
//     }

//     const filteredFeatures = filterByRegion(geojson.features, region);

//     // สำหรับแต่ละพื้นที่ เก็บข้อมูล temperature, year และ name
//     filteredFeatures.forEach((feature) => {
//       const { temperature, name } = feature.properties;
//       if (typeof temperature === 'number') {
//         trends.push({
//           year,
//           name,
//           temperature,
//         });
//       }
//     });
//   }

//   // จัดกลุ่มข้อมูลตามชื่อจังหวัด
//   const groupedByProvince = trends.reduce((acc, trend) => {
//     const { name, year, temperature } = trend;
//     if (!acc[name]) {
//       acc[name] = [];
//     }
//     acc[name].push({ year, temperature });
//     return acc;
//   }, {});

//   // คำนวณค่า slope สำหรับแต่ละจังหวัด
//   Object.entries(groupedByProvince).forEach(([province, data]) => {
//     // เรียงข้อมูลตามปี
//     const sortedData = data.sort((a, b) => a.year - b.year);

//     // แยกค่า year (x) และ temperature (y)
//     const x = sortedData.map((d) => d.year);
//     const y = sortedData.map((d) => d.temperature);

//     // คำนวณ slope (m) ด้วยสูตร Linear Regression: m = Σ((x - x̄)(y - ȳ)) / Σ((x - x̄)²)
//     const n = x.length;
//     const xMean = x.reduce((sum, val) => sum + val, 0) / n;
//     const yMean = y.reduce((sum, val) => sum + val, 0) / n;

//     const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
//     const denominator = x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);

//     const slope = denominator !== 0 ? numerator / denominator : 0;

//     // แสดงผลใน Console
//     //console.log(`Province: ${province}`);
//     //console.log(`  Slope: ${slope.toFixed(4)}`);
//   });
// };
