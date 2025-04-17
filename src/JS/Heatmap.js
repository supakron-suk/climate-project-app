//Heatmap
export const Heatmap = (
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

  const groupedData = {};

  for (let year = startYear; year <= endYear; year++) {
    const yearData = dataByYear[year];
    const geojson = isRegionView ? yearData?.region : yearData?.province;

    if (!geojson || !geojson.features) continue;

    let filteredFeatures = geojson.features;

    // ✅ ใช้ logic แบบเดียวกับ TrendMap
    if (isRegionView) {
      if (region && region !== "Thailand_region") {
        filteredFeatures = filteredFeatures.filter(
          (feature) => feature.properties.region_name === region
        );
      }
    } else {
      if (province && province !== "Thailand_province") {
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

      const geometry = feature.geometry;

      if (!groupedData[name]) {
        groupedData[name] = {
          geometry,
          total: 0,
          count: 0,
        };
      }

      if (typeof value === "number" && !isNaN(value)) {
        groupedData[name].total += value;
        groupedData[name].count++;
      }
    });
  }

  const averagedGeoJSON = {
    type: "FeatureCollection",
    features: Object.entries(groupedData).map(([name, data]) => ({
      type: "Feature",
      geometry: data.geometry,
      properties: {
        name,
        [valueKey]: data.count > 0 ? data.total / data.count : null,
        level: isRegionView ? "region" : "province",
      },
    })),
  };

  const levelSet = new Set(averagedGeoJSON.features.map(f => f.properties.level));
  console.log("🔥 Heatmap level types in features:", [...levelSet]);
  console.log("🔥 Heatmap feature count:", averagedGeoJSON.features.length);

  return averagedGeoJSON;
};

// export const Heatmap = (
//   dataByYear,
//   startYear,
//   endYear,
//   region,
//   province,
//   valueKey,
//   configData,
//   isRegionView
// ) => {
//   if (startYear > endYear) {
//     console.error("Start year must be less than or equal to end year.");
//     return null;
//   }

//   const groupedData = {};

//   for (let year = startYear; year <= endYear; year++) {
//     const yearData = dataByYear[year];

//     const geojson = isRegionView
//       ? yearData?.region
//       : yearData?.province;

//     if (!geojson || !geojson.features) continue;

//     let filteredFeatures = geojson.features;

//     if (isRegionView) {
//       // ✅ Region View
//       if (region !== "Thailand_region") {
//         filteredFeatures = filteredFeatures.filter(
//           (feature) => feature.properties.region_name === region
//         );
//       }
//     } else {
//       // ✅ Province View
//       if (province && province !== "Thailand_province") {
//         filteredFeatures = filteredFeatures.filter(
//           (feature) => feature.properties.name === province
//         );
//       }
//     }

//     filteredFeatures.forEach((feature) => {
//       const name = isRegionView
//         ? feature.properties.region_name
//         : feature.properties.name;

//       // ✅ Region ใช้ค่า annual ได้เลย
//       const value = isRegionView
//         ? feature.properties.annual?.[valueKey]
//         : feature.properties[valueKey]; // Province เป็นรายเดือน

//       const geometry = feature.geometry;

//       // ✅ เก็บ geometry ครั้งแรกที่เจอ
//       if (!groupedData[name]) {
//         groupedData[name] = {
//           geometry,
//           total: 0,
//           count: 0,
//         };
//       }

//       // ✅ Province → รวมหลายเดือนของแต่ละปี
//       if (typeof value === "number" && !isNaN(value)) {
//         groupedData[name].total += value;
//         groupedData[name].count++;
//       }
//     });
//   }

//   // ✅ คำนวณค่าเฉลี่ยแล้วสร้าง GeoJSON
//   const averagedGeoJSON = {
//     type: "FeatureCollection",
//     features: Object.entries(groupedData).map(([name, data]) => ({
//       type: "Feature",
//       geometry: data.geometry,
//       properties: {
//         name,
//         [valueKey]: data.count > 0 ? data.total / data.count : null,
//         level: isRegionView ? "region" : "province",
//       },
//     })),
//   };

//   // ✅ Console log ช่วย debug
//   const levelSet = new Set(averagedGeoJSON.features.map(f => f.properties.level));
//   console.log("🔥 Heatmap level types in features:", [...levelSet]);
//   console.log("🔥 Heatmap feature count:", averagedGeoJSON.features.length);

//   return averagedGeoJSON;
// };

// export const Heatmap = (
//   dataByYear,
//   startYear,
//   endYear,
//   region,
//   province,
//   valueKey,
//   configData,
//   isRegionView
// ) => {
//   if (startYear > endYear) {
//     console.error("Start year must be less than or equal to end year.");
//     return null;
//   }

//   const groupedData = {}; 

//   for (let year = startYear; year <= endYear; year++) {
//     const yearData = dataByYear[year];

//     const geojson = isRegionView
//       ? yearData?.region
//       : yearData?.province;

//     if (!geojson || !geojson.features) continue;

//     let filteredFeatures = geojson.features;

//       if (isRegionView) {
//     if (region !== "Thailand_region") {
//       filteredFeatures = filteredFeatures.filter(
//         (feature) => feature.properties.region_name === region
//       );
//     }
//   } else {
//     if (province && province !== "Thailand_province") {
//       filteredFeatures = filteredFeatures.filter(
//         (feature) => feature.properties.name === province
//       );
//     }
//   }

//     filteredFeatures.forEach((feature) => {
//       const name = isRegionView
//         ? feature.properties.region_name
//         : feature.properties.name;

//       const value = isRegionView
//       ? feature.properties.annual?.[valueKey]  
//       : feature.properties[valueKey];          

//       const geometry = feature.geometry;

//       if (!groupedData[name]) {
//         groupedData[name] = {
//           geometry,
//           total: 0,
//           count: 0,
//         };
//       }

//       if (typeof value === "number" && !isNaN(value)) {
//         groupedData[name].total += value;
//         groupedData[name].count++;
//       }
//     });
//   }

//   const averagedGeoJSON = {
//     type: "FeatureCollection",
//     features: Object.entries(groupedData).map(([name, data]) => ({
//       type: "Feature",
//       geometry: data.geometry,
//       properties: {
//         name,
//         [valueKey]: data.count > 0 ? data.total / data.count : null,
//         level: isRegionView ? "region" : "province",
//       },
//     })),
//   };

//   // ✅ เพิ่มตรงนี้ เพื่อดูว่าเรากำลังส่ง region หรือ province จริงหรือไม่
//   const levelSet = new Set(averagedGeoJSON.features.map(f => f.properties.level));
//   console.log("🔥 Heatmap level types in features:", [...levelSet]);  // ควรจะเห็น ['province'] หรือ ['region']

//   // ✅ ดูจำนวน feature ด้วย
//   console.log("🔥 Heatmap feature count:", averagedGeoJSON.features.length);

//   // console.log("🔥 Heatmap data returned:", averagedGeoJSON);
//   return averagedGeoJSON;
// };










