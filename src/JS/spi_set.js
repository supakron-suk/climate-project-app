// spi_set.js
export const spi_process = (features, selectedIndex, configData) => {
  const variable = configData.datasets["ERA dataset"].variable_options.find(
    (v) => v.value === selectedIndex
  );
  if (!variable || !variable.multi_scale) return [];

  const spiScales = variable.multi_scale;
  const spiData = [];

  features.forEach((feature) => {
    const { name, month, year } = feature.properties;
    spiScales.forEach((scale) => {
      const value = feature.properties[scale];
      if (value !== undefined && value !== null) {
        const entry = { name, year, month, scale, value };
        console.log(
          `year: ${year}, month: ${month}, spi value: ${value}, spi scale: ${scale}`
        );
        spiData.push(entry);
      }
    });
  });

  return spiData;
};

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


const getColorForScale = (scale) => {
  const colorMap = {
    spi3: '#4dabf7',
    spi6: '#74c0fc',
    spi12: '#a5d8ff',
    spi24: '#d0ebff',
  };
  return colorMap[scale] || '#ccc';
};
