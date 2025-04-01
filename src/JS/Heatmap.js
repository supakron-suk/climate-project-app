//Heatmap
export const Heatmap = (dataByYear, startYear, endYear, region, province, value) => {
  if (startYear > endYear) {
    console.error("Start year must be less than or equal to end year.");
    return null;
  }

  const filterByRegion = (features, region) => {
    if (region === 'Thailand') return features;
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

    //console.log(`GeoJSON for Year: ${year}`, geojson);

    let filteredFeatures = filterByRegion(geojson.features, region);
    filteredFeatures = filterByProvince(filteredFeatures, province);

    filteredFeatures.forEach((feature) => {
      const { name, region } = feature.properties;
      const { temperature, dtr, pre, tmin, tmax, tnn, txx, rx1day} = feature.properties;
      //console.log(`Year: ${year}, Province: ${name}, Value: ${value}, Pre: ${pre}, TXX: ${txx}, TNN: ${tnn}`);
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
          tnn: 0,
          txx: 0,
          rx1day: 0,
          count: 0,
        };
      }

      // ใช้ค่า `value` ที่เลือกจาก dropdown เพื่อคำนวณเฉพาะค่าที่ต้องการ
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
      if (value === 'txx' && typeof txx === 'number') {
        groupedData[name].txx += txx;
      }
      if (value === 'tnn' && typeof tnn === 'number') {
        groupedData[name].tnn += tnn;
      }
      if (value === 'rx1day' && typeof rx1day === 'number') {
        groupedData[name].rx1day += rx1day;
      }
      groupedData[name].count++; 
    });
  }

  const averagedGeoJSON = {
    type: "FeatureCollection",
    features: Object.keys(groupedData).map((area) => {
      const data = groupedData[area];
      const { temperature, dtr, pre, tmin, tmax, tnn, txx, rx1day, count } = data;

      return {
        type: "Feature",
        geometry: data.geometry,
        properties: {
          name: area,
          region: data.region,
          [value]: count > 0 ? data[value] / count : null, // คำนวณค่าเฉลี่ยตาม value ที่เลือก
        },
      };
    }),
  };

  console.log("Averaged GeoJSON Data:", averagedGeoJSON); // แสดงข้อมูล GeoJSON ที่คำนวณแล้ว
  return averagedGeoJSON;
};







