import React, { useEffect, useState } from 'react';
import { LayersControl, MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

//------------------- JSON, JAVA SCRIPT FILE ------------------------------------------------
import Thailandmap from "./Geo-data/thailand-Geo.json";
import ShapefileThai from "./Geo-data/shapefile-lv1-thailand.json";
import Timeseriesdata from './Geo-data/temp_time_series.json'; // JSON time series
import { plotTimeSeries } from './JS/Time-Series.js';
import HeatmapThailand from './Geo-data/test_temperature_thailand_2000.json'; // Heatmap GeoJSON
import ConvinceTest from './Geo-data/province_mean_temp_2000.json' ;
import { style } from './JS/Heatmap.js';
import './App.css'; 
//-------------------------------------------------------------------------------------------

const ColorBar = () => {
    return (
        <div className="color-bar-horizontal">
            <div className="gradient-bar" />
            <div className="temperature-labels">
                <span>22°C</span>
                <span>23°C</span>
                <span>24°C</span>
                <span>25°C</span>
                <span>26°C</span>
                <span>27°C</span>
                <span>28°C</span>
                <span>29°C</span>
                <span>30°C</span>
            </div>
        </div>
    );
};


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
      <h1>Multidimensional climate data visualization</h1> {/* name webapp (testing) */}
      <div className='timeseries-text'>
        <h1>Time series (testing)</h1>
      </div>
      <div className='map-text'>
        <h1>HeatMap (testing)</h1>
      </div>
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
                    <GeoJSON data={ShapefileThai} style={style} onEachFeature={onEachFeature} />
                  </div>
                </LayersControl.Overlay>
                 <LayersControl.Overlay checked name="Thailand Map">
                  <div className='thai-map'>
                    <GeoJSON data={HeatmapThailand} style={style} onEachFeature={onEachFeature} />
                  </div>
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Heatmap">
                  <GeoJSON data={ConvinceTest} style={style} onEachFeature={onEachFeature} />
                </LayersControl.Overlay>
              </LayersControl>
            </MapContainer>
            <ColorBar /> {/* แสดง ColorBar */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


