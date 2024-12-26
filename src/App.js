//import HeatmapThailand from './Geo-data/candex_to_geo.json';
//import ConvinceTest from './Geo-data/province_mean_temp_2001.json';
//import data2001 from './Geo-data/Year-Dataset/province_all_2001.json'; 
//import { style, ColorBar } from './JS/Heatmap.js';
//import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
//import Thailandmap from "./Geo-data/thailand-Geo.json";


import React, { useEffect, useState } from 'react';
import { LayersControl, MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
//import Thailandmap from "./Geo-data/thailand-Geo.json";
import ShapefileThai_lv0 from "./Geo-data/shapefile-thailand.json";
//import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import './App.css';
import MapComponent from './MapComponent'; // นำเข้า MapComponent
import { dummyTimeSeriesData,
         dummySeasonalCycleData,
         filterByRegion, 
         filterByMonth,  
         handleYearChange,  
         calculatemean,
       } from './JS/Graph';
import {TrendMap} from './JS/TrendMap.js';

//-------------------------IMPORT DATA YEAR-----------------------------------//
import data1901 from './Geo-data/Year-Dataset/data_polygon_1901.json';
import data1902 from './Geo-data/Year-Dataset/data_polygon_1902.json';
import data1903 from './Geo-data/Year-Dataset/data_polygon_1903.json';
import data1904 from './Geo-data/Year-Dataset/data_polygon_1904.json';
import data1905 from './Geo-data/Year-Dataset/data_polygon_1905.json';
import data1906 from './Geo-data/Year-Dataset/data_polygon_1906.json';
import data1907 from './Geo-data/Year-Dataset/data_polygon_1907.json';
import data1908 from './Geo-data/Year-Dataset/data_polygon_1908.json';
import data1909 from './Geo-data/Year-Dataset/data_polygon_1909.json';
import data1910 from './Geo-data/Year-Dataset/data_polygon_1910.json';

//----------------------- IMPROT DATA FULL INDEX -----------------------------//
import data_index_1901 from './Geo-data/Year-Dataset/data_index_polygon_1901.json';
import data_index_1902 from './Geo-data/Year-Dataset/data_index_polygon_1902.json';
import data_index_1903 from './Geo-data/Year-Dataset/data_index_polygon_1903.json';
import data_index_1904 from './Geo-data/Year-Dataset/data_index_polygon_1904.json';
import data_index_1905 from './Geo-data/Year-Dataset/data_index_polygon_1905.json';
import data_index_1906 from './Geo-data/Year-Dataset/data_index_polygon_1906.json';
import data_index_1907 from './Geo-data/Year-Dataset/data_index_polygon_1907.json';
import data_index_1908 from './Geo-data/Year-Dataset/data_index_polygon_1908.json';
import data_index_1909 from './Geo-data/Year-Dataset/data_index_polygon_1909.json';
import data_index_1910 from './Geo-data/Year-Dataset/data_index_polygon_1910.json';


//----------------------------------------------------------------------------//
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'; //import module for create graph
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin); //ลงทะเบียน func ต่างๆ ของ module chart เพราะเราจะใช้แค่ Linechart
//------------------------IMPORT FUCTION-------------------------------------//

//------------------------FUNCTION APP-------------------------------- -----//
function App() {
  //const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedProvince, setSelectedProvince] = useState(''); // จังหวัดที่เลือก
  const [filteredData, setFilteredData] = useState(null); // ข้อมูลที่กรองตามภูมิภาค
  const [provinces, setProvinces] = useState([]); // รายชื่อจังหวัดในภูมิภาค
  const [selectedProvinceData, setSelectedProvinceData] = useState(null);
  //const [selectedMonth, setSelectedMonth] = useState(''); // เก็บเดือนที่เลือก
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedData, setSelectedData] = useState([]);
  const [chartData, setChartData] = useState(dummyTimeSeriesData);
  const [seasonalCycle, setSeasonalCycle] = useState(dummySeasonalCycleData);

//   const [dataByYear, setDataByYear] = useState({
//   "1901": data1901,
//   "1902": data1902,
//   "1903": data1903,
//   "1904": data1904,
//   "1905": data1905,
//   "1906": data1906,
//   "1907": data1907,
//   "1908": data1908,
//   "1909": data1909,
//   "1910": data1910,
// });

const [dataByYear, setDataByYear] = useState({
  "1901": data_index_1901,
  "1902": data_index_1902,
  "1903": data_index_1903,
  "1904": data_index_1904,
  "1905": data_index_1905,
  "1906": data_index_1906,
  "1907": data_index_1907,
  "1908": data_index_1908,
  "1909": data_index_1909,
  "1910": data_index_1910,
});

const [selectedYearStart, setSelectedYearStart] = useState('');
const [selectedYearEnd, setSelectedYearEnd] = useState('');
//const [filteredDataByRange, setFilteredDataByRange] = useState(null);
const [isApplied, setIsApplied] = useState(false);

//---------------------- Trend VALUE data-----------------------//
const [trendGeoData, setTrendGeoData] = useState(null);

const [selectedIndex, setSelectedIndex] = useState('temperature');
//------------------------FUNCTION APP-------------------------------------//

//-------------------------------------------------- Function Area------------------------------------------//
  // ฟังก์ชันกรองข้อมูลตามภูมิภาค
  const filterByRegion = (data, region) => {
    if (region === 'All') {
      return data.features;
    } else {
      return data.features.filter(feature => feature.properties.region === region);
    }
  };

 const filteredProvinces = React.useMemo(() => {
  if (!selectedYearStart || !selectedYearEnd || selectedRegion === "All") {
    return []; // คืนค่ารายการว่างถ้าเงื่อนไขไม่ครบ
  }

  // รวบรวมข้อมูลในช่วงปีที่เลือก
  const filteredFeatures = [];
  for (let year = parseInt(selectedYearStart); year <= parseInt(selectedYearEnd); year++) {
    const yearData = dataByYear[year.toString()];
    if (yearData) {
      filteredFeatures.push(...yearData.features);
    }
  }

  // กรองข้อมูลตามภูมิภาค
  const provincesSet = new Set();
  filteredFeatures.forEach((feature) => {
    if (feature.properties.region === selectedRegion) {
      provincesSet.add(feature.properties.name); // เก็บชื่อจังหวัดใน Set เพื่อหลีกเลี่ยงข้อมูลซ้ำ
    }
  });

  return Array.from(provincesSet); // แปลง Set เป็น Array
}, [selectedYearStart, selectedYearEnd, selectedRegion, dataByYear]);

//----------------------------------User Effect-------------------------------------------//
useEffect(() => {
  if (isApplied && selectedYearStart && selectedYearEnd) {
    // คำนวณค่า chartData ตามข้อมูลที่กรองแล้ว
    const chartData = calculatemean(dataByYear, 
      selectedYearStart, 
      selectedYearEnd, 
      selectedRegion, 
      selectedProvince,
      selectedIndex);

    if (chartData) {
      setSeasonalCycle(chartData.seasonalCycleData);
      setChartData(chartData.timeSeriesData);
    }

    // อัปเดตแผนที่ตามข้อมูลด้วย TrendMap
    const generatedGeoJSON = TrendMap(
      dataByYear,
      parseInt(selectedYearStart),
      parseInt(selectedYearEnd),
      selectedRegion,
      selectedProvince,
      selectedIndex
    );

    if (generatedGeoJSON) {
      setTrendGeoData(generatedGeoJSON); // เก็บข้อมูลใน state
    }

    // Reset isApplied หลังจากทำงานเสร็จ
    setIsApplied(false);
  }
}, [isApplied, selectedYearStart, selectedYearEnd, selectedRegion, selectedProvince, selectedIndex ,dataByYear]);


useEffect(() => {
  if (selectedRegion && selectedYearStart) {
    // กรองข้อมูลตามภูมิภาค
    const yearData = dataByYear[selectedYearStart]; // ใช้ข้อมูลปีเริ่มต้นในการกรอง
    let filtered = filterByRegion(yearData, selectedRegion);

    // อัปเดตข้อมูลที่กรองแล้ว
    setFilteredData(filtered);

    // อัปเดตรายชื่อจังหวัดที่สามารถเลือกได้
    if (filtered.length > 0) {
      setProvinces(filtered.map((feature) => feature.properties.name));
    } else {
      setProvinces([]); // ถ้าไม่มีข้อมูล ให้เคลียร์รายชื่อจังหวัด
    }

    // รีเซ็ตจังหวัดที่เลือก
    setSelectedProvince('');
  }
}, [selectedRegion, selectedYearStart, dataByYear]);
//----------------------------------------------------------------------------/

// useEffect สำหรับการคำนวณข้อมูลเมื่อเลือกปีเริ่มและปีจบ
//------------------------------------------------------------------------------------------------------------//
// useEffect สำหรับการคำนวณข้อมูลเมื่อเลือกภูมิภาคใหม่
// useEffect(() => {
//   if (selectedRegion && selectedYearStart && selectedYearEnd && isApplied) {
//     // คำนวณข้อมูลทั้งหมดของภูมิภาคเมื่อเลือกภูมิภาคใหม่

//     const yearData = dataByYear[selectedYearStart]; // ใช้ข้อมูลปีเริ่มต้นในการกรอง
//     let filtered = filterByRegion(yearData, selectedRegion); // กรองข้อมูลตามภูมิภาค

//     // อัปเดตข้อมูลที่กรองแล้ว
//     setFilteredData(filtered);
//     const chartData = calculatemean(
//       dataByYear,
//       selectedYearStart,
//       selectedYearEnd,
//       selectedRegion,
//       "" 
//     );

//     if (chartData) {
//       setSeasonalCycle(chartData.seasonalCycleData);
//       setChartData(chartData.timeSeriesData);
//     }
    
//     // อัปเดตแผนที่ตามข้อมูล
//     TrendMap(dataByYear, parseInt(selectedYearStart), parseInt(selectedYearEnd), selectedRegion);
//   }
// }, [selectedRegion, selectedYearStart, selectedYearEnd, dataByYear, isApplied]);

// // useEffect สำหรับการคำนวณข้อมูลเมื่อเลือกจังหวัด
// useEffect(() => {
//   if (selectedYearStart && selectedYearEnd && isApplied && selectedRegion && selectedProvince) {

//      const yearData = dataByYear[selectedYearStart]; // ใช้ข้อมูลปีเริ่มต้นในการกรอง
//     let filtered = filterByRegion(yearData, selectedRegion); // กรองข้อมูลตามภูมิภาค

//     // อัปเดตข้อมูลที่กรองแล้ว
//     setFilteredData(filtered);
    
//     // คำนวณข้อมูลเมื่อเลือก Region และ Province
//     const chartData = calculatemean(
//       dataByYear,
//       selectedYearStart,
//       selectedYearEnd,
//       selectedRegion,
//       selectedProvince
//     );

//     if (chartData) {
//       setSeasonalCycle(chartData.seasonalCycleData);
//       setChartData(chartData.timeSeriesData);
//     }

//     // อัปเดตแผนที่ตามข้อมูล
//     TrendMap(dataByYear, parseInt(selectedYearStart), parseInt(selectedYearEnd), selectedRegion);
//   }
// }, [selectedRegion, selectedProvince, selectedYearStart, selectedYearEnd, dataByYear, isApplied]);

//------------------------------------------------------------------------------------------------------------//
// useEffect(() => {
//   if (isApplied && selectedYearStart && selectedYearEnd) {
//     // คำนวณข้อมูลใหม่เมื่อ Region หรือ Province เปลี่ยน
//     const chartData = calculatemean(
//       dataByYear,
//       selectedYearStart,
//       selectedYearEnd,
//       selectedRegion,
//       selectedProvince
//     );

//     if (chartData) {
//       setSeasonalCycle(chartData.seasonalCycleData);
//       setChartData(chartData.timeSeriesData);
//     }

//     // อัปเดตแผนที่ตามข้อมูล
//     TrendMap(dataByYear, parseInt(selectedYearStart), parseInt(selectedYearEnd), selectedRegion);
//   }
// }, [isApplied, selectedYearStart, selectedYearEnd, selectedRegion, selectedProvince, dataByYear]);


// // useEffect สำหรับการคำนวณใหม่เมื่อเลือก Region หรือ Province หลังจากกด Apply
// useEffect(() => {
//   if (selectedYearStart && selectedYearEnd && isApplied && selectedRegion && selectedProvince) {
//     // คำนวณข้อมูลใหม่เมื่อเลือก Region หรือ Province
//     const chartData = calculatemean(
//       dataByYear,
//       selectedYearStart,
//       selectedYearEnd,
//       selectedRegion,
//       selectedProvince
//     );

//     if (chartData) {
//       setSeasonalCycle(chartData.seasonalCycleData);
//       setChartData(chartData.timeSeriesData);
//     }

//     // อัปเดตแผนที่ตามข้อมูล
//     TrendMap(dataByYear, parseInt(selectedYearStart), parseInt(selectedYearEnd), selectedRegion);
//   }
// }, [selectedRegion, selectedProvince, selectedYearStart, selectedYearEnd, dataByYear, isApplied]);


// // ฟังก์ชันสำหรับปุ่ม Apply
// const handleApply = () => {
//   setIsApplied(true); // เมื่อกด Apply จะทำให้ isApplied เป็น true
// };

//-----------------------------------------------------------------------------//

// useEffect(() => {
//   if (isApplied) {
//     // กรองข้อมูลตามภูมิภาค (เฉพาะกรณีที่เลือกภูมิภาค)
//     if (selectedRegion) {
//       const yearData = dataByYear[selectedYearStart]; // ใช้ข้อมูลปีเริ่มต้นในการกรอง
//       let filtered = filterByRegion(yearData, selectedRegion);

//       // อัปเดตข้อมูลที่กรองแล้ว
//       setFilteredData(filtered);

//       // อัปเดตรายชื่อจังหวัดที่สามารถเลือกได้
//       if (filtered.length > 0) {
//         setProvinces(filtered.map((feature) => feature.properties.name));
//       } else {
//         setProvinces([]); // ถ้าไม่มีข้อมูล ให้เคลียร์รายชื่อจังหวัด
//       }

//       // รีเซ็ตจังหวัดที่เลือก
//       setSelectedProvince('');
//     }

//     // ตรวจสอบว่าเลือกปีเริ่มต้นและปีสิ้นสุดแล้วหรือไม่
//     if (selectedYearStart && selectedYearEnd) {
//       // คำนวณค่า chartData ตามข้อมูลที่กรองแล้ว
//       const chartData = calculatemean(dataByYear, selectedYearStart, selectedYearEnd, selectedRegion, selectedProvince);

//       if (chartData) {
//         // ตั้งค่า Seasonal Cycle และ Chart Data
//         setSeasonalCycle(chartData.seasonalCycleData);
//         setChartData(chartData.timeSeriesData);
//       }

//       // อัปเดตแผนที่ตามข้อมูล
//       TrendMap(dataByYear, parseInt(selectedYearStart), parseInt(selectedYearEnd), selectedRegion);
//     }

//     // Reset isApplied หลังจากทำงานเสร็จ
//     setIsApplied(false);
//   }
// }, [isApplied, selectedYearStart, selectedYearEnd, selectedRegion, selectedProvince, dataByYear]);





//----------------------------------User Effect-------------------------------------------//
//----------------------------------webpage UI AREA-------------------------------------------//

  return (
  <div className="main-container">
    <div className="header-text">
      <h1 className="block-text">Multidimensional climate data visualization</h1>
    </div>

    <div classname = "DashBoard-text">
      <h1>DashBoard</h1>

    </div>


  <div style={{ padding: '20px' }}>
  <h2 className="title-year">Select Time Period</h2>

  {/* Dropdown for Start Year Selection */}
      <div className="year-selector">
        <label>Select Start Year:</label>
        <select
          value={selectedYearStart}
          onChange={(e) => setSelectedYearStart(e.target.value)}
          style={{ width: '200px', padding: '10px', margin: '10px' }}
        >
          <option value="">-- select start year --</option>
          {Object.keys(dataByYear).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Dropdown for End Year Selection */}
        <label>Select End Year:</label>
        <select
          value={selectedYearEnd}
          onChange={(e) => setSelectedYearEnd(e.target.value)}
          style={{ width: '200px', padding: '10px', margin: '10px' }}
        >
          <option value="">-- select end year --</option>
          {Object.keys(dataByYear).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {!selectedYearStart || !selectedYearEnd ? (
          <p style={{ color: 'red' }}>
            Please select both a start year and an end year before applying.
          </p>
        ) : null}

        {/* Apply Button */}
        <button
  onClick={() => {
    if (!selectedYearStart || !selectedYearEnd) {
      alert('กรุณาเลือกปีเริ่มต้นและปีสิ้นสุด');
      return;
    }

    if (selectedYearStart > selectedYearEnd) {
      alert('ปีเริ่มต้นต้องไม่มากกว่าปีสิ้นสุด');
      return;
    }

    setIsApplied(true); // Trigger useEffect
  }}
  disabled={!selectedYearStart || !selectedYearEnd}
  style={{
    padding: '10px 20px',
    margin: '10px',
    backgroundColor: !selectedYearStart || !selectedYearEnd ? '#ccc' : '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: !selectedYearStart || !selectedYearEnd ? 'not-allowed' : 'pointer',
  }}
>
  Apply
</button>
      </div>

{/* Dropdown สำหรับเลือกภูมิภาค */}
<div className="region-selector">
  <label>Select Region:</label>
  <select
    onChange={(e) => {
      const region = e.target.value;
      setSelectedRegion(region); // อัปเดตภูมิภาคที่เลือก
      setSelectedProvince(""); // รีเซ็ตจังหวัดเมื่อเลือกภูมิภาคใหม่
    }}
    value={selectedRegion}
    style={{ width: '200px', padding: '10px', fontSize: '16px' }}
  >
    <option value="All">All Regions</option>
    <option value="North_East_region">North East</option>
    <option value="North_region">North</option>
    <option value="South_region">South</option>
    <option value="Middle_region">Middle</option>
    <option value="East_region">East</option>
    <option value="West_region">West</option>
  </select>
</div>

{/* Dropdown สำหรับเลือกจังหวัด */}
<div className="province-selector">
  <label>Select Province:</label>
  <select
    onChange={(e) => {
      const provinceName = e.target.value;
      setSelectedProvince(provinceName); // อัปเดตจังหวัดที่เลือก
    }}
    value={selectedProvince}
    style={{ width: '200px', padding: '10px', fontSize: '16px' }}
    disabled={filteredProvinces.length === 0} // ปิดการใช้งานถ้าไม่มีจังหวัดให้เลือก
  >
    <option value="">All Provinces</option>
    {filteredProvinces.length > 0 ? (
      filteredProvinces.map((province, index) => (
        <option key={index} value={province}>
          {province}
        </option>
      ))
    ) : (
      <option value="">No Provinces Available</option>
    )}
  </select>
</div>

{/* Dropdown สำหรับเลือก Index */}
<div className="index-selector">
  <label>Select Data Index:</label>
  <select
    value={selectedIndex}
    onChange={(e) => setSelectedIndex(e.target.value)}
    style={{ width: '200px', padding: '10px', fontSize: '16px' }}
  >
    <option value="temperature">Temperature Mean</option>
    <option value="tmin">Temperature Min</option>
    <option value="tmax">Temperature Max</option>
    {/* <option value="dtr">DTR (Diurnal Temperature Range)</option> */}
    <option value="pre">Precipitation</option>
  </select>
</div>

    </div>

    {/* แสดงข้อมูลสรุป
    <div>
      <p>Selected Year: {selectedYear}</p>
      <p>Selected Region: {selectedRegion}</p>
      <p>Selected Province: {selectedProvince || 'All'}</p>
      <p>Number of provinces: {filteredData ? filteredData.length : 0}</p>
    </div> */}

    <div className="content-container">
      {/* Time series chart */}
      <div className="time-series-chart">
        <h3>Time Series Data</h3>
        <Line
  data={chartData}
  options={{
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      annotation: {
        annotations: chartData?.options?.plugins?.annotation?.annotations || [],
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true, // เปิดการแสดงข้อความ
          text: 'Month and Year', // ข้อความบรรยายแกน x
          font: {
            size: 14, // ขนาดตัวอักษร
            weight: 'bold', // น้ำหนักตัวอักษร
          },
        },
      },
      y: {
        min: 10, // กำหนดค่าต่ำสุด
        max: 40, // กำหนดค่าสูงสุด
        ticks: {
          stepSize: 5, // เพิ่มเส้นบอกค่าทุกๆ 5 องศา (optional)
        },
        title: {
          display: true, // เปิดการแสดงข้อความ
          text: 'Temperature (°C)', // ข้อความบรรยายแกน y
          font: {
            size: 14, // ขนาดตัวอักษร
            weight: 'bold', // น้ำหนักตัวอักษร
          },
        },
      },
    },
  }}
/>
      </div>
    {/* Seasonal Cycle chart */}
<div className="Seasonal-Cycle-chart">
  <h3>Seasonal Cycle Data</h3>
  <Line
    data={seasonalCycle}
    options={{
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Months',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
        y: {
          min: 16,
          max: 36,
          ticks: {
          stepSize: 2, // กำหนดระยะห่างระหว่างจุดให้ละเอียดขึ้น
          callback: (value) => value.toFixed(1), // แสดงค่าทศนิยม 1 ตำแหน่ง
          },
          title: {
            display: true,
            text: 'Temperature (°C)',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
      },
    }}
  />
</div>
      

      <div className="container">
        <div className="content">
          <div className="time-series-chart">
            <div id="timeSeriesPlot" style={{ width: '100%', height: '650px' }}></div>
          </div>
          <div classname="Seasonal-Cycle-chart">
            <div id="seasonalcyclePlot" style={{ width: '100%', height: '650px' }}></div>
          </div>
          <div className="right-map">
            {/* แสดงแผนที่ใน MapComponent */}
            {trendGeoData && trendGeoData.features && (
  <MapComponent
    key={`${selectedYearStart}-${selectedYearEnd}-${isApplied}`} // ใช้ key สำหรับการ re-render เมื่อปีเปลี่ยน
    trendGeoData={trendGeoData} // ส่งข้อมูล GeoJSON ที่ถูกต้อง
    selectedRegion={selectedRegion}
    selectedProvinceData={selectedProvinceData} // ข้อมูล province ที่เลือก
    setSelectedProvinceData={setSelectedProvinceData}
    selectedProvince={selectedProvince}
  />
)}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
export default App;
