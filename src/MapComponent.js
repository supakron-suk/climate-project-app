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

const getAreaProperty = (configData, selectedDataset, isRegionView) => {
  const viewType = isRegionView ? "region" : "province";
  return configData.datasets?.[selectedDataset]?.file_name_pattern?.[viewType]?.area_property ;
};


function getUnit(configData, selectedDataset, selectedValue) {
  const variableOptions = configData.datasets[selectedDataset]?.variable_options || [];
  const found = variableOptions.find(opt => opt.value === selectedValue);
  return found?.unit || "";  
}


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
  selectedScale,
  configData,
  selectedDataset
) => {
  const isMultiScale = selectedValue === "spi" || selectedValue === "spei";
  const areaProperty = getAreaProperty(configData, selectedDataset, isRegionView);

  const actualValueKey =
    isMultiScale && selectedScale ? selectedScale : selectedValue;

  const dataValue =
    viewMode === "TrendMap"
      ? feature.properties.slope_value
      : feature.properties[actualValueKey];

  const areaName = feature.properties?.[areaProperty] || feature.properties?.name;
  const shouldShow = isRegionView
    ? selectedRegion === "Thailand_region" || areaName === selectedRegion
    : selectedProvince === "Thailand" || areaName === selectedProvince;

  return {
    fillColor: getColor(dataValue || 0, viewMode, min, max, selectedValue, selectedToneColor, isReversed),
    weight: 0.3,
    opacity: 1,
    color: "black",
    dashArray: "0",
    fillOpacity: shouldShow ? 0.9 : 0,
  };
};

const onEachFeature = (
  feature,
  layer,
  viewMode,
  value,
  isRegionView,
  selectedScale,
  numberOfYears,
  configData,
  selectedDataset
) => {
  const props = feature.properties;
  const areaProperty = getAreaProperty(configData, selectedDataset, isRegionView);

  const name = props?.[areaProperty] || props?.name;

  const isMultiScale = value === "spi" || value === "spei";
  const actualValueKey = isMultiScale && selectedScale ? selectedScale : value;

  const rawValue =
    viewMode === "TrendMap"
      ? props.slope_value
      : props.annual?.[actualValueKey] ?? props[actualValueKey];

  const formattedValue =
    rawValue !== null && rawValue !== undefined
      ? Number(rawValue).toFixed(2)
      : "N/A";

  const unit = getUnit(configData, selectedDataset, value);
  // const unit = ["temperature", "tmin", "tmax", "txx", "tnn"].includes(value) ? "°C" : "mm";
  const yearsText = numberOfYears ? `/ ${numberOfYears} year` : "";
  const label = viewMode === "TrendMap" ? "Slope" : "Value";

  const fullValue =
    formattedValue !== "N/A"
      ? `<strong>${label}:</strong> ${formattedValue}${unit}${yearsText}`
      : `<strong>${label}:</strong> N/A`;

  layer.bindPopup(`
    <strong>${name}</strong><br/>
    ${fullValue}
  `);
};



const HeatmapBar = ({ selectedValue, min, max, selectedToneColor, isReversed, numberOfYears, configData, 
  selectedDataset, selectedRegion, labelProvince, labelRegion  }) => {
  const { temp_color } = getColorScale(selectedValue, "Heatmap", selectedToneColor, isReversed);

  if (!temp_color || !Array.isArray(temp_color)) {
    console.warn("Invalid colorScale in HeatmapBar", { temp_color });
    return null;
  }

  const roundLabel = (value) => {
    if (["spi", "spei"].includes(selectedValue)) {
      return value.toFixed(2);
    }
    if (["pre", "rx1day"].includes(selectedValue)) {
      return Math.round(value);
    }
    return Math.round(value);
  };

  let labels = [];

  if (["spi", "spei"].includes(selectedValue)) {
    // 🟦 กรณี SPI/SPEI ใช้แบบเดิม
    const step = (max - min) / 11;
    labels = Array.from({ length: 12 }, (_, i) => {
      const value = min + step * i;
      return roundLabel(value);
    });
  } else {
    const desiredLabelCount = 7;
    const minInt = Math.floor(min);
    const maxInt = Math.ceil(max);
    const range = maxInt - minInt;

    let step = 1;
    if (range >= desiredLabelCount - 1) {
      step = Math.ceil(range / (desiredLabelCount - 1));
    }

    const rawLabels = [];
    for (let value = minInt; value <= maxInt; value += step) {
      rawLabels.push(roundLabel(value));
    }

    if (rawLabels.length < 2) {
      rawLabels.push(roundLabel(max));
    }

    labels = [...new Set(rawLabels)];
    console.log("Actual  label range :", labels);
  }


  const numBlocks = temp_color.length;
  const unit = getUnit(configData, selectedDataset, selectedValue);

  const areaName =
  selectedRegion === "Thailand_region"
    ? "Thailand"
    : labelProvince
    ? labelProvince.replace(/_/g, " ")
    : labelRegion
    ? labelRegion.replace(/_/g, " ")
    : "";
  // const unit = ["temperature", "tmin", "tmax", "txx", "tnn"].includes(selectedValue) ? "°C" : "mm";
  const title = `Actual Map | Area: ${areaName} | Unit: ${unit}`;
  // const title = `Actual Value (${unit}${numberOfYears ? ` / ${numberOfYears} year` : ""})`;

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



const TrendmapBar = ({ selectedValue, min, max, steps = 11, spacingFactor = 1.111, numberOfYears, isReversed, configData, selectedDataset, 
  selectedRegion, labelProvince, labelRegion }) => {
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
  const unit = getUnit(configData, selectedDataset, selectedValue);
  const areaName =
  selectedRegion === "Thailand_region"
    ? "Thailand"
    : labelProvince
    ? labelProvince.replace(/_/g, " ")
    : labelRegion
    ? labelRegion.replace(/_/g, " ")
    : "";
  // const unit = ["temperature", "tmin", "tmax", "txx", "tnn"].includes(selectedValue) ? "°C" : "mm";
  const trendTitle = `Trend Map | Area: ${areaName} | Unit: ${unit}`;

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
  labelYearStart,
  labelYearEnd,
  selectedToneColor,
  setSelectedToneColor,
  toneColors,
  isReversed,  
  numberOfYears,
  isRegionView,
  selectedScale,
  configData,
  selectedDataset,
}) => {
  // console.log("scale of spi", selectedScale)

  const { min: calculatedMin, max: calculatedMax } = calculateMinMax(fullGeoData, viewMode, value, selectedScale);
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

  // console.log("Props legendMin:", legendMin, "legendMax:", legendMax);


  return (
    <div className="map-box">
       <label className="map-header">
      {labelYearStart && labelYearEnd 
        ? `Map View (${labelYearStart} - ${labelYearEnd})` 
        : "Map View"}
    </label>
      {/* <label className="area-head-map">
        {selectedRegion === "Thailand_region"
          ? "Thailand"
          : labelProvince
          ? labelProvince.replace(/_/g, " ")
          : labelRegion.replace(/_/g, " ")}
      </label> */}

      <div className="map-container">
        <MapContainer center={[13.7563, 100.5018]} zoom={5} style={{ height: "450px", width: "600px" }}>
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
                  viewMode, defaultMin, defaultMax, value, selectedToneColor, isReversed, isRegionView, selectedScale, configData,
    selectedDataset )}  
                onEachFeature={(feature, layer) => onEachFeature(feature, layer, viewMode, value, isRegionView, selectedScale, numberOfYears, configData, selectedDataset)}
              />
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>

      {/* Use the appropriate color bar */}
      {viewMode === "Heatmap" ? (
        <HeatmapBar selectedValue={value} min={defaultMin} max={defaultMax} selectedToneColor={selectedToneColor} isReversed={isReversed}
         numberOfYears={numberOfYears} configData={configData} selectedDataset={selectedDataset} selectedRegion={selectedRegion} labelProvince={labelProvince}
  labelRegion={labelRegion}/>  
      ) : (
        <TrendmapBar selectedValue={value} min={defaultMin} max={defaultMax} numberOfYears={numberOfYears} isReversed={isReversed} 
        configData={configData} selectedDataset={selectedDataset}  selectedRegion={selectedRegion} labelProvince={labelProvince} abelRegion={labelRegion}
/>  
      )}
    </div>
  );
};

export default MapComponent;






