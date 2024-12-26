// Trendmap.js
export const TrendMap = (dataByYear, startYear, endYear, region, province) => {
  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year.");
    return null;
  }

  const filterByRegion = (features, region) => {
    if (region === 'All') return features;
    return features.filter((feature) => feature.properties.region === region);
  };

  const filterByProvince = (features, province) => {
    if (!province) return features;
    return features.filter((feature) => feature.properties.name === province);
  };

  const trends = [];
  const geometryMap = {};

  for (let year = startYear; year <= endYear; year++) {
    const geojson = dataByYear[year];
    if (!geojson) continue;

    let filteredFeatures = filterByRegion(geojson.features, region);
    filteredFeatures = filterByProvince(filteredFeatures, province);

    filteredFeatures.forEach((feature) => {
      const { temperature, month, name, region: region } = feature.properties;
      if (typeof temperature === 'number' && month >= 1 && month <= 12) {
        trends.push({ year, name, temperature, region: feature.properties.region});
        if (!geometryMap[name]) geometryMap[name] = feature.geometry;
      }
    });
  }

  if (trends.length === 0) {
    console.warn("No trends data available.");
    return null;
  }

  const groupedTrends = trends.reduce((acc, curr) => {
    const key = curr.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ year: curr.year, temperature: curr.temperature });
    return acc;
  }, {});

  const features = Object.entries(groupedTrends).map(([area, data]) => {
    const slope = calculateModifiedTheilSenSlope(data);
    const roundedSlope = parseFloat(slope.toFixed(2));
    return {
      type: "Feature",
      geometry: geometryMap[area],
      properties: {
        name: area,
        slope_value: roundedSlope,
        region: trends.find((t) => t.name === area).region,
      },
    };
  });

  const geojson_Trendmap = {
    type: "FeatureCollection",
    features,
  };

  console.log("Generated GeoJSON:", geojson_Trendmap); // Log ข้อมูล GeoJSON
  return geojson_Trendmap;
};

const calculateModifiedTheilSenSlope = (data) => {
  const n = data.length;
  const slopes = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const { year: x1, temperature: y1 } = data[i];
      const { year: x2, temperature: y2 } = data[j];
      const slope = (y2 - y1) / (x2 - x1);
      slopes.push(slope);
    }
  }
  slopes.sort((a, b) => a - b);
  const mid = Math.floor(slopes.length / 2);
  return slopes.length % 2 === 0 ? (slopes[mid - 1] + slopes[mid]) / 2 : slopes[mid];
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

//     // Debug: แสดงข้อมูลปีและภูมิภาคที่กำลังประมวลผล
//     //console.log(`Processing data for Year: ${year}, Region: ${region}`);
//     //console.log(`Filtered Features:`, filteredFeatures.map(f => f.properties.name));

//     // สำหรับแต่ละพื้นที่ เก็บข้อมูล temperature, month และ year
//     filteredFeatures.forEach((feature) => {
//       const { temperature, month, name, region: featureRegion } = feature.properties;

//       if (typeof temperature === 'number' && month >= 1 && month <= 12) {
//         // แสดงข้อมูลที่เลือกแบบละเอียด
//         console.log(`Data -> Year: ${year}, Month: ${month}, Area: ${name} (${featureRegion}), Temperature: ${temperature}`);
        
//         trends.push({
//           year,
//           month,
//           name,
//           temperature,
//           region: featureRegion,
//         });
//       }
//     });
//   }

//   // Debug: แสดงข้อมูลที่เก็บอยู่ใน trends
//   console.log("Collected Trends Data:", trends);

//   // แสดงผลข้อมูลแบบ Grouped ตามพื้นที่และปี
//   const groupedByAreaAndYear = trends.reduce((acc, curr) => {
//     const { year, name, temperature } = curr;
//     if (!acc[name]) {
//       acc[name] = {};
//     }
//     if (!acc[name][year]) {
//       acc[name][year] = [];
//     }
//     acc[name][year].push(temperature);
//     return acc;
//   }, {});
// };


