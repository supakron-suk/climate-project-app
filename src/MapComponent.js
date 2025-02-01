import React from 'react';
import { MapContainer,TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import mapbackgroud from "./Geo-data/thailand-Geo.json";

// ฟังก์ชันไล่ระดับสี Turbo สำหรับ Choroplet map
const turboColor = [
  [0, "#000099"],
  [0.1, "#0020ff"], 
  [0.2, "#0040ff"], 
  [0.3, "#0080ff"],
  [0.4, "#00c0ff"], 
  [0.5, "#00ff80"], 
  [0.6, "#00ff00"], 
  [0.7, "#80ff00"],
  [0.8, "#c0ff00"], 
  [0.9, "#ffc000"], 
  [1, "#ff0000"]
];

// ฟังก์ชันไล่ระดับสี Coolwarm สำหรับ TrendMap
const coolwarmColor = [
  [-0.5, "#053061"],
  [-0.4, "#256baf"],
  [-0.3, "#559ec9"],
  [-0.2, "#a7d0e4"],
  [-0.1, "#e2edf3"],
  [0, "#fae7dc"],
  [0.1, "#f7b799"],
  [0.2, "#dd6f59"],
  [0.3, "#b6202f"],
  [0.5, "#67001f"],
];

const turboColor_reverse = [
  [1, "#ff0000"],
  [0.9, "#ffc000"],
  [0.8, "#c0ff00"],
  [0.7, "#80ff00"],
  [0.6, "#00ff00"],
  [0.5, "#00ff80"],
  [0.4, "#00c0ff"],
  [0.3, "#0080ff"],
  [0.2, "#0040ff"],
  [0.1, "#0020ff"],
  [0, "#000099"]
];

// ฟังก์ชันไล่ระดับสี Coolwarm สำหรับ TrendMap
const coolwarmColor_reverse = [
  [0.5, "#67001f"],
  [0.3, "#b6202f"],
  [0.2, "#dd6f59"],
  [0.1, "#f7b799"],
  [0, "#fae7dc"],
  [-0.1, "#e2edf3"],
  [-0.2, "#a7d0e4"],
  [-0.3, "#559ec9"],
  [-0.4, "#256baf"],
  [-0.5, "#053061"],
];


// ฟังก์ชันไล่ระดับสีที่ใช้ Turbo หรือ Coolwarm
const interpolateColor = (value, min, max, scale) => {
  if (value === undefined || value === null) return "#ccc";
  if (min === max) return scale[0]?.[1] || "#ccc";

  // จำกัดค่า value ให้อยู่ในช่วง min และ max
  const clampedValue = Math.max(min, Math.min(max, value));

  // Normalize value into a 0-1 range
  const ratio = (clampedValue - min) / (max - min);
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  // Find two closest scale points
  const scaledIndex = clampedRatio * (scale.length - 1); // คำนวณตำแหน่งของสี
  const lowerIndex = Math.floor(scaledIndex);              // หา index ของสีที่ต่ำกว่า
  const upperIndex = Math.min(lowerIndex + 1, scale.length - 1); // หา index ของสีที่สูงกว่า
  const t = scaledIndex - lowerIndex;   // ระยะห่างระหว่างสีที่ต่ำกว่าและสูงกว่า

  if (!scale[lowerIndex] || !scale[upperIndex]) {
    console.warn("Color scale index out of bounds", { lowerIndex, upperIndex, scale });
    return "#ccc";
  }

  const lowerColor = scale[lowerIndex][1];
  const upperColor = scale[upperIndex][1];

  const interpolateRgb = (color1, color2, t) => {
    const [r1, g1, b1] = color1.match(/\w\w/g).map((c) => parseInt(c, 16));
    const [r2, g2, b2] = color2.match(/\w\w/g).map((c) => parseInt(c, 16));

    const r = Math.round(r1 + t * (r2 - r1));
    const g = Math.round(g1 + t * (g2 - g1));
    const b = Math.round(b1 + t * (b2 - b1));

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Interpolate between the two colors
  return interpolateRgb(lowerColor, upperColor, t);
};

const getColorScale = (selectedValue) => {
  if (selectedValue === "pre" || selectedValue === "rx1day") {
    return {
      turbo: turboColor_reverse,
      coolwarm: coolwarmColor_reverse
    };
  }
  return { turbo: turboColor, coolwarm: coolwarmColor };
};


// ฟังก์ชันกำหนดสี
const getColor = (value, viewMode, min, max, selectedValue) => {
  const isReverse = selectedValue === "pre" || selectedValue === "rx1day";
  
  const turbo = isReverse ? turboColor_reverse : turboColor;
  const coolwarm = isReverse ? coolwarmColor_reverse : coolwarmColor;
  
  const scale = viewMode === "Heatmap" ? turbo : coolwarm;

  if (!scale || !Array.isArray(scale) || scale.length === 0) {
    console.warn(`Invalid scale for viewMode: ${viewMode}`);
    return "#ccc";
  }

  return interpolateColor(value, min, max, scale);
};

// const getColor = (value, viewMode, min, max, selectedValue) => {
//   const isReverse = selectedValue === "pre" || selectedValue === "rx1day";
  
//   const turbo = isReverse ? turboColor_reverse : turboColor;
//   const coolwarm = isReverse ? coolwarmColor_reverse : coolwarmColor;
  
//   const scale = viewMode === "Heatmap" ? turbo : coolwarm;

//   if (!scale || !Array.isArray(scale) || scale.length === 0) {
//     console.warn(`Invalid scale for viewMode: ${viewMode}`);
//     return "#ccc";
//   }

//   return interpolateColor(value, min, max, scale);
// };


// const getColor = (value, viewMode, min, max, selectedValue) => {
//   const { turbo, coolwarm } = getColorScale(selectedValue);
//   const scale = viewMode === "Heatmap" ? turbo : coolwarm;

//   if (!scale || !Array.isArray(scale) || scale.length === 0) {
//     console.warn(`Invalid scale for viewMode: ${viewMode}`);
//     return "#ccc";
//   }
  
//   return interpolateColor(value, min, max, scale);
// };

// const getColor = (value, viewMode, min, max) => {
//   const scale = viewMode === "Heatmap" ? turboColor : coolwarmColor;

//   if (!scale || !Array.isArray(scale) || scale.length === 0) {
//     console.warn(`Invalid scale for viewMode: ${viewMode}`);
//     return "#ccc";
//   }
  
//   const color = interpolateColor(value, min, max, scale);
//   //console.log("Value:", value, "Min:", min, "Max:", max, "Color:", color); // ตรวจสอบสีที่ได้
//   return color;
//   // return interpolateColor(value, min, max, scale);
// };


// // ฟังก์ชันคำนวณ Min และ Max ของข้อมูล
const calculateMinMax = (geoData, viewMode, value, selectedValue) => {
  if (!geoData || !geoData.features) return { min: 0, max: 1 }; // ค่าเริ่มต้นสำหรับ Heatmap
  
  const values = geoData.features
    .map((feature) =>
      viewMode === "TrendMap"
        ? feature.properties.slope_value
        : feature.properties[value]
    )
    .filter((val) => val !== undefined && val !== null);

  if (selectedValue === "pre" || selectedValue === "rx1day") {
    // สำหรับ Precipitation และ Rx1day
    const rawMax = Math.max(...values);
    return { min: 0, max: rawMax };  // Min = 0, Max = ค่าสูงสุด
  }

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  if (viewMode === "Heatmap") {
    return { min: rawMin, max: rawMax };
  }

  const range = Math.max(Math.abs(rawMin), Math.abs(rawMax));
  return { min: -range, max: range };
};


// // ฟังก์ชันกำหนดสไตล์
const style = (feature, selectedRegion, selectedProvince, viewMode, min, max, selectedValue) => {
  const dataValue = viewMode === "TrendMap"
    ? feature.properties.slope_value
    : feature.properties[selectedValue]; // ใช้ selectedValue เพื่อให้ตรงกับ getColor

  return {
    fillColor: getColor(dataValue || 0, viewMode, min, max, selectedValue), // เพิ่ม selectedValue
    weight: 0.5,
    opacity: 1,
    color: 'black',
    dashArray: '3',
    fillOpacity:
      (selectedRegion === 'All' || feature.properties.region === selectedRegion) &&
      (!selectedProvince || feature.properties.name === selectedProvince)
        ? 0.9
        : 0,
  };
};

// const style = (feature, selectedRegion, selectedProvince, viewMode, min, max, value) => {
//   //console.log('style called with:', { feature, selectedRegion, selectedProvince, viewMode, min, max, value });

//   const dataValue = viewMode === "TrendMap"
//     ? feature.properties.slope_value
//     : feature.properties[value];

//   const styleResult = {
//     fillColor: getColor(dataValue || 0, viewMode, min, max),
//     weight: 0.5,
//     opacity: 1,
//     color: 'black',
//     dashArray: '3',
//     fillOpacity:
//       (selectedRegion === 'All' || feature.properties.region === selectedRegion) &&
//       (!selectedProvince || feature.properties.name === selectedProvince)
//         ? 0.9
//         : 0,
//   };

//   //console.log('style result:', styleResult);
//   return styleResult;
// };


// ฟังก์ชันแสดงข้อมูลใน popup
const onEachFeature = (feature, layer, viewMode, value) => {
  const valueText = viewMode === "TrendMap"
    ? feature.properties.slope_value !== undefined && feature.properties.slope_value !== null
      ? feature.properties.slope_value.toFixed(2)
      : 'N/A'
    : feature.properties[value] !== undefined && feature.properties[value] !== null
      ? feature.properties[value].toFixed(2)
      : 'N/A';

  const label = viewMode === "TrendMap" ? "Slope Value" : value.charAt(0).toUpperCase() + value.slice(1);

  layer.bindPopup(
    `<b>Province:</b> ${feature.properties.name || 'Unknown'}<br/>
     <b>Region:</b> ${feature.properties.region || 'Unknown'}<br/>
     <b>${label}:</b> ${valueText}`
  );
};

const ColorBar = ({ viewMode, selectedValue, steps = 10, min, max }) => {
  const { turbo, coolwarm } = getColorScale(selectedValue);
  const colorScale = viewMode === "Heatmap" ? turbo : coolwarm;

  const stepSize = (max - min) / (steps - 1);
  const labels = Array.from({ length: steps }, (_, i) => (min + i * stepSize).toFixed(2));

  return (
    <div className="color-bar-horizontal">
      <div className="gradient-bar">
        {colorScale.map((scale, index) => (
          <div
            key={index}
            className="color-segment"
            style={{
              backgroundColor: scale[1],
              flex: 1,
            }}
          />
        ))}
      </div>
      <div className="labels">
        {labels.map((label, index) => (
          <span
            key={index}
            style={{
              position: "absolute",
              left: `${(index / (labels.length - 1)) * 100}%`,
              transform: "translateX(-50%)",
              fontSize: "17px",
            }}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="title">
        {viewMode === "Heatmap" ? "Data Values" : "Trend Values"}
      </div>
    </div>
  );
};

// const ColorBar = ({ viewMode, steps = 10, min, max }) => {
//   const colorScale = viewMode === "Heatmap" ? turboColor : coolwarmColor;

//   const stepSize = (max - min) / (steps - 1);
//   const labels = Array.from({ length: steps }, (_, i) => (min + i * stepSize).toFixed(2));

//   return (
//     <div className="color-bar-horizontal">
//       <div className="gradient-bar">
//         {colorScale.map((scale, index) => (
//           <div
//             key={index}
//             className="color-segment"
//             style={{
//               backgroundColor: scale[1],
//               flex: 1,
//             }}
//           />
//         ))}
//       </div>
//       <div className="labels">
//         {labels.map((label, index) => (
//           <span
//             key={index}
//             style={{
//               position: "absolute",
//               left: `${(index / (labels.length - 1)) * 100}%`,
//               transform: "translateX(-50%)",
//               fontSize: "17px",
//             }}
//           >
//             {label}
//           </span>
//         ))}
//       </div>
//       <div className="title">
//         {viewMode === "Heatmap" ? "Data Values" : "Trend Values"}
//       </div>
//     </div>
//   );
// };


const MapComponent = ({
  geoData,
  selectedRegion,
  selectedProvince,
  viewMode,
  value,
  legendMin,
  legendMax,
}) => {
  const { min, max } = calculateMinMax(geoData, viewMode, value);
  const finalMin = legendMin !== null ? legendMin : min;
  const finalMax = legendMax !== null ? legendMax : max;

  console.log("Legend Min:", finalMin, "Legend Max:", finalMax);

  const displayedGeoData =
    geoData && geoData.features
      ? geoData
      : { type: "FeatureCollection", features: [] };

  return (
    <div className="map-container">
      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={6}
        style={{ height: "1200px", width: "1150px" }}
      >
        <LayersControl position="topright">
          {/* Backgroud layer */}
          <LayersControl.Overlay checked name="Thailand Background">
            <GeoJSON
              data={mapbackgroud}
              style={() => ({
                fillColor: "#808080", 
                color: "#808080", 
                weight: 0.1,
                fillOpacity: 0.2, 
              })}
            />
          </LayersControl.Overlay>

          
          <LayersControl.Overlay
            checked
            name={viewMode === "TrendMap" ? "Slope Value Map" : "Heatmap"}
          >
            <GeoJSON
              data={displayedGeoData}
              style={(feature) =>
                style(feature, selectedRegion, selectedProvince, viewMode, finalMin, finalMax, value)
              }
              onEachFeature={(feature, layer) =>
                onEachFeature(feature, layer, viewMode, value)
              }
            />
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>

      <ColorBar
        viewMode={viewMode}
        selectedValue={value}
        min={finalMin}
        max={finalMax}
      />
    </div>
  );
};

export default MapComponent;

// const MapComponent = ({
//   geoData,
//   selectedRegion,
//   selectedProvince,
//   viewMode,
//   value,
//   legendMin,
//   legendMax,
// }) => {
//   const { min, max } = calculateMinMax(geoData, viewMode, value);
//   const finalMin = legendMin !== null ? legendMin : min;
//   const finalMax = legendMax !== null ? legendMax : max;

//   console.log("Legend Min:", finalMin, "Legend Max:", finalMax);

//   const displayedGeoData =
//     geoData && geoData.features
//       ? geoData
//       : { type: "FeatureCollection", features: [] };

//   return (
//     <div className="map-container">
//       <MapContainer
//         center={[13.7563, 100.5018]}
//         zoom={6}
//         style={{ height: "1200px", width: "1150px" }}
//       >
//         <LayersControl position="topright">
//           <LayersControl.Overlay
//             checked
//             name={viewMode === "TrendMap" ? "Slope Value Map" : "Heatmap"}
//           >
//             <GeoJSON
//               data={displayedGeoData}
//               style={(feature) =>
//                 style(feature, selectedRegion, selectedProvince, viewMode, finalMin, finalMax, value)
//               }
//               onEachFeature={(feature, layer) =>
//                 onEachFeature(feature, layer, viewMode, value)
//               }
//             />
//           </LayersControl.Overlay>
//         </LayersControl>
//       </MapContainer>

//       {/* ColorBar ที่อัปเดตโทนสีตาม selectedValue */}
//       <ColorBar
//         viewMode={viewMode}
//         selectedValue={value}
//         min={finalMin}
//         max={finalMax}
//       />
//     </div>
//   );
// };

// export default MapComponent;

