import React, { useState, useEffect } from 'react';
import { MapContainer, GeoJSON, LayersControl } from 'react-leaflet';

// ฟังก์ชันที่ใช้ในการกำหนดสีตามอุณหภูมิ
const getColor = (temp) => {
  return temp > 30 ? '#a50026' :
         temp > 29 ? '#d73027' :
         temp > 28 ? '#f46d43' :
         temp > 27 ? '#fc8d59' :
         temp > 26 ? '#fee08b' :
         temp > 25 ? '#d9ef8b' :
         temp > 24 ? '#91cf60' :
         temp > 23 ? '#1cc3ff' :
         temp > 22 ? '#4575b4' :
         temp > 21 ? '#313695' :
         '#2c7bb6';
};

// ฟังก์ชันกำหนดสไตล์การแสดงผล
const style = (feature, selectedRegion, selectedProvince, selectedMonth) => {
  // กรองข้อมูลตามภูมิภาคหรือจังหวัดที่เลือก
  if (selectedRegion === 'All' || feature.properties.region === selectedRegion) {
    // กรองข้อมูลตามจังหวัดที่เลือก
    if (!selectedProvince || feature.properties.name === selectedProvince) {
      // กรองข้อมูลตามเดือนที่เลือก
      if (!selectedMonth || feature.properties.month === selectedMonth) {
        return {
          fillColor: getColor(feature.properties.temperature), // ใช้ฟังก์ชัน getColor เพื่อกำหนดสี
          weight: 0.5,
          opacity: 1,
          color: 'black',
          dashArray: '3',
          fillOpacity: 0.9,
        };
      }
      // ถ้าเดือนไม่ตรงกันให้ไม่แสดง (fillOpacity: 0 คือโปร่งใส)
      return {
        color: 'transparent',
        weight: 0,
        fillOpacity: 0,
      };
    }
    return {
      color: 'transparent',
      weight: 0,
      fillOpacity: 0,
    };
  } else {
    return {
      color: 'transparent',
      weight: 0,
      fillOpacity: 0,
    };
  }
};

// ฟังก์ชันสำหรับแสดงข้อมูลใน popup
const onEachFeature = (feature, layer) => {
  layer.bindPopup(
    `<b>Province:</b> ${feature.properties.name}<br/><b>Region:</b> ${feature.properties.region}`
  );
};

const ColorBar = () => {
  return (
    <div className="color-bar-horizontal">
      <div className="gradient-bar" />
      <div className="temperature-labels">
        <span>21°C</span>
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

const MapComponent = ({ filteredData, selectedRegion, selectedProvince, selectedProvinceData, selectedMonth }) => {
  const [additionalData, setAdditionalData] = useState(null);
  const [anotherData, setAnotherData] = useState(null);

  useEffect(() => {
    fetch('./Geo-data/candex_to_geo.json')
      .then((response) => response.json())
      .then((data) => setAdditionalData(data))
      .catch((error) => console.error('Error fetching additional data', error));

    fetch('./Geo-data/thailand-Geo.json')
      .then((response) => response.json())
      .then((data) => setAnotherData(data))
      .catch((error) => console.error('Error fetching another data', error));
  }, []);

  // ฟังก์ชันกรองข้อมูลตามเดือน
  const getFilteredData = (data) => {
    const filtered = selectedMonth
      ? data.filter((feature) => feature.properties.month === selectedMonth) // กรองข้อมูลตามเดือน
      : data;
    
    console.log('Filtered Data for Month', selectedMonth, filtered); // แสดงข้อมูลที่กรองใน console
    return filtered;
  };

  return (
  <div style={{ position: "relative" }}>
    <MapContainer center={[13.7563, 100.5018]} zoom={5} style={{ height: "700px", width: "800px" }}>
      <LayersControl position="topright">
        <LayersControl.Overlay checked name="Province Mean Temperature">
          <GeoJSON
            data={getFilteredData(selectedProvinceData ? [selectedProvinceData] : filteredData)}
            style={(feature) => style(feature, selectedRegion, selectedProvince, selectedMonth)}
            onEachFeature={onEachFeature}
          />
        </LayersControl.Overlay>
        {additionalData && (
          <LayersControl.Overlay name="Candex Geo Data">
            <GeoJSON
              data={additionalData}
              style={() => ({ color: 'blue', weight: 1, fillOpacity: 0.5 })}
              onEachFeature={(feature, layer) => layer.bindPopup(`<b>Data Info:</b> ${feature.properties.info}`)}
            />
          </LayersControl.Overlay>
        )}
        {anotherData && (
          <LayersControl.Overlay name="Another Geo Data">
            <GeoJSON
              data={anotherData}
              style={() => ({ color: 'grey', weight: 1, fillOpacity: 0.4 })}
              onEachFeature={(feature, layer) => layer.bindPopup(`<b>Additional Info:</b> ${feature.properties.additionalInfo}`)}
            />
          </LayersControl.Overlay>
        )}
      </LayersControl>
    </MapContainer>
    {/* เพิ่ม ColorBar ด้านล่างแผนที่ */}
    <ColorBar />
  </div>
);
};

export default MapComponent;




