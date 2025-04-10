import configData from './config.json';  // นำเข้าข้อมูลจาก config.json


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

        console.log(`Dataset for year ${year}:`, dataset[year]);
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



