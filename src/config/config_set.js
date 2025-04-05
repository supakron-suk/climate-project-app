import configData from './config.json';  // นำเข้าข้อมูลจาก config.json

// ฟังก์ชันสำหรับโหลดข้อมูลของแต่ละ dataset ตามชื่อ dataset
// ฟังก์ชันสำหรับโหลดข้อมูลของแต่ละ dataset ตามชื่อ dataset
const loadDatasetFiles = async (datasetName) => {
  const datasetConfig = configData.datasets[datasetName];

  if (!datasetConfig) {
    console.error(`Dataset '${datasetName}' not found in config.json`);
    return {};
  }

  const dataset = {};

  for (const year of datasetConfig.years) {
    // แทนที่ {year} ใน path และชื่อไฟล์
    const countryFilePath = `${datasetConfig.path}${year}/${datasetConfig.file_name_pattern.country.replace("{year}", year)}`;
    const regionFilePath = `${datasetConfig.path}${year}/${datasetConfig.file_name_pattern.region.replace("{year}", year)}`;

    console.log("Loading file:", countryFilePath, regionFilePath);

    try {
      // โหลดไฟล์ country
      const countryResponse = await fetch(countryFilePath);
      if (!countryResponse.ok) throw new Error(`Failed to fetch file: ${countryFilePath}`);

      const countryGeoJsonData = await countryResponse.json();
      console.log("Loaded Country GeoJSON:", countryGeoJsonData);

      // โหลดไฟล์ region
      const regionResponse = await fetch(regionFilePath);
      if (!regionResponse.ok) throw new Error(`Failed to fetch file: ${regionFilePath}`);

      const regionGeoJsonData = await regionResponse.json();
      console.log("Loaded Region GeoJSON:", regionGeoJsonData);

      // บันทึกข้อมูลลงใน dataset ตามปี
      dataset[year] = {
        country: countryGeoJsonData.features || [],
        region: regionGeoJsonData.features || []
      };

    } catch (error) {
      console.error(`Error loading file for year ${year}:`, error);
    }
  }

  return dataset;
};







// ฟังก์ชันเพื่อดึงข้อมูลตัวเลือกของ dropdown
const getDropdownOptions = () => {
  return configData.dropdown_options;
};

// ฟังก์ชันเพื่อดึงข้อมูลตัวเลือกของตัวแปรสำหรับ dataset ที่เลือก
const getVariableOptions = (datasetName) => {
  const datasetConfig = configData.datasets[datasetName];
  if (datasetConfig) {
    return datasetConfig.variable_options;
  }
  return [];
};


const Geometries_data = async (datasetName, areaName) => {
  const datasetConfig = configData.datasets[datasetName];
  if (!datasetConfig) {
    console.error(`Dataset '${datasetName}' not found in config.json`);
    return null;
  }

  const areaProvinces = configData.areas[areaName];
  if (!areaProvinces) {
    console.error(`Area '${areaName}' not found in config.json`);
    return null;
  }

  let geometries = [];

  for (const year of datasetConfig.years) {
    const filePath = `${datasetConfig.path}${datasetConfig.file_name}${year}${datasetConfig.file_extension}`;
    console.log("Loading file:", filePath);

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${filePath}`);
      }
      
      const geoJsonData = await response.json();
      console.log('GeoJSON Data:', geoJsonData);

      if (geoJsonData && geoJsonData.features) {
        const yearGeometries = geoJsonData.features
          .filter(feature => areaProvinces.includes(feature.properties.name))
          .map(feature => ({
            type: "Feature",
            geometry: feature.geometry,
            properties: { ...feature.properties, year }
          }));
        
        geometries.push(...yearGeometries);
      }
    } catch (error) {
      console.error(`Error loading file: ${filePath}`, error);
    }
  }
  
  return geometries;
};

export { loadDatasetFiles};



