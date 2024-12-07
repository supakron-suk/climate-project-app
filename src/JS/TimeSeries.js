// ข้อมูล dummyTimeSeriesData สำหรับแสดงในกราฟ
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

export const calculatemean = (dataByYear, year, region) => {
  const geojson = dataByYear[year];

  // สร้างอาร์เรย์เก็บผลรวมและจำนวนข้อมูลของแต่ละเดือน
  const monthlyAverages = Array(12).fill(0);
  const monthlyCounts = Array(12).fill(0);

  // ฟังก์ชันกรองข้อมูลตามภูมิภาค
  const filterByRegion = (features, region) => {
    if (region === 'All') {
      return features; // ถ้าเลือก "All" จะไม่กรอง
    }
    // กรองข้อมูลเฉพาะจังหวัดที่อยู่ในภูมิภาคที่เลือก
    return features.filter((feature) => feature.properties.region === region);
  };

  // กรองข้อมูลตามภูมิภาคที่เลือก
  const filteredFeatures = filterByRegion(geojson.features, region);

  // วนลูปผ่าน features เพื่อรวบรวมข้อมูล
  filteredFeatures.forEach((feature) => {
    const { temperature, month } = feature.properties;

    // ตรวจสอบว่า month และ temperature มีค่า
    if (month >= 1 && month <= 12 && typeof temperature === 'number') {
      monthlyAverages[month - 1] += temperature;
      monthlyCounts[month - 1] += 1;
    }
  });

  // คำนวณค่าเฉลี่ยรายเดือน
  const result = monthlyAverages.map((sum, index) => {
    if (monthlyCounts[index] > 0) {
      return sum / monthlyCounts[index];
    }
    return null; // ไม่มีข้อมูลในเดือนนี้
  });

  // คำนวณค่าเฉลี่ยรวมจาก result
  const validValues = result.filter((value) => value !== null); // กรองค่า null ออก
  const overallMean =
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length;

  // สร้างกราฟข้อมูล
const dummyTimeSeriesData = {
  labels: [
    ...Array(12).keys() // ใช้ index จาก 0 ถึง 11 (เดือน)
      .map((i) => i + 1), // ปรับให้เริ่มจาก 1 ถึง 12
    `Overall Mean (${year})`, // เพิ่มจุดข้อมูลพิเศษที่ตำแหน่งสุดท้าย
  ],
  datasets: [
    {
      label: 'Average Temperature (°C)',
      data: [...result, null], // ค่าเฉลี่ยรายเดือน (เติม null ไว้สำหรับจุดสุดท้าย)
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Overall Mean Temperature (°C)',
      data: [
        ...Array(12).fill(null), // เติม null เพื่อให้เส้นประไม่แสดงใน 12 เดือนแรก
        overallMean, // จุดเดียวที่เป็นค่าเฉลี่ยรวม
      ],
      borderColor: 'black',
      borderWidth: 2,
      borderDash: [5, 5], // เส้นประ
      pointBackgroundColor: 'black',
      pointRadius: 6, // ขนาดจุดที่ค่าเฉลี่ยรวม
      fill: false,
      tension: 0.4,
    },
  ],
};



  // แสดงผลลัพธ์
  console.log(`Monthly Averages for region "${region}" in year ${year}:`, result);
  console.log(`Overall Mean Temperature for region "${region}" in year ${year}:`, overallMean);
  console.log('Time Series Data for Plotting:', dummyTimeSeriesData);

  return dummyTimeSeriesData;
};

// export const calculatemean = (dataByYear, year, region) => {
//   const geojson = dataByYear[year];

//   // สร้างอาร์เรย์เก็บผลรวมและจำนวนข้อมูลของแต่ละเดือน
//   const monthlyAverages = Array(12).fill(0);
//   const monthlyCounts = Array(12).fill(0);

//   // ฟังก์ชันกรองข้อมูลตามภูมิภาค
//   const filterByRegion = (features, region) => {
//     if (region === 'All') {
//       return features; // ถ้าเลือก "All" จะไม่กรอง
//     }
//     // กรองข้อมูลเฉพาะจังหวัดที่อยู่ในภูมิภาคที่เลือก
//     return features.filter((feature) => feature.properties.region === region);
//   };

//   // กรองข้อมูลตามภูมิภาคที่เลือก
//   const filteredFeatures = filterByRegion(geojson.features, region);

//   // วนลูปผ่าน features เพื่อรวบรวมข้อมูล
//   filteredFeatures.forEach((feature) => {
//     const { temperature, month } = feature.properties;

//     // ตรวจสอบว่า month และ temperature มีค่า
//     if (month >= 1 && month <= 12 && typeof temperature === 'number') {
//       monthlyAverages[month - 1] += temperature;
//       monthlyCounts[month - 1] += 1;
//     }
//   });

//   // คำนวณค่าเฉลี่ย
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

//   // แสดงผลค่าเฉลี่ยที่คำนวณได้ในแต่ละเดือน
//   console.log(`Monthly Averages for region "${region}" in year ${year}:`, result);
//   console.log(`Overall Mean Temperature for region "${region}" in year ${year}:`, overallMean);


//   return result;
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
