import React from 'react';
import { MapContainer,TileLayer, GeoJSON, LayersControl } from 'react-leaflet';

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

// ฟังก์ชันกำหนดสี
const getColor = (value, viewMode, min, max) => {
  const scale = viewMode === "Heatmap" ? turboColor : coolwarmColor;

  if (!scale || !Array.isArray(scale) || scale.length === 0) {
    console.warn(`Invalid scale for viewMode: ${viewMode}`);
    return "#ccc";
  }
  
  const color = interpolateColor(value, min, max, scale);
  //console.log("Value:", value, "Min:", min, "Max:", max, "Color:", color); // ตรวจสอบสีที่ได้
  return color;
  // return interpolateColor(value, min, max, scale);
};


// // ฟังก์ชันคำนวณ Min และ Max ของข้อมูล
const calculateMinMax = (geoData, viewMode, value) => {
  if (!geoData || !geoData.features) return { min: 0, max: 1 }; // ค่าเริ่มต้นสำหรับ Heatmap

  const values = geoData.features
    .map((feature) =>
      viewMode === "TrendMap" 
        ? feature.properties.slope_value 
        : feature.properties[value]
    )
    .filter((val) => val !== undefined && val !== null);

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  if (viewMode === "Heatmap") {
    return { min: rawMin, max: rawMax };
  }

  const range = Math.max(Math.abs(rawMin), Math.abs(rawMax));
  return { min: -range, max: range };
};

// // ฟังก์ชันกำหนดสไตล์
const style = (feature, selectedRegion, selectedProvince, viewMode, min, max, value) => {
  //console.log('style called with:', { feature, selectedRegion, selectedProvince, viewMode, min, max, value });

  const dataValue = viewMode === "TrendMap"
    ? feature.properties.slope_value
    : feature.properties[value];

  const styleResult = {
    fillColor: getColor(dataValue || 0, viewMode, min, max),
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

  //console.log('style result:', styleResult);
  return styleResult;
};


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

const ColorBar = ({ viewMode, steps = 10, min, max }) => {
  const colorScale = viewMode === "Heatmap" ? turboColor : coolwarmColor;

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
              fontSize: "12px",
            }}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="title">
        {viewMode === "Heatmap" ? "Heat Values" : "Slope Values"}
      </div>
    </div>
  );
};

const MapComponent = ({ geoData, selectedRegion, selectedProvince, viewMode, value }) => {
  // คำนวณ Min และ Max สำหรับการไล่ระดับสี
  const { min, max } = calculateMinMax(geoData, viewMode, value);

  // ตรวจสอบข้อมูล GeoJSON ก่อนแสดงผล
  const displayedGeoData =
    geoData && geoData.features
      ? geoData
      : { type: 'FeatureCollection', features: [] }; // ค่าเริ่มต้นถ้าไม่มีข้อมูล

          // Log ข้อมูล GeoJSON
  console.log("Current GeoJSON Data (heatmap/trend):", geoData);
  // console.log("ViewMode:", viewMode);
  // console.log("Selected Region:", selectedRegion);
  // console.log("Selected Province:", selectedProvince);
  // console.log("Value:", value);
  return (
    <div className="map-container">
      <MapContainer
  center={[13.7563, 100.5018]}
  zoom={6} // ใช้ค่า zoom เป็นทศนิยม
  style={{ height: "1200px", width: "1150px" }}
>
  <LayersControl position="topright">
    <LayersControl.Overlay checked name={viewMode === "TrendMap" ? "Slope Value Map" : "Heatmap"}>
      <GeoJSON
        data={displayedGeoData}
        style={(feature) => style(feature, selectedRegion, selectedProvince, viewMode, min, max, value)}
        onEachFeature={(feature, layer) => onEachFeature(feature, layer, viewMode, value)}
      />
    </LayersControl.Overlay>
  </LayersControl>
</MapContainer>
      <ColorBar viewMode={viewMode} min={min} max={max} />
    </div>
  );
};

export default MapComponent;




// const MapComponent = ({ geoData, selectedRegion, selectedProvince, viewMode, value }) => {
//   // คำนวณ Min และ Max สำหรับการไล่ระดับสี
//   const { min, max } = calculateMinMax(geoData, viewMode, value);

//   // ตรวจสอบข้อมูล GeoJSON ก่อนแสดงผล
//   const displayedGeoData =
//     geoData && geoData.features
//       ? geoData
//       : { type: 'FeatureCollection', features: [] }; // ค่าเริ่มต้นถ้าไม่มีข้อมูล

//   return (
//     <div className="map-container">
//       <MapContainer
//   center={[13.7563, 100.5018]}
//   zoom={6} // ใช้ค่า zoom เป็นทศนิยม
//   style={{ height: "1200px", width: "1150px" }}
// >
//   <LayersControl position="topright">
//     <LayersControl.Overlay checked name={viewMode === "TrendMap" ? "Slope Value Map" : "Heatmap"}>
//       <GeoJSON
//         data={displayedGeoData}
//         style={(feature) => style(feature, selectedRegion, selectedProvince, viewMode, min, max, value)}
//         onEachFeature={(feature, layer) => onEachFeature(feature, layer, viewMode, value)}
//       />
//     </LayersControl.Overlay>
//   </LayersControl>
// </MapContainer>
//       <ColorBar viewMode={viewMode} min={min} max={max} />
//     </div>
//   );
// };

// export default MapComponent;



// const calculateMinMax = (geoData, viewMode, value) => {
//   if (!geoData || !geoData.features) return { min: -1, max: 1 }; // ค่าเริ่มต้น
  
//   const values = geoData.features
//     .map((feature) =>
//       viewMode === "TrendMap" ? feature.properties.slope_value : feature.properties[value]
//     )
//     .filter(val => val !== undefined && val !== null); // กรองค่า null หรือ undefined

//   const min = Math.min(...values, -0.9); // เพิ่มช่วงค่าต่ำสุด
//   const max = Math.max(...values, 0.9); // เพิ่มช่วงค่าสูงสุด

//   return { min, max: min === max ? min + 0.01 : max }; // ป้องกัน min และ max เท่ากัน
// };

// const calculateMinMax = (geoData, viewMode, value) => {
//   if (!geoData || !geoData.features) return { min: 0, max: 1 }; // ค่าเริ่มต้น

//   const values = geoData.features
//     .map((feature) =>
//       viewMode === "TrendMap" ? feature.properties.slope_value : feature.properties[value]
//     )
//     .filter(val => val !== undefined && val !== null); // กรองค่า null หรือ undefined

//   if (values.length === 0) {
//     console.warn(`No valid values found for viewMode: ${viewMode}, value: ${value}`);
//     return { min: 0, max: 1 }; // ค่าเริ่มต้นหากไม่มีข้อมูลที่ใช้งานได้
//   }

//   const min = Math.min(...values);
//   const max = Math.max(...values);

//   return { min, max: min === max ? min + 0.01 : max }; // ป้องกัน min และ max เท่ากัน
// };



// ColorBar ปรับปรุงสำหรับ Turbo และ Coolwarm Gradient Bar
// ฟังก์ชันการแสดงผลของ ColorBar ที่ปรับปรุงให้เหมาะสม
// const ColorBar = ({ viewMode, min, max }) => {
//   const colorScale = viewMode === "Heatmap" ? turboColorScale : coolwarmColorScale;
//   const steps = colorScale.length;

//   const calculateValue = (index) => {
//     const ratio = index / (steps - 1);
//     // คำนวณค่าในช่วงที่เหมาะสมตาม min, max ที่ปรับแล้ว
//     return (ratio * (max - min) + min).toFixed(2);
//   };

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
//         {colorScale.map((scale, index) => (
//           <span
//             key={index}
//             style={{
//               position: "absolute",
//               left: `${(index / (steps - 1)) * 100}%`,
//               transform: "translateX(-50%)",
//               fontSize: "12px",
//             }}
//           >
//             {calculateValue(index)} {/* คำนวณค่าที่จะถูกแสดง */}
//           </span>
//         ))}
//       </div>
//       <div className="title">{viewMode === "Heatmap" ? "Heat Values" : "Trend Values"}</div>
//     </div>
//   );
// };

// const ColorBar = ({ viewMode, min, max }) => {
//   const colorScale = viewMode === "Heatmap" ? turboColorScale : coolwarmColorScale;
//   const steps = colorScale.length;

//   const calculateValue = (index) => {
//     const ratio = index / (steps - 1);
//     return (ratio * (max - min) + min).toFixed(2);
//   };

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
//         {colorScale.map((scale, index) => (
//           <span
//             key={index}
//             style={{
//               position: "absolute",
//               left: `${(index / (steps - 1)) * 100}%`,
//               transform: "translateX(-50%)",
//               fontSize: "12px",
//             }}
//           >
//             {calculateValue(index)}
//           </span>
//         ))}
//       </div>
//       <div className="title">{viewMode === "Heatmap" ? "Heat Values" : "Trend Values"}</div>
//     </div>
//   );
// };
// import React from 'react';
// import { MapContainer, GeoJSON, LayersControl } from 'react-leaflet';

// // ฟังก์ชันไล่ระดับสี Turbo สำหรับ Heatmap
// const turboColorScale = [
//   [0, "#000000"], [0.1, "#0020ff"], [0.2, "#0040ff"], [0.3, "#0080ff"],
//   [0.4, "#00c0ff"], [0.5, "#00ff80"], [0.6, "#00ff00"], [0.7, "#80ff00"],
//   [0.8, "#c0ff00"], [0.9, "#ffc000"], [1, "#ff0000"]
// ];

// // ฟังก์ชันไล่ระดับสี Coolwarm สำหรับ TrendMap
// const coolwarmColorScale = [
//   [-0.5, "#3b4cc0"], [-0.25, "#709ece"], [0, "#e8ebf7"], [0.25, "#edaf80"],
//   [0.5, "#b40426"]
// ];

// // ฟังก์ชันไล่ระดับสีที่ใช้ Turbo หรือ Coolwarm
// const interpolateColor = (value, min, max, scale) => {
//   const ratio = (value - min) / (max - min); // ปรับค่าให้อยู่ระหว่าง 0 ถึง 1
//   const index = Math.min(Math.max(ratio, 0), 1) * (scale.length - 1);
//   const color = scale[Math.floor(index)];
//   return color[1]; // ส่งคืนสีที่สอดคล้อง
// };

// // ฟังก์ชันกำหนดสี
// const getColor = (value, viewMode, min, max) => {
//   if (viewMode === "Heatmap") {
//     return interpolateColor(value, min, max, turboColorScale); // ใช้ Turbo สำหรับ Heatmap
//   } else if (viewMode === "TrendMap") {
//     return interpolateColor(value, min, max, coolwarmColorScale); // ใช้ Coolwarm สำหรับ TrendMap
//   }
//   return '#ccc'; // Default color
// };

// // ฟังก์ชันคำนวณ Min และ Max ของข้อมูล
// const calculateMinMax = (geoData, viewMode) => {
//   if (!geoData || !geoData.features) return { min: 0, max: 1 }; // ค่าเริ่มต้น
//   const values = geoData.features.map((feature) =>
//     viewMode === "TrendMap"
//       ? feature.properties.slope_value
//       : feature.properties.temperature
//   );
//   return { min: Math.min(...values), max: Math.max(...values) };
// };

// // ฟังก์ชันกำหนดสไตล์
// const style = (feature, selectedRegion, selectedProvince, viewMode, min, max) => ({
//   fillColor: getColor(
//     viewMode === "TrendMap" ? feature.properties.slope_value : feature.properties.temperature,
//     viewMode,
//     min,
//     max
//   ),
//   weight: 0.5,
//   opacity: 1,
//   color: 'black',
//   dashArray: '3',
//   fillOpacity:
//     (selectedRegion === 'All' || feature.properties.region === selectedRegion) &&
//     (!selectedProvince || feature.properties.name === selectedProvince)
//       ? 0.9
//       : 0,
// });

// // ฟังก์ชันแสดงข้อมูลใน popup
// const onEachFeature = (feature, layer, viewMode) => {
//   const value =
//     viewMode === "TrendMap"
//       ? feature.properties.slope_value.toFixed(2)
//       : feature.properties.temperature.toFixed(2);
//   const label =
//     viewMode === "TrendMap" ? "Slope Value" : "Temperature";
//   layer.bindPopup(
//     `<b>Province:</b> ${feature.properties.name}<br/>
//      <b>Region:</b> ${feature.properties.region}<br/>
//      <b>${label}:</b> ${value}`
//   );
// };

// // ColorBar ปรับปรุงสำหรับ Turbo และ Coolwarm Gradient Bar
// const ColorBar = ({ viewMode, min, max }) => {
//   const gradientStyle =
//     viewMode === "Heatmap"
//       ? `linear-gradient(to right, ${turboColorScale.map((scale) => scale[1]).join(', ')})`
//       : `linear-gradient(to right, ${coolwarmColorScale.map((scale) => scale[1]).join(', ')})`;

//   return (
//     <div className="color-bar-horizontal">
//       <div
//         className="gradient-bar"
//         style={{ background: gradientStyle }}
//       />
//       <div className="labels">
//         <span>{min.toFixed(2)}</span>
//         <span>{max.toFixed(2)}</span>
//       </div>
//     </div>
//   );
// };

// const MapComponent = ({ geoData, selectedRegion, selectedProvince, viewMode }) => {
//   // คำนวณ Min และ Max สำหรับการไล่ระดับสี
//   const { min, max } = calculateMinMax(geoData, viewMode);

//   // ตรวจสอบข้อมูล GeoJSON ก่อนแสดงผล
//   const displayedGeoData =
//     geoData && geoData.features
//       ? geoData
//       : { type: 'FeatureCollection', features: [] }; // ค่าเริ่มต้นถ้าไม่มีข้อมูล

//   return (
//     <div className="map-container">
//       <MapContainer center={[13.7563, 100.5018]} zoom={5} style={{ height: "1000px", width: "800px" }}>
//         <LayersControl position="topright">
//           <LayersControl.Overlay checked name={viewMode === "TrendMap" ? "Slope Value Map" : "Heatmap"}>
//             <GeoJSON
//               data={displayedGeoData}
//               style={(feature) => style(feature, selectedRegion, selectedProvince, viewMode, min, max)}
//               onEachFeature={(feature, layer) => onEachFeature(feature, layer, viewMode)}
//             />
//           </LayersControl.Overlay>
//         </LayersControl>
//       </MapContainer>
//       <ColorBar viewMode={viewMode} min={min} max={max} />
//     </div>
//   );
// };

// export default MapComponent;





// const MapComponent = ({ trendGeoData, selectedRegion, selectedProvince }) => {
//   // ตรวจสอบข้อมูล GeoJSON ก่อนแสดงผล
//   const displayedGeoData = 
//     trendGeoData && trendGeoData.features
//       ? trendGeoData
//       : { type: 'FeatureCollection', features: [] }; // ค่าเริ่มต้นถ้าไม่มีข้อมูล

//   return (
//     <div className="map-container">
//       <MapContainer center={[13.7563, 100.5018]} zoom={5} style={{ height: "1000px", width: "800px" }}>
//         <LayersControl position="topright">
//           <LayersControl.Overlay checked name="Slope Value Map">
//             <GeoJSON
//               data={displayedGeoData}
//               style={(feature) => style(feature, selectedRegion, selectedProvince)}
//               onEachFeature={onEachFeature}
//             />
//           </LayersControl.Overlay>
//         </LayersControl>
//       </MapContainer>
//       <ColorBar />
//     </div>
//   );
// };





