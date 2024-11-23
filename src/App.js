// import React, { useState, useEffect } from 'react';
// import MapComponent from './MapComponent'; // นำเข้าคอมโพเนนต์ MapComponent
// import './App.css';

// function App() {
//   const [convinceTest, setConvinceTest] = useState(null);
//   const [selectedRegion, setSelectedRegion] = useState('All');

//   // ดึงข้อมูล GeoJSON
//   useEffect(() => {
//     fetch('./Geo-data/province_mean_temp_2001.json')
//       .then((response) => response.json())
//       .then((data) => setConvinceTest(data))
//       .catch((error) => console.error('Error fetching data', error));
//   }, []);

// useEffect(() => {
//     fetch('./Geo-data/candex_to_geo.json')
//       .then((response) => response.json())
//       .then((data) => setConvinceTest(data))
//       .catch((error) => console.error('Error fetching data', error));
//   }, []);

//   // ฟังก์ชันกรองข้อมูลตาม region
//   const filterByRegion = (data, region) => {
//     if (region === 'All') {
//       return data.features;
//     } else {
//       return data.features.filter(feature => feature.properties.region === region);
//     }
//   };

//   const filteredData = convinceTest ? filterByRegion(convinceTest, selectedRegion) : null;

//   // Debug ข้อมูลที่กรองมา
//   useEffect(() => {
//     if (filteredData) {
//       console.log('Filtered Data:', filteredData);
//     }
//   }, [filteredData]);

//   return (
//     <div className="main-container">
//       <h1>Multidimensional Climate Data Visualization</h1>
//       <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
//         <option value="All">All Regions</option>
//         <option value="North_region">North</option>
//         <option value="North_East_region">Northeast</option>
//         <option value="Middle_region">Central</option>
//         <option value="South_region">South</option>
//         <option value="East_region">East</option>
//         <option value="West_region">West</option>
//       </select>

//       {/* ใช้ MapComponent แสดงแผนที่ */}
//       {convinceTest && (
//         <MapComponent 
//           data={convinceTest} 
//           filteredData={filteredData} 
//           selectedRegion={selectedRegion} 
//         />
//       )}
//     </div>
//   );
// }

// export default App;
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
  const [filteredData, setFilteredData] = useState(null); // ข้อมูลที่กรองตามภูมิภาค

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

  useEffect(() => {
    if (ConvinceTest) {
      const filtered = filterByRegion(ConvinceTest, selectedRegion);
      setFilteredData(filtered); // อัพเดต filteredData
    }
  }, [selectedRegion]);

  return (
    <div className="main-container">
      <h1>Multidimensional climate data visualization</h1> 
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

      {/* Dropdown สำหรับเลือกภูมิภาค */}
      <div>
        <label>Select Region:</label>
        <select onChange={(e) => setSelectedRegion(e.target.value)} value={selectedRegion}>
          <option value="All">All Regions</option>
          <option value="North_East_region">North East</option>
          <option value="North_region">North</option>
          <option value="South_region">South</option>
          <option value="Middle_region">Middle</option>
          <option value="East_region">East</option>
          <option value="West_region">West</option>
        </select>

        <div>
          <p>Selected Region: {selectedRegion}</p>
          <p>Number of provinces: {filteredData ? filteredData.length : 0}</p>
        </div>
      </div>
    </div>
  );
}

export default App;




// import React, { useEffect, useState } from 'react';
// import { LayersControl, MapContainer, GeoJSON } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import Thailandmap from "./Geo-data/thailand-Geo.json";
// import ShapefileThai_lv0 from "./Geo-data/shapefile-thailand.json";
// import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
// import Timeseriesdata from './Geo-data/temp_time_series.json'; 
// import { plotTimeSeries } from './JS/Time-Series.js';
// import HeatmapThailand from './Geo-data/candex_to_geo.json';
// import ConvinceTest from './Geo-data/province_mean_temp_2001.json';
// import { style, ColorBar } from './JS/Heatmap.js';
// import './App.css';

// function App() {
//   const [timeSeriesData, setTimeSeriesData] = useState(null);
//   const [selectedRegion, setSelectedRegion] = useState('All'); // สถานะสำหรับเลือกภูมิภาค
//   //const [filteredFeatures, setFilteredFeatures] = useState(ConvinceTest.features); // จัดการข้อมูลที่กรอง

//   // ใช้ useEffect เพื่อโหลดข้อมูล time series
//   useEffect(() => {
//     const time = Timeseriesdata.data.map(item => new Date(item[0])); // แปลงเวลาเป็น Date
//     const temperature = Timeseriesdata.data.map(item => item[1]);
//     setTimeSeriesData({ time, temperature });
//   }, []);

//   useEffect(() => {
//     plotTimeSeries(timeSeriesData);  // ใช้ฟังก์ชัน plotTimeSeries
//   }, [timeSeriesData]);

//   // ฟังก์ชันกรองข้อมูลตาม region
//   const filterByRegion = (data, region) => {
//     if (region === 'All') {
//       return data.features;
//     } else {
//       return data.features.filter(feature => feature.properties.region === region);
//     }
//   };

//     const filteredData = convinceTest ? filterByRegion(convinceTest, selectedRegion) : null;
// //   const filterRegionGeoJSON = (regionName) => {
// //   const features = regionName === 'All' 
// //     ? ConvinceTest.features 
// //     : ConvinceTest.features.filter(feature => feature.properties.region === regionName);

// //   // สร้าง GeoJSON ใหม่
// //   return {
// //     type: 'FeatureCollection',
// //     features: features
// //   };
// // };

//   const onEachFeature = (feature, layer) => {
//   layer.bindPopup(
//     `<b>Province:</b> ${feature.properties.name}<br/><b>Region:</b> ${feature.properties.region}`
//   );
// };


//   return (
//     <div className="main-container">
//       <h1>Multidimensional climate data visualization</h1> 
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
//                   <GeoJSON 
//                   data={data} 
//                   style={(feature) => style(feature, selectedRegion)}
//                   onEachFeature={onEachFeature}
//                   />
//                 </LayersControl.Overlay>
//               </LayersControl>
//             </MapContainer>
//             <ColorBar /> 
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
//           <p>Selected Region: {selectedRegion}</p>
//           <p>Number of provinces: {filterRegionData(selectedRegion).length}</p>
//         </div>
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

