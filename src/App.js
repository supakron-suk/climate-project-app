import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import Plotly from 'plotly.js-dist-min';
import 'leaflet/dist/leaflet.css';
import thailandGeoJson from './Geo-data/thailand-Geo.json'; // GeoJSON lealef map
import Timeseriesdata from './Geo-data/temp_time_series.json'; // JSON time series
import HeatmapThailand from './Geo-data/mean_tmp_thai_2000_2005.json'; // Heatmap GeoJSON
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

  // Function to map temperature to color scale
 const getColor = (temp) => {
    return temp > 35 ? '#a50026' :   // Dark Red for hot temperatures
           temp > 29 ? '#d73027' :   // Red
           temp > 28 ? '#f46d43' :   // Light Red
           temp > 27 ? '#fc8d59' :   // Coral
           temp > 26 ? '#fee08b' :   // Yellow
           temp > 25 ? '#d9ef8b' :   // Light Yellow
           temp > 24 ? '#91cf60' :    // Light Green
           temp > 23 ? '#1cc3ff' :    // Light Blue
           '#313695';                 // Dark Blue for cooler temperatures
};


  // Function to style each GeoJSON feature
  const style = (feature) => {
    return {
      fillColor: getColor(feature.properties.temperature),
      weight: 1,
      opacity: 1,
      color: 'black',
      dashArray: '3',
      fillOpacity: 0.8
    };
  };

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

