// Graph.js
import { spi_process } from './spi_set';


//---------------------------------------- Time series Graph---------------------------------------------//
export const dummyTimeSeriesData = {
  labels: [],
  datasets: [
    {
      label: '',
      data: [], 
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
      tension: 0.4,
    },
  ],
};
//---------------------------------------- Time series Graph---------------------------------------------//
//---------------------------------------- Seasonal Cycle Graph---------------------------------------------//
export const dummySeasonalCycleData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: '',
      data: [],
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
      tension: 0.4,
    },
  ],
};


//---------------------------------------- SPI Bar Chart Dummy Graph ---------------------------------------------//


//---------------------------------------- Dummy seasonal Graph---------------------------------------------//



//---------------------------------------- Dummy spi Graph---------------------------------------------//

export const calculatemean = (dataByYear, startYear, endYear, region, province, selectedIndex, kernelSize, configData) => {
  
  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year."); // ตรวจสอบเงื่อนไขว่าปีเริ่มต้นต้องไม่มากกว่าปีสิ้นสุด
    return null; 
  }
  const monthlyAverages = Array(12 * (endYear - startYear + 1)).fill(0); 
  const monthlyCounts = Array(12 * (endYear - startYear + 1)).fill(0); 

  const provinceListInRegion = region !== 'Thailand' 
    ? configData.areas.area_thailand[region] || []
    : [];
  const filterRegion_Province = (features, region, province = null) => {
  if (province && province !== 'Thailand') {
    // เลือกจาก province dropdown โดยตรง
    return features.filter((feature) => feature.properties.name === province);
  }

  if (region && region !== 'Thailand_region') {
    const provinceList = configData.areas.area_thailand[region] || [];
    return features.filter((feature) =>
      provinceList.includes(feature.properties.name)
    );
  }

  // ✅ ถ้าเลือก Thailand ทั้งหมด
  return features;
};

  

  let overallCount = 0; // ตัวแปรเก็บจำนวนข้อมูลทั้งหมดที่ผ่านการประมวลผล
  let yearlyMeans = {}; // ตัวแปรเก็บค่าเฉลี่ยรายปี
  let provinceData = {}; // ตัวแปรเก็บข้อมูลเฉพาะจังหวัดที่เลือก
  let spiRawData = [];

  for (let year = startYear; year <= endYear; year++) {
    const geojson = dataByYear[year]?.province; // ต้องใช้เฉพาะ .province
    if (!geojson || !geojson.features) {
      console.warn(`No province data available for year ${year}`);
      continue;
    }

    const filteredFeatures = filterRegion_Province(geojson.features, region, province); 
    // กรองข้อมูลตาม region และ province ที่เลือก

    //----------------------SPI Process-----------------------------//
    // if (selectedIndex === 'spi' || selectedIndex === 'spei') {
    //   const { spi_process } = require('./spi_set');
    //   const spiResult = spi_process(filteredFeatures, selectedIndex, configData);
    //   console.log(`🔍 SPI Raw Data for in calculatemean ${selectedIndex.toUpperCase()}:`, spiResult);
    //   spiRawData.push(...spiResult);
    // }

    filteredFeatures.forEach((feature) => {
  const { name, month } = feature.properties;
  const value = feature.properties[selectedIndex]; // ดึงค่าของ selectedIndex
  

  if (!provinceData[name]) {
    provinceData[name] = [];
  }
  provinceData[name].push({ year, month, [selectedIndex]: value });

  if (month >= 1 && month <= 12 && typeof value === 'number') {
    const index = (year - startYear) * 12 + (month - 1);
    monthlyAverages[index] += value;
    monthlyCounts[index] += 1;
    overallCount += 1;
  }
});

    const yearlySum = monthlyAverages
      .slice((year - startYear) * 12, (year - startYear + 1) * 12)
      // แยกผลรวมค่าอุณหภูมิรายเดือนในปีนั้น ๆ
      .reduce((sum, val, i) => {
        const value = monthlyCounts[(year - startYear) * 12 + i] > 0 
          ? val / monthlyCounts[(year - startYear) * 12 + i] 
          : 0; 
        return sum + value; // รวมค่าเฉลี่ยรายเดือนทั้งหมด
      }, 0);

    const yearlyMean = yearlySum / 12; 
    // หาค่าเฉลี่ยรายปีโดยการหารผลรวมด้วย 12 เดือน
    yearlyMeans[year] = yearlyMean; 
    // บันทึกค่าเฉลี่ยรายปีใน yearlyMeans
  }

  const result = monthlyAverages.map((sum, index) =>
    monthlyCounts[index] > 0 ? sum / monthlyCounts[index] : null
  ); 
  // สร้างอาร์เรย์ผลลัพธ์โดยคำนวณค่าเฉลี่ยรายเดือน หากไม่มีข้อมูลให้ใช้ค่า null

  const validValues = result.filter((value) => value !== null); 
  // กรองเฉพาะค่าที่ไม่ใช่ null ใน result
  const overallMean =
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length; 
  // คำนวณค่าเฉลี่ยรวมของทุกเดือน

  const monthlyData = []; 
  // อาร์เรย์สำหรับเก็บข้อมูลรายเดือน
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const index = (year - startYear) * 12 + (month - 1); 
      // คำนวณ index ใน result
      const mean = result[index] !== null ? result[index] : "No data"; 
      monthlyData.push({ month, mean }); 
      // เพิ่มข้อมูลรายเดือนเข้าไปใน monthlyData
    }
  }


  //------------------------------------GRAPH ZONE------------------------------------------------------//
  

  const indexLabels = {
   temperature: { label: 'Value', unit: '°C' },
    tmin: { label: 'Value', unit: '°C' },
    tmax: { label: 'Value', unit: '°C' },
    txx: { label: 'Value', unit: '°C' },
    tnn: { label: 'Value', unit: '°C' },
    pre: { label: 'Value', unit: 'mm' },
    rx1day: { label: 'Value', unit: 'mm' },
};

const calculateYAxisBounds = (data) => {
  const validData = data.filter((value) => typeof value === "number" && !isNaN(value)); // กรองค่าที่ valid
  const min = Math.min(...validData);
  const max = Math.max(...validData);
  const padding = (max - min) * 0.2; // เพิ่ม padding 10% ให้กราฟดูสวยงาม
  return {
    min: min - padding > 0 ? min - padding : 0, // ไม่ให้ต่ำกว่าศูนย์ถ้าเป็นข้อมูลบวก
    max: max + padding,
  };
};

const selectedIndexLabel = indexLabels[selectedIndex]?.label || 'Unknown Data';
const selectedIndexUnit = indexLabels[selectedIndex]?.unit || '';

  const Seasonal_Cycle = (monthlyData) => {
    const seasonalCycle = Array.from({ length: 12 }, () => []); 
    monthlyData.forEach(({ month, mean }) => {
      if (mean !== "No data") {
        seasonalCycle[month - 1].push(mean); 
      }
    });

    return seasonalCycle.map((values) =>
      values.length > 0 
        ? values.reduce((acc, value) => acc + value, 0) / values.length 
        : null
    ); 
  };

  const seasonalMeans = Seasonal_Cycle(monthlyData); 
  const seasonalBounds = calculateYAxisBounds(seasonalMeans);

  const seasonalCycleData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: `${selectedIndexLabel} (${selectedIndexUnit})`,
      data: seasonalMeans,
      borderColor: 'black',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
      tension: 0,
    },
  ],
  options: {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: `${selectedIndexLabel} (${selectedIndexUnit})`,
        },
        min: seasonalBounds.min,
        max: seasonalBounds.max,
        ticks: {
          callback: function(value) {
            return Number(value.toFixed(0)); // ตัดทศนิยมออก
          },
        },
      },
    },
  },
};


  //----------------------------------------------------//
  // สร้างข้อมูลรายปีจากรายเดือน
const annualData = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
  const startIndex = i * 12; // index ของเดือนแรกในปีนั้น
  const endIndex = startIndex + 12; // index ของเดือนสุดท้ายในปีนั้น
  const yearlyValues = result.slice(startIndex, endIndex); // ข้อมูล 12 เดือนในปีนั้น
  const yearlyAverage = yearlyValues.reduce((sum, val) => sum + val, 0) / yearlyValues.length; // ค่าเฉลี่ยรายปี
  return yearlyAverage;
});

// สร้าง Labels รายปี
const annualLabels = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
  const year = parseInt(startYear, 10) + i; // แปลง startYear เป็นตัวเลขก่อนการคำนวณ
  return `${year}`; // แสดงปีในรูปแบบตัวเลข
});

// คำนวณ bounds ใหม่สำหรับข้อมูลรายปี
const annualBounds = calculateYAxisBounds(annualData);

const gaussianFilterWithPadding = (data, kernelSize, paddingType = 'reflect') => {
  // สร้าง Gaussian Kernel ตามสมการ K(x*, xi)
  const kernel = Array.from({ length: kernelSize }, (_, i) => {
    const x = i - Math.floor(kernelSize / 2);
    return Math.exp(-((x ** 2) / (2 * kernelSize ** 2)));  
  });

  // Normalize Kernel (ทำให้ผลรวมเป็น 1)
  const sumKernel = kernel.reduce((sum, val) => sum + val, 0);
  const normalizedKernel = kernel.map(val => val / sumKernel);

  // **Padding Data**
  let paddedData;
  const padSize = Math.floor(kernelSize / 2);

  if (paddingType === 'reflect') {
    paddedData = [
      ...data.slice(1, padSize + 1).reverse(),
      ...data,
      ...data.slice(-padSize - 1, -1).reverse()
    ];
  } else if (paddingType === 'edge') {
    paddedData = [
      ...Array(padSize).fill(data[0]),
      ...data,
      ...Array(padSize).fill(data[data.length - 1])
    ];
  } else {
    paddedData = [
      ...Array(padSize).fill(0),
      ...data,
      ...Array(padSize).fill(0)
    ];
  }

  // Apply Gaussian Filter บนข้อมูลที่มี padding
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

// **ให้ User กำหนดค่า kernelSize**
const annualGaussianAverage = gaussianFilterWithPadding(annualData, kernelSize, 'reflect');
  //----------------------------------------------------//

  const timeSeriesData = {
  labels: annualLabels,
  datasets: [
    {
      label: `Annual Average`,
      data: annualData,
      borderColor: 'black',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
      tension: 0,
      pointRadius: 0, 
      pointHoverRadius: 6, 
    },
    {
      label: `moving average`,
      data: annualGaussianAverage,
      borderColor: 'purple',
      borderWidth: 2,
      borderDash: [5, 5],
      pointBackgroundColor: 'purple',
      pointRadius: 0,
      pointHoverRadius: 6,
      fill: false,
      tension: 0,
    },
  ],
  options: {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 25,
          },
          color: 'black',
        },
        title: {
          display: true,
          text: 'Year',
          font: {
            size: 28,
          },
        },
      },
      y: {
        ticks: {
          callback: function(value) {
            return Number(value.toFixed(0)); 
          },
          font: {
            size: 25,
          },
          color: 'black',
        },
        title: {
          display: true,
          text: `${selectedIndexLabel} (${selectedIndexUnit})`,
          font: {
            size: 28,
          },
        },
        min: annualBounds.min,
        max: annualBounds.max,
      },
    },
  },
};

const spi_graph_Data = (spiRawData) => {
  if (!spiRawData || spiRawData.length === 0) return null;

  // รวมข้อมูลตามปี + เดือน + สเกล
  const grouped = {};
  spiRawData.forEach(({ year, month, scale, value }) => {
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = {};
    grouped[key][scale] = value;
  });

  const labels = Object.keys(grouped); // ['1960-01', '1960-02', ...]
  const scales = [...new Set(spiRawData.map((d) => d.scale))]; // ['spi3', 'spi6', ...]

  const datasets = scales.map((scale) => ({
    label: scale.toUpperCase(),
    data: labels.map((label) => grouped[label]?.[scale] ?? null),
    backgroundColor:
      scale === 'spi3' ? '#4dabf7' :
      scale === 'spi6' ? '#74c0fc' :
      scale === 'spi12' ? '#a5d8ff' :
      scale === 'spi24' ? '#d0ebff' :
      '#ccc',
  }));

  return {
    labels,
    datasets,
    options: {
      responsive: true,
      scales: {
        y: {
          min: -3,
          max: 3,
          title: {
            display: true,
            text: "SPI Value",
          },
        },
        x: {
          title: {
            display: true,
            text: "Year-Month",
          },
          ticks: {
            maxTicksLimit: 15,
            callback: function (value, index, ticks) {
              return labels[index];
            },
          },
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw?.toFixed(2)}`;
            },
          },
        },
      },
    },
  };
};


return { seasonalCycleData, timeSeriesData};

};
