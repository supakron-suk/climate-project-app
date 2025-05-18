//Heatmap
export const spi_Heatmap = (
  dataByYear,
  startYear,
  endYear,
  selectedValue,
  selectedScale,
  selectedRegion,
  selectedProvince,
  isRegionView
) => {
  console.log("Using scale:", selectedScale);

  const sumByArea = {};
  const countByArea = {};
  const geometryByArea = {};

  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    const geojson = isRegionView
      ? dataByYear[year]?.region
      : dataByYear[year]?.province;

    if (!geojson?.features) continue;

    const filtered = geojson.features.filter((f) => {
      if (isRegionView) {
        if (selectedRegion === "Thailand_region") return true;
        return f.properties.region_name === selectedRegion;
      } else {
        if (selectedProvince === "Thailand") return true;
        return f.properties.province_name === selectedProvince;
      }
    });

    filtered.forEach((feature) => {
      const name = isRegionView
        ? feature.properties.region_name
        : feature.properties.province_name;

      const monthlyData = feature.properties.monthly?.[selectedScale];
      if (!monthlyData || !Array.isArray(monthlyData)) return;

      if (!sumByArea[name]) {
        sumByArea[name] = 0;
        countByArea[name] = 0;
        geometryByArea[name] = feature.geometry; 
      }

      monthlyData.forEach((val) => {
        if (typeof val === "number" && !isNaN(val)) {
          sumByArea[name] += val;
          countByArea[name]++;
        }
      });
    });
  }

  const resultGeoJSON = {
    type: "FeatureCollection",
    features: Object.keys(sumByArea).map((name) => ({
      type: "Feature",
      geometry: geometryByArea[name],
      properties: {
        name,
        [selectedScale]: countByArea[name] > 0 ? sumByArea[name] / countByArea[name] : null,
        level: isRegionView ? "region" : "province",
      },
    })),
  };

  console.log("SPI GeoJSON:", resultGeoJSON);
  return resultGeoJSON;
};

export const Heatmap = (
  dataByYear,
  startYear,
  endYear,
  region,
  province,
  valueKey,
  configData,
  isRegionView,
  selectedScale,
  selectedDataset 
) => {
  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year.");
    return null;
  }

  const isMultiScale = valueKey === "spi" || valueKey === "spei";

  const viewType = isRegionView ? "region" : "province";
  const fileConfig = configData.datasets[selectedDataset]?.file_name_pattern?.[viewType];
  const areaProperty = fileConfig?.area_property || "name";

  const sumByArea = {};
  const countByArea = {};
  const geometryByArea = {};

  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    const geojson = dataByYear[year]?.[viewType];
    if (!geojson?.features) continue;

    let filteredFeatures = geojson.features;

    // ใช้ areaProperty เพื่อ filter โดยไม่ hardcode
    const selectedArea = isRegionView ? region : province;
    if (
      selectedArea &&
      selectedArea !== "Thailand" &&
      selectedArea !== "Thailand_region"
    ) {
      filteredFeatures = filteredFeatures.filter(
        (f) => f.properties[areaProperty] === selectedArea
      );
    }

    filteredFeatures.forEach((feature) => {
      const name = feature.properties[areaProperty] || feature.properties.name;
      const geometry = feature.geometry;

      if (!geometryByArea[name]) {
        geometryByArea[name] = geometry;
      }

      if (isMultiScale) {
        const monthlyData = feature.properties.monthly?.[selectedScale];
        if (!monthlyData || !Array.isArray(monthlyData)) return;

        if (!sumByArea[name]) {
          sumByArea[name] = 0;
          countByArea[name] = 0;
        }

        monthlyData.forEach((val) => {
          if (typeof val === "number" && !isNaN(val)) {
            sumByArea[name] += val;
            countByArea[name]++;
          }
        });
      } else {
        const value =
          feature.properties.annual?.[valueKey] ?? feature.properties[valueKey];

        if (typeof value === "number" && !isNaN(value)) {
          if (!sumByArea[name]) {
            sumByArea[name] = 0;
            countByArea[name] = 0;
          }

          sumByArea[name] += value;
          countByArea[name]++;
        }
      }
    });
  }

  const averagedGeoJSON = {
    type: "FeatureCollection",
    features: Object.entries(sumByArea).map(([name, total]) => ({
      type: "Feature",
      geometry: geometryByArea[name],
      properties: {
        name,
        [isMultiScale ? selectedScale : valueKey]:
          countByArea[name] > 0 ? total / countByArea[name] : null,
        level: isRegionView ? "region" : "province",
      },
    })),
  };

  console.log("Heatmap data returned:", averagedGeoJSON);
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
//   isRegionView,
//   selectedScale // 
// ) => {
//   if (startYear > endYear) {
//     console.error("Start year must be less than or equal to end year.");
//     return null;
//   }

//   const isMultiScale = valueKey === "spi" || valueKey === "spei";
//   //  อย่าสร้าง selectedScale ใหม่ตรงนี้

//   const sumByArea = {};
//   const countByArea = {};
//   const geometryByArea = {};

//   for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
//     const geojson = isRegionView
//       ? dataByYear[year]?.region
//       : dataByYear[year]?.province;

//     if (!geojson?.features) continue;

//     let filteredFeatures = geojson.features;

//     if (isRegionView) {
//       if (region && region !== "Thailand_region") {
//         filteredFeatures = filteredFeatures.filter(
//           (f) => f.properties.region_name === region
//         );
//       }
//     } else {
//       if (province && province !== "Thailand") {
//         filteredFeatures = filteredFeatures.filter(
//           (f) => f.properties.province_name === province
//         );
//       }
//     }

//     filteredFeatures.forEach((feature) => {
//       const name = isRegionView
//         ? feature.properties.region_name || feature.properties.name
//         : feature.properties.province_name || feature.properties.name;

//       const geometry = feature.geometry;

//       if (!geometryByArea[name]) {
//         geometryByArea[name] = geometry;
//       }

//       if (isMultiScale) {
//         const monthlyData = feature.properties.monthly?.[selectedScale];
//         if (!monthlyData || !Array.isArray(monthlyData)) return;

//         if (!sumByArea[name]) {
//           sumByArea[name] = 0;
//           countByArea[name] = 0;
//         }

//         monthlyData.forEach((val) => {
//           if (typeof val === "number" && !isNaN(val)) {
//             sumByArea[name] += val;
//             countByArea[name]++;
//           }
//         });
//       } else {
//         const value =
//           feature.properties.annual?.[valueKey] ?? feature.properties[valueKey];

//         if (typeof value === "number" && !isNaN(value)) {
//           if (!sumByArea[name]) {
//             sumByArea[name] = 0;
//             countByArea[name] = 0;
//           }

//           sumByArea[name] += value;
//           countByArea[name]++;
//         }
//       }
//     });
//   }

//   const averagedGeoJSON = {
//     type: "FeatureCollection",
//     features: Object.entries(sumByArea).map(([name, total]) => ({
//       type: "Feature",
//       geometry: geometryByArea[name],
//       properties: {
//         name,
//         [isMultiScale ? selectedScale : valueKey]:
//           countByArea[name] > 0 ? total / countByArea[name] : null,
//         level: isRegionView ? "region" : "province",
//       },
//     })),
//   };

//   console.log("Heatmap data returned:", averagedGeoJSON);
//   return averagedGeoJSON;
// };







