import React from 'react';
import { MapContainer,TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import mapbackgroud from "./Geo-data/thailand-Geo.json";
import colormap from 'colormap';

// ฟังก์ชันไล่ระดับสี real value สำหรับ Choroplet map
const tempColor = [
  [0, "#FFFFCC"],   // สีเหลืองอ่อนสุดๆ สำหรับอุณหภูมิต่ำสุด
  [0.1, "#FFF2AE"], // สีเหลืองอ่อน
  [0.2, "#FFE680"], // สีเหลืองอ่อน
  [0.3, "#FFD966"], // สีเหลือง
  [0.4, "#FFCC4D"], // สีเหลือง
  [0.5, "#FFB84D"], // สีส้มอ่อน
  [0.6, "#FFA64D"], // สีส้มอ่อน
  [0.7, "#FF8C4D"], // สีส้ม
  [0.8, "#FF704D"], // สีส้ม
  [0.9, "#FF4D4D"], // สีแดงอ่อน
  [1, "#E31A1C"]
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

// const rain_Color = [
//   [1, "#00008B"],   // สีน้ำเงินเข้ม สำหรับปริมาณน้ำฝนสูงสุด
//   [0.9, "#0000CD"], // สีน้ำเงิน
//   [0.8, "#1E90FF"], // สีฟ้าเข้ม
//   [0.7, "#00BFFF"], // สีฟ้า
//   [0.6, "#87CEEB"], // สีฟ้าอ่อน
//   [0.5, "#ADD8E6"], // สีฟ้าอ่อนมาก
//   [0.4, "#B0E0E6"], // สีฟ้าอ่อนมาก
//   [0.3, "#AFEEEE"], // สีฟ้าอ่อนอมเขียว
//   [0.2, "#E0FFFF"], // สีฟ้าอ่อนสุดๆ
//   [0.1, "#F0FFFF"], // สีฟ้าอ่อนสุดๆ
//   [0, "#FFFFFF"] 
// ];

const rain_Color = [
  [0, "#f7fcf0"],   
  [0.1, "#e0f3db"], 
  [0.2, "#ccebc5"], 
  [0.3, "#a8ddb5"], 
  [0.4, "#7bccc4"], 
  [0.5, "#4eb3d3"], 
  [0.6, "#2b8cbe"], 
  [0.7, "#0868ac"], 
  [0.8, "#084081"], 
  [0.9, "#062b61"], 
  [1, "#041e42"]    
];



// ฟังก์ชันไล่ระดับสี Coolwarm สำหรับ TrendMap



// ฟังก์ชันไล่ระดับสีที่ใช้ real value หรือ Coolwarm


// const interpolateColor = (value, min, max, scale) => {
//   if (value === undefined || value === null) return "#ccc";
//   if (min === max) return scale[0]?.[1] || "#ccc";

//   // จำกัดค่า value ให้อยู่ในช่วง min และ max
//   const clampedValue = Math.max(min, Math.min(max, value));

//   // Normalize value into a 0-1 range
//   const ratio = (clampedValue - min) / (max - min);
//   const clampedRatio = Math.max(0, Math.min(1, ratio));

//   // Find two closest scale points
//   const scaledIndex = clampedRatio * (scale.length - 1); // คำนวณตำแหน่งของสี
//   const lowerIndex = Math.floor(scaledIndex);              // หา index ของสีที่ต่ำกว่า
//   const upperIndex = Math.min(lowerIndex + 1, scale.length - 1); // หา index ของสีที่สูงกว่า
//   const t = scaledIndex - lowerIndex;   // ระยะห่างระหว่างสีที่ต่ำกว่าและสูงกว่า

//   if (!scale[lowerIndex] || !scale[upperIndex]) {
//     console.warn("Color scale index out of bounds", { lowerIndex, upperIndex, scale });
//     return "#ccc";
//   }

//   const lowerColor = scale[lowerIndex][1];
//   const upperColor = scale[upperIndex][1];

//   const interpolateRgb = (color1, color2, t) => {
//     const [r1, g1, b1] = color1.match(/\w\w/g).map((c) => parseInt(c, 16));
//     const [r2, g2, b2] = color2.match(/\w\w/g).map((c) => parseInt(c, 16));

//     const r = Math.round(r1 + t * (r2 - r1));
//     const g = Math.round(g1 + t * (g2 - g1));
//     const b = Math.round(b1 + t * (b2 - b1));

//     return `rgb(${r}, ${g}, ${b})`;
//   };

//   // Interpolate between the two colors
//   return interpolateRgb(lowerColor, upperColor, t);
// };

const interpolateColor = (value, min, max, scale) => {
  if (value === undefined || value === null) return "#ccc";
  if (min === max) return scale[0]?.[1] || "#ccc";

  const clampedValue = Math.max(min, Math.min(max, value));
  const ratio = (clampedValue - min) / (max - min);
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  const scaledIndex = clampedRatio * (scale.length - 1);
  const lowerIndex = Math.floor(scaledIndex);
  const upperIndex = Math.min(lowerIndex + 1, scale.length - 1);
  const t = scaledIndex - lowerIndex;

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

  return interpolateRgb(lowerColor, upperColor, t);
};


const getColorScale = (selectedValue, viewMode) => {
  const isPrecipitation = ["pre", "rx1day"].includes(selectedValue);
  const isTemperature = ["Temperature Mean", "Temperature Min", "Temperature Max", "TXx", "Tnn"].includes(selectedValue);

  if (viewMode === "TrendMap") {
    return {
      temp_color: isPrecipitation ? coolwarmColor_reverse : coolwarmColor,
      coolwarm: isPrecipitation ? coolwarmColor_reverse : coolwarmColor,
    };
  }

  // ใช้ colormap สำหรับ Heatmap และ Choropleth
  const colormapName = isPrecipitation ? "velocity-blue" : "blackbody";
  let colormapScale = colormap({
    colormap: colormapName,
    nshades: 20,
    format: "hex",
    alpha: 1,
  }).map((color, i) => [i / 19, color]);

  // ✅ Reverse สีถ้าเป็น Temperature เพื่อให้ "แดง" อยู่ที่ค่ามาก
  colormapScale.reverse()

  return {
    temp_color: colormapScale,
    coolwarm: colormapScale,
  };
};


// const getColorScale = (selectedValue) => {
//   if (selectedValue === "pre" || selectedValue === "rx1day") {
//     return {
//       temp_color: rain_Color,
//       coolwarm: coolwarmColor_reverse
//     };
//   }
//   return { temp_color: tempColor, coolwarm: coolwarmColor };
// };

const getColor = (value, viewMode, min, max, selectedValue) => {
  const { temp_color, coolwarm } = getColorScale(selectedValue, viewMode);
  const scale = viewMode === "Heatmap"  ? temp_color : coolwarm;

  if (!scale || !Array.isArray(scale) || scale.length === 0) {
    console.warn(`Invalid scale for viewMode: ${viewMode}`);
    return "#ccc";
  }

  return interpolateColor(value, min, max, scale);
};


// const getColor = (value, viewMode, min, max, selectedValue) => {
//   const isReverse = selectedValue === "pre" || selectedValue === "rx1day";
  
//   const temp_color = isReverse ? rain_Color : tempColor;
//   const coolwarm = isReverse ? coolwarmColor_reverse : coolwarmColor;
  
//   const scale = viewMode === "Heatmap" ? temp_color : coolwarm;

//   if (!scale || !Array.isArray(scale) || scale.length === 0) {
//     console.warn(`Invalid scale for viewMode: ${viewMode}`);
//     return "#ccc";
//   }

//   return interpolateColor(value, min, max, scale);
// };

// // ฟังก์ชันคำนวณ Min และ Max ของข้อมูล
// const calculateMinMax = (geoData, viewMode, value) => {
//   if (!geoData || !geoData.features) return { min: 0, max: 1 };
  
//   const values = geoData.features
//     .map((feature) => viewMode === "TrendMap" ? feature.properties.slope_value : feature.properties[value])
//     .filter((val) => val !== undefined && val !== null);

//   return {
//     min: Math.min(...values),
//     max: Math.max(...values)
//   };
// };

// const roundToStep = (value, step) => Math.round(value / step) * step;

const calculateMinMax = (geoData, viewMode, value) => {
  if (!geoData || !geoData.features) return { min: 10, max: 50 };

  const values = geoData.features
    .map((feature) => 
      viewMode === "TrendMap"
        ? feature.properties.slope_value
        : feature.properties[value]
    )
    .filter((val) => val !== undefined && val !== null && !isNaN(val));

  if (values.length === 0) return { min: 10, max: 50 };

  let min = Math.min(...values);
  let max = Math.max(...values);

  if (viewMode === "TrendMap") {
    const range = Math.max(Math.abs(min), Math.abs(max));
    return { min: -range, max: range };
  }

  
  if (["temperature", "tmin", "tmax", "txx", "tnn"].includes(value)) {
    return { min: 10, max: 50 };
  } 
  if (["pre", "rx1day"].includes(value)) {
    return { min: 10, max: 300 };
  }

  return { min, max };
};


const style = (feature, selectedRegion, selectedProvince, viewMode, min, max, selectedValue) => {
  const dataValue = viewMode === "TrendMap"
    ? feature.properties.slope_value
    : feature.properties[selectedValue];

  return {
    fillColor: getColor(dataValue || 0, viewMode, min, max, selectedValue),
    weight: 0.3,
    opacity: 1,
    color: "black",
    dashArray: "0",
    fillOpacity:
      (selectedRegion === "Thailand" || feature.properties.region === selectedRegion) &&
      (!selectedProvince || feature.properties.name === selectedProvince)
        ? 0.9
        : 0,
  };
};

// const style = (feature, selectedRegion, selectedProvince, viewMode, min, max, selectedValue) => {
//   const dataValue = viewMode === "TrendMap"
//     ? feature.properties.slope_value
//     : feature.properties[selectedValue]; // ใช้ selectedValue เพื่อให้ตรงกับ getColor

//   return {
//     fillColor: getColor(dataValue || 0, viewMode, min, max, selectedValue), // เพิ่ม selectedValue
//     weight: 0.3,
//     opacity: 1,
//     color: 'black',
//     dashArray: '0',
//     fillOpacity:
//       (selectedRegion === 'Thailand' || feature.properties.region === selectedRegion) &&
//       (!selectedProvince || feature.properties.name === selectedProvince)
//         ? 0.9
//         : 0,
//   };
// };


// ฟังก์ชันแสดงข้อมูลใน popup
// const onEachFeature = (feature, layer, viewMode, value) => {
//   const valueText = feature.properties[value] !== undefined && feature.properties[value] !== null
//     ? feature.properties[value].toFixed(2) : 'N/A';

//   layer.bindPopup(
//     `<b>Province:</b> ${feature.properties.name || 'Unknown'}<br/>
//      <b>Region:</b> ${feature.properties.region || 'Unknown'}<br/>
//      <b>Value:</b> ${valueText}`
//   );
// };
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




// const formatLabel = (value) => {
//   return value % 1 === 0 ? value.toFixed(1) : value.toFixed(2);
// };

// const ColorBar = ({ viewMode, selectedValue, min, max }) => {
//   const { temp_color, coolwarm } = getColorScale(selectedValue, viewMode);

//   const colorScale = viewMode === "Heatmap" ? temp_color : coolwarm;

//   if (!colorScale || !Array.isArray(colorScale)) {
//     console.warn("Invalid colorScale in ColorBar", { colorScale, viewMode, selectedValue });
//     return null;
//   }

//   const formatLabel = (value) => {
//     return value % 1 === 0 ? value.toFixed(1) : value.toFixed(2);
//   };

//   const labels = Array.from({ length: 12 }, (_, i) => {
//     const value = min + (i / 9) * (max - min);
//     return formatLabel(value);
//   });

//   const numBlocks = colorScale.length;

//   return (
//     <div className={`color-bar-container ${viewMode.toLowerCase()}`}>
//       <div className="color-bar-title">
//         {viewMode === "Heatmap" ? "Variable Value" : "Trend Value"}
//       </div>

//       {viewMode === "Heatmap" ? (
//         // Colorbar แบบไล่สีต่อเนื่อง
//         <div className="gradient-bar">
//           {colorScale.map(([_, color], index) => (
//             <div
//               key={index}
//               className="color-segment"
//               style={{
//                 backgroundColor: color,
//                 width: `${100 / numBlocks}%`, // กำหนดความกว้างให้มีความยาวตามจำนวนบล็อก
//                 height: "20px",
//               }}
//             />
//           ))}
//         </div>
//       ) : (
//         // Colorbar แบบบล็อก (Trendmap)
//         <div className="gradient-bar">
//           {colorScale.map(([_, color], index) => (
//             <div
//               key={index}
//               className="color-segment"
//               style={{
//                 backgroundColor: color,
//                 flex: 1,
//               }}
//             />
//           ))}
//         </div>
//       )}

//       {/* แสดง label ตามจำนวนบล็อก */}
//       <div className="labels">
//         {labels.map((label, index) => (
//           <span
//             key={index}
//             style={{
//               position: "absolute",
//               left: `${(index / (labels.length - 1)) * 100}%`,
//               transform: "translateX(-50%)",
//               fontSize: "11px",
//             }}
//           >
//             {label}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// };

const HeatmapBar = ({ selectedValue, min, max }) => {
  const { temp_color } = getColorScale(selectedValue, "Heatmap");

  if (!temp_color || !Array.isArray(temp_color)) {
    console.warn("Invalid colorScale in HeatmapBar", { temp_color });
    return null;
  }

  // ฟังก์ชันจัดรูปแบบตัวเลขให้เป็นเลขกลมๆ หรือ 0.5
  const roundLabel = (value) => {
    if (["pre", "rx1day"].includes(selectedValue)) {
      return Math.round(value); // ปริมาณน้ำฝนให้แสดงเลขเต็ม
    }
    return Math.round(value); // อุณหภูมิให้แสดงเป็น .0 หรือ .5
  };

  const labels = Array.from({ length: 12 }, (_, i) => roundLabel(min + (i / 11) * (max - min)));
  const numBlocks = temp_color.length;

  return (
    <div className="color-bar-container heatmap">
      <div className="color-bar-title">Actual Value</div>
      <div className="gradient-bar">
        {temp_color.map(([_, color], index) => (
          <div
            key={index}
            className="color-segment"
            style={{
              backgroundColor: color,
              width: `${100 / numBlocks}%`,
              height: "20px",
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
              fontSize: "11px",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};




const TrendmapBar = ({ selectedValue, min, max, steps = 11 }) => {
  const { coolwarm } = getColorScale(selectedValue, "TrendMap");

  if (!coolwarm || !Array.isArray(coolwarm)) {
    console.warn("Invalid colorScale in TrendmapBar", { coolwarm });
    return null;
  }

  const stepSize = (max - min) / (steps - 1);
  const midIndex = Math.floor(steps / 2);

  // ใช้ coolwarm.length เพื่อให้ tick marks ตรงกับขอบสี
  const labels = Array.from({ length: coolwarm.length }, (_, i) => {
    const value = min + i * stepSize;
    return {
      label: i === midIndex ? "0" : value.toFixed(2),
      position: (i / (coolwarm.length - 1)) * 100, // ตำแหน่งต้องสัมพันธ์กับ coolwarm.length
    };
  });

  return (
    <div className="color-bar-container trendmap">
      <div className="color-bar-title">Trend Value</div>

      {/* Gradient Bar */}
      <div className="gradient-bar">
        {coolwarm.map(([_, color], index) => (
          <div
            key={index}
            className="color-segment"
            style={{
              backgroundColor: color,
              flex: 1,
            }}
          />
        ))}
      </div>

      {/* Tick Marks - ใช้ coolwarm.length เพื่อให้ตรงกับขอบสี */}
      <div className="tick-marks">
        {Array.from({ length: coolwarm.length + 1 }, (_, index) => {
          const position = (index / (coolwarm.length - 1)) * 100;
          return (
            <div
              key={index}
              className="tick-mark"
              style={{
                position: "absolute",
                left: `${position}%`,
                transform: "translateX(-50%)",
                height: "8px",
                width: "1px",
                backgroundColor: "black",
              }}
            />
          );
        })}
        
      </div>

      {/* Labels */}
      <div className="labels">
        {labels.map(({ label, position }, index) => (
          <span
            key={index}
            style={{
              position: "absolute",
              left: `${position}%`,
              transform: "translateX(-50%)",
              fontSize: "10px",
              marginTop: "12px",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};





const MapComponent = ({
  geoData,
  selectedRegion,
  selectedProvince,
  viewMode,
  value,
  legendMin,
  legendMax,
  trendMin,
  trendMax,
  labelRegion,
  labelProvince
}) => {
  const { min: calculatedMin, max: calculatedMax } = calculateMinMax(geoData, viewMode, value);

  // ใช้ค่า legendMin และ legendMax จาก Actual และ Trend
  const defaultMin = viewMode === "TrendMap" 
    ? (trendMin ?? calculatedMin) 
    : (legendMin ?? calculatedMin);

  const defaultMax = viewMode === "TrendMap" 
    ? (trendMax ?? calculatedMax) 
    : (legendMax ?? calculatedMax);


  console.log("Legend Min:", defaultMin, "Legend Max:", defaultMax);

  const displayedGeoData = geoData?.features ? geoData : { type: "FeatureCollection", features: [] };

  return (
    <div className="map-box">
      <label className="area-head-map">
        {selectedRegion === "Thailand"
          ? "Thailand"
          : labelProvince
          ? labelProvince.replace(/_/g, " ")
          : labelRegion.replace(/_/g, " ")}
      </label>

      <div className="map-container">
        <MapContainer center={[13.7563, 100.5018]} zoom={6} style={{ height: "750px", width: "600px" }}>
          <LayersControl position="topright">
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

            <LayersControl.Overlay checked name={viewMode === "TrendMap" ? "Slope Value Map" : "Heatmap"}>
              <GeoJSON
                data={displayedGeoData}
                style={(feature) => style(feature, selectedRegion, selectedProvince, viewMode, defaultMin, defaultMax, value)}
                onEachFeature={(feature, layer) => onEachFeature(feature, layer, viewMode, value)}
              />
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>

      {/* ใช้ ColorBar ที่เหมาะสม */}
      {viewMode === "Heatmap" ? (
        <HeatmapBar selectedValue={value} min={defaultMin} max={defaultMax} />
      ) : (
        <TrendmapBar selectedValue={value} min={defaultMin} max={defaultMax} />
      )}
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
//   legendMin = 10,
//   legendMax = 50,
//   labelRegion,
//   labelProvince
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
//     <div className="map-box">
//       <label className="area-head-map">
//         {selectedRegion === "Thailand"
//           ? "Thailand"
//           : labelProvince
//           ? labelProvince.replace(/_/g, " ")
//           : labelRegion.replace(/_/g, " ")}
//       </label>

//       <div className="map-container">
//         <MapContainer center={[13.7563, 100.5018]} zoom={6} style={{ height: "750px", width: "600px" }}>
//           <LayersControl position="topright">
//             <LayersControl.Overlay checked name="Thailand Background">
//               <GeoJSON
//                 data={mapbackgroud}
//                 style={() => ({
//                   fillColor: "#808080",
//                   color: "#808080",
//                   weight: 0.1,
//                   fillOpacity: 0.2,
//                 })}
//               />
//             </LayersControl.Overlay>

//             <LayersControl.Overlay checked name={viewMode === "TrendMap" ? "Slope Value Map" : "Heatmap"}>
//               <GeoJSON
//                 data={displayedGeoData}
//                 style={(feature) => style(feature, selectedRegion, selectedProvince, viewMode, finalMin, finalMax, value)}
//                 onEachFeature={(feature, layer) => onEachFeature(feature, layer, viewMode, value)}
//               />
//             </LayersControl.Overlay>
//           </LayersControl>
//         </MapContainer>
//       </div>

//       {/* ใช้ ColorBar ที่เหมาะสม */}
//       {viewMode === "Heatmap" ? (
//         <HeatmapBar selectedValue={value} min={finalMin} max={finalMax} />
//       ) : (
//         <TrendmapBar selectedValue={value} min={finalMin} max={finalMax} />
//       )}
//     </div>
//   );
// };

// export default MapComponent;


// const MapComponent = ({
//   geoData,
//   selectedRegion,
//   selectedProvince,
//   viewMode,
//   value,
//   legendMin,
//   legendMax,
//   labelRegion,
//   labelProvince
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
//     <div className='map-box'> 

//       <label className='area-head-map'>
//   {selectedRegion === "Thailand"
//     ? "Thailand"
//     : labelProvince
//     ? labelProvince.replace(/_/g, " ")
//     : labelRegion.replace(/_/g, " ")}
// </label>


//     <div className="map-container">
//       <MapContainer
//         center={[13.7563, 100.5018]}
//         zoom={6}
//         style={{ height: "750px", width: "600px" }}
//       >
//         <LayersControl position="topright">
//           {/* Backgroud layer */}
//           <LayersControl.Overlay checked name="Thailand Background">
//             <GeoJSON
//               data={mapbackgroud}
//               style={() => ({
//                 fillColor: "#808080", 
//                 color: "#808080", 
//                 weight: 0.1,
//                 fillOpacity: 0.2, 
//               })}
//             />
//           </LayersControl.Overlay>

          
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
//       </div>
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

