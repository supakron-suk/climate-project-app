//import HeatmapThailand from './Geo-data/candex_to_geo.json';
//import ConvinceTest from './Geo-data/province_mean_temp_2001.json';
//import data2001 from './Geo-data/Year-Dataset/province_all_2001.json'; 
//import { style, ColorBar } from './JS/Heatmap.js';
//import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
//import Thailandmap from "./Geo-data/thailand-Geo.json";


import React, { useEffect, useState } from 'react';
import { LayersControl, MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
//import Thailandmap from "./Geo-data/thailand-Geo.json";
import ShapefileThai_lv0 from "./Geo-data/shapefile-thailand.json";
//import ShapefileThai_lv1 from "./Geo-data/shapefile-lv1-thailand.json";
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import './App.css';
import MapComponent from './MapComponent'; // นำเข้า MapComponent
import { dummyTimeSeriesData,
         dummySeasonalCycleData,
         filterByRegion, 
         filterByMonth,  
         handleYearChange,  
         calculatemean,
       } from './JS/Graph';
import {TrendMap} from './JS/TrendMap.js';
import { Heatmap } from './JS/Heatmap.js';
import { cal_index } from './JS/Index.js';

//----------------------- DATA CRU -----------------------------//
import data_index_1901 from './Geo-data/Year-Dataset/data_index_polygon_1901.json';
import data_index_1902 from './Geo-data/Year-Dataset/data_index_polygon_1902.json';
import data_index_1903 from './Geo-data/Year-Dataset/data_index_polygon_1903.json';
import data_index_1904 from './Geo-data/Year-Dataset/data_index_polygon_1904.json';
import data_index_1905 from './Geo-data/Year-Dataset/data_index_polygon_1905.json';
import data_index_1906 from './Geo-data/Year-Dataset/data_index_polygon_1906.json';
import data_index_1907 from './Geo-data/Year-Dataset/data_index_polygon_1907.json';
import data_index_1908 from './Geo-data/Year-Dataset/data_index_polygon_1908.json';
import data_index_1909 from './Geo-data/Year-Dataset/data_index_polygon_1909.json';
import data_index_1910 from './Geo-data/Year-Dataset/data_index_polygon_1910.json';
//import data_index_1960 from './Geo-data/Year-Dataset/test_1960.json';

//----------------------- DATA ERRA -----------------------------//
import erra_data_1960 from './Geo-data/Era-Dataset/era_data_polygon_1960.json';
import erra_data_1961 from './Geo-data/Era-Dataset/era_data_polygon_1961.json';
import erra_data_1962 from './Geo-data/Era-Dataset/era_data_polygon_1962.json'; 
import erra_data_1963 from './Geo-data/Era-Dataset/era_data_polygon_1963.json';
import erra_data_1964 from './Geo-data/Era-Dataset/era_data_polygon_1964.json';
import erra_data_1965 from './Geo-data/Era-Dataset/era_data_polygon_1965.json';
import erra_data_1966 from './Geo-data/Era-Dataset/era_data_polygon_1966.json';
import erra_data_1967 from './Geo-data/Era-Dataset/era_data_polygon_1967.json';
import erra_data_1968 from './Geo-data/Era-Dataset/era_data_polygon_1968.json';
import erra_data_1969 from './Geo-data/Era-Dataset/era_data_polygon_1969.json';
import erra_data_1970 from './Geo-data/Era-Dataset/era_data_polygon_1970.json';
import erra_data_1971 from './Geo-data/Era-Dataset/era_data_polygon_1971.json';
import erra_data_1972 from './Geo-data/Era-Dataset/era_data_polygon_1972.json';
import erra_data_1973 from './Geo-data/Era-Dataset/era_data_polygon_1973.json';
import erra_data_1974 from './Geo-data/Era-Dataset/era_data_polygon_1974.json';
import erra_data_1975 from './Geo-data/Era-Dataset/era_data_polygon_1975.json';

//----------------------------------------------------------------------------//
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'; //import module for create graph
import { CrosshairPlugin } from 'chartjs-plugin-crosshair';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin, CrosshairPlugin); //ลงทะเบียน func ต่างๆ ของ module chart เพราะเราจะใช้แค่ Linechart
//------------------------IMPORT FUCTION-------------------------------------//

//------------------------FUNCTION APP-------------------------------- -----//
function App() {
  const [selectedDataset, setSelectedDataset] = useState('CRU_dataset');
  

  //const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('Thailand');
  const [selectedProvince, setSelectedProvince] = useState(''); // จังหวัดที่เลือก
  const [filteredData, setFilteredData] = useState(null); // ข้อมูลที่กรองตามภูมิภาค
  const [filteredYearData, setFilteredYearData] = useState(null);  // เก็บข้อมูลของช่วงปีที่เลือก
  const [provinces, setProvinces] = useState([]); // รายชื่อจังหวัดในภูมิภาค
  const [selectedProvinceData, setSelectedProvinceData] = useState(null);
  //const [selectedMonth, setSelectedMonth] = useState(''); // เก็บเดือนที่เลือก
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedData, setSelectedData] = useState([]);
  const [chartData, setChartData] = useState(dummyTimeSeriesData);
  const [seasonalCycle, setSeasonalCycle] = useState(dummySeasonalCycleData);

const [dataByYear, setDataByYear] = useState({
  "1901": data_index_1901,
  "1902": data_index_1902,
  "1903": data_index_1903,
  "1904": data_index_1904,
  "1905": data_index_1905,
  "1906": data_index_1906,
  "1907": data_index_1907,
  "1908": data_index_1908,
  "1909": data_index_1909,
  "1910": data_index_1910,
});

const [selectedYearStart, setSelectedYearStart] = useState('');
const [selectedYearEnd, setSelectedYearEnd] = useState('');
//const [filteredDataByRange, setFilteredDataByRange] = useState(null);
const [isApplied, setIsApplied] = useState(false);

//---------------------- Trend VALUE data-----------------------//
const [trendGeoData, setTrendGeoData] = useState(null);
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

const [variableOptions, setVariableOptions] = useState([
    { label: "Temperature Mean", value: "temperature", group: "Raw Data" },
    { label: "Temperature Min", value: "tmin", group: "Raw Data" },
    { label: "Temperature Max", value: "tmax", group: "Raw Data" },
    { label: "Precipitation", value: "pre", group: "Raw Data" },
  ]);


//-----------------------------------------Label Output Dashboard---------------------------//
const [labelYearStart, setlabelYearStart] = useState(null);
const [labelYearEnd, setlabelYearEnd] = useState(null);
const [labelRegion, setlabelRegion] = useState("");
const [labelProvince, setlabelProvince] = useState("");



const [DataApply, setDataApply] = useState("");
//------------------------FUNCTION APP-------------------------------------//

//-------------------------------------------------- Function Area------------------------------------------//
  // ฟังก์ชันกรองข้อมูลตามภูมิภาค
  const filterByRegion = (data, region) => {
    if (region === 'Thailand') {
      return data.features;
    } else {
      return data.features.filter(feature => feature.properties.region === region);
    }
  };

 const filteredProvinces = React.useMemo(() => {
  if (!selectedYearStart || !selectedYearEnd || selectedRegion === "Thailand") {
    return []; // คืนค่ารายการว่างถ้าเงื่อนไขไม่ครบ
  }

  // รวบรวมข้อมูลในช่วงปีที่เลือก
  const filteredFeatures = [];
  for (let year = parseInt(selectedYearStart); year <= parseInt(selectedYearEnd); year++) {
    const yearData = dataByYear[year.toString()];
    if (yearData) {
      filteredFeatures.push(...yearData.features);
    }
  }

  // กรองข้อมูลตามภูมิภาค
  const provincesSet = new Set();
  filteredFeatures.forEach((feature) => {
    if (feature.properties.region === selectedRegion) {
      provincesSet.add(feature.properties.name); // เก็บชื่อจังหวัดใน Set เพื่อหลีกเลี่ยงข้อมูลซ้ำ
    }
  });

  return Array.from(provincesSet); // แปลง Set เป็น Array
}, [selectedYearStart, selectedYearEnd, selectedRegion, dataByYear]);

// ฟังก์ชันสลับมุมมอง
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };


  const handleValueChange = (e) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    
  setapplyLegendMin(null);
  setapplyLegendMax(null);
  };

// const handleValueChange = (e) => {
//     setSelectedValue(e.target.value);
//     setIsApplied(true); // Trigger useEffect
//   };

// ฟังก์ชันเปลี่ยน dataset
// ฟังก์ชันเปลี่ยน dataset
const handleDatasetChange = (e) => {
  const selected = e.target.value;
  setSelectedDataset(selected);

  // อัปเดต dataByYear ตาม dataset ที่เลือก
  if (selected === 'CRU_dataset') {
    setDataByYear({
      "1901": data_index_1901,
      "1902": data_index_1902,
      "1903": data_index_1903,
      "1904": data_index_1904,
      "1905": data_index_1905,
      "1906": data_index_1906,
      "1907": data_index_1907,
      "1908": data_index_1908,
      "1909": data_index_1909,
      "1910": data_index_1910,
    });

     setVariableOptions([
        { label: "Temperature Mean", value: "temperature", group: "Raw Data" },
        { label: "Temperature Min", value: "tmin", group: "Raw Data" },
        { label: "Temperature Max", value: "tmax", group: "Raw Data" },
        { label: "Precipitation", value: "pre", group: "Raw Data" },
      ]);
  } else if (selected === 'ERA_dataset') {
    setDataByYear({
      "1960": erra_data_1960,
      "1961": erra_data_1961,
      "1962": erra_data_1962,
      "1963": erra_data_1963,
      "1964": erra_data_1964,
      "1965": erra_data_1965,
      "1966": erra_data_1966,
      "1967": erra_data_1967,
      "1968": erra_data_1968,
      "1969": erra_data_1969,
      "1970": erra_data_1970,
      "1971": erra_data_1971,
      "1972": erra_data_1972,
      "1973": erra_data_1973,
      "1974": erra_data_1974,
      "1975": erra_data_1975,
    });

    setVariableOptions([
        { label: "Temperature Min", value: "tmin", group: "Raw Data" },
        { label: "Temperature Max", value: "tmax", group: "Raw Data" },
        { label: "Precipitation", value: "pre", group: "Raw Data" },
        { label: "TXx", value: "txx", group: "Index Data" },
        { label: "TNn", value: "tnn", group: "Index Data" },
        { label: "Rx1day", value: "rx1day", group: "Index Data" },
      
    ]);
  }

  // Reset ค่าอื่นๆ (กราฟและแผนที่)
  setSelectedYearStart('');
  setSelectedYearEnd('');
  setFilteredYearData(null);
  setTrendGeoData(null);
  setHeatmapData(null);
  setSeasonalCycle({ labels: [], datasets: [] });
  setChartData({ labels: [], datasets: [] });
  setIsApplied(false);
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
    case "ERA_dataset":
      return "ECMWF Reanalysis v5 Data";
    default:
      return "";
  }
};



//---------------------- value change when change dataset


//----------------------------------User Effect-------------------------------------------//
//Useeffect--1
// เก็บข้อมูลปีและภูมิภาคเมื่อกด Apply
useEffect(() => {
  if (isApplied && selectedYearStart && selectedYearEnd) {
    const selectedYears = Object.keys(dataByYear)
      .filter((year) => year >= selectedYearStart && year <= selectedYearEnd)
      .map((year) => ({
        year,
        data: filterByRegion(dataByYear[year], selectedRegion),
      }));

    setFilteredYearData(selectedYears);

    const provinces = new Set();
    selectedYears.forEach(({ data }) =>
      data.forEach((feature) => provinces.add(feature.properties.name))
    );
    setProvinces(Array.from(provinces));

    const generatedGeoJSON = TrendMap(
      dataByYear,
      parseInt(selectedYearStart),
      parseInt(selectedYearEnd),
      selectedRegion,
      selectedProvince,
      selectedValue
    );
    if (generatedGeoJSON) setTrendGeoData(generatedGeoJSON);

    const averageData = Heatmap(
      dataByYear,
      parseInt(selectedYearStart),
      parseInt(selectedYearEnd),
      selectedRegion,
      selectedProvince,
      selectedValue
    );
    if (averageData) setHeatmapData(averageData);

    const chartData = calculatemean(
      dataByYear,
      selectedYearStart,
      selectedYearEnd,
      selectedRegion,
      selectedProvince,
      selectedValue,
      kernelSize
    );
    if (chartData) {
      setSeasonalCycle(chartData.seasonalCycleData);
      setChartData(chartData.timeSeriesData);
    }

    setlabelYearStart(selectedYearStart);
    setlabelYearEnd(selectedYearEnd);
    setlabelRegion(selectedRegion);

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
    if (selectedValue === 'txx' || selectedValue === 'tnn' || selectedValue === 'rx1day') {
      setShowSeasonalCycle(false); 
    } else {
      setShowSeasonalCycle(true); 
    }
  }, [selectedValue]); 

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

  <div className="sidebar-content">

    <div className="sidebar-header">
    <h2>Access Data</h2>
    </div>

    {/* Dropdown เลือก Dataset */}
    <div className="dataset-selector">
      <label>Select Dataset</label>
      <select value={selectedDataset} onChange={handleDatasetChange}>
        <option value="CRU_dataset">CRU Dataset</option>
        <option value="ERA_dataset">ERA Dataset</option>
      </select>
    </div>


    {/* Dropdown for Start Year Selection */}
    <div className="year-selector">
      <label className="year-label">Time period</label>
      <div className="dropdown-container">
        <div className="dropdown-item">
          <label className="start-year-label">Start Year</label>
          <select
            value={selectedYearStart}
            onChange={(e) => setSelectedYearStart(e.target.value)}
          >
            <option value="">start year</option>
            {Object.keys(dataByYear).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown for End Year Selection */}
        <div className="dropdown-item">
          <label>End Year</label>
          <select
            value={selectedYearEnd}
            onChange={(e) => setSelectedYearEnd(e.target.value)}
          >
            <option value="">end year</option>
            {Object.keys(dataByYear).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* Select Area */}
    <label className="area-label">Area</label>
    <div className="region-selector">
      <label>Region</label>
      <select
        onChange={(e) => {
          const region = e.target.value;
          setSelectedRegion(region); 
          setSelectedProvince(""); 
        }}
        value={selectedRegion}
      >
        <option value="Thailand">Thailand</option>
        <option value="North_East_region">North East</option>
        <option value="North_region">North</option>
        <option value="South_region">South</option>
        <option value="Middle_region">Middle</option>
        <option value="East_region">East</option>
        <option value="West_region">West</option>
      </select>
    </div>

    {/* Select Province */}
    <div className="province-selector">
      <label>Province</label>
      <select
        onChange={(e) => {
          const provinceName = e.target.value;
          setSelectedProvince(provinceName);
        }}
        value={selectedProvince}
        disabled={filteredProvinces.length === 0}
      >
        <option value="">All Provinces</option>
        {filteredProvinces.length > 0 ? (
          filteredProvinces.map((province, index) => (
            <option key={index} value={province}>
              {province}
            </option>
          ))
        ) : (
          <option value="">No Provinces Available</option>
        )}
      </select>
    </div>

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
    onChange={handleValueChange}
  >
    {/* กลุ่ม Raw Values */}
    {["Raw Data", "Index Data"].map((group) => (
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
      onClick={() => setminmaxButton('Actual')}
    >
      Actual
    </button>
    <button
      className={`legend-bar-button Trend_minmax ${minmaxButton === 'Trend' ? 'selected' : ''}`}
      onClick={() => setminmaxButton('Trend')}
    >
      Trend
    </button>
  </div>

  {/* Box สำหรับ Min */}
  <div className="legend-bar-item legend-bar-min">
  <label>Min:</label>
  <input
    type="text"
    value={applyLegendMin ?? ""}
    onChange={(e) => {
      const value = e.target.value;

      // ถ้าเลือก Actual ห้ามใส่ค่าติดลบ
      if (minmaxButton === 'Actual' && value === "-") return;

      // ตรวจสอบให้ใส่ "-" ได้เฉพาะปุ่ม Trend
      if (minmaxButton === 'Trend' && value === "-") {
        setapplyLegendMin(value);
        return;
      }

      // อนุญาตเฉพาะตัวเลขทศนิยม
      if (/^-?\d*\.?\d*$/.test(value)) {
        setapplyLegendMin(value === "" ? null : parseFloat(value));
      }
    }}
    className="legend-bar-input"
  />
</div>

{/* Box สำหรับ Max */}
<div className="legend-bar-item legend-bar-max">
  <label>Max:</label>
  <input
    type="text"
    value={applyLegendMax ?? ""}
    onChange={(e) => {
      const value = e.target.value;

      // ถ้าเลือก Actual ห้ามใส่ค่าติดลบ
      if (minmaxButton === 'Actual' && value === "-") return;

      // ตรวจสอบให้ใส่ "-" ได้เฉพาะปุ่ม Trend
      if (minmaxButton === 'Trend' && value === "-") {
        setapplyLegendMax(value);
        return;
      }

      // อนุญาตเฉพาะตัวเลขทศนิยม
      if (/^-?\d*\.?\d*$/.test(value)) {
        setapplyLegendMax(value === "" ? null : parseFloat(value));
      }
    }}
    className="legend-bar-input"
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
            legendMin: minmaxButton === 'Actual' ? applyLegendMin : null, // ใช้เฉพาะเมื่อเลือก Actual
            legendMax: minmaxButton === 'Actual' ? applyLegendMax : null, // ใช้เฉพาะเมื่อเลือก Actual
            trendMin: minmaxButton === 'Trend' ? applyLegendMin : null,  // เพิ่มสำหรับ Trend
            trendMax: minmaxButton === 'Trend' ? applyLegendMax : null,  // เพิ่มสำหรับ Trend
            selectedRegion: selectedRegion,
            selectedProvince: selectedProvince,
          };
          setDataApply(appliedData);

          setIsApplied(true);
        }}
        disabled={!selectedYearStart || !selectedYearEnd}
        className="apply_button"
      >
        Apply
      </button>
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
  {(viewMode === "TrendMap" || viewMode === "Heatmap") && (
    <MapComponent
      key={`${viewMode}-${selectedYearStart}-${selectedYearEnd}-${selectedValue}-${isApplied}`} 
      geoData={viewMode === "TrendMap" ? trendGeoData : heatmapData} 
      selectedRegion={DataApply.selectedRegion}
      selectedProvinceData={DataApply.selectedProvinceData} 
      setSelectedProvinceData={setSelectedProvinceData}
      selectedProvince={DataApply.selectedProvince}
      viewMode={viewMode}
      value={DataApply.selectedValue}
      legendMin={DataApply.legendMin}  // ใช้ค่า legendMin ที่อัปเดต
      legendMax={DataApply.legendMax}  // ใช้ค่า legendMax ที่อัปเดต
      trendMin={DataApply.trendMin}    // ใช้ค่า trendMin ที่อัปเดต
      trendMax={DataApply.trendMax}    // ใช้ค่า trendMax ที่อัปเดต
      labelRegion={labelRegion}
      labelProvince={labelProvince} 
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
        min: chartData?.options?.scales?.y?.min || 0,
        max: chartData?.options?.scales?.y?.max || 100,
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
          callback: function (value) {
            return `${Number(value.toFixed(0))} ${chartData?.options?.scales?.y?.title?.text.split('(')[1]?.replace(')', '') || ''}`;
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



// useEffect(() => {
//   if (isApplied && selectedYearStart && selectedYearEnd) {
//     // คำนวณค่า chartData ตามข้อมูลที่กรองแล้ว
//     const chartData = calculatemean(dataByYear, 
//       selectedYearStart, 
//       selectedYearEnd, 
//       selectedRegion, 
//       selectedProvince,
//       selectedValue);

//     if (chartData) {
//       setSeasonalCycle(chartData.seasonalCycleData);
//       setChartData(chartData.timeSeriesData);
//     }

//     // อัปเดตแผนที่ตามข้อมูลด้วย TrendMap
//     const generatedGeoJSON = TrendMap(
//       dataByYear,
//       parseInt(selectedYearStart),
//       parseInt(selectedYearEnd),
//       selectedRegion,
//       selectedProvince,
//       selectedValue
//     );

//     if (generatedGeoJSON) {
//       setTrendGeoData(generatedGeoJSON); // เก็บข้อมูลใน state
//     }

//     // คำนวณค่าเฉลี่ยสำหรับ Heatmap
//     const averageData = Heatmap(
//       dataByYear,
//       parseInt(selectedYearStart),
//       parseInt(selectedYearEnd),
//       selectedRegion,
//       selectedProvince,
//       selectedValue 
//     );

//     if (averageData) {
//       //console.log("Heatmap Average Data:", averageData); // ตรวจสอบผลลัพธ์ใน console
//       setHeatmapData(averageData); // เก็บข้อมูลใน state เพื่อใช้งานใน Heatmap
//     }

//     // Reset isApplied หลังจากทำงานเสร็จ
//     setIsApplied(false);
//   }
// }, [isApplied, selectedYearStart, selectedYearEnd, selectedRegion, selectedProvince, selectedValue, dataByYear]);