export const cal_index = (dataByYear, startYear, endYear, region, province, value) => {
  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year.");
    return null;
  }

  const filterByRegion = (features, region) => {
    if (region === 'All') return features;
    return features.filter((feature) => feature.properties.region === region);
  };

  const filterByProvince = (features, province) => {
    if (!province) return features;
    return features.filter((feature) => feature.properties.name === province);
  };

  const groupedData = {};

  for (let year = startYear; year <= endYear; year++) {
    const geojson = dataByYear[year]; 
    if (!geojson) continue;

    let filteredFeatures = filterByRegion(geojson.features, region);
    filteredFeatures = filterByProvince(filteredFeatures, province);

    filteredFeatures.forEach((feature) => {
      const { name, region } = feature.properties;
      const { temperature, dtr, pre, tmin, tmax } = feature.properties;
      const geometry = feature.geometry;

      if (!groupedData[name]) {
        groupedData[name] = {
          region,
          geometry,
          temperature: 0,
          dtr: 0,
          pre: 0,
          tmin: 0,
          tmax: 0,
          count: 0,
        };
      }

      if (value === 'temperature' && typeof temperature === 'number') {
        groupedData[name].temperature += temperature;
      } 
      if (value === 'dtr' && typeof dtr === 'number') {
        groupedData[name].dtr += dtr;
      }
      if (value === 'pre' && typeof pre === 'number') {
        groupedData[name].pre += pre;
      }
      if (value === 'tmin' && typeof tmin === 'number') {
        groupedData[name].tmin += tmin;
      }
      if (value === 'tmax' && typeof tmax === 'number') {
        groupedData[name].tmax += tmax;
      }

      groupedData[name].count++; 
    });
  }

  const averagedGeoJSON = {
    type: "FeatureCollection",
    features: Object.keys(groupedData).map((area) => {
      const data = groupedData[area];
      const { temperature, dtr, pre, tmin, tmax, count } = data;

      return {
        type: "Feature",
        geometry: data.geometry,
        properties: {
          name: area,
          region: data.region,
          [value]: count > 0 ? data[value] / count : null, 
        },
      };
    }),
  };

  console.log("Averaged GeoJSON Data Of cal_index:", averagedGeoJSON);
  return averagedGeoJSON;
};


