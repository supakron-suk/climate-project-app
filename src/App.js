import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import Plotly from 'plotly.js-dist-min';
import 'leaflet/dist/leaflet.css';
import thailandGeoJson from './Geo-data/thailand-Geo.json'; // GeoJSON lealef map
import Timeseriesdata from './Geo-data/temp_time_series.json'; // JSON time series
import './App.css'; 

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
    if (timeSeriesData) {
      // แสดงผลกราฟด้วย Plotly
      Plotly.newPlot('timeSeriesPlot', [{
        x: timeSeriesData.time,
        y: timeSeriesData.temperature,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Temperature over Time'
      }], {
        title: 'Temperature Time Series',
        xaxis: { title: 'Time' },
        yaxis: { title: 'Temperature (°C)' }
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
              <GeoJSON data={thailandGeoJson} onEachFeature={onEachFeature} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
