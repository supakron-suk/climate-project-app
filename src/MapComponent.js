// MapComponent.js
import React, { useState, useEffect } from 'react';
import { MapContainer, GeoJSON, LayersControl } from 'react-leaflet';

// ฟังก์ชันกำหนดสีตามค่า slope_value
const getColor = (slope) => {
  return slope > 0.5 ? '#67001f' :
         slope > 0.2 ? '#b6202f' :
         slope > 0 ? '#dd6f59' :
         slope > -0.2 ? '#f3a582' :
         slope > -0.5 ? '#a7d0e4' :
         '#053061';
};

// ฟังก์ชันกำหนดสไตล์
const style = (feature, selectedRegion, selectedProvince, selectedMonth) => ({
  fillColor: getColor(feature.properties.slope_value), // ใช้ slope_value สำหรับกำหนดสี
  weight: 0.5,
  opacity: 1,
  color: 'black',
  dashArray: '3',
  fillOpacity: 
    (selectedRegion === 'All' || feature.properties.region === selectedRegion) &&
    (!selectedProvince || feature.properties.name === selectedProvince)
      ? 0.9
      : 0,
});

// ฟังก์ชันแสดงข้อมูลใน popup
const onEachFeature = (feature, layer) => {
  layer.bindPopup(
    `<b>Province:</b> ${feature.properties.name}<br/>
     <b>Region:</b> ${feature.properties.region}<br/>
     <b>Slope Value:</b> ${feature.properties.slope_value}`
  );
};

// ColorBar สำหรับแสดงสีและช่วง slope_value
const ColorBar = () => (
  <div className="color-bar-horizontal">
    <div className="gradient-bar" />
    <div className="slope-labels">
      <span>{'> 0.5'}</span>
      <span>{'0.2 - 0.5'}</span>
      <span>{'0 - 0.2'}</span>
      <span>{'-0.2 - 0'}</span>
      <span>{'-0.5 - -0.2'}</span>
      <span>{'< -0.5'}</span>
    </div>
  </div>
);

const MapComponent = ({ trendGeoData, selectedRegion, selectedProvince }) => {
  // ตรวจสอบข้อมูล GeoJSON ก่อนแสดงผล
  const displayedGeoData = 
    trendGeoData && trendGeoData.features
      ? trendGeoData
      : { type: 'FeatureCollection', features: [] }; // ค่าเริ่มต้นถ้าไม่มีข้อมูล

  return (
    <div className="map-container">
      <MapContainer center={[13.7563, 100.5018]} zoom={5} style={{ height: "1000px", width: "800px" }}>
        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Slope Value Map">
            <GeoJSON
              data={displayedGeoData}
              style={(feature) => style(feature, selectedRegion, selectedProvince)}
              onEachFeature={onEachFeature}
            />
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
      <ColorBar />
    </div>
  );
};

export default MapComponent;





