import React, { useEffect, useState } from 'react';
import { LayersControl, MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Thailandmap from "./Geo-data/thailand-Geo.json";
import ShapefileThai_lv0 from "./Geo-data/shapefile-thailand.json";
import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
import Timeseriesdata from './Geo-data/temp_time_series.json'; 
import { plotTimeSeries } from './JS/Time-Series.js';
import HeatmapThailand from './Geo-data/candex_to_geo.json';
import ConvinceTest from './Geo-data/province_mean_temp_2001.json';
import { style, ColorBar } from './JS/Heatmap.js';
import './App.css';
import MapComponent from './MapComponent'; // นำเข้า MapComponent

function App() {
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedProvince, setSelectedProvince] = useState(''); // จังหวัดที่เลือก
  const [filteredData, setFilteredData] = useState(null); // ข้อมูลที่กรองตามภูมิภาค
  const [provinces, setProvinces] = useState([]); // รายชื่อจังหวัดในภูมิภาค

  // ใช้ useEffect เพื่อโหลดข้อมูล time series
  useEffect(() => {
    const time = Timeseriesdata.data.map(item => new Date(item[0])); // แปลงเวลาเป็น Date
    const temperature = Timeseriesdata.data.map(item => item[1]);
    setTimeSeriesData({ time, temperature });
  }, []);

  // ใช้ฟังก์ชัน plotTimeSeries เมื่อข้อมูลถูกโหลด
  useEffect(() => {
    if (timeSeriesData) {
      plotTimeSeries(timeSeriesData);  // ใช้ฟังก์ชัน plotTimeSeries
    }
  }, [timeSeriesData]);

  // ฟังก์ชันกรองข้อมูลตามภูมิภาค
  const filterByRegion = (data, region) => {
    if (region === 'All') {
      return data.features;
    } else {
      return data.features.filter(feature => feature.properties.region === region);
    }
  };

  // อัปเดต filteredData และรายชื่อจังหวัดเมื่อภูมิภาคเปลี่ยน
  useEffect(() => {
    if (ConvinceTest) {
      const filtered = filterByRegion(ConvinceTest, selectedRegion);
      setFilteredData(filtered); // อัพเดต filteredData
      setProvinces(filtered.map(feature => feature.properties.name)); // ดึงรายชื่อจังหวัด
      setSelectedProvince(''); // รีเซ็ตจังหวัดที่เลือก
    }
  }, [selectedRegion]);

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

        {/* Dropdown สำหรับเลือกจังหวัด */}
        {selectedRegion !== 'All' && (
          <div className="province-selector">
            <label>Select Province:</label>
            <select 
              onChange={(e) => setSelectedProvince(e.target.value)} 
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

        <div>
          <p>Selected Region: {selectedRegion}</p>
          <p>Selected Province: {selectedProvince || 'All'}</p>
          <p>Number of provinces: {filteredData ? filteredData.length : 0}</p>
        </div>
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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
//   }
// };

// // // สไตล์ polygon ใน GeoJSON
// // const style = (feature) => ({
// //   fillColor: getColor(feature.properties.temperature), // เปลี่ยนสีตามค่า temperature
// //   weight: 2,
// //   opacity: 1,
// //   color: 'white',
// //   fillOpacity: 0.7,
// // });

//   return (
//     <div className="main-container">
//       <h1>Multidimensional climate data visualization</h1> {/* name webapp (testing) */}
//       <div className="container">
//         <div className="content">
//           <div className="left-content">
//             <div id="timeSeriesPlot" style={{ width: '100%', height: '650px' }}></div>
//           </div>
//           <div className="right-map">
//             <MapContainer center={[13.7563, 100.5018]} zoom={5} style={{ height: "700px", width: "800px" }}>
//               <LayersControl position="topright">
//                 <LayersControl.Overlay checked name="Thailand Map">
//                   <div className='thai-map'>
//                     <GeoJSON data={ShapefileThai_lv0} style={style} onEachFeature={onEachFeature} />
//                   </div>
//                 </LayersControl.Overlay>
//                 <LayersControl.Overlay checked name="Heatmap">
//                   <GeoJSON data={HeatmapThailand} style={style} onEachFeature={onEachFeature} />
//                 </LayersControl.Overlay>
//                 <LayersControl.Overlay checked name="Province Mean Temperature">
//                   <GeoJSON data={{ type: 'FeatureCollection', features: filterRegionData(selectedRegion) }} style={style} onEachFeature={onEachFeature} />
//                 </LayersControl.Overlay>
//               </LayersControl>
//             </MapContainer>
//             <ColorBar /> {/* แสดง ColorBar */}
//           </div>
//         </div>
//       </div>

//       {/* Dropdown ให้เลือกภูมิภาค */}
//       <div>
//         <label>Select Region:</label>
//         <select onChange={(e) => setSelectedRegion(e.target.value)} value={selectedRegion}>
//           <option value="All">All Regions</option>
//           <option value="North_East_region">North East</option>
//           <option value="North_region">North</option>
//           <option value="South_region">South</option>
//           <option value="Middle_region">Middle</option>
//           <option value="East_region">East</option>
//           <option value="West_region">West</option>
//         </select>

//         <div>
//   <p>Selected Region: {selectedRegion}</p>
//   <p>Number of provinces: {filterRegionData(selectedRegion).length}</p>
//   </div>
//       </div>
//     </div>
//   );
// }

// export default App;

