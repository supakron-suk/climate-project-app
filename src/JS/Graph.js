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

export const calculatemean = (dataByYear, startYear, endYear, region, province, selectedIndex, kernelSize, configData, selectedDataset, selectedValue) => {
  
  let annualValuesByYear = {};

  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year."); 
    return null; 
  }
  const monthlyAverages = Array(12 * (endYear - startYear + 1)).fill(0); 
  const monthlyCounts = Array(12 * (endYear - startYear + 1)).fill(0); 

  
  const filterRegion_Province = (features, region, province = null) => {
  if (province && province !== 'Thailand') {
    // เลือกจาก province dropdown โดยตรง
    return features.filter((feature) => feature.properties.province_name === province);
  }

  if (region && region !== 'Thailand_region') {
    // กรองข้อมูลโดยใช้ region_name จาก properties ของแต่ละ feature
    return features.filter((feature) => feature.properties.region_name === region);
  }

  return features;
};


  

  
  let yearlyMeans = {}; // ตัวแปรเก็บค่าเฉลี่ยรายปี
  let provinceData = {}; // ตัวแปรเก็บข้อมูลเฉพาะจังหวัดที่เลือก
  

  for (let year = startYear; year <= endYear; year++) {
    let geojson = null;

    // console.log(`Year: ${year}, Data for year:`, dataByYear[year]);


// ไม่ว่าจะอยู่ใน view ไหน ถ้าเลือก Thailand ให้ใช้ country
const isThailand =
  province === "Thailand" || region === "Thailand_region";

if (isThailand) {
  geojson = dataByYear[year]?.country;
} else if (region && region !== "Thailand_region") {
  geojson = dataByYear[year]?.region;
} else if (province && province !== "Thailand") {
  geojson = dataByYear[year]?.province;
}




    if (!geojson || !geojson.features) {
      console.warn(`No valid geojson data available for year ${year}`);
      continue;
    }

    let features = [];
if (geojson.features) {
  features = Array.isArray(geojson.features) ? geojson.features : [geojson.features];
} else if (geojson.type === "Feature") {
  features = [geojson];
} else {
  console.warn(`❌ Invalid geojson structure for year ${year}:`, geojson);
  continue;
}

    const filteredFeatures = filterRegion_Province(features, region, province);

    // console.log(`📅 Year: ${year}, Dataset used:`, geojson);
    // กรองข้อมูลตาม region และ province ที่เลือก

      filteredFeatures.forEach((feature) => {
        const { name } = feature.properties;



        // ดึง annual value สำหรับ Time Series
         let annualValue = null;
        if (feature.properties.annual && feature.properties.annual[selectedIndex] !== undefined) {
          annualValue = feature.properties.annual[selectedIndex];
        }

        // ดึง monthly array สำหรับ Seasonal Cycle
        let monthlyValues = null;
      if (feature.properties.monthly && Array.isArray(feature.properties.monthly[selectedIndex])) {
        monthlyValues = feature.properties.monthly[selectedIndex];
      }

      if (annualValue !== null) {
        const yearlySum = annualValue; 
        yearlyMeans[year] = (yearlyMeans[year] || 0) + yearlySum;
      }

      if (monthlyValues !== null) {
        monthlyValues.forEach((value, monthIndex) => {
          const idx = (year - startYear) * 12 + monthIndex;
          monthlyAverages[idx] += value; 
          monthlyCounts[idx] += 1; 
        });
      }

      });

  }


  
const averagedYearlyMeans = {};
for (let year in annualValuesByYear) {
  const values = annualValuesByYear[year];
  if (Array.isArray(values) && values.length > 0) {
    averagedYearlyMeans[year] = values.reduce((a, b) => a + b, 0) / values.length;
  }
}


  const annualArray = [];
for (let year = startYear; year <= endYear; year++) {
  annualArray.push({
    year,
    value: yearlyMeans[year] !== undefined ? yearlyMeans[year] : null,
  });
}
// console.log("📊 Full annual array:", annualArray);


  const result = monthlyAverages.map((sum, index) =>
    monthlyCounts[index] > 0 ? sum / monthlyCounts[index] : null
  ); 
  // สร้างอาร์เรย์ผลลัพธ์โดยคำนวณค่าเฉลี่ยรายเดือน หากไม่มีข้อมูลให้ใช้ค่า null

  const validValues = result.filter((value) => value !== null); 
  // กรองเฉพาะค่าที่ไม่ใช่ null ใน result

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
  

//   const indexLabels = {
//    temperature: { label: 'Value', unit: '°C' },
//     tmin: { label: 'Value', unit: '°C' },
//     tmax: { label: 'Value', unit: '°C' },
//     txx: { label: 'Value', unit: '°C' },
//     tnn: { label: 'Value', unit: '°C' },
//     pre: { label: 'Value', unit: 'mm' },
//     rx1day: { label: 'Value', unit: 'mm' },
// };

// const selectedIndexLabel = indexLabels[selectedIndex]?.label || 'Unknown Data';
// const selectedIndexUnit = indexLabels[selectedIndex]?.unit || '';

const variableOption = configData.datasets[selectedDataset]?.variable_options?.find(
  (opt) => opt.value === selectedValue
);

const selectedIndexUnit = variableOption?.unit || '';



const calculateYAxisBounds = (data) => {
  const validData = data.filter((value) => typeof value === "number" && !isNaN(value)); // กรองค่าที่ valid
  const min = Math.min(...validData);
  const max = Math.max(...validData);
  const padding = (max - min) * 0.2; 
  return {
    min: min - padding > 0 ? min - padding : 0, 
    max: max + padding,
  };
};



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
      label: `Value (${selectedIndexUnit})`,
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
          text: `Value (${selectedIndexUnit})`,
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




// สร้าง Labels รายปี
const annualLabels = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
  const year = parseInt(startYear, 10) + i; // แปลง startYear เป็นตัวเลขก่อนการคำนวณ
  return `${year}`; // แสดงปีในรูปแบบตัวเลข
});

// คำนวณ bounds ใหม่สำหรับข้อมูลรายปี
const annualBounds = calculateYAxisBounds(annualArray.map(item => item.value));




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
const annualGaussianAverage = gaussianFilterWithPadding(annualArray.map(item => item.value), kernelSize, 'reflect');
// console.log("📊 Kernel Size:", kernelSize);
// console.log("📊 annual data :", annualArray);
// console.log("📊 Gaussian Filter Data:", annualGaussianAverage);
  //----------------------------------------------------//

  const timeSeriesData = {
  labels: annualLabels,
  datasets: [
    {
      label: `Annual Average`,
      data:  annualArray.map(item => item.value),  
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
          text: `Value (${selectedIndexUnit})`,
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

console.log("📊 Time Series Data:", timeSeriesData);
console.log("📈 Seasonal Cycle Data:", seasonalCycleData);

return { seasonalCycleData, timeSeriesData};

};
