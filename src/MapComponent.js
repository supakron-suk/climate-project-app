import React, { useState, useEffect } from 'react';
import { MapContainer, GeoJSON, LayersControl } from 'react-leaflet';

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

const style = (feature, selectedRegion) => {
  if (selectedRegion === 'All' || feature.properties.region === selectedRegion) {
    return {
      fillColor: getColor(feature.properties.temperature),
      weight: 0.5,
      opacity: 1,
      color: 'black',
      dashArray: '3',
      fillOpacity: 0.9,
    };
  } else {
    return {
      color: 'transparent',
      weight: 0,
      fillOpacity: 0,
    };
  }
};

const onEachFeature = (feature, layer) => {
  layer.bindPopup(
    `<b>Province:</b> ${feature.properties.name}<br/><b>Region:</b> ${feature.properties.region}`
  );
};

const MapComponent = ({ data, filteredData, selectedRegion }) => {
  const [additionalData, setAdditionalData] = useState(null);
  const [anotherData, setAnotherData] = useState(null);  // สำหรับข้อมูลใหม่ที่คุณต้องการเพิ่ม

  // โหลดข้อมูล candex_to_geo.json
  useEffect(() => {
    fetch('./Geo-data/candex_to_geo.json')
      .then((response) => response.json())
      .then((data) => setAdditionalData(data))
      .catch((error) => console.error('Error fetching additional data', error));

    // โหลดข้อมูลใหม่จากไฟล์ anotherGeoData.json
    fetch('./Geo-data/thailand-Geo.json')  // เพิ่มไฟล์ใหม่ที่ต้องการ
      .then((response) => response.json())
      .then((data) => setAnotherData(data))
      .catch((error) => console.error('Error fetching another data', error));
  }, []);

  return (
    <MapContainer center={[13.7563, 100.5018]} zoom={5} style={{ height: "700px", width: "800px" }}>
      <LayersControl position="topright">
        <LayersControl.Overlay checked name="Province Mean Temperature">
          <GeoJSON
            data={filteredData} // ใช้ข้อมูลที่กรองแล้ว
            style={(feature) => style(feature, selectedRegion)}
            onEachFeature={onEachFeature}
          />
        </LayersControl.Overlay>

        {/* เพิ่มเลเยอร์ใหม่สำหรับข้อมูล candex_to_geo.json */}
        {additionalData && (
          <LayersControl.Overlay name="Candex Geo Data">
            <GeoJSON
              data={additionalData}
              style={() => ({
                color: 'blue',
                weight: 1,
                fillOpacity: 0.5,
              })}
              onEachFeature={(feature, layer) =>
                layer.bindPopup(`<b>Data Info:</b> ${feature.properties.info}`)
              }
            />
          </LayersControl.Overlay>
        )}

        {/* เพิ่มเลเยอร์ใหม่สำหรับข้อมูล anotherGeoData.json */}
        {anotherData && (
          <LayersControl.Overlay name="Another Geo Data">
            <GeoJSON
              data={anotherData}
              style={() => ({
                color: 'green',
                weight: 1,
                fillOpacity: 0.4,
              })}
              onEachFeature={(feature, layer) =>
                layer.bindPopup(`<b>Additional Info:</b> ${feature.properties.additionalInfo}`)
              }
            />
          </LayersControl.Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
};

export default MapComponent;



