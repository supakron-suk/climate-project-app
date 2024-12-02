// ข้อมูล dummyTimeSeriesData สำหรับแสดงในกราฟ
export const dummyTimeSeriesData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Average Temperature (°C)',
      data: [], // เริ่มต้นเป็นอาร์เรย์ว่าง
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
      tension: 0.4,
    },
  ],
};

export const calculatemean = (dataByYear, year) => {
  const geojson = dataByYear[year];

  // ตรวจสอบว่า geojson มีโครงสร้างที่ถูกต้อง
  if (!geojson || !geojson.features || !Array.isArray(geojson.features)) {
    console.error(`Invalid GeoJSON data for year ${year}:`, geojson);
    return null;
  }

  // สร้างอาร์เรย์เก็บผลรวมและจำนวนข้อมูลของแต่ละเดือน
  const monthlyAverages = Array(12).fill(0);
  const monthlyCounts = Array(12).fill(0);

  // วนลูปผ่าน features เพื่อรวบรวมข้อมูล
  geojson.features.forEach((feature) => {
    const { temperature, month } = feature.properties;

    // ตรวจสอบว่า month และ temperature มีค่า
    if (month >= 1 && month <= 12 && typeof temperature === 'number') {
      monthlyAverages[month - 1] += temperature;
      monthlyCounts[month - 1] += 1;
    }
  });

  // คำนวณค่าเฉลี่ย
  const result = monthlyAverages.map((sum, index) => {
    if (monthlyCounts[index] > 0) {
      return sum / monthlyCounts[index];
    }
    return null; // ไม่มีข้อมูลในเดือนนี้
  });

  console.log(`Monthly Average Temperatures for the Year ${year}:`, result);

  // อัปเดตค่าใน dummyTimeSeriesData
  dummyTimeSeriesData.datasets[0].data = result;

  console.log('Updated dummyTimeSeriesData:', dummyTimeSeriesData);

  return result;
};





// Function to filter data by region
export const filterByRegion = (data, region) => {
  if (region === 'All') {
    return data.features;
  } else {
    return data.features.filter(feature => feature.properties.region === region);
  }
};

// Function to filter data by month
export const filterByMonth = (data, month) => {
  if (!month) {
    return data; 
  }
  return data.filter(feature => feature.properties.month === parseInt(month));
};

// Function to process and prepare time series data
export const processTimeSeriesData = (data) => {
  const time = data.map(item => new Date(item[0])); // Convert to Date
  const temperature = data.map(item => item[1]);
  return { time, temperature };
};


// export const handleYearChange = (setYear, setData, dataByYear) => (event) => {
//   const year = event.target.value;
//   setYear(year);

//   const geojson = dataByYear[year];

//   if (!geojson || !geojson.features) {
//     console.error(`No valid GeoJSON data for the selected year: ${year}`);
//     setData([]);
//     return;
//   }

//   setData(geojson.features);

//   // เรียกใช้ calculatemean เพื่ออัปเดตข้อมูลกราฟ
//   calculatemean(dataByYear, year);

//   console.log('Selected Year:', year);
// };