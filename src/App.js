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
// import { isCompositeComponent } from 'react-dom/test-utils';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin); //ลงทะเบียน func ต่างๆ ของ module chart เพราะเราจะใช้แค่ Linechart
//------------------------IMPORT FUCTION-------------------------------------//

//------------------------FUNCTION APP-------------------------------- -----//
function App() {
  const [selectedDataset, setSelectedDataset] = useState('CRU_dataset');

  //const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('All');
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
const [legendMin, setLegendMin] = useState(null);
const [legendMax, setLegendMax] = useState(null);
//-------------------------------User Select Min/Max Legend Bar-----------------------//
const [kernelSize, setKernelSize] = useState(null);



//------------------------FUNCTION APP-------------------------------------//

//-------------------------------------------------- Function Area------------------------------------------//
  // ฟังก์ชันกรองข้อมูลตามภูมิภาค
  const filterByRegion = (data, region) => {
    if (region === 'All') {
      return data.features;
    } else {
      return data.features.filter(feature => feature.properties.region === region);
    }
  };

 const filteredProvinces = React.useMemo(() => {
  if (!selectedYearStart || !selectedYearEnd || selectedRegion === "All") {
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
    setIsApplied(true); // Trigger useEffect
    
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

    setIsApplied(false);
  }
}, [isApplied]);


useEffect(() => {
  if (filteredYearData && selectedValue) {
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
  }
}, [selectedValue,  filteredYearData, kernelSize]);

//---------------------------------- Index Use Effect------------------------------------//
useEffect(() => {
    if (selectedValue === 'txx' || selectedValue === 'tnn' || selectedValue === 'rx1day') {
      setShowSeasonalCycle(false); // ซ่อนกราฟ seasonal cycle เมื่อเลือก txx หรือ tnn
    } else {
      setShowSeasonalCycle(true); // แสดงกราฟ seasonal cycle เมื่อเลือก --- หรือค่าอื่น
    }
  }, [selectedValue]); // ติดตามการเปลี่ยนแปลงของ selectedValue

 

//----------------------------------User Effect-----------------------------------------------//
//----------------------------------webpage UI AREA-------------------------------------------//

  return (
  <div className="main-container">
    <div className="header-text">
      <h1 className="block-text">Multidimensional climate data visualization</h1>
    </div>

     {/* Introduction Section */}
    <div className="introduction-header" style={{ fontSize: '30px', lineHeight: '1.6' }}>
     <h2>Dashboard for Visualizing Climate Data Across Time and Area</h2>
      </div> 

    <div className="introduction" style={{ padding: '20px', textAlign: 'justify' }}>
      <p style={{ fontSize: '30px', lineHeight: '1.6' }}>
        Thailand's climate varies and fluctuates across different times of the year, 
        often presenting intriguing patterns worth exploring. 
        This dashboard aims to provide users with a clear and interactive way to understand climate data and trends 
        within specific regions and time periods. 
        Through the use of dynamic graphs and spatial visualizations, 
        users can gain insights into regional climate behavior and make 
        informed observations about environmental changes over time.
      </p>
      <p style={{ fontSize: '30px', lineHeight: '1.6' }}>
        The datasets utilized in this visualization are sourced from the CRU dataset provided by 
        the University of East Anglia (UEA) and the ERA5 dataset from the European Centre for Medium-Range Weather Forecasts (ECMWF). 
        Both datasets serve as reliable references, and we have tailored their data to be presented in various 
        formats suitable for visualizing climate conditions across Thailand.
      </p>
    </div>

    {/* <div classname = "Time-period-text">
      <h1>Select Time Period</h1>

    </div> */}

      {/* Dropdown เลือก Dataset */}
<div className="dataset-selector">
  <label>Select Dataset:</label>
  <select value={selectedDataset} onChange={handleDatasetChange}>
    <option value="CRU_dataset">CRU Dataset</option>
    <option value="ERA_dataset">ERA Dataset</option>
  </select>
</div>


  <div style={{ padding: '20px', }}>
  <h1 className="title-year">Select Time Period</h1>

  {/* Dropdown for Start Year Selection */}
      <div className="year-selector">
        <label>Select Start Year</label>
        <select
          value={selectedYearStart}
          onChange={(e) => setSelectedYearStart(e.target.value)}
          style={{ width: '200px', padding: '10px', margin: '10px' }}
        >
          <option value="">-- select start year --</option>
          {Object.keys(dataByYear).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Dropdown for End Year Selection */}
        <label>Select End Year</label>
        <select
          value={selectedYearEnd}
          onChange={(e) => setSelectedYearEnd(e.target.value)}
          style={{ width: '200px', padding: '10px', margin: '10px' }}
        >
          <option value="">-- select end year --</option>
          {Object.keys(dataByYear).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

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

    setIsApplied(true); // Trigger useEffect
  }}
  disabled={!selectedYearStart || !selectedYearEnd}
  style={{
    padding: '10px 20px',
    margin: '10px',
    backgroundColor: !selectedYearStart || !selectedYearEnd ? '#ccc' : '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: !selectedYearStart || !selectedYearEnd ? 'not-allowed' : 'pointer',
  }}
>
  Apply
</button>
      </div>

{/* Button select map */}
<div className="map-buttons">
  <button onClick={() => toggleViewMode("Heatmap")}>choropleth Map</button>
  <button onClick={() => toggleViewMode("TrendMap")}>Trend Map</button>
</div>

{/* การแสดงผลตาม viewMode */}
{/* {viewMode === "Heatmap" && heatmapData && (
  console.log("Choropleth Map:", heatmapData) 
)}

{viewMode === "TrendMap" && trendGeoData && (
  console.log("TrendMap:", trendGeoData) 
)} */}
{/* Button select map */}



{/* Dropdown สำหรับเลือกภูมิภาค */}
<div className="region-selector">
  <label>Select Region:</label>
  <select
    onChange={(e) => {
      const region = e.target.value;
      setSelectedRegion(region); // อัปเดตภูมิภาคที่เลือก
      setSelectedProvince(""); // รีเซ็ตจังหวัดเมื่อเลือกภูมิภาคใหม่
    }}
    value={selectedRegion}
    // style={{ width: '200px', padding: '10px', fontSize: '20px' }}
  >
    <option value="All">All Regions</option>
    <option value="North_East_region">North East</option>
    <option value="North_region">North</option>
    <option value="South_region">South</option>
    <option value="Middle_region">Middle</option>
    <option value="East_region">East</option>
    <option value="West_region">West</option>
  </select>
</div>

{/* Dropdown สำหรับเลือกจังหวัด */}
<div className="province-selector">
  <label>Select Province:</label>
  <select
    onChange={(e) => {
      const provinceName = e.target.value;
      setSelectedProvince(provinceName); // อัปเดตจังหวัดที่เลือก
    }}
    value={selectedProvince}
    style={{ width: '200px', padding: '10px', fontSize: '16px' }}
    disabled={filteredProvinces.length === 0} // ปิดการใช้งานถ้าไม่มีจังหวัดให้เลือก
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



    </div>

    <div className="content-container">

    <h1>DashBoard</h1>
  <div className="dashboard-box">

  <div className="dropdown-container">

   
  <div className="value-selector">
  <label>Select Data:</label>
  <select
    value={selectedValue}
    onChange={handleValueChange}
  >
    {/* กลุ่ม Raw Values */}
    <optgroup label="Raw Data">
      <option value="temperature">Temperature Mean</option>
      <option value="tmin">Temperature Min</option>
      <option value="tmax">Temperature Max</option>
      <option value="pre">Precipitation</option>
    </optgroup>

    {/* กลุ่ม Index */}
    <optgroup label="Index Data">
      <option value="txx">TXx</option>
      <option value="tnn">Tnn</option>
      <option value="rx1day">rx1day</option>
      {/* <option value="rx1day">rx1day</option> */}
    </optgroup>
  </select>
</div>
 

</div>
  
  {/* User Select Legend Bar */}
<div className="legend-bar-container">
  {/* Box สำหรับ Min */}
  <div className="legend-bar-item legend-bar-min">
    <label>Min:</label>
    <input
  type="text"
  value={legendMin ?? ""}  // ถ้า null ให้แสดงเป็น ""
  onChange={(e) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value)) {
      setLegendMin(value === "" ? null : Number(value)); // ถ้าเป็น "" ให้เซ็ตเป็น null
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
  value={legendMax ?? ""}
  onChange={(e) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value)) {
      setLegendMax(value === "" ? null : Number(value));
    }
  }}
  className="legend-bar-input"
/>

  </div>
</div>

{/* User Select Legend Bar */}


<input 
  type="number" 
  value={kernelSize} 
  onChange={(e) => setKernelSize(Number(e.target.value))} 
  min={1} 
  max={50} 
  className="kernel-input"
/>



   
    <div className="right-map">
  {(viewMode === "TrendMap" || viewMode === "Heatmap") && (
    <MapComponent
      key={`${viewMode}-${selectedYearStart}-${selectedYearEnd}-${selectedValue}-${isApplied}`} 
      geoData={viewMode === "TrendMap" ? trendGeoData : heatmapData} 
      selectedRegion={selectedRegion}
      selectedProvinceData={selectedProvinceData} 
      setSelectedProvinceData={setSelectedProvinceData}
      selectedProvince={selectedProvince}
      viewMode={viewMode}
      value={selectedValue}
      legendMin={legendMin} // ส่งค่า Min
    legendMax={legendMax} // ส่งค่า Max
    />
  )}
</div>



      {/* Time series chart */}
<div className="time-series-chart">
  <h3>Time Series</h3>
  <Line
    data={chartData}
    options={{
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        annotation: {
          annotations: chartData?.options?.plugins?.annotation?.annotations || [],
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year',
            font: {
              size: 18,
              weight: 'bold',
            },
          },
          ticks: {
            font: {
              size: 18,
              weight: 'bold',
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
              size: 18,
              weight: 'bold',
            },
          },
          ticks: {
            font: {
              size: 16,
              weight: 'bold',
            },
            callback: function(value) {
              return `${Number(value.toFixed(0))} ${chartData?.options?.scales?.y?.title?.text.split('(')[1]?.replace(')', '') || ''}`;
            },
          },
        },
      },
    }}
  />
</div>

{/* Seasonal Cycle chart */}
{showSeasonalCycle && (
  <div className="Seasonal-Cycle-chart">
    <h3>Seasonal Cycle</h3>
    <Line
      data={seasonalCycle}
      options={{
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Months',
              font: {
                size: 18,
                weight: 'bold',
              },
            },
            ticks: {
              font: {
                size: 14,
                weight: 'bold',
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
                size: 18,
                weight: 'bold',
              },
            },
            ticks: {
              font: {
                size: 16,
                weight: 'bold',
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



      <div className="container">
        <div className="content">
          <div className="time-series-chart">
            <div id="timeSeriesPlot" style={{ width: '100%', height: '650px' }}></div>
          </div>
          <div classname="Seasonal-Cycle-chart">
            <div id="seasonalcyclePlot" style={{ width: '100%', height: '650px' }}></div>
          </div>
          {/* <div className="right-map">
  {(viewMode === "TrendMap" || viewMode === "Heatmap") && (
    <MapComponent
      key={`${viewMode}-${selectedYearStart}-${selectedYearEnd}-${selectedValue}-${isApplied}`} 
      geoData={viewMode === "TrendMap" ? trendGeoData : heatmapData} 
      selectedRegion={selectedRegion}
      selectedProvinceData={selectedProvinceData} 
      setSelectedProvinceData={setSelectedProvinceData}
      selectedProvince={selectedProvince}
      viewMode={viewMode}
      value={selectedValue}
    />
  )}
</div> */}
  </div>
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