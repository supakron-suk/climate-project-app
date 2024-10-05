import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
//import Plotly from 'plotly.js-dist-min';
import 'leaflet/dist/leaflet.css';

//------------------- JSON, JAVA SCRIPT FILE ------------------------------------------------
import Timeseriesdata from './Geo-data/temp_time_series.json'; // JSON time series
import  { plotTimeSeries }  from './JS/Time-Series.js';
import HeatmapThailand from './Geo-data/mean_tmp_thai_2000_2005.json'; // Heatmap GeoJSON
import { style , filterThailandFeatures, styleWithOpacity } from './JS/Heatmap.js';
import './App.css'; 
//-------------------------------------------------------------------------------------------

function App() {
  const [timeSeriesData, setTimeSeriesData] = useState(null);

  useEffect(() => {
    // use data JSON 
    const time = Timeseriesdata.data.map(item => new Date(item[0])); // แปลงเวลาเป็น Date
    const temperature = Timeseriesdata.data.map(item => item[1]);

    // เก็บข้อมูลใน state เพื่อใช้ในการพล็อต
    setTimeSeriesData({ time, temperature });
  }, []);

  useEffect(() => {
    plotTimeSeries(timeSeriesData);  // ใช้ฟังก์ชัน plotTimeSeries
  }, [timeSeriesData]);


  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.temperature) {
      layer.bindPopup(`Temperature: ${feature.properties.temperature} °C`);
    }
  };

  return (
    <div className="main-container">
      <h1>Climate Project</h1> {/* name webapp (testing) */}
      <div className='timeseries-text'>
        <h1>Time series (testing)</h1>
      </div>
      <div className='map-text'>
        <h1>Map (testing)</h1>
      </div>
      <div className="container">
        <div className="content">
          <div className="left-content">
            <div id="timeSeriesPlot" style={{ width: '100%', height: '650px' }}></div>
          </div>
          <div className="right-map">
            <MapContainer center={[13.7563, 100.5018]} zoom={5} style={{ height: "700px", width: "800px" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              />
              <GeoJSON data={HeatmapThailand} style={style} onEachFeature={onEachFeature} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

