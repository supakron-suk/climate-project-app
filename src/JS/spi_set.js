// spi_set.js
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

export const spi_process = (
  dataByYear,
  startYear,
  endYear,
  selectedValue,
  updatedRegion,
  updatedProvince,
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
    let geojson = null;

    if (updatedRegion === "Thailand_region" && updatedProvince === "Thailand") {
      geojson = dataByYear[year]?.country;
    } else if (updatedProvince && updatedProvince !== "Thailand") {
      geojson = dataByYear[year]?.province;
    } else {
      geojson = dataByYear[year]?.region;
    }

    if (!geojson || !geojson.features) {
      console.warn(`❌ No valid geojson for year ${year}`);
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
            // console.log(
            //   `year: ${featYear}, month: ${idx + 1}, spi value: ${value}, spi scale: ${scale}`
            // );
          });
        } else {
          console.warn(
            `⚠️ ${scale} missing for ${updatedProvince || updatedRegion}, year ${year}`
          );
        }
      });
    });
  }

  return spiData;
};

export const SPIChartData = (spiData, kernelSize = null) => {
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

  const datasets = [];

  sortedScales.forEach((scale) => {
    const data = labels.map((label) => grouped[label]?.[scale] ?? null);
    const backgroundColor = data.map((val) => {
      if (val === null) return '#ccc';
      return val >= 0 ? '#0000ff' : '#ff0000';
    });

    // Bar chart dataset (SPI value)
    datasets.push({
      label: scale.toUpperCase(),
      data,
      backgroundColor,
      type: "bar", 
    });

    // 
    if (kernelSize && kernelSize > 1 && kernelSize % 2 === 1) {
      const smoothed = gaussianFilterWithPadding(
        data.map((v) => (typeof v === "number" ? v : 0)), // null → 0
        kernelSize,
        "reflect"
      );

      datasets.push({
        label: `${scale.toUpperCase()} Moving Avg`,
        data: smoothed,
        type: "line",
        borderColor: "purple",
        borderWidth: 2,
        // borderDash: [5, 5],
        tension: 0.25,
        pointRadius: 0,
        fill: false,
      });
    }
  });

  return { labels, datasets };
};


