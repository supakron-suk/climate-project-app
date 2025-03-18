// Era_dataset.js
const loadEraData = async (year) => {
  try {
    const data = await import(`./Geo-data/Era-Dataset/era_data_polygon_${year}.json`);
    return data.default;
  } catch (error) {
    console.error(`Error loading dataset for year ${year}:`, error);
    return null;
  }
};

export default loadEraData;
