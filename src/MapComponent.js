import React from 'react';
import { MapContainer,TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import mapbackgroud from "./Geo-data/thailand-Geo.json";
import colormap from 'colormap';

// ฟังก์ชันไล่ระดับสี real value สำหรับ Choroplet map


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

const getColorScale = (selectedValue, viewMode, toneColor = "velocity-blue", isReversed = false) => {
  const isPrecipitation = ["pre", "rx1day", "rx3day"].includes(selectedValue);
  const isTemperature = ["Temperature Mean", "Temperature Min", "Temperature Max", "TXx", "Tnn"].includes(selectedValue);

  if (viewMode === "TrendMap") {
    return {
      temp_color: isPrecipitation ? coolwarmColor_reverse : coolwarmColor,
      coolwarm: isPrecipitation ? coolwarmColor_reverse : coolwarmColor,
    };
  }

  const colormapName = toneColor; 
  let colormapScale = colormap({
    colormap: colormapName,
    nshades: 20,
    format: "hex",
    alpha: 1,
  }).map((color, i) => [i / 19, color]);

  // ตรวจสอบว่า reverse หรือไม่
  if (isReversed) {
    colormapScale.reverse();
  }

  return {
    temp_color: colormapScale,
    coolwarm: colormapScale,
  };
};


const getColor = (value, viewMode, min, max, selectedValue, selectedToneColor, isReversed = false) => {
  const { temp_color, coolwarm } = getColorScale(selectedValue, viewMode, selectedToneColor, isReversed);
  const scale = viewMode === "Heatmap" ? temp_color : coolwarm;

  if (!scale || !Array.isArray(scale) || scale.length === 0) {
    console.warn(`Invalid scale for viewMode: ${viewMode}`);
    return "#ccc";
  }

  return interpolateColor(value, min, max, scale);
};

const calculateMinMax = (geoData, viewMode, value) => {
  if (!geoData || !geoData.features) return { min: 10, max: 50 };

  const values = geoData.features
  .map((feature, index) => {
    const val = viewMode === "TrendMap"
      ? feature.properties.slope_value
      : feature.properties[value];

    // 🔍 Debug log: ดูว่า value ที่เรียกมีอยู่จริงไหม
    console.log(`[Feature ${index}] ${viewMode} | value key = "${value}" | val =`, val);

    return val;
  })
    .filter((val) => val !== undefined && val !== null && !isNaN(val));

    

  if (values.length === 0) return { min: 10, max: 50 };

  

  let min = Math.min(...values);
  let max = Math.max(...values);

  if (viewMode === "TrendMap") {
    const range = Math.max(Math.abs(min), Math.abs(max));
    return { min: -range, max: range }; // ยังเก็บ logic นี้ไว้สำหรับ trend
  }

  

  return { min, max }; // 
};

// const calculateMinMax = (geoData, viewMode, value) => {
//   if (!geoData || !geoData.features) return { min: 10, max: 50 };

//   const values = geoData.features
//     .map((feature) => 
//       viewMode === "TrendMap"
//         ? feature.properties.slope_value
//         : feature.properties[value]
//     )
//     .filter((val) => val !== undefined && val !== null && !isNaN(val));

//   if (values.length === 0) return { min: 10, max: 50 };

//   let min = Math.min(...values);
//   let max = Math.max(...values);

//   if (viewMode === "TrendMap") {
//     const range = Math.max(Math.abs(min), Math.abs(max));
//     return { min: -range, max: range };
//   }

  
//   if (["temperature", "tmin", "tmax", "txx", "tnn"].includes(value)) {
//     return { min: 10, max: 50 };
//   } 
//   if (["pre", "rx1day"].includes(value)) {
//     return { min: 10, max: 300 };
//   }

//   return { min, max };
// };


const style = (feature, selectedRegion, selectedProvince, viewMode, min, max, selectedValue, selectedToneColor, isReversed) => {
  const dataValue = viewMode === "TrendMap"
    ? feature.properties.slope_value
    : feature.properties[selectedValue];

  const { temp_color, coolwarm } = getColorScale(selectedValue, viewMode, selectedToneColor, isReversed);

  return {
    fillColor: getColor(dataValue || 0, viewMode, min, max, selectedValue, selectedToneColor, isReversed),
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


const HeatmapBar = ({ selectedValue, min, max, selectedToneColor, isReversed , numberOfYears}) => {
  const { temp_color } = getColorScale(selectedValue, "Heatmap", selectedToneColor, isReversed);

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

  // กำหนดหน่วยตาม selectedValue
  const unit = ["temperature", "tmin", "tmax", "txx", "tnn"].includes(selectedValue) ? "°C" : "mm";
  const title = `Actual Value (${unit}${numberOfYears ? ` / ${numberOfYears} year` : ""})`;

  return (
    <div className="color-bar-container heatmap">
      <div className="color-bar-title">
        {title}
      </div>
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



const TrendmapBar = ({ selectedValue, min, max, steps = 11, spacingFactor = 1.111, numberOfYears }) => {
  const { coolwarm } = getColorScale(selectedValue, "TrendMap");

  if (!coolwarm || !Array.isArray(coolwarm)) {
    console.warn("Invalid colorScale in TrendmapBar", { coolwarm });
    return null;
  }

  // ขยายขอบเขตเล็กน้อย
  const stepSize = (max - min) / (steps - 3); 
  const newMin = min - stepSize; 
  const newMax = max + stepSize; 

  // สร้าง labels ให้ตรงกับ tick marks
  const labels = Array.from({ length: steps }, (_, i) => {
    const value = newMin + i * stepSize;
    return {
      label: i === Math.floor(steps / 2) ? "0" : value.toFixed(2), // ให้ 0 อยู่ตรงกลาง
      position: (i / (steps - 1)) * 100, // ใช้ steps ในการกำหนดตำแหน่ง
    };
  });

  // สร้างตำแหน่งของ tick marks โดยให้หัวและท้ายติดขอบ
  const tickMarksPositions = Array.from({ length: steps }, (_, i) => {
    if (i === 0) return 0; // ตำแหน่งของ tick mark ที่แรก (ซ้ายสุด)
    if (i === steps - 1) return 111; // ตำแหน่งของ tick mark ที่สุดท้าย (ขวาสุด)

    // คำนวณตำแหน่งที่เหลือของ tick marks
    const basePosition = (i / (steps - 1)) * 100;
    return basePosition * spacingFactor;  
  });

  // กำหนดหน่วยตาม selectedValue
  const unit = ["temperature", "tmin", "tmax", "txx", "tnn"].includes(selectedValue) ? "°C" : "mm";
  const trendTitle = `Trend Values (${unit}${numberOfYears ? ` / ${numberOfYears} year` : ""})`;

  return (
    <div className="color-bar-container trendmap">
      <div className="color-bar-title">{trendTitle}</div>  {/* แสดง title ที่ปรับปรุงแล้ว */}

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

      {/* Tick Marks - ปรับระยะห่างตาม spacingFactor */}
      <div className="tick-marks">
        {tickMarksPositions.map((position, index) => (
          <div
            key={index}
            className="tick-mark"
            style={{
              position: "absolute",
              left: `${Math.min(position, 160)}%`,  // ป้องกันไม่ให้ตำแหน่งเกิน 100%
              transform: `translateX(-50%)`,
              height: "8px",
              width: "1px",
              backgroundColor: "black",
            }}
          />
        ))}
      </div>

      {/* Labels - ให้ตรงกับ tick marks และไม่มีค่าซ้ำกัน */}
      <div className="labels">
        {labels.map(({ label, position }, index) => (
          <span
            key={index}
            style={{
              position: "absolute",
              left: `${tickMarksPositions[index]}%`,
              transform: `translateX(-30%)`,
              fontSize: "10px",
              marginTop: "16px", 
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
  labelProvince,
  selectedYearStart,
  selectedYearEnd,
  selectedToneColor,
  setSelectedToneColor,
  toneColors,
  isReversed,  
  numberOfYears,
}) => {
  const { min: calculatedMin, max: calculatedMax } = calculateMinMax(geoData, viewMode, value);
  
  // Use the values of legendMin and legendMax from Actual and Trend
  const defaultMin = viewMode === "TrendMap" 
    ? (trendMin ?? calculatedMin) 
    : (legendMin ?? calculatedMin);

  const defaultMax = viewMode === "TrendMap" 
    ? (trendMax ?? calculatedMax) 
    : (legendMax ?? calculatedMax);

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
                style={(feature) => style(feature, selectedRegion, selectedProvince, 
                  viewMode, defaultMin, defaultMax, value, selectedToneColor, isReversed)}  // Pass isReversed here
                onEachFeature={(feature, layer) => onEachFeature(feature, layer, viewMode, value)}
              />
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>

      {/* Use the appropriate color bar */}
      {viewMode === "Heatmap" ? (
        <HeatmapBar selectedValue={value} min={defaultMin} max={defaultMax} selectedToneColor={selectedToneColor} isReversed={isReversed} numberOfYears={numberOfYears}/>  // Pass isReversed here
      ) : (
        <TrendmapBar selectedValue={value} min={defaultMin} max={defaultMax} numberOfYears={numberOfYears}/>  
      )}
    </div>
  );
};

export default MapComponent;






