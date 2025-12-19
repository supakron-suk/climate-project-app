// config_set.js (medium Config Set Not K8S)
import configData from './config.json';

const loadDatasetFiles = async (datasetName) => {
  const datasetConfig = configData.datasets[datasetName];
  if (!datasetConfig) {
    console.error(`Dataset '${datasetName}' not found in config.json`);
    return {};
  }

  const { path, year_start, year_end, file_name_pattern } = datasetConfig;
  const dataset = {};

  for (let year = year_start; year <= year_end; year++) {
    dataset[year] = {};

    for (const [type, patternObj] of Object.entries(file_name_pattern)) {
      const fileName = typeof patternObj === 'string'
        ? patternObj.replace('{year}', year)
        : patternObj.filename.replace('{year}', year); // ✅ ดึงจาก filename

      const filePath = `${path}${year}/${fileName}`;
      console.log(`Loading ${type} file:`, filePath);

      try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to fetch ${type} file: ${filePath}`);

        const geoJsonData = await response.json();
        dataset[year][type] = geoJsonData;
      } catch (error) {
        console.error(`Error loading ${type} file for year ${year}:`, error);
      }
    }
  }

  return dataset;
};


export { loadDatasetFiles };







// //------------------------------------------------------------------------------
// // config_set.js (Config Set For Kubenetes Kube Container)
// //------------------------------------------------------------------------------
// import configData from './config.json';

// const BASE_URL = process.env.REACT_APP_DATASET_URL;
// console.log("BASE_URL is:", BASE_URL);

// const loadDatasetFiles = async (datasetName) => {
//   const datasetConfig = configData.datasets[datasetName];
//   if (!datasetConfig) {
//     console.error(`Dataset '${datasetName}' not found in config.json`);
//     return {};
//   }

//   const { path, year_start, year_end, file_name_pattern } = datasetConfig;
//   const dataset = {};

//   for (let year = year_start; year <= year_end; year++) {
//     dataset[year] = {};

//     for (const [type, patternObj] of Object.entries(file_name_pattern)) {
//       const fileName = typeof patternObj === 'string'
//         ? patternObj.replace('{year}', year)
//         : patternObj.filename.replace('{year}', year);

//       // รวม BASE_URL กับ path เพื่อให้ fetch จาก dataset-service
//       const filePath = `${BASE_URL}${path}${year}/${fileName}`;
//       console.log(`Loading ${type} file:`, filePath);

//       try {
//         const response = await fetch(filePath);
//         if (!response.ok) throw new Error(`Failed to fetch ${type} file: ${filePath}`);

//         const geoJsonData = await response.json();
//         dataset[year][type] = geoJsonData;
//       } catch (error) {
//         console.error(`Error loading ${type} file for year ${year}:`, error);
//       }
//     }
//   }

//   return dataset;
// };

// export { loadDatasetFiles };



