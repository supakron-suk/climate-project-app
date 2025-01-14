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
export const calculatemean = (dataByYear, startYear, endYear, region, province, selectedIndex) => {
  // ฟังก์ชันหลักสำหรับคำนวณค่าเฉลี่ยอุณหภูมิ
  // `dataByYear` เป็นข้อมูล GeoJSON แยกตามปี
  // `startYear` และ `endYear` เป็นปีเริ่มต้นและสิ้นสุดที่ต้องการคำนวณ
  // `region` เป็นพื้นที่ที่ต้องการกรองข้อมูล (หรือ 'All' เพื่อคำนวณทุกพื้นที่)

  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year."); // ตรวจสอบเงื่อนไขว่าปีเริ่มต้นต้องไม่มากกว่าปีสิ้นสุด
    return null; // หยุดทำงานหากเงื่อนไขไม่ถูกต้อง
  }

  const monthlyAverages = Array(12 * (endYear - startYear + 1)).fill(0); 
  // สร้างอาร์เรย์เก็บผลรวมค่าอุณหภูมิรายเดือนในแต่ละปี
  const monthlyCounts = Array(12 * (endYear - startYear + 1)).fill(0); 
  // สร้างอาร์เรย์เก็บจำนวนข้อมูลที่ถูกบันทึกในแต่ละเดือน

  const filterRegion_Province = (features, region, province = null) => {
    // ฟังก์ชันสำหรับกรองข้อมูล GeoJSON ตาม region และ province
    let filteredFeatures = features;

    if (region !== 'All') {
      filteredFeatures = filteredFeatures.filter(
        (feature) => feature.properties.region === region
      );
    }

    if (province) {
      filteredFeatures = filteredFeatures.filter(
        (feature) => feature.properties.name === province
      );
    }

    return filteredFeatures;
  };

  let overallCount = 0; // ตัวแปรเก็บจำนวนข้อมูลทั้งหมดที่ผ่านการประมวลผล
  let yearlyMeans = {}; // ตัวแปรเก็บค่าเฉลี่ยรายปี
  let provinceData = {}; // ตัวแปรเก็บข้อมูลเฉพาะจังหวัดที่เลือก

  for (let year = startYear; year <= endYear; year++) {
    // ลูปผ่านแต่ละปี
    const geojson = dataByYear[year]; // ดึงข้อมูล GeoJSON ตามปีที่กำลังลูป
    if (!geojson) {
      console.warn(`No data available for year ${year}`);
      continue; // ข้ามปีที่ไม่มีข้อมูล
    }

    const filteredFeatures = filterRegion_Province(geojson.features, region, province); 
    // กรองข้อมูลตาม region และ province ที่เลือก

    filteredFeatures.forEach((feature) => {
  const { name, month } = feature.properties;
  const value = feature.properties[selectedIndex]; // ดึงค่าของ selectedIndex

  // Log ข้อมูลที่เลือกใน console
  //console.log(`Year: ${year}, Month: ${month}, Region: ${region}, Province: ${name}, ${selectedIndex}: ${value}`);

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
  temperature: { label: 'Average Temperature', unit: '°C' },
  precipitation: { label: 'Average Precipitation', unit: 'mm' },
  humidity: { label: 'Average Humidity', unit: '%' },
  // เพิ่ม index อื่น ๆ ตามที่คุณมีในข้อมูล
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
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
      tension: 0.4,
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
        min: seasonalBounds.min, // ตั้งค่า min อัตโนมัติ
        max: seasonalBounds.max, // ตั้งค่า max อัตโนมัติ
      },
    },
  },
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

  const timeSeriesBounds = calculateYAxisBounds(result);

  const timeSeriesData = {
  labels: Array.from({ length: (endYear - startYear + 1) * 12 }, (_, i) => {
    const year = startYear + Math.floor(i / 12);
    const month = i % 12;
    return `${new Date(year, month).toLocaleString('en-US', { month: 'short' })} ${year}`;
  }),
  datasets: [
    {
      label: `${selectedIndexLabel} (${selectedIndexUnit})`,
      data: result,
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
      tension: 0.4,
    },
    {
      label: `Overall Mean ${selectedIndexLabel} (${selectedIndexUnit})`,
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
    scales: {
      y: {
        title: {
          display: true,
          text: `${selectedIndexLabel} (${selectedIndexUnit})`,
        },
        min: timeSeriesBounds.min, // ตั้งค่า min อัตโนมัติ
        max: timeSeriesBounds.max, // ตั้งค่า max อัตโนมัติ
      },
    },
  },
};

return { seasonalCycleData, timeSeriesData };

};





// export const filterByMonth = (data, month) => {
//   if (!month) {
//     return data; 
//   }
//   return data.filter(feature => feature.properties.month === parseInt(month));
// };
