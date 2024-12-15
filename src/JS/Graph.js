// ข้อมูล dummyTimeSeriesData สำหรับแสดงในกราฟ
//---------------------------------------- Time series Graph---------------------------------------------//
export const dummyTimeSeriesData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Average Temperature (°C)',
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
      label: 'Seasonal Cycle (°C)',
      data: [],
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
      tension: 0.4,
    },
  ],
};

//---------------------------------------- Seasonal Cycle Graph---------------------------------------------//

export const calculatemean = (dataByYear, startYear, endYear, region) => {
  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year.");
    return null;
  }

  const monthlyAverages = Array(12 * (endYear - startYear + 1)).fill(0);
  const monthlyCounts = Array(12 * (endYear - startYear + 1)).fill(0);

  const filterByRegion = (features, region) => {
    if (region === 'All') {
      return features;
    }
    return features.filter((feature) => feature.properties.region === region);
  };

  let overallCount = 0;
  let yearlyMeans = {};

  for (let year = startYear; year <= endYear; year++) {
    const geojson = dataByYear[year];
    if (!geojson) {
      console.warn(`No data available for year ${year}`);
      continue;
    }

    const filteredFeatures = filterByRegion(geojson.features, region);

    filteredFeatures.forEach((feature) => {
      const { temperature, month } = feature.properties;
      if (month >= 1 && month <= 12 && typeof temperature === 'number') {
        const index = (year - startYear) * 12 + (month - 1);
        monthlyAverages[index] += temperature;
        monthlyCounts[index] += 1;
        overallCount += 1;
      }
    });

    const yearlySum = monthlyAverages
      .slice((year - startYear) * 12, (year - startYear + 1) * 12)
      .reduce((sum, val, i) => {
        const value = monthlyCounts[(year - startYear) * 12 + i] > 0 ? val / monthlyCounts[(year - startYear) * 12 + i] : 0;
        return sum + value;
      }, 0);

    const yearlyMean = yearlySum / 12;
    yearlyMeans[year] = yearlyMean;
  }

  const result = monthlyAverages.map((sum, index) =>
    monthlyCounts[index] > 0 ? sum / monthlyCounts[index] : null
  );

  const validValues = result.filter((value) => value !== null);
  const overallMean =
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length;

  const monthlyData = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const index = (year - startYear) * 12 + (month - 1);
      const mean = result[index] !== null ? result[index] : "No data";
      monthlyData.push({ month, mean });
    }
  }

  const Seasonal_Cycle = (monthlyData) => {
    const seasonalCycle = Array.from({ length: 12 }, () => []);
    monthlyData.forEach(({ month, mean }) => {
      if (mean !== "No data") {
        seasonalCycle[month - 1].push(mean);
      }
    });

    return seasonalCycle.map((values) =>
      values.length > 0 ? values.reduce((acc, value) => acc + value, 0) / values.length : null
    );
  };

  const seasonalMeans = Seasonal_Cycle(monthlyData);
  const seasonalCycleData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Seasonal Cycle (°C)',
        data: seasonalMeans,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const yearBoundaries = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    const midYearIndex = i * 12 + 11;
    return {
      type: "line",
      scaleID: "x",
      value: midYearIndex,
      borderColor: "rgba(255, 0, 0, 0.5)",
      borderWidth: 2,
      borderDash: [10, 5],
      label: { enabled: true, content: `${startYear + i}` },
    };
  });

  const timeSeriesData = {
    labels: Array.from({ length: (endYear - startYear + 1) * 12 }, (_, i) => {
      const year = startYear + Math.floor(i / 12);
      const month = i % 12;
      return `${new Date(year, month).toLocaleString('en-US', { month: 'short' })} ${year}`;
    }),
    datasets: [
      {
        label: 'Average Temperature (°C)',
        data: result,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Overall Mean Temperature (°C)',
        data: Array(result.length).fill(null).concat(overallMean),
        borderColor: 'black',
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: 'black',
        pointRadius: 6,
        fill: false,
        tension: 0.4,
      },
    ],
    options: {
      responsive: true,
      plugins: {
        annotation: {
          annotations: yearBoundaries,
        },
      },
    },
  };

  return { seasonalCycleData, timeSeriesData };
};
// export const calculatemean = (dataByYear, startYear, endYear, region) => {
//   // ตรวจสอบความถูกต้องของช่วงปี
//   if (startYear > endYear) {
//     console.error("Start year must be less than or equal to end year.");
//     return null;
//   }

//   // สร้างอาร์เรย์เก็บผลรวมและจำนวนข้อมูลของแต่ละเดือน
//   const monthlyAverages = Array(12 * (endYear - startYear + 1)).fill(0);
//   const monthlyCounts = Array(12 * (endYear - startYear + 1)).fill(0);

//   // ฟังก์ชันกรองข้อมูลตามภูมิภาค
//   const filterByRegion = (features, region) => {
//     if (region === 'All') {
//       return features; // ถ้าเลือก "All" จะไม่กรอง
//     }
//     // กรองข้อมูลเฉพาะจังหวัดที่อยู่ในภูมิภาคที่เลือก
//     return features.filter((feature) => feature.properties.region === region);
//   };

//   // วนลูปผ่านแต่ละปีในช่วงที่เลือก
//   let overallCount = 0;
//   let yearlyMeans = {}; // สร้างอ็อบเจกต์เก็บค่าเฉลี่ยรายปี

//   for (let year = startYear; year <= endYear; year++) {
//     const geojson = dataByYear[year];
//     if (!geojson) {
//       console.warn(`No data available for year ${year}`);
//       continue;
//     }

//     // กรองข้อมูลตามภูมิภาค
//     const filteredFeatures = filterByRegion(geojson.features, region);

//     // วนลูปผ่าน features เพื่อรวบรวมข้อมูล
//     filteredFeatures.forEach((feature) => {
//       const { temperature, month } = feature.properties;

//       // ตรวจสอบว่า month และ temperature มีค่า
//       if (month >= 1 && month <= 12 && typeof temperature === 'number') {
//         const index = (year - startYear) * 12 + (month - 1);
//         monthlyAverages[index] += temperature;
//         monthlyCounts[index] += 1;
//         overallCount += 1;
//       }
//     });

//     // คำนวณค่าเฉลี่ยรายปี
//     // วนลูปผ่านปีที่เลือกเพื่อคำนวณค่าเฉลี่ยของแต่ละปี
// for (let year = startYear; year <= endYear; year++) {
//   // สกัดข้อมูลรายเดือนของปีนั้น
//   const yearlySum = monthlyAverages.slice((year - startYear) * 12, (year - startYear + 1) * 12).reduce((sum, val, i) => {
//     const value = monthlyCounts[(year - startYear) * 12 + i] > 0 ? val / monthlyCounts[(year - startYear) * 12 + i] : 0;
//     // ใช้ console.log เพื่อตรวจสอบค่า value ในแต่ละรอบ
//     //console.log(`Year: ${year}, Month: ${i + 1}, Value: ${value}`);
//     return sum + value;
//   }, 0);

//   // แสดงค่า yearlySum
//   //console.log(`Yearly sum for year ${year}: ${yearlySum}`);

//   // คำนวณค่าเฉลี่ยรายปี
//   const yearlyMean = yearlySum / 12;
//   //console.log(`Yearly mean for year ${year}: ${yearlyMean}`);

//   // เก็บค่าเฉลี่ยของแต่ละปี
//   yearlyMeans[year] = yearlyMean;
// }

//   }

//   // คำนวณค่าเฉลี่ยรายเดือน
//   const result = monthlyAverages.map((sum, index) => {
//     if (monthlyCounts[index] > 0) {
//       return sum / monthlyCounts[index];
//     }
//     return null; // ไม่มีข้อมูลในเดือนนี้
//   });

//   // คำนวณค่าเฉลี่ยรวมจาก result
//   const validValues = result.filter((value) => value !== null); // กรองค่า null ออก
//   const overallMean =
//     validValues.reduce((sum, value) => sum + value, 0) / validValues.length;

// //------------------------------------------- Seasonal Cycle Function-------------------------------------------//

// const monthlyData = [];
// for (let year = startYear; year <= endYear; year++) {
//   console.log(`Year: ${year}`);
//   for (let month = 1; month <= 12; month++) {
//     const index = (year - startYear) * 12 + (month - 1);
//     const mean = result[index] !== null ? result[index] : "No data";
//     //console.log(`  Month: ${month}, Mean: ${mean}`);
//      monthlyData.push({ month, mean });
//   }
// }
// const Seasonal_Cycle = (monthlyData) => {
//   // คำนวณค่าเฉลี่ยตามฤดูกาล
//   const seasonalCycle = Array.from({ length: 12 }, () => []);

//   monthlyData.forEach(({ month, mean }) => {
//     if (mean !== "No data") {
//       seasonalCycle[month - 1].push(mean); // เก็บเฉพาะค่า mean ที่ไม่ใช่ "No data"
//     }
//   });

//   // คำนวณค่าเฉลี่ยสำหรับแต่ละเดือน
//   const seasonalMeans = seasonalCycle.map((values, index) => {
//     if (values.length > 0) {
//       const sum = values.reduce((acc, value) => acc + value, 0);
//       return sum / values.length;
//     }
//     return null; // ไม่มีข้อมูลในเดือนนี้
//   });

//   return seasonalMeans;
// };

// //Seasonal_Cycle(monthlyData);



// const seasonalMeans = Seasonal_Cycle(monthlyData);
// const dummySeasonalCycleData = {
//   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//   datasets: [
//     {
//       label: 'Seasonal Cycle (°C)',
//       data: seasonalMeans, // นำ Seasonal Cycle มาใส่ใน data
//       borderColor: 'rgba(75,192,192,1)',
//       backgroundColor: 'rgba(75,192,192,0.2)',
//       fill: true,
//       tension: 0.4,
//     },
//   ],
//   //return dummySeasonalCycleData;
// };

// // แสดง labels และ data ใน console
// // console.log('Labels:', dummySeasonalCycleData.labels);
// console.log('Data:', dummySeasonalCycleData.datasets[0].data);



// //------------------------------------------- Seasonal Cycle Function-------------------------------------------//

//   // สร้างกราฟข้อมูล
//   // กำหนดเส้นประสำหรับแต่ละปี
//   const yearBoundaries = Array.from(
//   { length: endYear - startYear + 1 },
//   (_, i) => {
//     const yearIndex = i * 12;
//     const midYearIndex = yearIndex + 11; // จุดกลางระหว่างเดือน 12 และเดือน 1

//     return {
//       type: "line",
//       scaleID: "x",
//       value: midYearIndex, // เปลี่ยนไปใช้จุดกลางระหว่างปี
//       borderColor: "rgba(255, 0, 0, 0.5)",
//       borderWidth: 2,
//       borderDash: [10, 5],
//       label: {
//         enabled: true,
//         content: `${startYear + i}`,
//       },
//       // เพิ่มข้อมูล tooltip เพื่อแสดงค่าเฉลี่ยของปีนั้นๆ
//       tooltip: {
//         enabled: true,
//         callbacks: {
//           label: function (context) {
//             const year = startYear + i;
//             const mean = yearlyMeans[year] || 'N/A'; // ดึงค่าเฉลี่ยรายปี
//             return `Year ${year}: Mean Temperature = ${mean.toFixed(2)}°C`; // แสดงค่าเฉลี่ยใน tooltip
//           },
//         },
//       },
//     };
//   }
// );

// //-------------------------------------- Time series graph---------------------------------// 
//   const dummyTimeSeriesData = {
//   labels: [
//     ...Array.from({ length: (endYear - startYear + 1) * 12 }, (_, i) => {
//     const year = parseInt(startYear) + Math.floor(i / 12); // ใช้ parseInt เพื่อแปลง startYear เป็นตัวเลข
//     const month = i % 12;

//     // เพิ่มการตรวจสอบค่า year และ month
//     //console.log(`Index: ${i}, Year: ${year}, Month: ${month}`);
    
//     return `${new Date(year, month).toLocaleString('en-US', { month: 'short' })} ${year}`; // สร้าง label ใหม่
//     }),
//   ],
  

//   datasets: [
//     {
//       label: 'Average Temperature (°C)',
//       data: [...result, null],
//       borderColor: 'rgba(75,192,192,1)',
//       backgroundColor: 'rgba(75,192,192,0.2)',
//       fill: true,
//       tension: 0.4,
//     },
//     {
//       label: 'Overall Mean Temperature (°C)',
//       data: [
//         ...Array(result.length).fill(null),
//         overallMean,
//       ],
//       borderColor: 'black',
//       borderWidth: 2,
//       borderDash: [5, 5],
//       pointBackgroundColor: 'black',
//       pointRadius: 6,
//       fill: false,
//       tension: 0.4,
//     },
//   ],
//   options: {
//     responsive: true,
//     plugins: {
//       annotation: {
//         annotations: yearBoundaries,
//       },
//       tooltip: {
//         enabled: true,
//       },
//     },
//   },
// };

// // ตรวจสอบค่า labels
// //console.log("Generated Labels:", dummyTimeSeriesData.labels);

// return dummyTimeSeriesData;


// };
//-------------------------------------- Time series graph---------------------------------// 

// export const Seasonal_Cycle = (result, startYear, endYear) => {
//   // สร้างอาเรย์เก็บค่าของแต่ละเดือน
//   const monthlyValues = Array.from({ length: 12 }, () => []);

//   // วนลูปผ่านข้อมูล result ที่เป็นค่าเฉลี่ยรายเดือน
//   for (let year = startYear; year <= endYear; year++) {
//     for (let month = 1; month <= 12; month++) {
//       const index = (year - startYear) * 12 + (month - 1);
//       if (result[index] !== null) {
//         monthlyValues[month - 1].push(result[index]);
//       }
//     }
//   }

//   // คำนวณค่าเฉลี่ยของแต่ละเดือน
//   const seasonalCycle = monthlyValues.map((values, monthIndex) => {
//     if (values.length > 0) {
//       const sum = values.reduce((acc, value) => acc + value, 0);
//       const mean = sum / values.length;
//       console.log(`Month: ${monthIndex + 1}, Mean: ${mean}`);
//       return mean;
//     } else {
//       console.log(`Month: ${monthIndex + 1}, Mean: No data`);
//       return null; // กรณีไม่มีข้อมูล
//     }
//   });

//   return seasonalCycle;
// };


// export const calculatemean = (dataByYear, startYear, endYear, region) => {
//   // ตรวจสอบความถูกต้องของช่วงปี
//   if (startYear > endYear) {
//     console.error("Start year must be less than or equal to end year.");
//     return null;
//   }

//   // สร้างอาร์เรย์เก็บผลรวมและจำนวนข้อมูลของแต่ละเดือน
//   const monthlyAverages = Array(12 * (endYear - startYear + 1)).fill(0);
//   const monthlyCounts = Array(12 * (endYear - startYear + 1)).fill(0);

//   // ฟังก์ชันกรองข้อมูลตามภูมิภาค
//   const filterByRegion = (features, region) => {
//     if (region === 'All') {
//       return features; // ถ้าเลือก "All" จะไม่กรอง
//     }
//     // กรองข้อมูลเฉพาะจังหวัดที่อยู่ในภูมิภาคที่เลือก
//     return features.filter((feature) => feature.properties.region === region);
//   };

//   // วนลูปผ่านแต่ละปีในช่วงที่เลือก
//   let overallCount = 0;
//   for (let year = startYear; year <= endYear; year++) {
//     const geojson = dataByYear[year];
//     if (!geojson) {
//       console.warn(`No data available for year ${year}`);
//       continue;
//     }

//     // กรองข้อมูลตามภูมิภาค
//     const filteredFeatures = filterByRegion(geojson.features, region);

//     // วนลูปผ่าน features เพื่อรวบรวมข้อมูล
//     filteredFeatures.forEach((feature) => {
//       const { temperature, month } = feature.properties;

//       // ตรวจสอบว่า month และ temperature มีค่า
//       if (month >= 1 && month <= 12 && typeof temperature === 'number') {
//         const index = (year - startYear) * 12 + (month - 1);
//         monthlyAverages[index] += temperature;
//         monthlyCounts[index] += 1;
//         overallCount += 1;
//       }
//     });
//   }

//   // คำนวณค่าเฉลี่ยรายเดือน
//   const result = monthlyAverages.map((sum, index) => {
//     if (monthlyCounts[index] > 0) {
//       return sum / monthlyCounts[index];
//     }
//     return null; // ไม่มีข้อมูลในเดือนนี้
//   });

//   // คำนวณค่าเฉลี่ยรวมจาก result
//   const validValues = result.filter((value) => value !== null); // กรองค่า null ออก
//   const overallMean =
//     validValues.reduce((sum, value) => sum + value, 0) / validValues.length;

//   // แสดงจำนวนข้อมูลที่ใช้ในการคำนวณในแต่ละเดือน
//   console.log(`Monthly Data Counts (${startYear}-${endYear}):`, monthlyCounts);

//   // แสดงผลลัพธ์ค่าเฉลี่ยรายเดือน
//   console.log(`Monthly Averages (${startYear}-${endYear}):`, result);

//   // แสดงผลค่าเฉลี่ยรวม
//   console.log(`Overall Mean Temperature (${startYear}-${endYear}):`, overallMean);

//   // สร้างกราฟข้อมูล
//   // สร้างกราฟข้อมูล

//   // กำหนดเส้นประสำหรับแต่ละปี

//   const yearBoundaries = Array.from(
//     { length: endYear - startYear + 1 },
//     (_, i) => {
//       const yearIndex = i * 12;
//       return {
//         type: "line",
//         scaleID: "x",
//         value: yearIndex,
//         borderColor: "rgba(255, 0, 0, 0.5)",
//         borderWidth: 2,
//         borderDash: [10, 5],
//         label: {
//           enabled: true,
//           content: `${startYear + i}`,
//         },
//       };
//     }
//   );

// const dummyTimeSeriesData = {
//   labels: [
//     ...Array.from({ length: (endYear - startYear + 1) * 12 }, (_, i) => {
//       const year = startYear + Math.floor(i / 12);
//       const month = (i % 12) + 1;
//       return `${new Date(year, month - 1).toLocaleString('en-US', { month: 'short' })} ${year}`;
//     }),
//     `Overall Mean (${startYear}-${endYear})`,
//   ],
//   datasets: [
//     {
//       label: 'Average Temperature (°C)',
//       data: [...result, null],
//       borderColor: 'rgba(75,192,192,1)',
//       backgroundColor: 'rgba(75,192,192,0.2)',
//       fill: true,
//       tension: 0.4,
//     },
//     {
//       label: 'Overall Mean Temperature (°C)',
//       data: [
//         ...Array(result.length).fill(null),
//         overallMean,
//       ],
//       borderColor: 'black',
//       borderWidth: 2,
//       borderDash: [5, 5],
//       pointBackgroundColor: 'black',
//       pointRadius: 6,
//       fill: false,
//       tension: 0.4,
//     },
//   ],
//   options: {
//     responsive: true,
//     plugins: {
//       annotation: {
//         annotations:  yearBoundaries,
//       },
//     },
//   },
// };



// return dummyTimeSeriesData;

// };


// Function to filter data by month
export const filterByMonth = (data, month) => {
  if (!month) {
    return data; 
  }
  return data.filter(feature => feature.properties.month === parseInt(month));
};



export const getProvinceTemp = (geojson, provinceName) => {
  // สร้างอาร์เรย์เก็บค่า temperature สำหรับ 12 เดือน
  const monthlyTemperatures = Array(12).fill(null);

  // ค้นหาข้อมูลจังหวัดที่เลือก
  const provinceFeatures = geojson.features.filter(
    (feature) => feature.properties.name === provinceName
  );

  // วนลูปเพื่อดึงค่า temperature สำหรับแต่ละเดือน
  provinceFeatures.forEach((feature) => {
    const { temperature, month } = feature.properties;

    if (month >= 1 && month <= 12 && typeof temperature === 'number') {
      monthlyTemperatures[month - 1] = temperature;
    }
  });

  return monthlyTemperatures;
};
