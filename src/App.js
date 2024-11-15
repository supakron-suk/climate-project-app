import React, { useEffect, useState } from 'react';
import { LayersControl, MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

//------------------- JSON, JAVA SCRIPT FILE ------------------------------------------------
import Thailandmap from "./Geo-data/thailand-Geo.json";
import ShapefileThai_lv0 from "./Geo-data/shapefile-thailand.json";
import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
import Timeseriesdata from './Geo-data/temp_time_series.json'; // JSON time series
import { plotTimeSeries } from './JS/Time-Series.js';
import HeatmapThailand from './Geo-data/test_temperature_thailand_2000.json'; // Heatmap GeoJSON
import ConvinceTest from './Geo-data/province_mean_temp_2000.json' ;
import { style, ColorBar  } from './JS/Heatmap.js';
import './App.css'; 
//-------------------------------------------------------------------------------------------

function App() {
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('All');  // ค่าสถานะเพื่อเลือกภูมิภาค

  // ใช้ useEffect เพื่อโหลดข้อมูล time series
  useEffect(() => {
    const time = Timeseriesdata.data.map(item => new Date(item[0])); // แปลงเวลาเป็น Date
    const temperature = Timeseriesdata.data.map(item => item[1]);
    setTimeSeriesData({ time, temperature });
  }, []);

  useEffect(() => {
    plotTimeSeries(timeSeriesData);  // ใช้ฟังก์ชัน plotTimeSeries
  }, [timeSeriesData]);

  // ฟังก์ชันในการกรองข้อมูลภูมิภาค
  const filterRegionData = (regionName) => {
    if (regionName === 'All') {
      return ConvinceTest.features;  // แสดงข้อมูลทั้งหมด
    } else {
      return ConvinceTest.features.filter(feature => feature.properties.region_name === regionName);  // กรองข้อมูลตามภูมิภาค
    }
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.temperature) {
      layer.bindPopup(`Temperature: ${feature.properties.temperature} °C`);
    }
  };

  return (
    <div className="main-container">
      <h1>Multidimensional climate data visualization</h1> {/* name webapp (testing) */}
      <div className="container">
        <div className="content">
          <div className="left-content">
            <div id="timeSeriesPlot" style={{ width: '100%', height: '650px' }}></div>
          </div>
          <div className="right-map">
            <MapContainer center={[13.7563, 100.5018]} zoom={5} style={{ height: "700px", width: "800px" }}>
              <LayersControl position="topright">
                <LayersControl.Overlay checked name="Thailand Map">
                  <div className='thai-map'>
                    <GeoJSON data={ShapefileThai_lv0} style={style} onEachFeature={onEachFeature} />
                  </div>
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Heatmap">
                  <GeoJSON data={HeatmapThailand} style={style} onEachFeature={onEachFeature} />
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Province Mean Temperature">
                  <GeoJSON data={{ type: 'FeatureCollection', features: filterRegionData(selectedRegion) }} style={style} onEachFeature={onEachFeature} />
                </LayersControl.Overlay>
              </LayersControl>
            </MapContainer>
            <ColorBar /> {/* แสดง ColorBar */}
          </div>
        </div>
      </div>

      {/* Dropdown ให้เลือกภูมิภาค */}
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
      </div>
    </div>
  );
}

export default App;


