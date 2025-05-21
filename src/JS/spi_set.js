// spi_set.js

export const spi_process = (
  dataByYear,
  startYear,
  endYear,
  selectedValue,
  updatedRegion,
  updatedProvince,
  configData,
  selectedDataset,
  selectedScales
) => {
  const datasetConfig = configData.datasets[selectedDataset];
  const variableOption = datasetConfig.variable_options.find(
    (opt) => opt.value === selectedValue
  );
  if (!variableOption?.multi_scale) return [];

  const allScales = variableOption.multi_scale;
  const oniKey = variableOption?.oni_scale; 
  const scalesToUse = selectedScales?.length > 0 ? selectedScales : [allScales[0]];
  const spiData = [];

  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    const areaType = updatedProvince !== "Thailand" ? "province"
                    : updatedRegion !== "Thailand_region" ? "region"
                    : "country";
    const geojson = dataByYear[year]?.[areaType];
    if (!geojson?.features) continue;

    const areaProperty = datasetConfig.file_name_pattern?.[areaType]?.area_property;
    const monthlyKey = datasetConfig.file_name_pattern?.[areaType]?.monthly;
    const features = Array.isArray(geojson.features) ? geojson.features : [geojson.features];

    const filtered = features.filter(f => {
      const areaName = f.properties?.[areaProperty];
      return (
        updatedProvince === "Thailand" && updatedRegion === "Thailand_region" ||
        (areaType === "province" && areaName === updatedProvince) ||
        (areaType === "region" && areaName === updatedRegion)
      );
    });

    filtered.forEach((feature) => {
      const props = feature.properties;
      scalesToUse.forEach((scale) => {
        if (scale === oniKey) return; 
        const values = props?.[monthlyKey]?.[scale];
        if (Array.isArray(values)) {
          values.forEach((value, idx) => {
            spiData.push({ year, month: idx + 1, scale, value });
          });
        }
      });
    });
  }

  
  if (scalesToUse.includes(oniKey)) {
    for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
      const oceanic = dataByYear[year]?.oceanic;
      if (!oceanic?.features?.length) continue;

      const oceanicMonthlyKey = datasetConfig.file_name_pattern?.oceanic?.monthly;
      const values = oceanic.features[0]?.properties?.[oceanicMonthlyKey]?.[oniKey];
      if (Array.isArray(values)) {
        values.forEach((value, idx) => {
          spiData.push({ year, month: idx + 1, scale: oniKey, value }); 
        });
      }
    }
  }

  return spiData;
};


export const gaussianFilterWithPadding = (data, kernelSize, paddingType = 'reflect') => {
  const kernel = Array.from({ length: kernelSize }, (_, i) => {
    const x = i - Math.floor(kernelSize / 2);
    return Math.exp(-((x ** 2) / (2 * kernelSize ** 2)));
  });

  const sumKernel = kernel.reduce((sum, val) => sum + val, 0);
  const normalizedKernel = kernel.map(val => val / sumKernel);

  const padSize = Math.floor(kernelSize / 2);
  let paddedData;

  if (paddingType === 'reflect') {
    paddedData = [
      ...data.slice(1, padSize + 1).reverse(),
      ...data,
      ...data.slice(-padSize - 1, -1).reverse(),
    ];
  } else if (paddingType === 'edge') {
    paddedData = [
      ...Array(padSize).fill(data[0]),
      ...data,
      ...Array(padSize).fill(data[data.length - 1]),
    ];
  } else {
    paddedData = [
      ...Array(padSize).fill(0),
      ...data,
      ...Array(padSize).fill(0),
    ];
  }

  return data.map((_, i) => {
    let sum = 0;
    let weightSum = 0;

    for (let j = 0; j < kernelSize; j++) {
      const index = i + j;
      sum += paddedData[index] * normalizedKernel[j];
      weightSum += normalizedKernel[j];
    }

    return sum / weightSum;
  });
};

export const SPIChartData = (spiData, kernelSize = null, selectedType = "SPI") => {
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
    const numA = parseInt(a.replace(/[^\d]/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/[^\d]/g, ''), 10) || 0;
    return numA - numB;
  });

  const datasets = [];

  sortedScales.forEach((scale) => {
    const data = labels.map((label) => grouped[label]?.[scale] ?? null);
    const backgroundColor = data.map((val) => {
  if (val === null) return '#ccc';
  if (scale === "oni") {
    return val >= 0 ? '#ff0000' : '#0000ff'; 
  }
  return val >= 0 ? '#0000ff' : '#ff0000'; 
});

    const scaleLabel = scale === "oni"
      ? "Oceanic Nino Index"
      : `${scale.replace(/[^\d]/g, '')}-Month ${selectedType.toUpperCase()}`;

    datasets.push({
      label: scaleLabel,
      data,
      backgroundColor,
      type: "bar",
    });

    if (kernelSize && kernelSize > 1 && kernelSize % 2 === 1) {
      const smoothed = gaussianFilterWithPadding(
        data.map((v) => (typeof v === "number" ? v : 0)),
        kernelSize,
        "reflect"
      );

      datasets.push({
        label: `${scaleLabel} Moving Avg`,
        data: smoothed,
        type: "line",
        borderColor: "purple",
        borderWidth: 2,
        tension: 0.25,
        pointRadius: 0,
        fill: false,
      });
    }
  });

  return { labels, datasets };
};




//-------------------------------r square process -------------------------------------//
export const getSpiAndSpeiData = (
  dataByYear,
  startYear,
  endYear,
  selectedValues,
  updatedRegion,
  updatedProvince,
  configData,
  selectedDataset,
  selectedScales
) => {
  const datasetConfig = configData.datasets[selectedDataset];
  if (!datasetConfig) return [];

  const valuesArray = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
  const scalesArray = selectedScales
    ? (Array.isArray(selectedScales) ? selectedScales : [selectedScales])
    : [];

  // ดึงเฉพาะเลขจาก scale เช่น 'spi3' => '3'
  const scaleNumbers = scalesArray.map(s => s.match(/\d+/)?.[0]).filter(Boolean);

  // คำนวณชื่อ scale ที่ต้องใช้ เช่น ['spi3', 'spei3'] หรือใช้ default จาก config
  const scalesToUse = scaleNumbers.length > 0
    ? scaleNumbers.flatMap(num => valuesArray.map(prefix => `${prefix}${num}`))
    : datasetConfig.variable_options
        .filter(opt => valuesArray.includes(opt.value) && Array.isArray(opt.multi_scale))
        .flatMap(opt => opt.multi_scale);

  const spiSpeiData = [];
  const areaScaleMap = {}; // เก็บข้อมูลตามพื้นที่

  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    // หาประเภทพื้นที่
    const isNational = updatedRegion === "Thailand_region" && updatedProvince === "Thailand";
    const areaType = updatedProvince !== "Thailand" ? "province"
                     : updatedRegion !== "Thailand_region" ? "region"
                     : "country";

    const geojson = dataByYear[year]?.[areaType];
    if (!geojson?.features) continue;

    const features = Array.isArray(geojson.features) ? geojson.features : [geojson.features];
    const areaProperty = datasetConfig.file_name_pattern?.[areaType]?.area_property;
    const monthlyKey = datasetConfig.file_name_pattern?.[areaType]?.monthly;

    const filtered = features.filter(f => {
      const areaName = f.properties?.[areaProperty];
      return (
        isNational ||
        (areaType === "province" && areaName === updatedProvince) ||
        (areaType === "region" && areaName === updatedRegion)
      );
    });

    filtered.forEach(feature => {
      const props = feature.properties;
      const areaName = props?.[areaProperty];

      if (!areaScaleMap[areaName]) areaScaleMap[areaName] = {};

      scalesToUse.forEach(scale => {
        const values = props?.[monthlyKey]?.[scale];
        if (Array.isArray(values)) {
          if (!areaScaleMap[areaName][scale]) {
            areaScaleMap[areaName][scale] = [];
          }

          areaScaleMap[areaName][scale].push(...values);

          values.forEach((value, idx) => {
            spiSpeiData.push({
              year,
              month: idx + 1,
              scale,
              value
            });
          });
        }
      });
    });
  }

  // 🔽 Debug log สำหรับดูข้อมูลที่รวมไว้
  Object.entries(areaScaleMap).forEach(([areaName, scaleObj]) => {
    console.log(`\n📍 Area: ${areaName}`);
    const uniqueScaleNums = [...new Set(
      Object.keys(scaleObj).map(s => s.match(/\d+/)?.[0]).filter(Boolean)
    )];
    uniqueScaleNums.forEach(scaleNum => {
      valuesArray.forEach(prefix => {
        const key = `${prefix}${scaleNum}`;
        // console.log(`${key}:`, scaleObj[key] ?? "N/A");
      });
    });
  });

  return spiSpeiData;
};


export const r_squared = (spiData, speiData, oniKey) => {
  const result = {};
  const spiByScale = {};
  const speiByScale = {};

  spiData.forEach(d => {
    const scaleKey = d.scale.replace('spi', '');
    if (!spiByScale[scaleKey]) spiByScale[scaleKey] = [];
    spiByScale[scaleKey].push(d.value);
  });

  speiData.forEach(d => {
    const scaleKey = d.scale.replace('spei', '');
    if (!speiByScale[scaleKey]) speiByScale[scaleKey] = [];
    speiByScale[scaleKey].push(d.value);
  });

  for (const scale in spiByScale) {
    if (typeof oniKey === 'string' && scale === oniKey.replace(/(spi|spei)/g, '')) continue;
    // if (scale === oniKey.replace(/(spi|spei)/g, '')) continue; 
    const x = spiByScale[scale];
    const y = speiByScale[scale];

    if (!Array.isArray(x) || !Array.isArray(y)) {
      result[scale] = null;
      continue;
    }

    const timeLength = Math.min(x.length, y.length);
    if (timeLength === 0) {
      result[scale] = null;
      continue;
    }

    const xMean = x.reduce((sum, val) => sum + val, 0) / timeLength;
    const yMean = y.reduce((sum, val) => sum + val, 0) / timeLength;

    let sxy = 0, sxx = 0, sst = 0;
    for (let i = 0; i < timeLength; i++) {
      sxy += (x[i] - xMean) * (y[i] - yMean);
      sxx += (x[i] - xMean) ** 2;
      sst += (y[i] - yMean) ** 2;
    }

    const b = sxy / sxx;
    const a = yMean - b * xMean;
    let ssr = 0;
    for (let i = 0; i < timeLength; i++) {
      const yPred = x[i] * b + a;
      ssr += (y[i] - yPred) ** 2;
    }

    result[scale] = 1 - ssr / sst;
  }

  return result;
};

//--------------------------------- oni rsquare zone-------------------------------//
export function y_multi_value(selectedValue, spiResult) {
  const scaleGroups = {};
  spiResult.forEach(({ scale, value }) => {
    if (!scaleGroups[scale]) scaleGroups[scale] = [];
    scaleGroups[scale].push(value);
  });

  console.log("Summary of scale arrays:");
  Object.entries(scaleGroups).forEach(([scale, values]) => {
    console.log(`Variable: ${selectedValue}, Scale: ${scale}, Count: ${values.length}`);
    console.log("    Values:", values);
  });

  return scaleGroups;
}


export function x_oni_value(variable, oniOnlyData) {
  if (!variable?.oni_scale || oniOnlyData.length === 0) return [];

  const oniArray = oniOnlyData.map(d => d.value);
  console.log(`Full ONI Values (${variable.oni_scale}):`, oniArray);
  return oniArray;
}

export function oni_r_square(xArray, yGroups) {
  if (!xArray || xArray.length === 0) {
    console.warn("No ONI (x) values provided");
    return {};
  }

  const result = {};

  Object.entries(yGroups).forEach(([scale, yArray]) => {
    const timeLength = Math.min(xArray.length, yArray.length);
    if (timeLength === 0) {
      console.warn(`Scale "${scale}" skipped: empty array`);
      return;
    }

    const x = xArray.slice(0, timeLength);
    const y = yArray.slice(0, timeLength);

    const xMean = x.reduce((sum, v) => sum + v, 0) / timeLength;
    const yMean = y.reduce((sum, v) => sum + v, 0) / timeLength;

    let sxy = 0, sxx = 0, sst = 0;
    for (let i = 0; i < timeLength; i++) {
      sxy += (x[i] - xMean) * (y[i] - yMean);
      sxx += (x[i] - xMean) ** 2;
      sst += (y[i] - yMean) ** 2;
    }

    const b = sxy / sxx;
    const a = yMean - b * xMean;

    let ssr = 0;
    for (let i = 0; i < timeLength; i++) {
      const yPred = x[i] * b + a;
      ssr += (y[i] - yPred) ** 2;
    }

    const r2 = 1 - ssr / sst;

    // 🔁 Normalize key: spi3 -> 3
    const key = scale.replace(/[^\d]/g, ''); // extract number only
    result[key] = r2;
  });

  return result;
}

// export function oni_r_square(xArray, yGroups) {
//   const result = {};

//   if (!xArray || xArray.length === 0) {
//     console.warn("No ONI (x) values provided");
//     return result;
//   }

//   Object.entries(yGroups).forEach(([scale, yArray]) => {
//     const timeLength = Math.min(xArray.length, yArray.length);
//     if (timeLength === 0) {
//       console.warn(`Scale "${scale}" skipped: empty array`);
//       result[scale] = null;
//       return;
//     }

//     const x = xArray.slice(0, timeLength);
//     const y = yArray.slice(0, timeLength);

//     const xMean = x.reduce((sum, v) => sum + v, 0) / timeLength;
//     const yMean = y.reduce((sum, v) => sum + v, 0) / timeLength;

//     let sxy = 0, sxx = 0, sst = 0;
//     for (let i = 0; i < timeLength; i++) {
//       sxy += (x[i] - xMean) * (y[i] - yMean);
//       sxx += (x[i] - xMean) ** 2;
//       sst += (y[i] - yMean) ** 2;
//     }

//     const b = sxy / sxx;
//     const a = yMean - b * xMean;

//     let ssr = 0;
//     for (let i = 0; i < timeLength; i++) {
//       const yPred = x[i] * b + a;
//       ssr += (y[i] - yPred) ** 2;
//     }

//     const r2 = 1 - ssr / sst;
//     result[scale] = r2;
//     console.log(`R² (ONI vs ${scale}):`, r2.toFixed(3));
//   });

//   return result;
// }

// export function oni_r_square(xArray, yGroups) {
//   if (!xArray || xArray.length === 0) {
//     console.warn("No ONI (x) values provided");
//     return;
//   }

//   Object.entries(yGroups).forEach(([scale, yArray]) => {
//     const timeLength = Math.min(xArray.length, yArray.length);
//     if (timeLength === 0) {
//       console.warn(`Scale "${scale}" skipped: empty array`);
//       return;
//     }

//     const x = xArray.slice(0, timeLength);
//     const y = yArray.slice(0, timeLength);

//     const xMean = x.reduce((sum, v) => sum + v, 0) / timeLength;
//     const yMean = y.reduce((sum, v) => sum + v, 0) / timeLength;

//     let sxy = 0, sxx = 0, sst = 0;
//     for (let i = 0; i < timeLength; i++) {
//       sxy += (x[i] - xMean) * (y[i] - yMean);
//       sxx += (x[i] - xMean) ** 2;
//       sst += (y[i] - yMean) ** 2;
//     }

//     const b = sxy / sxx;
//     const a = yMean - b * xMean;

//     let ssr = 0;
//     for (let i = 0; i < timeLength; i++) {
//       const yPred = x[i] * b + a;
//       ssr += (y[i] - yPred) ** 2;
//     }

//     const r2 = 1 - ssr / sst;
//     console.log(`R² (ONI vs ${scale}):`, r2.toFixed(3));
//   });
// }



//--------------------------------- oni rsquare zone-------------------------------//

// export const oni_r_squared = (oniData, climateData) => {
//   const oniByMonth = {};
//   oniData.forEach(d => {
//     const key = `${d.year}-${d.month}`;
//     oniByMonth[key] = d.value;
//   });

//   const x = [], y = [];

//   climateData.forEach(d => {
//     const key = `${d.year}-${d.month}`;
//     const oniVal = oniByMonth[key];
//     if (oniVal !== undefined && typeof d.value === 'number') {
//       x.push(oniVal);
//       y.push(d.value);
//     }
//   });

//   // 🔍 ตรวจสอบข้อมูลที่ดึงมา
//   console.log("ONI (X):", x);
//   console.log("SPI/SPEI (Y):", y);

//   return { x, y }; 
// };



// export const r_squared = (spiData, speiData) => {
//   const result = {};
//   const spiByScale = {};
//   const speiByScale = {};

//   spiData.forEach(d => {
//     const scaleKey = d.scale.replace('spi', '');
//     if (!spiByScale[scaleKey]) spiByScale[scaleKey] = [];
//     spiByScale[scaleKey].push(d.value);
//   });

//   speiData.forEach(d => {
//     const scaleKey = d.scale.replace('spei', '');
//     if (!speiByScale[scaleKey]) speiByScale[scaleKey] = [];
//     speiByScale[scaleKey].push(d.value);
//   });

//   for (const scale in spiByScale) {
//     if (scale === 'oni') continue;

//     const x = spiByScale[scale];
//     const y = speiByScale[scale];

//     // console.log("spei scale y", y);
//     // console.log("spi scale x", x);

//     if (!Array.isArray(x) || !Array.isArray(y)) {
//       console.warn(`Missing data for scale ${scale}:`, { x, y });
//       result[scale] = null;
//       continue;
//     }

//     const timeLength = Math.min(x.length, y.length);
//     if (timeLength === 0) {
//       result[scale] = null;
//       continue;
//     }

//     const xTrim = x.slice(0, timeLength);
//     const yTrim = y.slice(0, timeLength);

//     // console.log(`Scale: ${scale}`);
//     // console.log(`SPI values [${scale}]:`, xTrim);
//     // console.log(`SPEI values [${scale}]:`, yTrim);

//     const xMean = xTrim.reduce((sum, val) => sum + val, 0) / timeLength;
//     const yMean = yTrim.reduce((sum, val) => sum + val, 0) / timeLength;

//     let sxy = 0, sxx = 0, sst = 0;
//     for (let i = 0; i < timeLength; i++) {
//       sxy += (xTrim[i] - xMean) * (yTrim[i] - yMean);
//       sxx += (xTrim[i] - xMean) ** 2;
//       sst += (yTrim[i] - yMean) ** 2;
//     }

//     const b = sxy / sxx;
//     const a = yMean - b * xMean;

//     let ssr = 0;
//     for (let i = 0; i < timeLength; i++) {
//       const yPred = xTrim[i] * b + a;
//       ssr += (yTrim[i] - yPred) ** 2;
//     }

//     result[scale] = 1 - ssr / sst;
//   }

//   return result;
// };







