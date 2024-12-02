import React, { useEffect, useState } from 'react';
import { LayersControl, MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Thailandmap from "./Geo-data/thailand-Geo.json";
import ShapefileThai_lv0 from "./Geo-data/shapefile-thailand.json";
import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
import { Line } from 'react-chartjs-2';
import HeatmapThailand from './Geo-data/candex_to_geo.json';
import ConvinceTest from './Geo-data/province_mean_temp_2001.json';
import data2001 from './Geo-data/Year-Dataset/province_all_2001.json'; 
import { style, ColorBar } from './JS/Heatmap.js';
import './App.css';
import MapComponent from './MapComponent'; // นำเข้า MapComponent
import { dummyTimeSeriesData, filterByRegion, filterByMonth,  handleYearChange, calculatemean } from './JS/TimeSeries';


//-------------------------IMPORT DATA YEAR-----------------------------------//
import data1901 from './Geo-data/Year-Dataset/data_polygon_1901.json';
import data1902 from './Geo-data/Year-Dataset/data_polygon_1902.json';
//----------------------------------------------------------------------------//
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
//------------------------IMPORT FUCTION-------------------------------------//

//---------------------------------------------------------------------------//

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

  const [dataByYear, setDataByYear] = useState({
  "1901": data1901,
  "1902": data1902,
  // เพิ่มปีอื่น ๆ ถ้ามี
});

useEffect(() => {
  if (selectedYear && dataByYear[selectedYear]) {
    const geojson = dataByYear[selectedYear];
    setSelectedData(geojson.features || []); // ตั้งค่า selectedData ด้วย features จาก geojson
    calculatemean(dataByYear, selectedYear);
  } else {
    setSelectedData([]); // รีเซ็ตข้อมูลถ้าไม่มีการเลือกปี
  }
}, [selectedYear, dataByYear]);

//-------------------------------------------------- Function Area------------------------------------------//
  // ฟังก์ชันกรองข้อมูลตามภูมิภาค
  const filterByRegion = (data, region) => {
    if (region === 'All') {
      return data.features;
    } else {
      return data.features.filter(feature => feature.properties.region === region);
    }
  };

  const filterByMonth = (data, month) => {
  if (!month) {
    return data; 
  }
  return data.filter(feature => feature.properties.month === parseInt(month));
};

// const calculatemean = (dataByYear, year) => {
//   const geojson = dataByYear[year];

//   // ตรวจสอบว่า geojson มีโครงสร้างที่ถูกต้อง
//   if (!geojson || !geojson.features || !Array.isArray(geojson.features)) {
//     console.error(`Invalid GeoJSON data for year ${year}:`, geojson);
//     return null;
//   }

//   // สร้างอาร์เรย์เก็บผลรวมและจำนวนข้อมูลของแต่ละเดือน
//   const monthlyAverages = Array(12).fill(0);
//   const monthlyCounts = Array(12).fill(0);

//   // วนลูปผ่าน features เพื่อรวบรวมข้อมูล
//   geojson.features.forEach((feature) => {
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

//   console.log(`Monthly Average Temperatures for the Year ${year}:`, result);

//   // อัปเดตค่าใน dummyTimeSeriesData
//   dummyTimeSeriesData.datasets[0].data = result;

//   return result;
// };

// ฟังก์ชันที่ใช้ใน dropdown เพื่อเลือกปี
const handleYearChange = (event) => {
  const selectedYear = event.target.value;
  if (selectedYear) {
    // เรียกใช้งาน calculatemean เมื่อเลือกปี
    calculatemean(dataByYear, selectedYear);
  }
};

// const handleYearChange = (setYear, setData, dataByYear) => (event) => {
//   const year = event.target.value;
//   if (!year || !dataByYear[year]) {
//     console.error(`No data found for the year: ${year}`);
//     setYear('');
//     setData([]);
//     return;
//   }

//   setYear(year);
//   const geojson = dataByYear[year];
//   setData(geojson.features || []); // Set data for selected year

//   // คำนวณค่าอุณหภูมิเฉลี่ยสำหรับปีที่เลือก
//   calculatemean(dataByYear, year);
//   console.log('Selected Year:', year);
// };

//-----------------------------------------------------------------------------//
 useEffect(() => {
    if (data2001) {
      let filtered = filterByRegion(data2001, selectedRegion); // กรองตามภูมิภาค
      filtered = filterByMonth(filtered, selectedMonth); // กรองตามเดือน
      setFilteredData(filtered); // อัปเดตข้อมูลที่กรองแล้ว
      setProvinces(filtered.map(feature => feature.properties.name)); // อัปเดตรายชื่อจังหวัด
      setSelectedProvince(''); // รีเซ็ตจังหวัดที่เลือก
    }
  }, [selectedRegion, selectedMonth]);

//   useEffect(() => {
//   // ตรวจสอบว่ามีปีที่เลือกและข้อมูลใน dataByYear สำหรับปีนั้น
//   if (selectedYear && dataByYear[selectedYear]) {
//     const geojson = dataByYear[selectedYear];
//     setSelectedData(geojson.features || []); // ตั้งค่า selectedData ด้วย features จาก geojson

//     // คำนวณค่าอุณหภูมิเฉลี่ยสำหรับปีที่เลือก
//     calculatemean(dataByYear, selectedYear);
//   } else {
//     setSelectedData([]); // รีเซ็ตข้อมูลถ้าไม่มีการเลือกปี
//   }
// }, [selectedYear, dataByYear]); // useEffect นี้จะทำงานเมื่อ selectedYear หรือ dataByYear เปลี่ยนแปลง


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

    {/* Dropdown สำหรับเลือกจังหวัด */}
    {selectedRegion !== 'All' && (
      <div className="province-selector">
        <label>Select Province:</label>
        <select 
          onChange={(e) => {
            const provinceName = e.target.value;
            setSelectedProvince(provinceName);

            // กรองข้อมูล GeoJSON ตามจังหวัดที่เลือก
            if (provinceName) {
              const provinceData = data2001.features.find(
                (feature) => feature.properties.name === provinceName
              );

              console.log('GeoJSON Data for Selected Province:', provinceData); // แสดงข้อมูลจังหวัดใน Console
              
              // ส่งข้อมูล provinceData ไปยัง mapComponent.js ผ่าน props หรือ context
              setSelectedProvinceData(provinceData);
            } else {
              console.log('All Provinces selected');
              setSelectedProvinceData(null);  // ถ้าเลือก "All Provinces"
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
    )}
    {/* Dropdown สำหรับเลือกปี */}
  <div className="year-selector">
  <h2>เลือกปี</h2>
  <select
    onChange={handleYearChange}
    value={selectedYear}
    style={{ width: '200px', padding: '10px', fontSize: '16px' }}
  >
    <option value="">-- เลือกปี --</option>
    {Object.keys(dataByYear).map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
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
  data={dummyTimeSeriesData} // ใช้ข้อมูลที่จัดรูปแบบแล้ว
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
              data={ShapefileThai_lv0} // หรือสามารถเลือกเป็น data อื่น ๆ
              filteredData={filteredData} 
              selectedRegion={selectedRegion}
              selectedProvinceData={selectedProvinceData}  // ส่งข้อมูล provinceData ไปที่ MapComponent
              setSelectedProvinceData={setSelectedProvinceData}
              selectedProvince={selectedProvince} 
              selectedMonth={selectedMonth}
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