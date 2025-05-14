//import HeatmapThailand from './Geo-data/candex_to_geo.json';
//import ConvinceTest from './Geo-data/province_mean_temp_2001.json';
//import data2001 from './Geo-data/Year-Dataset/province_all_2001.json'; 
//import { style, ColorBar } from './JS/Heatmap.js';
//import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
//import Thailandmap from "./Geo-data/thailand-Geo.json";


import React, { useEffect, useState} from 'react';
import 'leaflet/dist/leaflet.css';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import './App.css';
import MapComponent from './MapComponent'; // นำเข้า MapComponent
import { dummyTimeSeriesData,
         dummySeasonalCycleData,
         calculatemean,
       } from './JS/Graph';
import {TrendMap} from './JS/TrendMap.js';
import { Heatmap, spi_Heatmap} from './JS/Heatmap.js';
import { new_dataset, sendFileToBackend } from "./JS/new_dataset.js";
import colormap from 'colormap';
import { spi_process, SPIChartData, r_squared, getSpiAndSpeiData } from './JS/spi_set.js';




import { loadDatasetFiles } from './config/config_set';
import configData from './config/config.json';


//----------------------------------------------------------------------------//
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, registerables ,Title, Tooltip, Legend } from 'chart.js'; 
import { CrosshairPlugin } from 'chartjs-plugin-crosshair';

const movingAvgLegendPlugin = {
  id: 'customLegend',
  afterDraw(chart, args, options) {
    const { ctx, chartArea: { top, right } } = chart;

    const hasMovingAvg = chart.data.datasets.some(d =>
      d.label.toLowerCase().includes('moving avg')
    );
    if (!hasMovingAvg) return;

    ctx.save();
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = 'purple';

    const legendX = right - 180;
    const legendY = top + 10;

    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 20, legendY);
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillText('Moving Avg', legendX + 25, legendY + 4);
    ctx.restore();
  }
};


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, annotationPlugin,CrosshairPlugin,  ...registerables, movingAvgLegendPlugin); 


//------------------------IMPORT FUCTION-------------------------------------//

//------------------------FUNCTION APP-------------------------------- -----//
function App() {
  // config Line test
  const [selectedDataset, setSelectedDataset] = useState('');  // เก็บข้อมูล dataset ที่เลือก
  const [isLoading, setIsLoading] = useState(false);
  // const [datasetData, setDatasetData] = useState(null);
  // const [availableRegions, setAvailableRegions] = useState({});



  const [dataByYear, setDataByYear] = useState({});  // เก็บข้อมูลที่โหลดตามปี
  const [variableOptions, setVariableOptions] = useState([]);  // ตัวเลือกตัวแปรต่าง ๆ ที่จะใช้
  const [selectedYearStart, setSelectedYearStart] = useState('');
  const [selectedYearEnd, setSelectedYearEnd] = useState('');

  
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  // const [selectedRegion, setSelectedRegion] = useState('Thailand_region');
  // const [selectedProvince, setSelectedProvince] = useState(''); 
  // const [filteredData, setFilteredData] = useState(null); // ข้อมูลที่กรองตามภูมิภาค
  const [filteredYearData, setFilteredYearData] = useState(null);  // เก็บข้อมูลของช่วงปีที่เลือก
  const [provinces, setProvinces] = useState([]); // รายชื่อจังหวัดในภูมิภาค
  const [selectedProvinceData, setSelectedProvinceData] = useState(null);
  const [isRegionView, setIsRegionView] = useState(true);
  

  const [isExpand, setIsExpand] = useState(false);
  const [isSPIExpand, setIsSPIExpand] = useState(false);
  const [availableScales, setAvailableScales] = useState([]);
  const [selectedScale, setSelectedScale] = useState([]);
  const [spiChartData, setSPIChartData] = useState(null);
  const [isSpiOpen, setIsSpiOpen] = useState(true);
  const [showSPIBarChart, setShowSPIBarChart] = useState(false);
  const [displayMapScale, setDisplayMapScale] = useState("");
  const [rSquaredValue, setRSquaredValue] = useState(null);
  // const [rSquareText, setRSquareText] = useState({});

  const [spiSpeiData, setSpiSpeiData] = useState([]);
//--------------------spi and spi state-----------------------------------//


  const [chartData, setChartData] = useState(dummyTimeSeriesData);
  // const [Timeseries, set] = useState(dummyTimeSeriesData);
  const [seasonalCycle, setSeasonalCycle] = useState(dummySeasonalCycleData);
  
  // const [spiChartData, setSPIChartData] = useState(null);
  // const [isSpiOpen, setIsSpiOpen] = useState(true);
  // const [showSPIBarChart, setShowSPIBarChart] = useState(false);
  const [showRegularCharts, setShowRegularCharts] = useState(true);
  const [showSeasonalCycle, setShowSeasonalCycle] = useState(true);
  const [isSeasonalHidden, setIsSeasonalHidden] = useState(false);
  

//const [filteredDataByRange, setFilteredDataByRange] = useState(null);
const [isApplied, setIsApplied] = useState(false);

//---------------------- Trend VALUE data-----------------------//
const [trendGeoData, setTrendGeoData] = useState(null);
const [numberOfYears, setNumberOfYears] = useState(null);
const [heatmapData, setHeatmapData] = useState(null);
const [selectedValue, setSelectedValue] = useState('temperature');

const [variableDescription, setVariableDescription] = useState('');

//----------------------------Select map----------------------------//
const [viewMode, setViewMode] = useState("Heatmap"); // "Heatmap" หรือ "TrendMap"
//--------------------------------Select Index of Variable---------------------------//
// const [selectedIndex, setSelectedIndex] = useState(null);


//-------------------------------User Select Min/Max Legend Bar-----------------------//
const [minmaxButton, setminmaxButton] = useState(null);

const [legendMin, setLegendMin] = useState();
const [legendMax, setLegendMax] = useState();

const [actualMin, setActualMin] = useState(null);
const [actualMax, setActualMax] = useState(null);

const [globalLegendMin, setGlobalLegendMin] = useState(null);
const [globalLegendMax, setGlobalLegendMax] = useState(null);
const [globalTrendMin, setGlobalTrendMin] = useState(null);
const [globalTrendMax, setGlobalTrendMax] = useState(null);

const [fullHeatmapData, setFullHeatmapData] = useState(null);
const [fullTrendData, setFullTrendData] = useState(null);


const [trendLegendMin, setTrendLegendMin] = useState(null);
const [trendLegendMax, setTrendLegendMax] = useState(null);

const [applyLegendMin, setapplyLegendMin] = useState(legendMin);
const [applyLegendMax, setapplyLegendMax] = useState(legendMax);
//-------------------------------User Select Min/Max Legend Bar-----------------------//
const [kernelSize, setKernelSize] = useState(null);

const [isSidebarOpen, setSidebarOpen] = useState(true);


//-----------------------------------------Label Output Dashboard---------------------------//
const [labelYearStart, setlabelYearStart] = useState(null);
const [labelYearEnd, setlabelYearEnd] = useState(null);
const [labelRegion, setlabelRegion] = useState("");
const [labelProvince, setlabelProvince] = useState("");
const [DataApply, setDataApply] = useState("");

const [labelVariable, setLabelVariable] = useState("");

//-----------------------------------------Tone color state---------------------------//

const [selectedToneColor, setSelectedToneColor] = useState("blackbody");
const toneColors = ["velocity-blue", "blackbody", "jet", "viridis"];
const [isReversed, setIsReversed] = useState(false);
// const [isReversePopupVisible, setIsReversePopupVisible] = useState(false);

const getGradient = (colormapName, isReversed = false) => {
  const colors = colormap({
    colormap: colormapName,
    nshades: 10,
    format: "hex",
    alpha: 1,
  });

  const gradientColors = isReversed ? colors.reverse() : colors;
  return `linear-gradient(to right, ${gradientColors.join(", ")})`;
};


//-----------------------------------------Tone color state---------------------------//




//------------------------FUNCTION APP-------------------------------------//

//-------------------------------------------------- Function Area------------------------------------------//
  // ฟังก์ชันกรองข้อมูลตามภูมิภาค
 const filterByArea = (dataByYear, region, province, startYear, endYear) => {
  const filtered = [];

  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    let features = [];

    if (province && province !== "Thailand") {
      const provinceData = dataByYear[year]?.province;
      if (provinceData?.features) {
        features = provinceData.features.filter(
          (f) => f.properties.province_name === province
        );
      }
    } else if (region && region !== "Thailand_region") {
      const regionData = dataByYear[year]?.region;
      if (regionData?.features) {
        features = regionData.features.filter(
          (f) => f.properties.region_name === region
        );
      }
    } else {
      const countryData = dataByYear[year]?.country;
      if (countryData?.features) {
        features = countryData.features;
      }
    }

    if (Array.isArray(features)) {
      filtered.push(...features);
    } else if (features) {
      filtered.push(features);
    }
  }

  return filtered;
};



const filteredProvinces = React.useMemo(() => {
  if (!selectedYearStart || !selectedYearEnd || selectedRegion === "Thailand") {
    return [];
  }

  const regionProvinces = configData.areas.area_thailand[selectedRegion] || [];
  const provincesSet = new Set();

  for (let year = parseInt(selectedYearStart); year <= parseInt(selectedYearEnd); year++) {
    const provinceData = dataByYear[year]?.province;

    if (provinceData && provinceData.features) {
      provinceData.features.forEach((feature) => {
        const provinceName = feature.properties.province_name;
        if (regionProvinces.includes(provinceName)) {
          provincesSet.add(provinceName);
        }
      });
    }
  }

  return Array.from(provincesSet);
}, [selectedYearStart, selectedYearEnd, selectedRegion, dataByYear]);



const extractMinMaxFromGeoJSON = (geojson, key) => {
  if (!geojson || !geojson.features) return { min: 0, max: 1 };

  const values = geojson.features
    .map(f => f?.properties?.[key])
    .filter(v => v !== undefined && v !== null && !isNaN(v));

  if (values.length === 0) return { min: 0, max: 1 };

  const min = Math.min(...values);
  const max = Math.max(...values);

  return { min, max };
};



// ฟังก์ชันสลับมุมมอง
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleToggleView = (toRegionView) => {
  setIsRegionView(toRegionView);
  

  const updatedRegion = toRegionView ? "Thailand_region" : "";
  const updatedProvince = !toRegionView ? "Thailand" : "";

  // อัปเดต Heatmap
  const heatmapResult = Heatmap(
    dataByYear,
    parseInt(selectedYearStart),
    parseInt(selectedYearEnd),
    "Thailand_region",     
    "Thailand",
    selectedValue,
    configData,
    toRegionView,
  );
  if (heatmapResult) {
  setHeatmapData(heatmapResult);
  setFullHeatmapData(heatmapResult);
  const { min, max } = extractMinMaxFromGeoJSON(heatmapResult, selectedValue);
  setGlobalLegendMin(min);
  setGlobalLegendMax(max);
}

  // อัปเดต TrendMap
  const trendResult = TrendMap(
    dataByYear,
    parseInt(selectedYearStart),
    parseInt(selectedYearEnd),
    "Thailand_region",     
    "Thailand",
    selectedValue,
    configData,
    toRegionView
  );
  if (trendResult) {
  setTrendGeoData(trendResult.geojson);
  setNumberOfYears(trendResult.numberOfYears);
  setFullTrendData(trendResult.geojson);
  const { min, max } = extractMinMaxFromGeoJSON(trendResult.geojson, "slope_value");
  setGlobalTrendMin(min);
  setGlobalTrendMax(max);
}

  // รีเซต dropdown + labels
  setSelectedRegion(updatedRegion);
  setSelectedProvince(updatedProvince);
  setlabelRegion(updatedRegion);
  setlabelProvince(updatedProvince);

  
};




// ฟังก์ชันจัดการการเปลี่ยนแปลงของ dropdown
const handleDatasetChange = async (e) => {
  const selected = e.target.value;
  setSelectedDataset(selected);
  setIsLoading(true);

  try {
    const dataset = await loadDatasetFiles(selected);
    console.log("Loaded dataset:", dataset);
    setDataByYear(dataset);

    const options = getVariableOptions(selected);
    setVariableOptions(options);

    
    setSelectedValue(""); 

    // Reset ค่าอื่นๆ
    setSelectedYearStart("");
    setSelectedYearEnd("");
    setFilteredYearData(null);
    setTrendGeoData(null);
    setHeatmapData(null);
    setSeasonalCycle({ labels: [], datasets: [] });
    setChartData({ labels: [], datasets: [] });
    setIsApplied(false);
  } catch (error) {
    console.error("Error loading dataset:", error);
  } finally {
    setIsLoading(false);
  }
};

//---------------------------spi FUNC zone --------------------------------/
// รับพาราม เตอร์ต่าง ๆ แล้วคืนข้อมูล multi‑scale map



  // ฟังก์ชันเพื่อดึงตัวเลือกของตัวแปรจาก config
  const getVariableOptions = (dataset) => {
    if (!dataset) return [];
    return configData.datasets[dataset]?.variable_options || [];
  };

const getUnit = (variable) => {
  const units = {
    temperature: "°C",
    tmin: "°C",
    tmax: "°C",
    txx: "°C",
    tnn: "°C",
    pre: "mm",
    rx1day: "mm",
  };
  return units[variable] || "";
};



const getFullDatasetName = (dataset) => {
  switch (dataset) {
    case "CRU_dataset":
      return "Climatic Research Unit Data";
    case "ERA dataset":
      return "ECMWF Reanalysis v5 Data";
    default:
      return dataset;
  }
};



//---------------------- value change when change dataset------------------------------//


//----------------------------------User Effect-------------------------------------------//
//Useeffect--1
// เก็บข้อมูลปีและภูมิภาคเมื่อกด Apply
useEffect(() => {
  if (isApplied && selectedYearStart && selectedYearEnd) {

    


   const updatedRegion = DataApply.isRegionView
  ? DataApply.selectedRegion
  : "";

    const updatedProvince = !DataApply.isRegionView ? DataApply.selectedProvince : "";


    console.log("[APPLY] View Mode:", DataApply.isRegionView ? "Region View" : "Province View");

    console.log("Region:", updatedRegion);
    console.log("Province:", updatedProvince);
    console.log("Value Key:", selectedValue);

   
    const selectedYears = Object.keys(dataByYear)
  .filter((year) => year >= selectedYearStart && year <= selectedYearEnd)
  .map((year) => ({
    year,
    data: filterByArea(dataByYear, updatedRegion, updatedProvince, selectedYearStart, selectedYearEnd),
  }));


      selectedYears.forEach(({ year, data }) => {
        
        

    });

    setFilteredYearData(selectedYears);

    const provinces = new Set();
    selectedYears.forEach(({ data }) =>
      data.forEach((feature) => provinces.add(feature.properties.province_name))
    );
    setProvinces(Array.from(provinces));

    //-------------------------------------spi USE EFFECT----------------------------------------------//
  

    const isSPIorSPEI = selectedValue === 'spi' || selectedValue === 'spei';
    // const includesONI = selectedScale.includes('oni');
    const includesONI = Array.isArray(selectedScale) && selectedScale.includes('oni');

    if (isSPIorSPEI || includesONI) {
  const updatedRegion = isRegionView ? selectedRegion : "Thailand_region";
  const updatedProvince = !isRegionView ? selectedProvince : "Thailand";

  if (!isSPIorSPEI) {
      setSelectedScale([]);
      setDisplayMapScale("");
    }

  const spiResult = spi_process(
    dataByYear,
    selectedYearStart,
    selectedYearEnd,
    selectedValue,
    updatedRegion,
    updatedProvince,
    configData,
    selectedDataset,
    selectedScale
  );

  console.log(`SPI Raw Data from app.js ${selectedValue.toUpperCase()}:`, spiResult);

  if (isSPIorSPEI && !includesONI) {
  const mapSPIData = spi_Heatmap(
    dataByYear,
    selectedYearStart,
    selectedYearEnd,
    selectedValue,
    displayMapScale,
    updatedRegion,
    updatedProvince,
    isRegionView
  );

  console.log(`SPI Heatmap Summary:`, mapSPIData);

}


const spiData = getSpiAndSpeiData(
  dataByYear,
  selectedYearStart,
  selectedYearEnd,
  "spi",
  updatedRegion,
  updatedProvince,
  configData,
  selectedDataset,
  selectedScale
);

const speiData = getSpiAndSpeiData(
  dataByYear,
  selectedYearStart,
  selectedYearEnd,
  "spei",
  updatedRegion,
  updatedProvince,
  configData,
  selectedDataset,
  selectedScale
);


const combinedData = [...spiData, ...speiData];

// console.log("Combined SPI/SPEI data:", combinedData);
setSpiSpeiData(combinedData);

const rSquareResult = r_squared(spiData, speiData);
  console.log("R² (SPI vs SPEI) by scale:", rSquareResult);
  setRSquaredValue(rSquareResult);

  setSPIChartData(SPIChartData(spiResult, kernelSize, selectedValue));
  setShowSPIBarChart(true);                  
  setShowRegularCharts(false);              
  setShowSeasonalCycle(false);
  setIsSpiOpen(true);
} else {
  setShowSPIBarChart(false);
  setShowRegularCharts(true);
  setShowSeasonalCycle(true);
  setIsSpiOpen(false);
}



    //-------------------------------------spi USE EFFECT----------------------------------------------//
    
    const trendResult = TrendMap(
        dataByYear,
        parseInt(selectedYearStart),
        parseInt(selectedYearEnd),
        "Thailand_region",     
        "Thailand",
        // updatedRegion,
        // updatedProvince,
        DataApply.selectedValue,
        configData,
        DataApply.isRegionView,
      );

      if (trendResult) {
        setTrendGeoData(trendResult.geojson);
        setNumberOfYears(trendResult.numberOfYears); 
        setFullTrendData(trendResult.geojson);

        const { min, max } = extractMinMaxFromGeoJSON(trendResult.geojson, "slope_value");
        setGlobalTrendMin(min);
        setGlobalTrendMax(max);
      }


    const averageData = Heatmap(
      dataByYear,
      parseInt(selectedYearStart),
      parseInt(selectedYearEnd),
      // updatedRegion,
      // updatedProvince,
      "Thailand_region",     
      "Thailand",   
      DataApply.selectedValue,
      configData,
      DataApply.isRegionView,
      displayMapScale,
    );
    if (averageData) {
      setHeatmapData(averageData);
       setFullHeatmapData(averageData);

      const { min, max } = extractMinMaxFromGeoJSON(averageData, DataApply.selectedValue);
  setGlobalLegendMin(min);
  setGlobalLegendMax(max);
    }

    const chartData = calculatemean(
      dataByYear,
      selectedYearStart,
      selectedYearEnd,
      updatedRegion,
      updatedProvince,
      selectedValue,
      kernelSize,
      configData,
      selectedDataset,
      selectedValue
    );
    if (chartData) {
      console.log("Time Series Data:", chartData);
      setSeasonalCycle(chartData.seasonalCycleData);
      setChartData(chartData.timeSeriesData);
    }

   

    setlabelYearStart(selectedYearStart);
    setlabelYearEnd(selectedYearEnd);
    setlabelRegion(updatedRegion);
    setlabelProvince(updatedProvince);
    

    
    const datasetKey = selectedDataset;
    const dataset = configData?.datasets?.[datasetKey];

    if (dataset && dataset.variable_options) {
      const variable = dataset.variable_options.find((v) => v.value === selectedValue);

      if (variable) {
  const isSPI = selectedValue === "spi" || selectedValue === "spei";

  if (variable.type === "yearly" || isSPI) {
    // console.log("Hide Seasonal Cycle because Yearly or SPI/SPEI variable");
    setShowSeasonalCycle(false);
    setIsSeasonalHidden(true);
  } else {
    setShowSeasonalCycle(true);
    setIsSeasonalHidden(false);
  }

        if (variable.description) {
          setVariableDescription(variable.description);
        } else {
          setVariableDescription('');
        }

        if (variable.label) {
          setLabelVariable(variable.label);
        }
      }
    }




    setIsApplied(false);
  }

}, [isApplied]);

useEffect(() => {
  const datasetKey = selectedDataset;
  const dataset = configData?.datasets?.[datasetKey];

  if (dataset && dataset.variable_options) {
    const variable = dataset.variable_options.find((v) => v.value === selectedValue);
    if (variable?.multi_scale) {
      setAvailableScales(variable.multi_scale);
      setSelectedScale(variable.multi_scale[0]); 
    } else {
      setAvailableScales([]);
      setSelectedScale(null);
    }
  }
}, [selectedValue, selectedDataset, configData]);

useEffect(() => {
  if (isRegionView) {
    setSelectedRegion('');
  } else {
    setSelectedProvince('');
  }
}, [isRegionView]);


useEffect(() => {
  if (isApplied && selectedYearStart && selectedYearEnd) {
    // อัปเดตค่า labelRegion และ labelProvince
    setlabelRegion(selectedRegion);
    setlabelProvince(selectedProvince);
    
    setIsApplied(false);
  }
}, [isApplied]);




//---------------------------------- Index Use Effect------------------------------------//


  useEffect(() => {
  if (selectedDataset === "ERA_dataset") {
    setSelectedValue("tmin");
  } else if (selectedDataset === "CRU_dataset") {
    setSelectedValue("temperature");
  }
}, [selectedDataset]);


useEffect(() => {
  setapplyLegendMin(null);
  setapplyLegendMax(null);
}, [minmaxButton]);


 

//----------------------------------User Effect-----------------------------------------------//
//----------------------------------webpage UI AREA-------------------------------------------//

  return (
  <div className="main-container">
    <div className="header-text">
      <h1 className="block-text">Multidimensional climate data visualization</h1>
    </div>

    

    {/* sidebar */}
<div className={`left-sidebar ${isSidebarOpen ? "open" : ""}`}>
  
  <div className="sidebar-header">
    <h2>Access Data</h2>
    </div>

  <div className={`sidebar-content ${isLoading ? "loading" : ""}`}>

    {/* <div className="sidebar-header">
    <h2>Access Data</h2>
    <p className="line">.</p>
    </div> */}

    {/* Dropdown เลือก Dataset */}
    <div className="dataset-selector">
  <label>Select Dataset</label>
  <select value={selectedDataset} onChange={handleDatasetChange} disabled={isLoading}>
    <option value="" disabled>Select dataset</option>
    {Object.keys(configData.datasets).map((key) => (
      <option key={key} value={key}>
        {configData.datasets[key].label || key}
      </option>
    ))}
  </select>
</div>

{/* Loading Animation */}
{isLoading ? (
  <div className="loading-container">
    <div className="spinner"></div>
     <p className="loading-text">Loading dataset...</p>
  </div>
) : (
  <>
  

  <label className="area-label">Select Area</label>


<div className="toggle-button-group">
  <button
    className={`toggle-button ${isRegionView ? " active" : ""}`}
    onClick={() => handleToggleView(true)}
  >
    Region
  </button>
  <button
    className={`toggle-button ${!isRegionView ? "active" : ""}`}
    onClick={() => handleToggleView(false)}
  >
    Province
  </button>
</div>

{/* REGION View */}
{isRegionView ? (
  <div className="region-selector">
    <select
      onChange={(e) => {
        setSelectedRegion(e.target.value);
        setSelectedProvince('');
      }}
      value={selectedRegion}
    >
        <option value="" disabled>
      Region
    </option>
      <option value="Thailand_region">Thailand</option>
      {Object.keys(configData.areas.area_thailand).map((region) => (
        <option key={region} value={region}>
          {region.replace(/_/g, ' ')}
        </option>
      ))}
    </select>
  </div>
) : (
  <div className="province-selector">
    <select
      onChange={(e) => {
        setSelectedProvince(e.target.value);
        setSelectedRegion('');
      }}
      value={selectedProvince}
    >
      <option value="" disabled>
      Province
    </option>
      <option value="Thailand">Thailand</option>
      {[...new Set(Object.values(configData.areas.area_thailand).flat())].map(
        (province, index) => (
          <option key={index} value={province}>
            {province}
          </option>
        )
      )}
    </select>
  </div>
)}


    <label className='select-data'>Select Data</label>

  <div className="value-selector">
      <label>Variable</label>
      <select
        value={selectedValue}
        onChange={(e) => setSelectedValue(e.target.value)}
      >
        <option value="" disabled hidden>
          Select Variable
        </option>
        {["monthly", "yearly"].map((type) => (
      <optgroup
        key={type}
        label={type === "monthly" ? "Monthly" : "Yearly"}
      >
        {variableOptions
          .filter((option) => option.type === type)
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </optgroup>
    ))}
      </select>

      {Array.isArray(availableScales) && availableScales.length > 0 && (
      <div className="scale-selector">
        <label className="scale-label">Select Scale:</label>
        <div className="scale-options">
          {availableScales.map((scale) => (
            <label key={scale} className="scale-option">
              <input
                type="checkbox"
                name="scale"
                value={scale}
                checked={selectedScale.includes(scale)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!Array.isArray(selectedScale)) {
                    setSelectedScale([value]);
                    return;
                  }
                  if (e.target.checked) {
                    setSelectedScale([...selectedScale, value]);
                  } else {
                    setSelectedScale(selectedScale.filter((s) => s !== value));
                  }
                }}
              />
              <span>{scale}</span>
            </label>
          ))}
        </div>
      </div>
    )}

    {(selectedValue === 'spi' || selectedValue === 'spei') &&
  Array.isArray(availableScales) &&
  availableScales.length > 0 && (
  <div className="display-map-scale">
    <label>Map Scale:</label>
    <select
      value={displayMapScale}
      onChange={(e) => setDisplayMapScale(e.target.value)}
    >
      <option value="" disabled hidden>
        Select Scale
      </option>
      {availableScales.map((scale) => (
        <option key={scale} value={scale}>
          {scale}
        </option>
      ))}
    </select>
  </div>
)}


    </div>  

    {/* Year Selector Dropdown */}
<div className="year-selector">
  <div className="dropdown-container">

    {/* Start Year */}
    <div className="dropdown-item">
      <label className="start-year-label">Start Year</label>
      <select
        value={selectedYearStart}
        onChange={(e) => setSelectedYearStart(e.target.value)}
      >
        <option value="">start year</option>
        {selectedDataset && configData.datasets[selectedDataset] && (() => {
          const { year_start, year_end } = configData.datasets[selectedDataset];
          const years = Array.from({ length: year_end - year_start + 1 }, (_, i) => year_start + i);
          return years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ));
        })()}
      </select>
    </div>

    {/* End Year */}
    <div className="dropdown-item">
      <label>End Year</label>
      <select
        value={selectedYearEnd}
        onChange={(e) => setSelectedYearEnd(e.target.value)}
      >
        <option value="">end year</option>
        {selectedDataset && configData.datasets[selectedDataset] && (() => {
          const { year_start, year_end } = configData.datasets[selectedDataset];
          const years = Array.from({ length: year_end - year_start + 1 }, (_, i) => year_start + i);
          return years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ));
        })()}
      </select>
    </div>

  </div>
</div>

    
        <label className='output-options'>Output Options</label>


    <div className="kernel-size-container">
  <label>Kernel Size</label>
  <input
    type="text"
    value={kernelSize ?? ""} 
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) {  
        const num = Number(value);
        if (num === 0 || (num % 2 === 1 && num >= 1 && num <= 50)) {
          setKernelSize(num);
        }
      }
    }}
    className="kernel-input"
  />
</div>


   




{/* User Select Legend Bar */}
<div className="legend-bar-container">
  <div className="legend-bar-header">
    <span style={{ fontWeight: "bold", marginRight: "40px" }}>Legend Range</span>
    <span style={{ marginRight: "60px" }}>Min</span>
    <span>Max</span>
  </div>

  {/* Row: Actual */}
  <div className="legend-bar-row">
    <label className="legend-bar-label">Actual</label>
    <input
      type="text"
      value={minmaxButton === "Actual" ? applyLegendMin ?? "" : ""}
      disabled={minmaxButton !== "Actual"}
      onChange={(e) => {
        const value = e.target.value;
        if (!/^-?\d*(\.\d*)?$/.test(value)) return;
        setapplyLegendMin(value);
      }}
      onBlur={() => {
        if (applyLegendMin !== "" && applyLegendMin !== "-") {
          setapplyLegendMin(parseFloat(applyLegendMin));
        }
      }}
      className="legend-bar-input"
    />
    <input
      type="text"
      value={minmaxButton === "Actual" ? applyLegendMax ?? "" : ""}
      disabled={minmaxButton !== "Actual"}
      onChange={(e) => {
        const value = e.target.value;
        if (!/^\d*(\.\d*)?$/.test(value)) return;
        setapplyLegendMax(value);
      }}
      onBlur={() => {
        if (applyLegendMax !== "" && applyLegendMax !== "-") {
          setapplyLegendMax(parseFloat(applyLegendMax));
        }
      }}
      className="legend-bar-input"
    />
    <button
      className={`legend-bar-button Actual_minmax ${minmaxButton === 'Actual' ? 'selected' : ''}`}
      onClick={() => {
        if (minmaxButton === "Actual") {
          setminmaxButton(null);
          setapplyLegendMin(null);
          setapplyLegendMax(null);
        } else {
          setminmaxButton("Actual");
        }
      }}
    >
      {minmaxButton === "Actual" ? "✓" : "Set"}
    </button>
  </div>

  {/* Row: Trend */}
  <div className="legend-bar-row">
    <label className="legend-bar-label">Trend</label>
    <input
      type="text"
      value={minmaxButton === "Trend" ? applyLegendMin ?? "" : ""}
      disabled={minmaxButton !== "Trend"}
      onChange={(e) => {
        const value = e.target.value;
        if (!/^-?\d*(\.\d*)?$/.test(value)) return;
        setapplyLegendMin(value);
      }}
      onBlur={() => {
        if (applyLegendMin !== "" && applyLegendMin !== "-") {
          setapplyLegendMin(parseFloat(applyLegendMin));
        }
      }}
      className="legend-bar-input"
    />
    <input
      type="text"
      value={minmaxButton === "Trend" ? applyLegendMax ?? "" : ""}
      disabled={minmaxButton !== "Trend"}
      onChange={(e) => {
        const value = e.target.value;
        if (!/^-?\d*(\.\d*)?$/.test(value)) return;
        setapplyLegendMax(value);
      }}
      onBlur={() => {
        if (applyLegendMax !== "" && applyLegendMax !== "-") {
          setapplyLegendMax(parseFloat(applyLegendMax));
        }
      }}
      className="legend-bar-input"
    />
    <button
      className={`legend-bar-button Trend_minmax ${minmaxButton === 'Trend' ? 'selected' : ''}`}
      onClick={() => {
        if (minmaxButton === "Trend") {
          setminmaxButton(null);
          setapplyLegendMin(null);
          setapplyLegendMax(null);
        } else {
          setminmaxButton("Trend");
        }
      }}
    >
      {minmaxButton === "Trend" ? "✓" : "Set"}
    </button>
  </div>
</div>

{/* <div className="legend-bar-container">

   <div className="legend-bar-buttons">
    <button
      className={`legend-bar-button Actual_minmax ${minmaxButton === 'Actual' ? 'selected' : ''}`}
      onClick={() => {
        
        if (minmaxButton === "Actual") {
          setminmaxButton(null);
          setapplyLegendMin(null);
          setapplyLegendMax(null);
        } else {
          setminmaxButton("Actual");
        }
      }}
    >
      Actual
    </button>
    <button
      className={`legend-bar-button Trend_minmax ${minmaxButton === 'Trend' ? 'selected' : ''}`}
      onClick={() => {
       
        if (minmaxButton === "Trend") {
          setminmaxButton(null);
          setapplyLegendMin(null);
          setapplyLegendMax(null);
        } else {
          setminmaxButton("Trend");
        }
      }}
    >
      Trend
    </button>
  </div>


<div className="legend-bar-item legend-bar-min">
  <label style={{ opacity: !minmaxButton ? 0.5 : 1 }}>Min:</label>
  <input
    type="text"
    value={applyLegendMin ?? ""}
    disabled={!minmaxButton}
    style={{ opacity: !minmaxButton ? 0.5 : 1 }}
    onChange={(e) => {
      let value = e.target.value;

      if (minmaxButton === "Actual") {
        
        if (!/^-?\d*(\.\d*)?$/.test(value)) return;
      } else if (minmaxButton === "Trend") {
        
        if (!/^-?\d*(\.\d*)?$/.test(value)) return;
      }

      setapplyLegendMin(value); 
    }}
    className="legend-bar-input"
    onBlur={() => {
      if (applyLegendMin !== "" && applyLegendMin !== "-") {
        setapplyLegendMin(parseFloat(applyLegendMin));
      }
    }}
  />
</div>

<div className="legend-bar-item legend-bar-max">
  <label style={{ opacity: !minmaxButton ? 0.5 : 1 }}>Max:</label>
  <input
    type="text"
    value={applyLegendMax ?? ""}
    disabled={!minmaxButton}
    style={{ opacity: !minmaxButton ? 0.5 : 1 }}
    onChange={(e) => {
      let value = e.target.value;

      if (minmaxButton === "Actual") {
        
        if (!/^\d*(\.\d*)?$/.test(value)) return;
      } else if (minmaxButton === "Trend") {
        
        if (!/^-?\d*(\.\d*)?$/.test(value)) return;
      }

      setapplyLegendMax(value);
    }}
    className="legend-bar-input"
    onBlur={() => {
      if (applyLegendMax !== "" && applyLegendMax !== "-") {
        setapplyLegendMax(parseFloat(applyLegendMax));
      }
    }}
  />
</div>

</div> */}

{/* Apply Button */}
      <button
        onClick={() => {
          if (!selectedYearStart || !selectedYearEnd) {
            alert('กรุณาเลือกปีเริ่มต้นและปีสิ้นสุด');
            return;
          }

          if (selectedYearStart > selectedYearEnd) {
            alert('ปีเริ่มต้นต้องไม่มากกว่าปีสิ้นสุด');
            return;
          }
           
          if (minmaxButton === 'Actual') {
          setActualMin(applyLegendMin);
          setActualMax(applyLegendMax);
          setTrendLegendMin(null);  
          setTrendLegendMax(null);
    } else if (minmaxButton === 'Trend') {
          setTrendLegendMin(applyLegendMin);
          setTrendLegendMax(applyLegendMax);
          setActualMin(null);  
          setActualMax(null);
    }

          const appliedData = {
            yearStart: selectedYearStart,
            yearEnd: selectedYearEnd,
            selectedValue: selectedValue,
            displayMapScale: displayMapScale,
            legendMin: minmaxButton === 'Actual' ? applyLegendMin : null, 
            legendMax: minmaxButton === 'Actual' ? applyLegendMax : null, 
            trendMin: minmaxButton === 'Trend' ? applyLegendMin : null,  
            trendMax: minmaxButton === 'Trend' ? applyLegendMax : null,  
            selectedRegion: selectedRegion,
            selectedProvince: selectedProvince,
            isRegionView: isRegionView,
          };
          setDataApply(appliedData);

          setIsApplied(true);
        }}
        disabled={!selectedYearStart || !selectedYearEnd || !selectedValue}
        className="apply_button"
      >
        Apply
      </button>


  {/* Loading Animation */}
  </>
)}

    
  </div>
</div>


      {/* ปุ่มเปิด-ปิด Sidebar */}
      <button className={`side-button ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(!isSidebarOpen)}>
</button>


    <div className="content-container">
    {/* <h1>DashBoard</h1> */}
  <div className={`dashboard-box ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} `}>

    <div className="dashboard-header">
  {selectedDataset && labelVariable && (
  <label className="dataset-head-dashboard">
    {getFullDatasetName(selectedDataset)} ({labelVariable})
  </label>
)}
</div>



    <div className='dashboard-content'>
      
  

    {!isSPIExpand && (
    <div className={`right-map ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${isExpand ? "expanded" : ""}
      ${isSeasonalHidden ? "hidden-seasonal" : ""}
      ${showSPIBarChart ? "show-spi" : ""}`}>


  {/* Button select map */}
<div className="map-buttons">
  <button onClick={() => toggleViewMode("Heatmap")}>Actual Map</button>
  <button onClick={() => toggleViewMode("TrendMap")}>Trend Map</button>
</div>

    <div className="tonecolor-wrapper">
  <div className="change_tonecolor">Color</div>
  <div className="popup-tone">
    {toneColors.map((tone) => (
      <div
        key={tone}
        className={`tone-option ${selectedToneColor === tone ? "active" : ""}`}
        onClick={() => setSelectedToneColor(tone)}
        style={{
          cursor: "pointer",
          padding: "4px",
          marginBottom: "6px",
          border: selectedToneColor === tone ? "2px solid blue" : "1px solid #ccc",
          borderRadius: "4px",
          background: getGradient(tone, isReversed),
          color: "transparent", 
          height: "7px", 
        }}
        title={tone} 
      >
        {tone}
      </div>
    ))}

    <div style={{ marginTop: "10px" }}>
  <button
    onClick={() => setIsReversed(prev => !prev)}
    style={{
      backgroundColor: isReversed ? "#4682b4" : "#888", // สีเปลี่ยนตามสถานะ
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      padding: "6px 10px",
      fontSize: "12px",
      cursor: "pointer",
    }}
  >
    {isReversed ? "Reverse" : "Reverse"}
  </button>
</div>

  </div>
</div>
    
      
  {(viewMode === "TrendMap" || viewMode === "Heatmap") && (
    <MapComponent
      key={`${viewMode}-${selectedYearStart}-${selectedYearEnd}-
      ${selectedValue}-${isApplied}-${selectedToneColor}-${isReversed}-${isRegionView}`} 

      geoData={viewMode === "TrendMap" ? trendGeoData : heatmapData} 
      fullGeoData={viewMode === "TrendMap" ? fullTrendData : fullHeatmapData}
      selectedRegion={DataApply.selectedRegion}
      selectedProvinceData={DataApply.selectedProvinceData} 
      setSelectedProvinceData={setSelectedProvinceData}
      selectedProvince={DataApply.selectedProvince}
      viewMode={viewMode}
      value={DataApply.selectedValue}
      legendMin={DataApply.legendMin ?? globalLegendMin}
      legendMax={DataApply.legendMax ?? globalLegendMax}
      trendMin={DataApply.trendMin ?? globalTrendMin}
      trendMax={DataApply.trendMax ?? globalTrendMax}
      selectedYearStart={DataApply.selectedYearStart}
      selectedYearEnd={DataApply.selectedYearEnd}    
      labelRegion={labelRegion}
      labelProvince={labelProvince}
      selectedToneColor={selectedToneColor}
      setSelectedToneColor={setSelectedToneColor}
      toneColors={toneColors}
      isReversed={isReversed}
      numberOfYears={numberOfYears}
      isRegionView={DataApply.isRegionView} 
      selectedScale={DataApply.displayMapScale}
    />
  )}
</div>
)}

{showRegularCharts && (
<div className={`time-series-box ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${isExpand ? "expanded" : ""} ${isSeasonalHidden ? "hidden-seasonal" : ""}`}>
        {/* Time series chart */}

  <div className="expand-time-series-button">
    <button
      onClick={() => setIsExpand(prev => !prev)}
      style={{
        backgroundColor: "#4682b4",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "6px 12px",
        fontSize: "13px",
        cursor: "pointer",
        marginBottom: "10px",
      }}
    >
      {isExpand ? "Collapse" : "Expand"}
    </button>
  </div>




  <div className={`time-series-chart ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${isExpand ? "expanded" : ""} 
  ${isSeasonalHidden ? "hidden-seasonal" : ""} ${showSPIBarChart ? "show-spi" : ""}`}>
    {labelYearStart && labelYearEnd ? (
      <h3 className="time-series-head">
        Time Series ({labelYearStart} - {labelYearEnd}) 
      </h3>
    ) : (
      <h3 className="time-series-head">Time Series</h3>
    )}

    <div className="time-series-legend-line">
  <div className="legend-item">
    <span className="annual-average-line"></span>
    <h4 className="legend-text">Annual Average</h4>
  </div>
  <div className="legend-item">
    <span className="kernel-average-line"></span>
    <h4 className="legend-text">{kernelSize}-Year Average</h4>
  </div>
</div>
<Line
  data={chartData}
  options={{
    responsive: true,
    // maintainAspectRatio: false,
    maintainAspectRatio: false,
    devicePixelRatio: 3,
    interaction: {
      mode: 'index',
      intersect: false,
      axis: 'x',
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
          display: false,
        },
  tooltip: {
    enabled: true,
    mode: 'nearest',
    intersect: false,
    backgroundColor: 'white',
    titleColor: 'black',
    bodyColor: 'black',
    borderColor: 'black',
    borderWidth: 1,
    titleFont: {
      size: 14,
      weight: 'bold',
    },
    bodyFont: {
      size: 14,
    },
    padding: 10,
    callbacks: {
      label: function (context) {
        let label = context.dataset.label || '';
        if (label) {
          label += ': ';
        }
        let value = context.raw || 0;
        let unit = getUnit(selectedValue);
        return `${label}${value.toFixed(2)} ${unit}`;
      },
    },
  },
  crosshair: {
            line: {
              color: 'rgba(255, 0, 0, 0.3)',
              width: 1,
              dashPattern: [5, 5],
            },
            sync: {
              enabled: true,
            },
            zoom: {
              enabled: false,
            },
          },
},
    
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
          font: {
            size: 10,
          },
        },
        ticks: {
          font: {
            size: 9,
          },
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        min: chartData?.options?.scales?.y?.min || 10,
        max: chartData?.options?.scales?.y?.max || 50,
        title: {
          display: true,
          text: `${chartData?.options?.scales?.y?.title?.text || 'Unknown'}`,
          font: {
            size: 10,
          },
        },
        ticks: {
          font: {
            size: 9,
          },
          stepSize: Math.ceil((chartData?.options?.scales?.y?.max - chartData?.options?.scales?.y?.min) / 3),
    callback: function (value, index, values) {
      let unit = chartData?.options?.scales?.y?.title?.text.split("(")[1]?.replace(")", "") || "";
      let uniqueTicks = [];

      
      let newValue = Math.round(value);
      while (uniqueTicks.includes(newValue)) {
        newValue += 2;
      }
      uniqueTicks.push(newValue);

      return `${newValue} ${unit}`;
          },
        },
      },
    },
  }}
/>

  </div>
</div>
)}

{showSeasonalCycle && (
<div className={`seasonal-cycle-box ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${isExpand ? "expanded" : ""}`}>
  {/* Seasonal Cycle chart */}

    <div className={`seasonal-cycle-chart ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${isExpand ? "expanded" : ""}`}>
      <h3>Seasonal Cycle</h3>

      
        <div className="seasonal-legend-line">
  <span></span><h4 className='legend-text'>Value</h4>
  {/* <span className="legend-text">Value</span>  */}
</div>

      <Line
  data={seasonalCycle}
  options={{
    responsive: true,
    maintainAspectRatio: false, 
    devicePixelRatio: 3,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: 'white',
        titleColor: 'black',
        bodyColor: 'black',
        borderColor: 'black',
        borderWidth: 1,
        titleFont: { size: 15, weight: 'bold' },
        bodyFont: { size: 14 },
        padding: 10,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            let value = context.raw || 0;
            let unit = getUnit(selectedValue);
            return `${label}${value.toFixed(2)} ${unit}`;
          },
        },
      },

      crosshair: {
            line: {
              color: 'rgba(255, 0, 0, 0.3)',
              width: 1,
              dashPattern: [5, 5],
            },
            sync: {
              enabled: true,
            },
            zoom: {
              enabled: false,
            },
          },

    },
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Months',
          font: { size: 9, family: 'Arial Narrow', weight: 'normal' },
        },
        ticks: {
          font: { size: 9.5, family: 'Arial Narrow', weight: 'normal' },
          callback: function (value, index) {
            const labelsToShow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
            return labelsToShow.includes(index)
              ? this.getLabelForValue(value)
              : '';
          },
        },
      },
      y: {
        min: seasonalCycle?.options?.scales?.y?.min || 0,
        max: seasonalCycle?.options?.scales?.y?.max || 100,
        title: {
          display: true,
          text: seasonalCycle?.options?.scales?.y?.title?.text || 'Unknown',
          font: { size: 10, family: 'Arial Narrow', weight: 'bold' },
        },
        ticks: {
          font: { size: 9, family: 'Arial Narrow', weight: 'normal' },
          stepSize: 10,
          maxTicksLimit: 5,
          callback: function (value) {
            return `${Number(value.toFixed(0))} ${
              seasonalCycle?.options?.scales?.y?.title?.text
                ?.split('(')[1]
                ?.replace(')', '') || ''
            }`;
          },
        },
      },
    },
  }}
/>

    </div>
</div>
)}

{showSPIBarChart && spiChartData && (
  <div className={`spi-chart-wrapper ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${isSPIExpand ? "spi-expanded" : ""} ${showSPIBarChart ? "show-spi" : ""}`}>




    <div className={`spi-chart-group ${isSPIExpand ? "spi-expanded" : ""} ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${isSPIExpand ? "spi-expanded" : ""}`}>


        <div className={`expand-spi-chart-button ${isSPIExpand ? "spi-expanded" : ""}  ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <button
          onClick={() => setIsSPIExpand(prev => !prev)}
          style={{
            backgroundColor: "#4682b4",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "10px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          {isSPIExpand ? "Collapse" : "Expand"}
        </button>
      </div>

      {
        spiChartData.datasets
            .sort((a, b) => {
              // ถ้าเป็น "ONI" ให้ไปล่างสุด
              if (a.label === "Oceanic Nino Index" && b.label !== "Oceanic Nino Index") return 1;
              if (b.label === "Oceanic Nino Index" && a.label !== "Oceanic Nino Index") return -1;
              return 0; // สำหรับข้อมูลอื่นๆ ให้เรียงตามเดิม
            })
            .filter((d) => !d.label.toLowerCase().includes("moving avg"))
            .map((barDataset) => {
              const matchingLine = spiChartData.datasets.find(
                (d) =>
                  d.label.toLowerCase().includes("moving avg") &&
                  d.label.toLowerCase().includes(barDataset.label.toLowerCase())
              );
                const scaleLabel = barDataset.label.toLowerCase(); // เช่น "spi3"
                const scaleMatch = scaleLabel.match(/\d+/);        // ดึง "3" ออกมา
                const scaleKey = scaleMatch ? scaleMatch[0] : null;

                const rSquareText = scaleKey && rSquaredValue[scaleKey]
                  ? `R² = ${rSquaredValue[scaleKey].toFixed(3)}`
                  : "";
                console.log("r Square Text",rSquareText);
            return (
              <div
            key={barDataset.label}
            className={`spi-sub-chart ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${isSPIExpand ? "spi-expanded" : ""} ${showSPIBarChart ? "show-spi" : ""}`}
            style={{ position: "relative" }} // สำคัญ เพื่อให้ข้อความอยู่ในกรอบนี้
          >
            {/* ✅ แสดงข้อความ R² บนมุมขวาบน */}
            {rSquareText && (
              <div className="rsquare-text">
                {rSquareText}
              </div>
            )}

            <Bar
              data={{
                labels: spiChartData.labels,
                datasets: matchingLine
                  ? [barDataset, matchingLine]
                  : [barDataset],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 3,
                plugins: {
                  legend: { display: false },
                  customLegend: {
                    display: true
                  }
                },
                scales: {
                  y: {
                    min: -3,
                    max: 3,
                    title: {
                      display: true,
                      text: barDataset.label, // <-- ยังแสดงชื่อ scale เช่น SPI3
                      font: {
                        size: 15,
                        weight: 'normal',
                      },
                      color: '#000000'
                    },
                  },
                  x: {
                    ticks: {
                      autoSkip: false,
                      maxRotation: 0,
                      minRotation: 0,
                      maxTicksLimit: 20,
                      font: {
                        size: 10,
                      },
                      callback: function (val) {
                        const label = this.getLabelForValue(val);
                        const [year, month] = label.split("-");
                        const labels = this.getLabels();
                        const yearsOnly = labels.filter(lbl => lbl.endsWith("-01"));
                        const totalYears = yearsOnly.length;

                        let interval = 1;
                        if (totalYears <= 11) interval = 1;
                        else if (totalYears <= 70) interval = 5;
                        else interval = 10;

                        if (month === "01") {
                          const numericYear = parseInt(year, 10);
                          return numericYear % interval === 0 ? year : "";
                        }

                        return "";
                      },
                    },
                    grid: {
                      display: true,
                    },
                  },
                },
              }}
            />
          </div>
        );
          })
      }
    </div>
  </div>
)}



</div>

<div className={`dashboard-footer ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${isSpiOpen ? "spi-open" : "spi-closed"}
 ${isExpand ? "expanded" : ""} ${isSPIExpand ? "spi-expanded" : ""} ${isSeasonalHidden ? "hidden-seasonal" : "" } ${showSPIBarChart ? "show-spi" : ""}`} title="Variable Description">
  {variableDescription && (
    <div className="variable-description">
      <p dangerouslySetInnerHTML={{ __html: variableDescription }}></p>
    </div>
  )}
</div>



</div>


  </div>
  
  </div>
);
};
export default App;


