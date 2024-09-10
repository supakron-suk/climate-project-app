import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import Plotly from 'plotly.js-dist-min';
import 'leaflet/dist/leaflet.css';
import thailandGeoJson from './Geo-data/thailand-Geo.json';  // GeoJSON สำหรับประเทศไทย
import './App.css';  // นำเข้าไฟล์ CSS

function App() {
  const [timeSeriesData, setTimeSeriesData] = useState(null);

  useEffect(() => {
    // ดึงข้อมูล JSON ของ Time Series ที่คุณสร้างไว้
    fetch('src/Python/output_max_temp_time_series.json')  // เปลี่ยน URL เป็นตำแหน่งไฟล์ของคุณ
      .then(response => response.json())
      .then(data => {
        const { index: time, data: temperature } = data;  // ใช้ 'split' orient เพื่อดึงข้อมูล time และ temperature
        setTimeSeriesData({ time, temperature });
      })
      .catch(error => console.error("Error loading JSON file:", error));
  }, []);

  useEffect(() => {
    if (timeSeriesData) {
      Plotly.newPlot('timeSeriesPlot', [{
        x: timeSeriesData.time,
        y: timeSeriesData.temperature,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Max Temperature per Month'
      }], {
        title: 'Max Monthly Temperature',
        xaxis: { title: 'Time' },
        yaxis: { title: 'Max Temperature (°C)' }
      });
    }
  }, [timeSeriesData]);

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
    }
    if (feature.properties && feature.properties.style) {
      layer.setStyle(feature.properties.style);
    }
  };

  return (
    <div className="container">
      <div className="left-content">
        <h1>Time Series Plot</h1>
        <div id="timeSeriesPlot" style={{ width: '100%', height: '450px' }}></div>
      </div>
      <div className="right-map">
        <MapContainer center={[13.7563, 100.5018]} zoom={5} style={{ height: "500px", width: "700px" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          <GeoJSON data={thailandGeoJson} onEachFeature={onEachFeature} />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;

