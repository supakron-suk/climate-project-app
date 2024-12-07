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
import './App.css';
import MapComponent from './MapComponent'; // นำเข้า MapComponent
import { dummyTimeSeriesData,
         filterByRegion, 
         filterByMonth,  
         handleYearChange, 
         calculatemean,
        getProvinceTemp } from './JS/TimeSeries';

//-------------------------IMPORT DATA YEAR-----------------------------------//
import data1901 from './Geo-data/Year-Dataset/data_polygon_1901.json';
import data1902 from './Geo-data/Year-Dataset/data_polygon_1902.json';
import data1903 from './Geo-data/Year-Dataset/data_polygon_1903.json';
import data1904 from './Geo-data/Year-Dataset/data_polygon_1904.json';
import data1905 from './Geo-data/Year-Dataset/data_polygon_1905.json';

//----------------------------------------------------------------------------//
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'; //import module for create graph
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend); //ลงทะเบียน func ต่างๆ ของ module chart เพราะเราจะใช้แค่ Linechart
//------------------------IMPORT FUCTION-------------------------------------//

//------------------------FUNCTION APP-------------------------------------//
function App() {
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedProvince, setSelectedProvince] = useState(''); // จังหวัดที่เลือก
  const [filteredData, setFilteredData] = useState(null); // ข้อมูลที่กรองตามภูมิภาค
  const [provinces, setProvinces] = useState([]); // รายชื่อจังหวัดในภูมิภาค
  const [selectedProvinceData, setSelectedProvinceData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(''); // เก็บเดือนที่เลือก
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedData, setSelectedData] = useState([]);
  const [chartData, setChartData] = useState(dummyTimeSeriesData);

  const [dataByYear, setDataByYear] = useState({
  "1901": data1901,
  "1902": data1902,
  "1903": data1903,
  "1904": data1904,
  "1905": data1905,
  // เพิ่มปีอื่น ๆ ถ้ามี
});

const [selectedYearStart, setSelectedYearStart] = useState('');
const [selectedYearEnd, setSelectedYearEnd] = useState('');
const [filteredDataByRange, setFilteredDataByRange] = useState(null);
//------------------------FUNCTION APP-------------------------------------//

// User effect เมื่อมีการเปลี่ยนแปลงข้อมูลในระดับปี
useEffect(() => {
  if (selectedYear && dataByYear[selectedYear]) { // ตรวจสอบว่ามีปีที่เลือกและข้อมูลในปีนั้น
    const geojson = dataByYear[selectedYear]; // ดึงข้อมูล GeoJSON ของปีที่เลือก
    setSelectedData(geojson.features || []); // อัปเดต state selectedData ด้วยฟีเจอร์ (features) หรืออาร์เรย์ว่างถ้าไม่มี
    calculatemean(dataByYear, selectedYear); // คำนวณค่าเฉลี่ยของข้อมูลในปีที่เลือก
  } else {
    setSelectedData([]); // ถ้าไม่มีปีที่เลือกหรือข้อมูลปีนั้น รีเซ็ต selectedData เป็นอาร์เรย์ว่าง
  }
}, [selectedYear, dataByYear]); // จะเรียกใช้เมื่อ selectedYear หรือ dataByYear เปลี่ยน


//-------------------------------------------------- Function Area------------------------------------------//
  // ฟังก์ชันกรองข้อมูลตามภูมิภาค
  const filterByRegion = (data, region) => {
    if (region === 'All') {
      return data.features;
    } else {
      return data.features.filter(feature => feature.properties.region === region);
    }
  };

  const filterDataByYearRange = (startYear, endYear) => {
  if (startYear && endYear) {
    const start = parseInt(startYear);
    const end = parseInt(endYear);

    if (start > end) {
      alert("Please select a start year that is less than or equal to the end year.");
      return;
    }

    let combinedData = [];
    for (let year = start; year <= end; year++) {
      if (dataByYear[year]) {
        combinedData = combinedData.concat(dataByYear[year].features);
      }
    }

    // แสดงข้อมูลที่กรองใน Console
    console.log(`Filtered data from ${startYear} to ${endYear}:`, combinedData);

    // ตั้งค่า filteredDataByRange เพื่อใช้ใน UI (หากต้องการ)
    setFilteredDataByRange(combinedData);
  }
};


//----------------------------------User Effect-------------------------------------------//

// Effect User สำหรับ Update Graph Time series
useEffect(() => {
  // ถ้ามีการเลือกปีและภูมิภาคหรือจังหวัด
  if (selectedYear) {
    if (selectedProvince) {
      // กรณีเลือกจังหวัด
      const provinceData = dataByYear[selectedYear];
      const provinceTemperatures = getProvinceTemp(provinceData, selectedProvince);

      if (provinceTemperatures) {
        setChartData({
          ...dummyTimeSeriesData,
          datasets: [
            {
              ...dummyTimeSeriesData.datasets[0],
              data: provinceTemperatures, // ใช้ค่า temperature ของจังหวัด
            },
          ],
        });
      }
    } else if (selectedRegion) {
      // กรณีเลือกภูมิภาค
      const chartData = calculatemean(dataByYear, selectedYear, selectedRegion);
      if (chartData) {
        setChartData(chartData); // ใช้ข้อมูลจาก calculatemean โดยตรง
      }
    }
  }
}, [selectedYear, selectedRegion, selectedProvince]);

// useEffect(() => {
//   // ถ้ามีการเลือกปีและภูมิภาคหรือจังหวัด
//   if (selectedYear) {
//     if (selectedProvince) {
//       // กรณีเลือกจังหวัด
//       const provinceData = dataByYear[selectedYear];
//       const provinceTemperatures = getProvinceTemp(provinceData, selectedProvince);

//       if (provinceTemperatures) {
//         setChartData({
//           ...dummyTimeSeriesData,
//           datasets: [
//             {
//               ...dummyTimeSeriesData.datasets[0],
//               data: provinceTemperatures, // ใช้ค่า temperature ของจังหวัด
//             },
//           ],
//         });
//       }
//     } else if (selectedRegion) {
//       // กรณีเลือกภูมิภาค
//       const chartData = calculatemean(dataByYear, selectedYear, selectedRegion);
//       if (chartData) {
//         setChartData(chartData); // ใช้ข้อมูลจาก calculatemean โดยตรง
//       }
//     }
//   }
// }, [selectedYear, selectedRegion, selectedProvince]);


  // useEffect(() => {
  //   // ถ้ามีการเลือกปีแล้ว อัปเดตกราฟ
  //   if (selectedYear && selectedRegion) {
  //     const result = calculatemean(dataByYear, selectedYear, selectedRegion);
  //     if (result) {
  //       setChartData({ ...dummyTimeSeriesData, datasets: [{ ...dummyTimeSeriesData.datasets[0], data: result }] });
  //     }
  //   }
  // }, [selectedYear, selectedRegion]);

useEffect(() => {
  // ตรวจสอบว่าเลือกปีแล้วและข้อมูลปีนั้นมีอยู่ใน dataByYear
  if (selectedYear && dataByYear[selectedYear]) {
    const yearData = dataByYear[selectedYear]; // ใช้ข้อมูลจากปีที่เลือก

    // กรองข้อมูลตามภูมิภาค
    let filtered = filterByRegion(yearData, selectedRegion);
    // console.log(`Filtered data for region ${selectedRegion}:`);
    // กรองข้อมูลตามเดือน
    filtered = filterByMonth(filtered, selectedMonth);
    
    setFilteredData(filtered); // อัปเดตข้อมูลที่กรองแล้ว
    setProvinces(filtered.map(feature => feature.properties.name)); // อัปเดตรายชื่อจังหวัด
    setSelectedProvince(''); // รีเซ็ตจังหวัดที่เลือก

  }
}, [selectedYear, selectedRegion, dataByYear]); // 
//----------------------------------User Effect-------------------------------------------//
//----------------------------------webpage UI AREA-------------------------------------------//

  return (
  <div className="main-container">
    <h1>Multidimensional climate data visualization</h1> 

    {/* Dropdown สำหรับเลือกภูมิภาค */}
    <div className="region-selector">
      <label>Select Region:</label>
      <select 
        onChange={(e) => setSelectedRegion(e.target.value)} 
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

    <div className="province-selector">
  <label>Select Province:</label>
  <select
    onChange={(e) => {
      const provinceName = e.target.value;
      setSelectedProvince(provinceName);

      // กรองข้อมูลตามจังหวัดและปีที่เลือก
      if (selectedYear && provinceName) {
        const provinceData = dataByYear[selectedYear];
        const provinceTemperatures = getProvinceTemp(provinceData, provinceName);

        // แสดงผลใน Console หรืออัปเดต State
        console.log(`Temperatures for ${provinceName}:`, provinceTemperatures);

        setSelectedProvinceData(provinceTemperatures); // อัปเดตข้อมูล temperature สำหรับจังหวัดนั้น
      } else {
        setSelectedProvinceData(null); // หากไม่มีการเลือกจังหวัด
      }
    }}
    value={selectedProvince}
    style={{ width: '200px', padding: '10px', fontSize: '16px' }}
  >
    <option value="">All Provinces</option>
    {provinces.map((province, index) => (
      <option key={index} value={province}>
        {province}
      </option>
    ))}
  </select>
</div>


  <div style={{ padding: '20px' }}>
  <h2>เลือกช่วงปี</h2>

  {/* Dropdown สำหรับเลือกปีเริ่มต้น */}
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

  {/* Dropdown สำหรับเลือกปีสิ้นสุด */}
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

  {/* ปุ่ม Apply */}
  <button
    onClick={() => {
      if (selectedYearStart && selectedYearEnd) {
        filterDataByYearRange(selectedYearStart, selectedYearEnd);
      } else {
        alert('Please select both a start year and an end year.');
      }
    }}
    style={{
      padding: '10px 20px',
      margin: '10px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      cursor: 'pointer',
    }}
  >
    Apply
  </button>
    {/* <div className="year-selector">
      <h2>เลือกปี</h2>
      <select
        onChange={(e) => {
          const year = e.target.value;
          setSelectedYear(year);

          // เมื่อเลือกปี ให้กรองข้อมูลตามปี
          if (year) {
            const yearData = dataByYear[year];
            setFilteredData(yearData);
          } else {
            setFilteredData(null); // ถ้าไม่เลือกปี
          }
        }}
        value={selectedYear}
        style={{ width: '200px', padding: '10px', fontSize: '16px' }}
      >
        <option value="">-- เลือกปี --</option>
        {Object.keys(dataByYear).map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select> */}
    </div>

    {/* แสดงข้อมูลสรุป */}
    <div>
      <p>Selected Year: {selectedYear}</p>
      <p>Selected Region: {selectedRegion}</p>
      <p>Selected Province: {selectedProvince || 'All'}</p>
      <p>Number of provinces: {filteredData ? filteredData.length : 0}</p>
    </div>

    <div className="content-container">
      {/* Time series chart */}
      <div className="left-content">
        <h3>Time Series Data</h3>
        <Line
          data={chartData} // ใช้ข้อมูลที่จัดรูปแบบแล้ว
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
              },
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>

      <div className="container">
        <div className="content">
          <div className="left-content">
            <div id="timeSeriesPlot" style={{ width: '100%', height: '650px' }}></div>
          </div>
          <div className="right-map">
            {/* แสดงแผนที่ใน MapComponent */}
            {filteredData && (
              <MapComponent 
                key={selectedYear}
                data={ShapefileThai_lv0} // หรือสามารถเลือกเป็น data อื่น ๆ
                filteredData={filteredData} 
                selectedRegion={selectedRegion}
                selectedProvinceData={selectedProvinceData} // ส่งข้อมูล provinceData ไปที่ MapComponent
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


// import React, { useEffect, useState } from 'react';
// import { LayersControl, MapContainer, GeoJSON } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import Thailandmap from "./Geo-data/thailand-Geo.json";
// import ShapefileThai_lv0 from "./Geo-data/shapefile-thailand.json";
// import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
// import Timeseriesdata from './Geo-data/temp_time_series.json'; 
// //import { plotTimeSeries } from './JS/Time-Series.js';
// import HeatmapThailand from './Geo-data/candex_to_geo.json';
// import ConvinceTest from './Geo-data/province_mean_temp_2001.json';
// import data2001 from './Geo-data/Year-Dataset/province_all_2001.json'; 
// import { style, ColorBar } from './JS/Heatmap.js';
// import './App.css';
// import MapComponent from './MapComponent'; // นำเข้า MapComponent


// //------------------------IMPORT FUCTION-------------------------------------//
// import { plotTimeSeries } from './JS/Time-Series.js';
// //---------------------------------------------------------------------------//

// function App() {
//   const [timeSeriesData, setTimeSeriesData] = useState(null);
//   const [selectedRegion, setSelectedRegion] = useState('All');
//   const [selectedProvince, setSelectedProvince] = useState(''); // จังหวัดที่เลือก
//   const [filteredData, setFilteredData] = useState(null); // ข้อมูลที่กรองตามภูมิภาค
//   const [provinces, setProvinces] = useState([]); // รายชื่อจังหวัดในภูมิภาค
//   const [selectedProvinceData, setSelectedProvinceData] = useState(null);

//   // ใช้ useEffect เพื่อโหลดข้อมูล time series
//   useEffect(() => {
//     const time = Timeseriesdata.data.map(item => new Date(item[0])); // แปลงเวลาเป็น Date
//     const temperature = Timeseriesdata.data.map(item => item[1]);
//     setTimeSeriesData({ time, temperature });
//   }, []);

//   // ใช้ฟังก์ชัน plotTimeSeries เมื่อข้อมูลถูกโหลด
//   useEffect(() => {
//     if (timeSeriesData) {
//       plotTimeSeries(timeSeriesData);  // ใช้ฟังก์ชัน plotTimeSeries
//     }
//   }, [timeSeriesData]);

//   // ฟังก์ชันกรองข้อมูลตามภูมิภาค
//   const filterByRegion = (data, region) => {
//     if (region === 'All') {
//       return data.features;
//     } else {
//       return data.features.filter(feature => feature.properties.region === region);
//     }
//   };

//   // อัปเดต filteredData และรายชื่อจังหวัดเมื่อภูมิภาคเปลี่ยน
//   useEffect(() => {
//     if (data2001) {
//       const filtered = filterByRegion(data2001, selectedRegion);
//       setFilteredData(filtered); // อัพเดต filteredData
//       setProvinces(filtered.map(feature => feature.properties.name)); // ดึงรายชื่อจังหวัด
//       setSelectedProvince(''); // รีเซ็ตจังหวัดที่เลือก
//     }
//   }, [selectedRegion]);

//   return (
//     <div className="main-container">
//       <h1>Multidimensional climate data visualization</h1> 

//       {/* Dropdown สำหรับเลือกภูมิภาค */}
//       <div className="region-selector">
//         <label>Select Region:</label>
//         <select 
//           onChange={(e) => setSelectedRegion(e.target.value)} 
//           value={selectedRegion} 
//           style={{ width: '200px', padding: '10px', fontSize: '16px' }}
//         >
//           <option value="All">All Regions</option>
//           <option value="North_East_region">North East</option>
//           <option value="North_region">North</option>
//           <option value="South_region">South</option>
//           <option value="Middle_region">Middle</option>
//           <option value="East_region">East</option>
//           <option value="West_region">West</option>
//         </select>

// {/* Dropdown สำหรับเลือกจังหวัด */}
// {selectedRegion !== 'All' && (
//   <div className="province-selector">
//     <label>Select Province:</label>
//     <select 
//       onChange={(e) => {
//         const provinceName = e.target.value;
//         setSelectedProvince(provinceName);

//         // กรองข้อมูล GeoJSON ตามจังหวัดที่เลือก
//         if (provinceName) {
//           const provinceData = data2001.features.find(
//             (feature) => feature.properties.name === provinceName
//           );

//           console.log('GeoJSON Data for Selected Province:', provinceData); // แสดงข้อมูลจังหวัดใน Console
          
//           // ส่งข้อมูล provinceData ไปยัง mapComponent.js ผ่าน props หรือ context
//           setSelectedProvinceData(provinceData);  // สมมติว่า setSelectedProvinceData เป็นฟังก์ชันที่ส่งข้อมูลไปยัง mapComponent
//         } else {
//           console.log('All Provinces selected');
//           // ส่งข้อมูลทั้งหมดไปยัง mapComponent.js (ถ้าต้องการให้แสดงทั้งหมด)
//           setSelectedProvinceData(null);  // ถ้าเลือก "All Provinces"
//         }
//       }} 
//       value={selectedProvince} 
//       style={{ width: '200px', padding: '10px', fontSize: '16px' }}
//     >
//       <option value="">All Provinces</option>
//       {provinces.map((province, index) => (
//         <option key={index} value={province}>
//           {province}
//         </option>
//       ))}
//     </select>
//   </div>
// )}

//         <div>
//           <p>Selected Region: {selectedRegion}</p>
//           <p>Selected Province: {selectedProvince || 'All'}</p>
//           <p>Number of provinces: {filteredData ? filteredData.length : 0}</p>
//         </div>
//       </div>

//       <div className="container">
//         <div className="content">
//           <div className="left-content">
//             <div id="timeSeriesPlot" style={{ width: '100%', height: '650px' }}></div>
//           </div>
//           <div className="right-map">
//             {/* แสดงแผนที่ใน MapComponent */}
//             {filteredData && (
//               <MapComponent 
//                 data={ShapefileThai_lv0} // หรือสามารถเลือกเป็น data อื่น ๆ
//                 filteredData={filteredData} 
//                 selectedRegion={selectedRegion}
//                 selectedProvinceData={selectedProvinceData}  // ส่งข้อมูล provinceData ไปที่ MapComponent
//                 setSelectedProvinceData={setSelectedProvinceData}
//                 selectedProvince={selectedProvince} 
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

// import React, { useEffect, useState } from 'react';
// import './App.css';
// import ConvinceTest from './Geo-data/province_mean_temp_2001.json'; // ไฟล์ JSON ที่มีข้อมูล

// function App() {
//   const [selectedRegion, setSelectedRegion] = useState('All'); // เก็บภูมิภาคที่เลือก
//   const [selectedProvince, setSelectedProvince] = useState(''); // เก็บจังหวัดที่เลือก
//   const [filteredRegions, setFilteredRegions] = useState([]); // ข้อมูลที่กรองตามภูมิภาค
//   const [provinces, setProvinces] = useState([]); // รายชื่อจังหวัดในภูมิภาคที่เลือก

//   // ฟังก์ชันกรองข้อมูลตามภูมิภาค
//   const filterByRegion = (data, region) => {
//     if (region === 'All') return data.features;
//     return data.features.filter((feature) => feature.properties.region === region);
//   };

//   // เมื่อภูมิภาคเปลี่ยน ให้กรองข้อมูลใหม่
//   useEffect(() => {
//     if (ConvinceTest) {
//       const filtered = filterByRegion(ConvinceTest, selectedRegion);
//       setFilteredRegions(filtered); // อัปเดตข้อมูลภูมิภาคที่กรองแล้ว
//       setProvinces(filtered.map((feature) => feature.properties.name)); // ดึงรายชื่อจังหวัด
//       setSelectedProvince(''); // รีเซ็ตจังหวัดที่เลือก
//     }
//   }, [selectedRegion]);

//   // เมื่อจังหวัดถูกเลือก อาจเพิ่มการจัดการข้อมูลได้ที่นี่
//   const handleProvinceChange = (province) => {
//     setSelectedProvince(province);
//     // สามารถเพิ่มโค้ดเพื่อตอบสนองการเปลี่ยนจังหวัด เช่นการแสดงข้อมูล
//     console.log(`Selected Province: ${province}`);
//   };

//   return (
//     <div className="main-container">
//       <h1>Multidimensional climate data visualization</h1>

//       {/* Dropdown สำหรับเลือกภูมิภาค */}
//       <div className="region-selector">
//         <label>Select Region:</label>
//         <select 
//           onChange={(e) => setSelectedRegion(e.target.value)} 
//           value={selectedRegion} 
//           style={{ width: '200px', padding: '10px', fontSize: '16px' }}
//         >
//           <option value="All">All Regions</option>
//           <option value="North_region">North</option>
//           <option value="North_East_region">North East</option>
//           <option value="South_region">South</option>
//           <option value="Middle_region">Middle</option>
//           <option value="East_region">East</option>
//           <option value="West_region">West</option>
//         </select>

//         {/* Dropdown สำหรับเลือกจังหวัด */}
//         {selectedRegion !== 'All' && (
//           <div className="province-selector">
//             <label>Select Province:</label>
//             <select 
//               onChange={(e) => handleProvinceChange(e.target.value)} 
//               value={selectedProvince} 
//               style={{ width: '200px', padding: '10px', fontSize: '16px' }}
//             >
//               <option value="">All Provinces</option>
//               {provinces.map((province, index) => (
//                 <option key={index} value={province}>
//                   {province}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}
//       </div>

//       <div>
//         <p>Selected Region: {selectedRegion}</p>
//         <p>Selected Province: {selectedProvince || 'All'}</p>
//         <p>Number of provinces: {filteredRegions.length}</p>
//       </div>
//     </div>
//   );
// }

// export default App;





// import React, { useEffect, useState } from 'react';
// import { LayersControl, MapContainer, GeoJSON } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';

// //------------------- JSON, JAVA SCRIPT FILE ------------------------------------------------
// import Thailandmap from "./Geo-data/thailand-Geo.json";
// import ShapefileThai_lv0 from "./Geo-data/shapefile-thailand.json";
// import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
// import Timeseriesdata from './Geo-data/temp_time_series.json'; // JSON time series
// import { plotTimeSeries } from './JS/Time-Series.js';
// import HeatmapThailand from './Geo-data/candex_to_geo.json'; // Heatmap GeoJSON
// import ConvinceTest from './Geo-data/province_mean_temp_2001.json' ;
// import { style, ColorBar  } from './JS/Heatmap.js';
// import './App.css'; 
// //-------------------------------------------------------------------------------------------

// function App() {
//   const [timeSeriesData, setTimeSeriesData] = useState(null);
//   const [selectedRegion, setSelectedRegion] = useState('All'); // ค่าสถานะเพื่อเลือกภูมิภาค
//   const [filteredFeatures, setFilteredFeatures] = useState(ConvinceTest.features); // จัดการข้อมูลที่กรองแล้ว

//   // ใช้ useEffect เพื่อโหลดข้อมูล time series
//   useEffect(() => {
//     const time = Timeseriesdata.data.map(item => new Date(item[0])); // แปลงเวลาเป็น Date
//     const temperature = Timeseriesdata.data.map(item => item[1]);
//     setTimeSeriesData({ time, temperature });
//   }, []);

//   useEffect(() => {
//     plotTimeSeries(timeSeriesData);  // ใช้ฟังก์ชัน plotTimeSeries
//   }, [timeSeriesData]);

//   // ฟังก์ชันในการกรองข้อมูลภูมิภาค
//   const filterRegionData = (regionName) => {
//     if (regionName === 'All') {
//       return ConvinceTest.features;  // แสดงข้อมูลทั้งหมด
//     } else {
//       return ConvinceTest.features.filter(feature => feature.properties.region === regionName);  // กรองข้อมูลตามภูมิภาค
//     }
//   };

// const onEachFeature = (feature, layer) => {
//   if (feature.properties) {
//     const { name, temperature, region } = feature.properties;
//     const coordinates = feature.geometry.coordinates; // ดึง coordinates ของ polygon

//     // สร้างข้อความใน popup
//     const popupContent = `
//       <b>Province Name:</b> ${name}<br />
//       <b>Region:</b> ${region}<br />
//       <b>Temperature:</b> ${temperature} °C<br />
//     `;

//     layer.bindPopup(popupContent); // ผูก popup กับ layer