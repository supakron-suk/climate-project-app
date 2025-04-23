// spi_set.js

export const spi_process = (
  dataByYear,
  startYear,
  endYear,
  selectedValue,
  updatedRegion,
  configData,
  selectedDataset
) => {
  const datasetConfig = configData.datasets[selectedDataset];
  const variableOption = datasetConfig.variable_options.find(
    (opt) => opt.value === selectedValue
  );

  if (!variableOption || !variableOption.multi_scale) {
    console.warn("No multi_scale config for", selectedValue);
    return [];
  }

  const allScales = variableOption.multi_scale;
  const spiData = [];

  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    let geojson =
      updatedRegion === "Thailand_region"
        ? dataByYear[year]?.country
        : dataByYear[year]?.region;

    if (!geojson || !geojson.features) {
      console.warn(`❌ No valid geojson for year ${year}`);
      continue;
    }

    const features = Array.isArray(geojson.features)
      ? geojson.features
      : [geojson.features];

    const filtered =
      updatedRegion === "Thailand_region"
        ? features
        : features.filter(
            (f) => f.properties.region_name === updatedRegion
          );

    filtered.forEach((feature) => {
      const props = feature.properties;
      const featYear = year;

      allScales.forEach((scale) => {
        const values = props.monthly?.[scale];

        if (Array.isArray(values)) {
          values.forEach((value, idx) => {
            spiData.push({
              year: featYear,
              month: idx + 1,
              scale,
              value,
            });
            console.log(
              `year: ${featYear}, month: ${idx + 1}, spi value: ${value}, spi scale: ${scale}`
            );
          });
        } else {
          console.warn(
            `⚠️ ${scale} missing for region ${updatedRegion}, year ${year}`
          );
        }
      });
    });
  }

  return spiData;
};

// export const spi_process = (dataByYear, startYear, endYear, selectedValue, updatedRegion, configData, selectedDataset) => {
//   const datasetConfig = configData.datasets[selectedDataset];
//   const variableOption = datasetConfig.variable_options.find(opt => opt.value === selectedValue);

//   if (!variableOption || !variableOption.multi_scale) {
//     console.warn('No multi_scale config for', selectedValue);
//     return {};
//   }

//   const allScales = variableOption.multi_scale;
//   const scaleDataMap = {};

//   for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
//     let geojson = updatedRegion === "Thailand_region"
//       ? dataByYear[year]?.country
//       : dataByYear[year]?.region;

//     if (!geojson || !geojson.features) {
//       console.warn(`❌ No valid geojson for year ${year}`);
//       continue;
//     }

//     const features = Array.isArray(geojson.features)
//       ? geojson.features
//       : [geojson.features];

//     const filtered = updatedRegion === "Thailand_region"
//       ? features
//       : features.filter(f => f.properties.region_name === updatedRegion);

//     filtered.forEach(feature => {
//       const { year: featYear } = feature.properties;
//       const props = feature.properties;

//       allScales.forEach(scale => {
//         if (!scaleDataMap[scale]) scaleDataMap[scale] = [];
//         const values = props.monthly?.[scale];

//         if (Array.isArray(values)) {
//           // Loop through each month to log the year, scale, and value
//           values.forEach((value, idx) => {
//             console.log(`year: ${featYear}, spi value: ${value}, spi scale: ${scale}`);
//           });
//           scaleDataMap[scale].push(...values);
//         } else {
//           console.warn(`⚠️ ${scale} missing for region ${updatedRegion}, year ${year}`);
//         }
//       });
//     });
//   }

//   return scaleDataMap;
// };

// export const spi_process = (dataByYear, selectedYearStart, selectedYearEnd, selectedValue, updatedRegion, configData, selectedDataset) => {
//   const datasetConfig = configData.datasets[selectedDataset];
//   const variableOption = datasetConfig.variable_options.find(opt => opt.value === selectedValue);

//   if (variableOption && variableOption.multi_scale) {
//     const allScales = variableOption.multi_scale;
//     const scaleDataMap = {};

//     for (let year = parseInt(selectedYearStart); year <= parseInt(selectedYearEnd); year++) {
//       let geojson = null;
//       if (updatedRegion === "Thailand_region") {
//         geojson = dataByYear[year]?.country;
//       } else if (updatedRegion && updatedRegion !== "Thailand_region") {
//         geojson = dataByYear[year]?.region;
//       }

//       if (!geojson || !geojson.features) {
//         console.warn(`❌ No valid geojson for year ${year}`);
//         continue;
//       }

//       const features = Array.isArray(geojson.features) ? geojson.features : [geojson.features];

//       // If region is specified, filter features by region name
//       const filteredFeatures = features.filter(feature => {
//         return updatedRegion === "Thailand_region" || feature.properties.region_name === updatedRegion;
//       });

//       filteredFeatures.forEach((feature) => {
//         const props = feature.properties;
//         console.log(`🧪 Year ${year} - monthly keys for ${updatedRegion}:`, Object.keys(props.monthly || {}));

//         allScales.forEach((scale) => {
//           if (!scaleDataMap[scale]) scaleDataMap[scale] = [];

//           const values = props.monthly?.[scale];
//           if (Array.isArray(values)) {
//             scaleDataMap[scale].push(...values);
//           } else {
//             console.warn(`⚠️ ${scale} not found under 'monthly' for region ${updatedRegion}, year ${year}`);
//           }
//         });
//       });
//     }

//     return scaleDataMap;
//   }

//   return {};
// };

// export const spi_process = (features, selectedIndex, configData, selectedDataset) => {
//   const dataset = configData.datasets[selectedDataset];
//   if (!dataset) return [];  // ถ้าไม่ได้เลือก dataset ให้ return array ว่าง

//   const variable = dataset.variable_options.find((v) => v.value === selectedIndex);
//   if (!variable || !variable.multi_scale) return [];

//   const spiScales = variable.multi_scale;
//   const spiData = [];

//   features.forEach((feature) => {
//     const { name, year } = feature.properties;

//     // ดึงข้อมูลจาก annual หรือ monthly ตามการเลือก
//     const valueFromAnnual = feature.properties.annual ? feature.properties.annual[selectedIndex] : null;
//     const valueFromMonthly = feature.properties.monthly ? feature.properties.monthly[selectedIndex] : null;

//     // สำหรับแต่ละ scale ใน spiScales
//     spiScales.forEach((scale) => {
//       const value = scale.includes("monthly") ? valueFromMonthly : valueFromAnnual;
//       if (value !== undefined && value !== null) {
//         const entry = { name, year, scale, value };
//         console.log(`year: ${year}, spi value: ${value}, spi scale: ${scale}`);
//         spiData.push(entry);
//       }
//     });
//   });

//   return spiData;
// };



export const SPIChartData = (spiData) => {
  if (!spiData || spiData.length === 0) return null;

  const grouped = {};
  const allScales = new Set();

  spiData.forEach(({ year, month, scale, value }) => {
    const label = `${year}-${String(month).padStart(2, '0')}`;
    if (!grouped[label]) grouped[label] = {};
    grouped[label][scale] = value;
    allScales.add(scale);
  });

  const labels = Object.keys(grouped).sort();

  const sortedScales = [...allScales].sort((a, b) => {
    const numA = parseInt(a.replace(/[^\d]/g, ''), 10);
    const numB = parseInt(b.replace(/[^\d]/g, ''), 10);
    return numA - numB;
  });

  const datasets = sortedScales.map((scale) => {
    const data = labels.map((label) => grouped[label]?.[scale] ?? null);
    const backgroundColor = data.map((val) => {
      if (val === null) return '#ccc';
      return val >= 0 ? '#0000ff' : '#ff0000';
    });

    return {
      label: scale.toUpperCase(),
      data,
      backgroundColor,
    };
  });

  return { labels, datasets };
};

// export const SPIChartData = (spiData) => {
//   if (!spiData || spiData.length === 0) return null;

//   const grouped = {};
//   const allScales = new Set();

//   spiData.forEach(({ year, month, scale, value }) => {
//     const label = `${year}-${String(month).padStart(2, '0')}`;
//     if (!grouped[label]) grouped[label] = {};
//     grouped[label][scale] = value;
//     allScales.add(scale);
//   });

//   const labels = Object.keys(grouped).sort();

//   const sortedScales = [...allScales].sort((a, b) => {
//     const numA = parseInt(a.replace(/[^\d]/g, ''), 10);
//     const numB = parseInt(b.replace(/[^\d]/g, ''), 10);
//     return numA - numB;
//   });

//   const datasets = sortedScales.map((scale) => {
//     const data = labels.map((label) => grouped[label]?.[scale] ?? null);
//     const backgroundColor = data.map((val) => {
//       if (val === null) return '#ccc';
//       return val >= 0 ? '#0000ff' : '#ff0000';
//     });

//     return {
//       label: scale.toUpperCase(),
//       data,
//       backgroundColor,
//     };
//   });

//   return { labels, datasets };
// };

