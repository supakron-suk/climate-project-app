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
  if (viewMode === "TrendMap") {
    // ถ้าเป็น TrendMap ก็ใช้ coolwarm แล้ว reverse ตาม isReversed
    const baseColor = [...coolwarmColor]; // สำเนาเพื่อไม่แก้ต้นฉบับ
    if (isReversed) baseColor.reverse();

    return {
      temp_color: baseColor,
      coolwarm: baseColor,
    };
  }

  // สำหรับ Heatmap ใช้ colormap library
  let colormapScale = colormap({
    colormap: toneColor,
    nshades: 20,
    format: "hex",
    alpha: 1,
  }).map((color, i) => [i / 19, color]);

  if (isReversed) colormapScale.reverse();

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


const calculateMinMax = (geoData, viewMode, value, displayMapScale) => {
  if (!geoData || !geoData.features) return { min: 10, max: 50 };

  let propertyName = value;
  if (value === 'spi' || value === 'spei') {
    propertyName = `${displayMapScale}`; // ใช้ selectedScale เช่น spi6 หรือ spei12
  }

  const values = geoData.features
    .map((feature) => {
      const val = viewMode === "TrendMap"
        ? feature.properties.slope_value
        : feature.properties[propertyName];
      return val;
    })
    .filter((val) => val !== undefined && val !== null && !isNaN(val));

  if (values.length === 0) return { min: -3, max: 3 };

  let min = Math.min(...values);  // คำนวณค่าต่ำสุด
  let max = Math.max(...values);  // คำนวณค่าสูงสุด

  

  // ตรวจสอบว่าค่า min และ max มีความต่างน้อยเกินไปหรือไม่
  if (propertyName.startsWith("spi") || propertyName.startsWith("spei")) {
    
    
    // ถ้าความต่างระหว่าง min และ max น้อยกว่า 0.5, ไม่ให้ปรับเป็น -2 และ 2
    if (max - min < 0.5) {
      // เอาค่า min และ max ที่คำนวณมาใช้จริง ๆ แทน
      // ยกเลิกการปรับเป็น -2 และ 2

    }
  }

  // ตรวจสอบค่าหลังจากการคำนวณและไม่ปรับค่า
  console.log('Final Min:', min);
  console.log('Final Max:', max);

  if (viewMode === "TrendMap") {
    const range = Math.max(Math.abs(min), Math.abs(max));
    return { min: -range, max: range }; 
  }

  return { min, max }; 
};





// const calculateMinMax = (geoData, viewMode, value) => {
//   if (!geoData || !geoData.features) return { min: 10, max: 50 };

//   const values = geoData.features
//   .map((feature, index) => {
//     const val = viewMode === "TrendMap"
//       ? feature.properties.slope_value
//       : feature.properties[value];


//     return val;
//   })
//     .filter((val) => val !== undefined && val !== null && !isNaN(val));

    

//   if (values.length === 0) return { min: 10, max: 50 };

  

//   let min = Math.min(...values);
//   let max = Math.max(...values);


//   if (viewMode === "TrendMap") {
//     const range = Math.max(Math.abs(min), Math.abs(max));
//     return { min: -range, max: range }; // ยังเก็บ logic นี้ไว้สำหรับ trend
//   }

  

//   return { min, max }; // 
// };

const style = (
  feature,
  selectedRegion,
  selectedProvince,
  viewMode,
  min,
  max,
  selectedValue,
  selectedToneColor,
  isReversed,
  isRegionView,
  selectedScale
) => {
  const isMultiScale = selectedValue === "spi" || selectedValue === "spei";

  
  const actualValueKey =
  isMultiScale && selectedScale
    ? selectedScale 
    : selectedValue;

  const dataValue =
    viewMode === "TrendMap"
      ? feature.properties.slope_value
      : feature.properties[actualValueKey];

  // console.log(`[STYLE DEBUG] ${feature.properties.name} ->`, {
  //   viewMode,
  //   selectedValue,
  //   actualValueKey,
  //   dataValue,
  //   selectedScale
  // });

  const isProvinceFeature = feature.properties.level === "province";
  const isRegionFeature = feature.properties.level === "region";

  const shouldShow = isRegionView
    ? (selectedRegion === "Thailand_region" || feature.properties.region_name === selectedRegion || feature.properties.name === selectedRegion)
    : (selectedProvince === "Thailand" || feature.properties.province_name === selectedProvince || feature.properties.name === selectedProvince);

  return {
    fillColor: getColor(dataValue || 0, viewMode, min, max, selectedValue, selectedToneColor, isReversed),
    weight: 0.3,
    opacity: 1,
    color: "black",
    dashArray: "0",
    fillOpacity: shouldShow ? 0.9 : 0,
  };
};

// const style = (
//   feature,
//   selectedRegion,
//   selectedProvince,
//   viewMode,
//   min,
//   max,
//   selectedValue,
//   selectedToneColor,
//   isReversed,
//   isRegionView,
//   selectedScale
// ) => {
//   const actualValueKey = (selectedValue === "spi" || selectedValue === "spei")
//   ? `${selectedValue}${selectedScale}`
//   : selectedValue;

// const dataValue = viewMode === "TrendMap"
//   ? feature.properties.slope_value
//   : feature.properties[actualValueKey];

//   // const dataValue = viewMode === "TrendMap"
//   //   ? feature.properties.slope_value
//   //   : feature.properties[selectedValue];

//   console.log(`[STYLE DEBUG] ${feature.properties.name} ->`, {
//     viewMode,
//     selectedValue,
//     dataValue,
//   });

//   const isProvinceFeature = feature.properties.level === "province";
//   const isRegionFeature = feature.properties.level === "region";

//   // เงื่อนไขที่ให้แสดงผลบนแผนที่

//   const shouldShow = isRegionView
//   ? (selectedRegion === "Thailand_region" || feature.properties.region_name === selectedRegion || feature.properties.name === selectedRegion)
//   : (selectedProvince === "Thailand" || feature.properties.province_name === selectedProvince || feature.properties.name === selectedProvince);
//   // const shouldShow =
//   //   isRegionView
//   //     ? (selectedRegion === "Thailand_region" || feature.properties.region_name === selectedRegion)
//   //     : (selectedProvince === "Thailand_province" || feature.properties.name === selectedProvince);

//   return {
//     fillColor: getColor(dataValue || 0, viewMode, min, max, selectedValue, selectedToneColor, isReversed),
//     weight: 0.3,
//     opacity: 1,
//     color: "black",
//     dashArray: "0",
//     fillOpacity: shouldShow ? 0.9 : 0,
//   };
// };


const onEachFeature = (feature, layer, viewMode, value, isRegionView, selectedScale) => {
  const props = feature.properties;

  const name = isRegionView
    ? props.region_name || props.name
    : props.province_name || props.name;

  const region = props.region_name || "N/A";
  const province = props.province_name || "N/A";

  const isMultiScale = value === "spi" || value === "spei";

  const actualValueKey =
    isMultiScale && selectedScale
      ? selectedScale
      : value;

  const actualValue =
    viewMode === "TrendMap"
      ? props.slope_value
      : props.annual?.[actualValueKey] ?? props[actualValueKey];

  // const actualValueKey = (value === "spi" || value === "spei")
  //   ? `${value}${selectedScale}`
  //   : value;

  // let actualValue = null;

  // if (viewMode === "TrendMap") {
  //   actualValue = props.slope_value;
  // } else {
  //   if (props.annual && props.annual[actualValueKey] !== undefined) {
  //     actualValue = props.annual[actualValueKey];
  //   } else if (props[actualValueKey] !== undefined) {
  //     actualValue = props[actualValueKey];
  //   }
  // }

 console.log(
  `[DEBUG] ${name} (${region}/${province}) | viewMode: ${viewMode}, selectedScale: ${selectedScale}, actualKey: ${actualValueKey} -> value:`,
  actualValue
);

  layer.bindPopup(`
    <strong>${name}</strong><br/>
    Value: ${actualValue !== null && actualValue !== undefined ? actualValue : 'N/A'}
  `);
};



// const onEachFeature = (feature, layer, viewMode, value) => {
//   const valueText = viewMode === "TrendMap"
//     ? feature.properties.slope_value !== undefined && feature.properties.slope_value !== null
//       ? feature.properties.slope_value.toFixed(2)
//       : 'N/A'
//     : feature.properties[value] !== undefined && feature.properties[value] !== null
//       ? feature.properties[value].toFixed(2)
//       : 'N/A';

  
//   const label = viewMode === "TrendMap"
//     ? "Slope Value"
//     : (typeof value === "string" ? value.charAt(0).toUpperCase() + value.slice(1) : "Value");

//   const labelName = feature.properties.province_name || feature.properties.name || "Unknown";
//   const regionLabel = feature.properties.region_name || feature.properties.name || "Unknown";

//   layer.bindPopup(
//     `<b>Province:</b> ${labelName}<br/>
//      <b>Region:</b> ${regionLabel}<br/>
//      <b>${label}:</b> ${valueText}`
//   );
// };


const HeatmapBar = ({ selectedValue, min, max, selectedToneColor, isReversed, numberOfYears }) => {
  const { temp_color } = getColorScale(selectedValue, "Heatmap", selectedToneColor, isReversed);

  if (!temp_color || !Array.isArray(temp_color)) {
    console.warn("Invalid colorScale in HeatmapBar", { temp_color });
    return null;
  }

  // ฟังก์ชันจัดรูปแบบตัวเลขให้เป็นเลขกลมๆ หรือ 0.5
  const roundLabel = (value) => {
    if (["spi", "spei"].includes(selectedValue)) {
      return value.toFixed(2); // สำหรับ SPI หรือ SPEI ให้แสดงเลขที่มีทศนิยม 2 ตำแหน่ง
    }
    if (["pre", "rx1day"].includes(selectedValue)) {
      return Math.round(value); // สำหรับปริมาณน้ำฝนแสดงเลขเต็ม
    }
    return Math.round(value); // สำหรับอุณหภูมิให้แสดงเป็น .0 หรือ .5
  };

  // log min และ max ก่อน
  console.log("Min:", min, "Max:", max);

  // คำนวณ labels โดยใช้ min, max และขั้น step ที่คำนวณจาก (max - min) / 11
  const step = (max - min) / 11;
  console.log("Step:", step); // log step value

  // คำนวณ labels โดยการเพิ่ม step จาก min เพื่อให้อยู่ในช่วงของ min - max
  const labels = Array.from({ length: 12 }, (_, i) => {
    const value = min + step * i;  // คำนวณค่าแต่ละขั้นจาก min และ step
    const roundedValue = roundLabel(value); // ใช้ roundLabel เพื่อจัดรูปแบบค่าทศนิยม
    return roundedValue;     
  });

  // log labels array
  console.log("Labels (Rounded Values):", labels);

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





// const HeatmapBar = ({ selectedValue, min, max, selectedToneColor, isReversed , numberOfYears}) => {
//   const { temp_color } = getColorScale(selectedValue, "Heatmap", selectedToneColor, isReversed);

//   if (!temp_color || !Array.isArray(temp_color)) {
//     console.warn("Invalid colorScale in HeatmapBar", { temp_color });
//     return null;
//   }

//   // ฟังก์ชันจัดรูปแบบตัวเลขให้เป็นเลขกลมๆ หรือ 0.5
//   const roundLabel = (value) => {
//     if (["pre", "rx1day"].includes(selectedValue)) {
//       return Math.round(value); // ปริมาณน้ำฝนให้แสดงเลขเต็ม
//     }
//     return Math.round(value); // อุณหภูมิให้แสดงเป็น .0 หรือ .5
//   };

//   const labels = Array.from({ length: 12 }, (_, i) => roundLabel(min + (i / 11) * (max - min)));
//   const numBlocks = temp_color.length;

//   // กำหนดหน่วยตาม selectedValue
//   const unit = ["temperature", "tmin", "tmax", "txx", "tnn"].includes(selectedValue) ? "°C" : "mm";
//   const title = `Actual Value (${unit}${numberOfYears ? ` / ${numberOfYears} year` : ""})`;

//   return (
//     <div className="color-bar-container heatmap">
//       <div className="color-bar-title">
//         {title}
//       </div>
//       <div className="gradient-bar">
//         {temp_color.map(([_, color], index) => (
//           <div
//             key={index}
//             className="color-segment"
//             style={{
//               backgroundColor: color,
//               width: `${100 / numBlocks}%`,
//               height: "20px",
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


const TrendmapBar = ({ selectedValue, min, max, steps = 11, spacingFactor = 1.111, numberOfYears, isReversed }) => {
  const { coolwarm } = getColorScale(selectedValue, "TrendMap", undefined, isReversed);

  if (!coolwarm || !Array.isArray(coolwarm)) {
    console.warn("Invalid colorScale in TrendmapBar", { coolwarm });
    return null;
  }

  //  ปรับให้เป็นช่วงสมมาตรรอบ 0
  const symmetricRange = Math.max(Math.abs(min), Math.abs(max));
  const adjustedMin = -symmetricRange;
  const adjustedMax = symmetricRange;
  const stepSize = (adjustedMax - adjustedMin) / (steps - 1);

  const labels = Array.from({ length: steps }, (_, i) => {
    const value = adjustedMin + i * stepSize;
    return {
      label: value === 0 ? "0" : value.toFixed(2),
      position: (i / (steps - 1)) * 100,
    };
  });

  const tickMarksPositions = Array.from({ length: steps }, (_, i) => {
    if (i === 0) return 0;
    if (i === steps - 1) return 111;

    const basePosition = (i / (steps - 1)) * 100;
    return basePosition * spacingFactor;
  });

  const unit = ["temperature", "tmin", "tmax", "txx", "tnn"].includes(selectedValue) ? "°C" : "mm";
  const trendTitle = `Trend Values (${unit}${numberOfYears ? ` / ${numberOfYears} year` : ""})`;

  return (
    <div className="color-bar-container trendmap">
      <div className="color-bar-title">{trendTitle}</div>

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

      <div className="tick-marks">
        {tickMarksPositions.map((position, index) => (
          <div
            key={index}
            className="tick-mark"
            style={{
              position: "absolute",
              left: `${Math.min(position, 160)}%`,
              transform: `translateX(-50%)`,
              height: "8px",
              width: "1px",
              backgroundColor: "black",
            }}
          />
        ))}
      </div>

      <div className="labels">
        {labels.map(({ label }, index) => (
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
  fullGeoData,
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
  isRegionView,
  selectedScale
}) => {
  // console.log("scale of spi", selectedScale)

  const { min: calculatedMin, max: calculatedMax } = calculateMinMax(fullGeoData, viewMode, value, selectedScale);
  console.log("Legend MinMax:", calculatedMin, calculatedMax);
  
  // Use the values of legendMin and legendMax from Actual and Trend
  const isValid = (v) => typeof v === "number" && !isNaN(v) && v !== 0 && v !== 1;

  const defaultMin = viewMode === "TrendMap"
    ? (isValid(trendMin) ? trendMin : calculatedMin)
    : (isValid(legendMin) ? legendMin : calculatedMin);

  const defaultMax = viewMode === "TrendMap"
    ? (isValid(trendMax) ? trendMax : calculatedMax)
    : (isValid(legendMax) ? legendMax : calculatedMax);

  // const defaultMin = viewMode === "TrendMap" 
  //   ? (trendMin ?? calculatedMin) 
  //   : (legendMin ?? calculatedMin);

  // const defaultMax = viewMode === "TrendMap" 
  //   ? (trendMax ?? calculatedMax) 
  //   : (legendMax ?? calculatedMax);

  const displayedGeoData = geoData?.features ? geoData : { type: "FeatureCollection", features: [] };

  console.log("Props legendMin:", legendMin, "legendMax:", legendMax);


  return (
    <div className="map-box">
      <label className="area-head-map">
        {selectedRegion === "Thailand_region"
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
                  viewMode, defaultMin, defaultMax, value, selectedToneColor, isReversed, isRegionView, selectedScale )}  // Pass isReversed here
                onEachFeature={(feature, layer) => onEachFeature(feature, layer, viewMode, value, isRegionView, selectedScale )}
              />
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>

      {/* Use the appropriate color bar */}
      {viewMode === "Heatmap" ? (
        <HeatmapBar selectedValue={value} min={defaultMin} max={defaultMax} selectedToneColor={selectedToneColor} isReversed={isReversed} numberOfYears={numberOfYears}/>  // Pass isReversed here
      ) : (
        <TrendmapBar selectedValue={value} min={defaultMin} max={defaultMax} numberOfYears={numberOfYears} isReversed={isReversed}/>  
      )}
    </div>
  );
};

export default MapComponent;






