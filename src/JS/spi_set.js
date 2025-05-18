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

  if (!variableOption || !variableOption.multi_scale) {
    console.warn("No multi_scale config for", selectedValue);
    return [];
  }

  const allScales = variableOption.multi_scale;
  const scalesToUse = (selectedScales && selectedScales.length > 0)
    ? selectedScales
    : [allScales[0]];

  const spiData = [];

  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    let geojson = null;

    if (updatedRegion === "Thailand_region" && updatedProvince === "Thailand") {
      geojson = dataByYear[year]?.country;
    } else if (updatedProvince && updatedProvince !== "Thailand") {
      geojson = dataByYear[year]?.province;
    } else {
      geojson = dataByYear[year]?.region;
    }

    if (!geojson || !geojson.features) {
      console.warn(`No valid geojson for year ${year}`);
      continue;
    }

    const features = Array.isArray(geojson.features)
      ? geojson.features
      : [geojson.features];

    let filtered = [];

    if (updatedProvince && updatedProvince !== "Thailand") {
      filtered = features.filter(f => f.properties.province_name === updatedProvince);
    } else if (updatedRegion && updatedRegion !== "Thailand_region") {
      filtered = features.filter(f => f.properties.region_name === updatedRegion);
    } else {
      filtered = features;
    }

    filtered.forEach((feature) => {
      const props = feature.properties;
      const featYear = year;

      scalesToUse.forEach((scale) => {
        if (scale === 'oni') return; 

        const values = props.monthly?.[scale];

        if (Array.isArray(values)) {
          values.forEach((value, idx) => {
            spiData.push({
              year: featYear,
              month: idx + 1,
              scale,
              value,
            });
          });
        } else {
          console.warn(`${scale} missing for ${updatedProvince || updatedRegion}, year ${year}`);
        }
      });
    });
  }

  // เสริม: อ่าน ONI หากถูกเลือก
if (scalesToUse.includes('oni')) {
  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    const oceanic = dataByYear[year]?.oceanic;

    if (!oceanic || !oceanic.features || oceanic.features.length === 0) {
      console.warn(`[] No oceanic data for year ${year}`);
      continue;
    }

    const values = oceanic.features[0]?.properties?.monthly?.oni;

    // console.log(`📘 ONI data for year ${year}:`, values); 

    if (Array.isArray(values)) {
      values.forEach((value, idx) => {
        // console.log(`➡️ year: ${year}, month: ${idx + 1}, oni: ${value}`); 

        spiData.push({
          year,
          month: idx + 1,
          scale: "oni",
          value,
        });
      });
    } else {
      console.warn(`⚠️ Missing ONI data for year ${year}`);
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

  const valuesArray = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
  const scalesArray = selectedScales
    ? (Array.isArray(selectedScales) ? selectedScales : [selectedScales])
    : [];

  const scaleNumbers = scalesArray.length > 0
    ? scalesArray.map(s => s.match(/\d+/)?.[0]).filter(Boolean)
    : [];

  const scalesToUse = scaleNumbers.length > 0
    ? scaleNumbers.flatMap(num => valuesArray.map(prefix => `${prefix}${num}`))
    : datasetConfig.variable_options
        .filter(opt => valuesArray.includes(opt.value))
        .flatMap(opt => opt.multi_scale);

  // console.log(`Final scales to use (SPI + SPEI):`, scalesToUse);

  const spiSpeiData = [];
  const areaScaleMap = {}; // { areaName: { scaleKey: [all values] } }

  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    let geojson = null;

    if (updatedRegion === "Thailand_region" && updatedProvince === "Thailand") {
      geojson = dataByYear[year]?.country;
    } else if (updatedProvince && updatedProvince !== "Thailand") {
      geojson = dataByYear[year]?.province;
    } else {
      geojson = dataByYear[year]?.region;
    }

    if (!geojson || !geojson.features) continue;

    const features = Array.isArray(geojson.features)
      ? geojson.features
      : [geojson.features];

    const filtered = (updatedProvince && updatedProvince !== "Thailand")
      ? features.filter(f => f.properties.province_name === updatedProvince)
      : (updatedRegion && updatedRegion !== "Thailand_region")
      ? features.filter(f => f.properties.region_name === updatedRegion)
      : features;

    filtered.forEach(feature => {
      const props = feature.properties;
      const areaName = props.province_name || props.region_name || "Thailand";

      if (!areaScaleMap[areaName]) areaScaleMap[areaName] = {};

      scalesToUse.forEach(scale => {
        const values = props.monthly?.[scale];
        if (Array.isArray(values)) {
          if (!areaScaleMap[areaName][scale]) {
            areaScaleMap[areaName][scale] = [];
          }

          areaScaleMap[areaName][scale].push(...values); // รวมข้ามปี

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

  // 🔽 Log รวมแบบจัดกลุ่มหลังวนครบทุกปี
  Object.entries(areaScaleMap).forEach(([areaName, scaleObj]) => {
    console.log(`\nArea: ${areaName}`);
    const uniqueScaleNums = [...new Set(
      Object.keys(scaleObj).map(s => s.match(/\d+/)?.[0]).filter(Boolean)
    )];

    uniqueScaleNums.forEach(scaleNum => {
      console.log(`Scale: ${scaleNum}`);
      valuesArray.forEach(prefix => {
        const scaleKey = `${prefix}${scaleNum}`;
        console.log(`${scaleKey}:`, scaleObj[scaleKey] ?? "N/A");
      });
    });
  });

  return spiSpeiData;
};

export const r_squared = (spiData, speiData) => {
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
    if (scale === 'oni') continue;

    const x = spiByScale[scale];
    const y = speiByScale[scale];

    // console.log("spei scale y", y);
    // console.log("spi scale x", x);

    if (!Array.isArray(x) || !Array.isArray(y)) {
      console.warn(`Missing data for scale ${scale}:`, { x, y });
      result[scale] = null;
      continue;
    }

    const timeLength = Math.min(x.length, y.length);
    if (timeLength === 0) {
      result[scale] = null;
      continue;
    }

    const xTrim = x.slice(0, timeLength);
    const yTrim = y.slice(0, timeLength);

    // console.log(`Scale: ${scale}`);
    // console.log(`SPI values [${scale}]:`, xTrim);
    // console.log(`SPEI values [${scale}]:`, yTrim);

    const xMean = xTrim.reduce((sum, val) => sum + val, 0) / timeLength;
    const yMean = yTrim.reduce((sum, val) => sum + val, 0) / timeLength;

    let sxy = 0, sxx = 0, sst = 0;
    for (let i = 0; i < timeLength; i++) {
      sxy += (xTrim[i] - xMean) * (yTrim[i] - yMean);
      sxx += (xTrim[i] - xMean) ** 2;
      sst += (yTrim[i] - yMean) ** 2;
    }

    const b = sxy / sxx;
    const a = yMean - b * xMean;

    let ssr = 0;
    for (let i = 0; i < timeLength; i++) {
      const yPred = xTrim[i] * b + a;
      ssr += (yTrim[i] - yPred) ** 2;
    }

    result[scale] = 1 - ssr / sst;
  }

  return result;
};







