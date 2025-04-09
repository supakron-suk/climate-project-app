import configData from './config.json';  // นำเข้าข้อมูลจาก config.json

// ฟังก์ชันสำหรับโหลดข้อมูลของแต่ละ dataset ตามชื่อ dataset
// ฟังก์ชันสำหรับโหลดข้อมูลของแต่ละ dataset ตามชื่อ dataset
// const loadDatasetFiles = async (datasetName) => {
//   const datasetConfig = configData.datasets[datasetName];

//   if (!datasetConfig) {
//     console.error(`Dataset '${datasetName}' not found in config.json`);
//     return {};
//   }

//   const dataset = {};

//   for (const year of datasetConfig.years) {
//     // แทนที่ {year} ใน path และชื่อไฟล์
//     const countryFilePath = `${datasetConfig.path}${year}/${datasetConfig.file_name_pattern.country.replace("{year}", year)}`;
//     const regionFilePath = `${datasetConfig.path}${year}/${datasetConfig.file_name_pattern.region.replace("{year}", year)}`;

//     console.log("Loading file:", countryFilePath, regionFilePath);

//     try {
//       // โหลดไฟล์ country
//       const countryResponse = await fetch(countryFilePath);
//       if (!countryResponse.ok) throw new Error(`Failed to fetch file: ${countryFilePath}`);

//       const countryGeoJsonData = await countryResponse.json();
//       console.log("Loaded Country GeoJSON:", countryGeoJsonData);

//       // โหลดไฟล์ region
//       const regionResponse = await fetch(regionFilePath);
//       if (!regionResponse.ok) throw new Error(`Failed to fetch file: ${regionFilePath}`);

//       const regionGeoJsonData = await regionResponse.json();
//       console.log("Loaded Region GeoJSON:", regionGeoJsonData);

//       // บันทึกข้อมูลลงใน dataset ตามปี
//       dataset[year] = {
//         country: countryGeoJsonData.features || [],
//         region: regionGeoJsonData.features || []
//       };

//     } catch (error) {
//       console.error(`Error loading file for year ${year}:`, error);
//     }
//   }

//   return dataset;
// };

const loadDatasetFiles = async (datasetName) => {
  const datasetConfig = configData.datasets[datasetName];

  if (!datasetConfig) {
    console.error(`Dataset '${datasetName}' not found in config.json`);
    return {};
  }

  const dataset = {};
  
  // ดึงปีเริ่มและสิ้นสุดจาก config
  const startYear = datasetConfig.year_start;
  const endYear = datasetConfig.year_end;

  if (!startYear || !endYear || isNaN(startYear) || isNaN(endYear)) {
    console.error("Invalid 'year_start' or 'year_end' in config.json");
    return {};
  }

  for (let year = startYear; year <= endYear; year++) {
    const filePath = `${datasetConfig.path}${datasetConfig.file_name}${year}${datasetConfig.file_extension}`;
    console.log("Loading file:", filePath);

    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to fetch file: ${filePath}`);

      const geoJsonData = await response.json();

      if (geoJsonData && geoJsonData.features) {
        dataset[year] = {
          type: "FeatureCollection",
          features: geoJsonData.features,
        };
      }
    } catch (error) {
      console.error(`Error loading file: ${filePath}`, error);
    }
  }

  return dataset;
};

export { loadDatasetFiles };



// const loadDatasetFiles = async (datasetName) => {
//   const datasetConfig = configData.datasets[datasetName];

//   if (!datasetConfig) {
//     console.error(`Dataset '${datasetName}' not found in config.json`);
//     return {};
//   }

//   const dataset = {};

//   for (const year of datasetConfig.years) {
//     const filePath = `${datasetConfig.path}${datasetConfig.file_name}${year}${datasetConfig.file_extension}`;
//     console.log("Loading file:", filePath);

//     try {
//       const response = await fetch(filePath);
//       if (!response.ok) throw new Error(`Failed to fetch file: ${filePath}`);

//       const geoJsonData = await response.json();
//       console.log("Loaded GeoJSON:", geoJsonData);

//       if (geoJsonData && geoJsonData.features) {
//         dataset[year] = {
//           type: "FeatureCollection", 
//           features: geoJsonData.features,
//         };
//       }
//     } catch (error) {
//       console.error(`Error loading file: ${filePath}, error`);
//     }
//   }

//   return dataset;
// };

// export { loadDatasetFiles};



