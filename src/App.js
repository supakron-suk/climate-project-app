//import HeatmapThailand from './Geo-data/candex_to_geo.json';
//import ConvinceTest from './Geo-data/province_mean_temp_2001.json';
//import data2001 from './Geo-data/Year-Dataset/province_all_2001.json'; 
//import { style, ColorBar } from './JS/Heatmap.js';
//import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
//import Thailandmap from "./Geo-data/thailand-Geo.json";


import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import './App.css';
import MapComponent from './MapComponent'; // นำเข้า MapComponent
import { dummyTimeSeriesData,
         dummySeasonalCycleData,
         calculatemean,
       } from './JS/Graph';
import {TrendMap} from './JS/TrendMap.js';
import { Heatmap } from './JS/Heatmap.js';
import { new_dataset, sendFileToBackend } from "./JS/new_dataset.js";
import colormap from 'colormap';





import { loadDatasetFiles } from './config/config_set';
import configData from './config/config.json';


//----------------------------------------------------------------------------//
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'; //import module for create graph
import { CrosshairPlugin } from 'chartjs-plugin-crosshair';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin, CrosshairPlugin); //ลงทะเบียน func ต่างๆ ของ module chart เพราะเราจะใช้แค่ Linechart


//------------------------IMPORT FUCTION-------------------------------------//

//------------------------FUNCTION APP-------------------------------- -----//
function App() {
  // config Line test
  const [selectedDataset, setSelectedDataset] = useState('');  // เก็บข้อมูล dataset ที่เลือก
  const [isLoading, setIsLoading] = useState(false);
  const [datasetData, setDatasetData] = useState(null);
  const [availableRegions, setAvailableRegions] = useState({});



  const [dataByYear, setDataByYear] = useState({});  // เก็บข้อมูลที่โหลดตามปี
  const [variableOptions, setVariableOptions] = useState([]);  // ตัวเลือกตัวแปรต่าง ๆ ที่จะใช้
  const [selectedYearStart, setSelectedYearStart] = useState('');
  const [selectedYearEnd, setSelectedYearEnd] = useState('');

  
  

  //const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('Thailand_region');
  const [selectedProvince, setSelectedProvince] = useState(''); // จังหวัดที่เลือก
  const [filteredData, setFilteredData] = useState(null); // ข้อมูลที่กรองตามภูมิภาค
  const [filteredYearData, setFilteredYearData] = useState(null);  // เก็บข้อมูลของช่วงปีที่เลือก
  const [provinces, setProvinces] = useState([]); // รายชื่อจังหวัดในภูมิภาค
  const [selectedProvinceData, setSelectedProvinceData] = useState(null);
  const [isRegionView, setIsRegionView] = useState(true);
  const [isProvinceView, setIsProvinceView] = useState(true);

  //const [selectedMonth, setSelectedMonth] = useState(''); // เก็บเดือนที่เลือก
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedData, setSelectedData] = useState([]);
  const [chartData, setChartData] = useState(dummyTimeSeriesData);
  const [seasonalCycle, setSeasonalCycle] = useState(dummySeasonalCycleData);

//const [filteredDataByRange, setFilteredDataByRange] = useState(null);
const [isApplied, setIsApplied] = useState(false);

//---------------------- Trend VALUE data-----------------------//
const [trendGeoData, setTrendGeoData] = useState(null);
const [numberOfYears, setNumberOfYears] = useState(null);
const [heatmapData, setHeatmapData] = useState(null);
const [selectedValue, setSelectedValue] = useState('temperature');
//----------------------------Select map----------------------------//
const [viewMode, setViewMode] = useState("Heatmap"); // "Heatmap" หรือ "TrendMap"
//--------------------------------Select Index of Variable---------------------------//
const [selectedIndex, setSelectedIndex] = useState(null);
const [showSeasonalCycle, setShowSeasonalCycle] = useState(true);

//-------------------------------User Select Min/Max Legend Bar-----------------------//
const [minmaxButton, setminmaxButton] = useState(null);

const [legendMin, setLegendMin] = useState();
const [legendMax, setLegendMax] = useState();

const [actualMin, setActualMin] = useState(null);
const [actualMax, setActualMax] = useState(null);
const [trendMin, setTrendMin] = useState(null);
const [trendMax, setTrendMax] = useState(null);

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

//-----------------------------------------Tone color state---------------------------//

const [selectedToneColor, setSelectedToneColor] = useState("blackbody");
const toneColors = ["velocity-blue", "blackbody", "jet", "viridis"];
const [isReversed, setIsReversed] = useState(false);
const [isReversePopupVisible, setIsReversePopupVisible] = useState(false);

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
  const filterByRegion = (dataByYear, region, selectedYearStart, selectedYearEnd) => {
  const filtered = [];

  for (let year = parseInt(selectedYearStart); year <= parseInt(selectedYearEnd); year++) {
    const regionData = dataByYear[year]?.region;
    if (regionData && regionData.features) {
      const features = region === 'Thailand_region'
        ? dataByYear[year]?.country?.features || []  // ถ้าเลือกประเทศไทย ใช้ country แทน region
        : regionData.features.filter(f => f.properties.region_name === region); 
      filtered.push(...features);
    }
  }

  return filtered;
};



const filteredProvinces = React.useMemo(() => {
  if (!selectedYearStart || !selectedYearEnd || selectedRegion === "Thailand_province") {
    return [];
  }

  const regionProvinces = configData.areas.area_thailand[selectedRegion] || [];
  const provincesSet = new Set();

  for (let year = parseInt(selectedYearStart); year <= parseInt(selectedYearEnd); year++) {
    const provinceData = dataByYear[year]?.province;

    if (provinceData && provinceData.features) {
      provinceData.features.forEach((feature) => {
        const provinceName = feature.properties.name;
        if (regionProvinces.includes(provinceName)) {
          provincesSet.add(provinceName);
        }
      });
    }
  }

  return Array.from(provincesSet);
}, [selectedYearStart, selectedYearEnd, selectedRegion, dataByYear]);




// ฟังก์ชันสลับมุมมอง
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleToggleView = (toRegionView) => {
  setIsRegionView(toRegionView);
  

  const updatedRegion = toRegionView ? "Thailand_region" : "";
  const updatedProvince = !toRegionView ? "Thailand_province" : "";

  // อัปเดต Heatmap
  const heatmapResult = Heatmap(
    dataByYear,
    parseInt(selectedYearStart),
    parseInt(selectedYearEnd),
    updatedRegion,
    updatedProvince,
    selectedValue,
    configData,
    toRegionView
  );
  if (heatmapResult) setHeatmapData(heatmapResult);

  // อัปเดต TrendMap
  const trendResult = TrendMap(
    dataByYear,
    parseInt(selectedYearStart),
    parseInt(selectedYearEnd),
    updatedRegion,
    updatedProvince,
    selectedValue,
    configData,
    toRegionView
  );
  if (trendResult) {
    setTrendGeoData(trendResult.geojson);
    setNumberOfYears(trendResult.numberOfYears);
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
    console.log("📦 Loaded dataset:", dataset);
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



const getFullDatasetName = (dataset, variable) => {
  let datasetName = "";
  
  switch (dataset) {
    case "CRU_dataset":
      datasetName = "Climatic Research Unit Data";
      break;
    case "ERA_dataset":
      datasetName = "ECMWF Reanalysis v5 Data";
      break;
    default:
      return "";
  }

  // ตรวจสอบว่า selectedVariable มีค่าหรือไม่
  return variable ? `${datasetName} (${variable})` : datasetName;
};

//---------------------- value change when change dataset------------------------------//

//-------------------------- New dataset function-------------------------------------//

const [datasetInfo, setDatasetInfo] = useState(null);

  useEffect(() => {
    // ใช้ค่า BACKEND_URL จาก .env
    const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

    // ฟังก์ชันเพื่อดึงข้อมูลจาก Flask API
    const fetchDatasetInfo = async () => {
      try {
        const response = await fetch(`${apiUrl}/dataset-info`);  // เรียก API ใช้ URL ที่เก็บใน .env
        if (response.ok) {
          const data = await response.json();
          setDatasetInfo(data);  // เก็บข้อมูลไว้ใน state
          console.log('Dataset Info:', data);  // แสดงข้อมูลใน console.log
        } else {
          console.log('Failed to fetch dataset:', response.status);
        }
      } catch (error) {
        console.log('Error fetching dataset:', error);
      }
    };

    // เรียกใช้ฟังก์ชันเมื่อ component โหลด
    fetchDatasetInfo();
  }, []);  // ว่างเปล่าเพื่อให้ทำแค่ครั้งเดียวเมื่อ component ถูก mount


//----------------------------------User Effect-------------------------------------------//
//Useeffect--1
// เก็บข้อมูลปีและภูมิภาคเมื่อกด Apply
useEffect(() => {
  if (isApplied && selectedYearStart && selectedYearEnd) {

   const updatedRegion = DataApply.isRegionView
  ? DataApply.selectedRegion
  : "";

// const updatedProvince = !DataApply.isRegionView
//   ? DataApply.selectedProvince
//   : "";
    const updatedProvince = !DataApply.isRegionView ? DataApply.selectedProvince : "";


    console.log("🗺️ [APPLY] View Mode:", DataApply.isRegionView ? "Region View" : "Province View");

    console.log("➡️ Region:", updatedRegion);
    console.log("➡️ Province:", updatedProvince);
    console.log("➡️ Value Key:", selectedValue);

    const selectedYears = Object.keys(dataByYear)
      .filter((year) => year >= selectedYearStart && year <= selectedYearEnd)
      .map((year) => ({

        year,
        data: filterByRegion(dataByYear[year], selectedRegion),
      }));

      selectedYears.forEach(({ year, data }) => {
    });

    setFilteredYearData(selectedYears);

    const provinces = new Set();
    selectedYears.forEach(({ data }) =>
      data.forEach((feature) => provinces.add(feature.properties.name))
    );
    setProvinces(Array.from(provinces));
    
    const trendResult = TrendMap(
        dataByYear,
        parseInt(selectedYearStart),
        parseInt(selectedYearEnd),
        updatedRegion,
        updatedProvince,
        DataApply.selectedValue,
        configData,
        DataApply.isRegionView,
      );

      if (trendResult) {
        setTrendGeoData(trendResult.geojson);
        setNumberOfYears(trendResult.numberOfYears); 
      }


    const averageData = Heatmap(
      dataByYear,
      parseInt(selectedYearStart),
      parseInt(selectedYearEnd),
      updatedRegion,
      updatedProvince,
      DataApply.selectedValue,
      configData,
      DataApply.isRegionView,
    );
    if (averageData) setHeatmapData(averageData);

    const chartData = calculatemean(
      dataByYear,
      selectedYearStart,
      selectedYearEnd,
      updatedRegion,
      updatedProvince,
      // selectedRegion,
      // selectedProvince,
      selectedValue,
      kernelSize,
      configData
    );
    if (chartData) {
      setSeasonalCycle(chartData.seasonalCycleData);
      setChartData(chartData.timeSeriesData);
    }

    setlabelYearStart(selectedYearStart);
    setlabelYearEnd(selectedYearEnd);
    setlabelRegion(updatedRegion);
    setlabelProvince(updatedProvince);
    // setlabelRegion(selectedRegion);

    setIsApplied(false);
  }

}, [isApplied]);

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
  if (!selectedDataset || !selectedValue) return;

  const datasetConfig = configData.datasets[selectedDataset];
  if (!datasetConfig) return;

  const variableOption = datasetConfig.variable_options.find(opt => opt.value === selectedValue);

  if (variableOption?.group === 'Indices Data') {
    setShowSeasonalCycle(false); // ซ่อนกราฟ seasonal cycle
  } else {
    setShowSeasonalCycle(true);  // แสดงกราฟถ้าไม่ใช่ Indices Data
  }
}, [selectedDataset, selectedValue]);


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

  <div className={`sidebar-content ${isLoading ? "loading" : ""}`}>

    <div className="sidebar-header">
    <h2>Access Data</h2>
    </div>

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
  

    {/* Year Selector Dropdown */}
<div className="year-selector">
  <label className="year-label">Time period</label>
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

  
  
    <label className="area-label">Area</label>


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
    <label>Region</label>
    <select
      onChange={(e) => {
        setSelectedRegion(e.target.value);
        setSelectedProvince("");
      }}
      value={selectedRegion}
    >
      <option value="Thailand_region">Thailand</option>
      {Object.keys(configData.areas.area_thailand).map((region) => (
        <option key={region} value={region}>
          {region.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  </div>
) : (
  <div className="province-selector">
    <label>Province</label>
    <select
      onChange={(e) => {
        setSelectedProvince(e.target.value);
        setSelectedRegion("");
      }}
      value={selectedProvince}
    >
      <option value="Thailand_province">Thailand</option>
      {[
        ...new Set(
          Object.values(configData.areas.area_thailand).flat()
        ),
      ].map((province, index) => (
        <option key={index} value={province}>
          {province}
        </option>
      ))}
    </select>
  </div>
)}

    

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


   <div className="value-selector">
  <label>Variable</label>
  <select
    value={selectedValue}
    onChange={(e) => setSelectedValue(e.target.value)}
  >
    <option value="" disabled hidden>
      Select Variable
    </option>
    {["Raw Data", "Indices Data"].map((group) => (
      <optgroup key={group} label={group}>
        {variableOptions
          .filter((option) => option.group === group)
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </optgroup>
    ))}
  </select>
</div>




{/* User Select Legend Bar */}
<div className="legend-bar-container">

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

  {/* Box สำหรับ Min */}
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
        
        if (!/^\d*(\.\d*)?$/.test(value)) return;
      } else if (minmaxButton === "Trend") {
        
        if (!/^-?\d*(\.\d*)?$/.test(value)) return;
      }

      setapplyLegendMin(value); // เก็บค่าเป็น string
    }}
    className="legend-bar-input"
    onBlur={() => {
      if (applyLegendMin !== "" && applyLegendMin !== "-") {
        setapplyLegendMin(parseFloat(applyLegendMin));
      }
    }}
  />
</div>

{/* Box สำหรับ Max */}
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

</div>

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
  <div className={`dashboard-box ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="dashboard-header">
        {selectedDataset && labelRegion && (
          <>
            <label className="dataset-head-dashboard">
  {getFullDatasetName(selectedDataset)}
</label>

          </>
        )}
      </div>

  <div className='dashboard-content'>
 
 

</div>
  
{/* Button select map */}
<div className="map-buttons">
  <button onClick={() => toggleViewMode("Heatmap")}>Actual Map</button>
  <button onClick={() => toggleViewMode("TrendMap")}>Trend Map</button>
</div>

    <div className="right-map">

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
      selectedRegion={DataApply.selectedRegion}
      selectedProvinceData={DataApply.selectedProvinceData} 
      setSelectedProvinceData={setSelectedProvinceData}
      selectedProvince={DataApply.selectedProvince}
      viewMode={viewMode}
      value={DataApply.selectedValue}
      legendMin={DataApply.legendMin}  
      legendMax={DataApply.legendMax}  
      trendMin={DataApply.trendMin}    
      trendMax={DataApply.trendMax}
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
    />
  )}
</div>



<div className={`time-series-box ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        {/* Time series chart */}
  <div className={`time-series-chart ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
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
    maintainAspectRatio: false,
    devicePixelRatio: 2,
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
      size: 16,
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
            size: 12,
          },
        },
        ticks: {
          font: {
            size: 12,
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
            size: 15,
          },
        },
        ticks: {
          font: {
            size: 12,
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

<div className={`seasonal-cycle-box ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
  {/* Seasonal Cycle chart */}
  {showSeasonalCycle && (
    <div className={`seasonal-cycle-chart ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <h3>Seasonal Cycle</h3>

      
        <div className="seasonal-legend-line">
  <span></span><h4 className='legend-text'>Value</h4>
  {/* <span className="legend-text">Value</span>  */}
</div>

      <Line
        data={seasonalCycle}
        options={{
          responsive: true,
          plugins: {
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
      size: 16,
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
            legend: {
              display: false, 
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Months',
                font: {
                  size: 12,
                  
                },
              },
              ticks: {
                font: {
                  size: 12,
                  
                },
              },
            },
            y: {
              min: seasonalCycle?.options?.scales?.y?.min || 0,
              max: seasonalCycle?.options?.scales?.y?.max || 100,
              title: {
                display: true,
                text: `${seasonalCycle?.options?.scales?.y?.title?.text || 'Unknown'}`,
                font: {
                  size: 15,
                  
                },
              },
              ticks: {
                font: {
                  size: 12,
                  
                },
                callback: function(value) {
                  return `${Number(value.toFixed(0))} ${seasonalCycle?.options?.scales?.y?.title?.text.split('(')[1]?.replace(')', '') || ''}`;
                },
              },
            },
          },
        }}
      />
    </div>
  )}
</div>
</div>
      
    
  </div>
  </div>
);
};
export default App;


