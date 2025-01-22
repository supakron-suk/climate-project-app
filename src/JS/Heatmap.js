//Heatmap
export const Heatmap = (dataByYear, startYear, endYear, region, province, value) => {
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

    //console.log(`GeoJSON for Year: ${year}`, geojson);

    let filteredFeatures = filterByRegion(geojson.features, region);
    filteredFeatures = filterByProvince(filteredFeatures, province);

    filteredFeatures.forEach((feature) => {
      const { name, region } = feature.properties;
      const { temperature, dtr, pre, tmin, tmax, tnn, txx} = feature.properties;
      console.log(`Year: ${year}, Province: ${name}, Value: ${value}, Pre: ${pre}, TXX: ${txx}, TNN: ${tnn}`);
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
      groupedData[name].count++; 
    });
  }

  const averagedGeoJSON = {
    type: "FeatureCollection",
    features: Object.keys(groupedData).map((area) => {
      const data = groupedData[area];
      const { temperature, dtr, pre, tmin, tmax, tnn, txx, count } = data;

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




// export const Heatmap = (dataByYear, startYear, endYear, region, province) => {
//   if (startYear > endYear) {
//     console.error("Start year must be less than or equal to end year.");
//     return null;
//   }

//   // ฟังก์ชันกรองข้อมูลตามภูมิภาค
//   const filterByRegion = (features, region) => {
//     if (region === 'All') return features;
//     return features.filter((feature) => feature.properties.region === region);
//   };

//   // ฟังก์ชันกรองข้อมูลตามจังหวัด
//   const filterByProvince = (features, province) => {
//     if (!province) return features;
//     return features.filter((feature) => feature.properties.name === province);
//   };

//   // เก็บข้อมูลแบบกลุ่ม (เฉลี่ยสำหรับแต่ละพื้นที่)
//   const groupedData = {};

//   // วนลูปปีที่อยู่ในช่วงเวลาที่กำหนด
//   for (let year = startYear; year <= endYear; year++) {
//     const geojson = dataByYear[year]; // ดึงข้อมูล GeoJSON ตามปี
//     if (!geojson) continue; // ข้ามปีที่ไม่มีข้อมูล

//     // กรองข้อมูลตามภูมิภาคและจังหวัด
//     let filteredFeatures = filterByRegion(geojson.features, region);
//     filteredFeatures = filterByProvince(filteredFeatures, province);

//     // รวมค่าข้อมูลแยกตามพื้นที่
//     filteredFeatures.forEach((feature) => {
//       const { name, region } = feature.properties;
//       const { temperature, dtr, pre, tmin, tmax } = feature.properties;
//       const geometry = feature.geometry;

//       // สร้าง entry สำหรับจังหวัดหากยังไม่มีใน groupedData
//       if (!groupedData[name]) {
//         groupedData[name] = {
//           region,
//           geometry,
//           temperature: 0,
//           dtr: 0,
//           pre: 0,
//           tmin: 0,
//           tmax: 0,
//           count: 0, // เก็บจำนวนข้อมูล
//         };
//       }

//       // เพิ่มค่าต่าง ๆ เฉพาะข้อมูลที่มีค่า valid
//       if (typeof temperature === 'number') groupedData[name].temperature += temperature;
//       if (typeof dtr === 'number') groupedData[name].dtr += dtr;
//       if (typeof pre === 'number') groupedData[name].pre += pre;
//       if (typeof tmin === 'number') groupedData[name].tmin += tmin;
//       if (typeof tmax === 'number') groupedData[name].tmax += tmax;

//       groupedData[name].count++; // เพิ่มตัวนับข้อมูล
//     });
//   }

//   // คำนวณค่าเฉลี่ยสำหรับแต่ละพื้นที่
//   const averagedGeoJSON = {
//     type: "FeatureCollection",
//     features: Object.keys(groupedData).map((area) => {
//       const data = groupedData[area];
//       const { temperature, dtr, pre, tmin, tmax, count } = data;

//       return {
//         type: "Feature",
//         geometry: data.geometry,
//         properties: {
//           name: area,
//           region: data.region,
//           temperature: count > 0 ? temperature / count : null,
//           dtr: count > 0 ? dtr / count : null,
//           pre: count > 0 ? pre / count : null,
//           tmin: count > 0 ? tmin / count : null,
//           tmax: count > 0 ? tmax / count : null,
//         },
//       };
//     }),
//   };

//   console.log("Averaged GeoJSON Data:", averagedGeoJSON); // แสดงผลทาง console
//   return averagedGeoJSON; // คืนค่า GeoJSON ที่มีค่าเฉลี่ย
// };





// import React from 'react';

// export const ColorBar = () => {
//     return (
//         <div className="color-bar-horizontal">
//             <div className="gradient-bar" />
//             <div className="temperature-labels">
//                 <span>21°C</span>
//                 <span>22°C</span>
//                 <span>23°C</span>
//                 <span>24°C</span>
//                 <span>25°C</span>
//                 <span>26°C</span>
//                 <span>27°C</span>
//                 <span>28°C</span>
//                 <span>29°C</span>
//                 <span>30°C</span>
//             </div>
//         </div>
//     );
// };


// export const getColor = (temp) => {
//     return temp > 30 ? '#a50026' :   // สีแดงเข้มสำหรับอุณหภูมิสูง
//            temp > 29 ? '#d73027' :
//            temp > 28 ? '#f46d43' :
//            temp > 27 ? '#fc8d59' :
//            temp > 26 ? '#fee08b' :
//            temp > 25 ? '#d9ef8b' :
//            temp > 24 ? '#91cf60' :
//            temp > 23 ? '#1cc3ff' :
//            temp > 22 ? '#4575b4' :   // สีฟ้าสำหรับอุณหภูมิใกล้ 20°C
//            temp > 21 ? '#313695' :
//            '#2c7bb6';                // สีฟ้าเข้มสำหรับอุณหภูมิต่ำ
// };



// export const style = (feature, selectedRegion) => {
//   if (selectedRegion === 'All' || feature.properties.region === selectedRegion) {
//     return {
//       fillColor: getColor(feature.properties.temperature),
//       weight: 0.5,
//       opacity: 1,
//       color: 'black',
//       dashArray: '3',
//       fillOpacity: 0.9,
//     };
//   } else {
//     return {
//       color: 'transparent',
//       weight: 0,
//       fillOpacity: 0,
//     };
//   }
// };


// export const onEachFeature = (feature, layer) => {
//   if (feature.properties) {
//     const { name, temperature, region } = feature.properties;

//     const popupContent = `
//       <b>Province Name:</b> ${name}<br />
//       <b>Region:</b> ${region}<br />
//       <b>Temperature:</b> ${temperature} °C<br />
//     `;
    
//     // ผูกข้อมูลใน popup กับ layer ของแต่ละ feature
//     layer.bindPopup(popupContent);
//   }
// };

// //Heatmap
// export const Heatmap = (dataByYear, startYear, endYear, region, province, value) => {
//   if (startYear > endYear) {
//     console.error("Start year must be less than or equal to end year.");
//     return null;
//   }

//   const filterByRegion = (features, region) => {
//     if (region === 'All') return features;
//     return features.filter((feature) => feature.properties.region === region);
//   };

//   const filterByProvince = (features, province) => {
//     if (!province) return features;
//     return features.filter((feature) => feature.properties.name === province);
//   };

//   const groupedData = {};

//   for (let year = startYear; year <= endYear; year++) {
//     const geojson = dataByYear[year]; 
//     if (!geojson) continue;

//     let filteredFeatures = filterByRegion(geojson.features, region);
//     filteredFeatures = filterByProvince(filteredFeatures, province);

//     filteredFeatures.forEach((feature) => {
//       const { name, region } = feature.properties;
//       const { temperature, dtr, pre, tmin, tmax, txx, tnn } = feature.properties;
//       const geometry = feature.geometry;

//       if (!groupedData[name]) {
//         groupedData[name] = {
//           region,
//           geometry,
//           temperature: 0,
//           dtr: 0,
//           pre: 0,
//           tmin: 0,
//           tmax: 0,
//           txx: 0,
//           tnn: 0,
//           count: 0,
//         };
//       }

//       // ใช้ค่า `value` ที่เลือกจาก dropdown เพื่อคำนวณเฉพาะค่าที่ต้องการ
//       if (value === 'temperature' && typeof temperature === 'number') {
//         groupedData[name].temperature += temperature;
//       } 
//       if (value === 'dtr' && typeof dtr === 'number') {
//         groupedData[name].dtr += dtr;
//       }
//       if (value === 'pre' && typeof pre === 'number') {
//         groupedData[name].pre += pre;
//       }
//       if (value === 'tmin' && typeof tmin === 'number') {
//         groupedData[name].tmin += tmin;
//       }
//       if (value === 'tmax' && typeof tmax === 'number') {
//         groupedData[name].tmax += tmax;
//       }
//       if (value === 'txx' && typeof txx === 'number') {
//         groupedData[name].txx += txx;
//       }
//       if (value === 'tnn' && typeof tnn === 'number') {
//         groupedData[name].tnn += tnn;
//       }
//       groupedData[name].count++; 
//     });
//   }

//   const averagedGeoJSON = {
//     type: "FeatureCollection",
//     features: Object.keys(groupedData).map((area) => {
//       const data = groupedData[area];
//       const { temperature, dtr, pre, tmin, tmax, txx, tnn, count } = data;

//       return {
//         type: "Feature",
//         geometry: data.geometry,
//         properties: {
//           name: area,
//           region: data.region,
//           [value]: count > 0 ? data[value] / count : null, // คำนวณค่าเฉลี่ยตาม value ที่เลือก
//         },
//       };
//     }),
//   };

//   console.log("Averaged GeoJSON Data:", averagedGeoJSON); // แสดงข้อมูล GeoJSON ที่คำนวณแล้ว
//   return averagedGeoJSON;
// };





// export const Heatmap = (dataByYear, startYear, endYear, region, province) => {
//   if (startYear > endYear) {
//     console.error("Start year must be less than or equal to end year.");
//     return null;
//   }

//   // ฟังก์ชันกรองข้อมูลตามภูมิภาค
//   const filterByRegion = (features, region) => {
//     if (region === 'All') return features;
//     return features.filter((feature) => feature.properties.region === region);
//   };

//   // ฟังก์ชันกรองข้อมูลตามจังหวัด
//   const filterByProvince = (features, province) => {
//     if (!province) return features;
//     return features.filter((feature) => feature.properties.name === province);
//   };

//   // เก็บข้อมูลแบบกลุ่ม (เฉลี่ยสำหรับแต่ละพื้นที่)
//   const groupedData = {};

//   // วนลูปปีที่อยู่ในช่วงเวลาที่กำหนด
//   for (let year = startYear; year <= endYear; year++) {
//     const geojson = dataByYear[year]; // ดึงข้อมูล GeoJSON ตามปี
//     if (!geojson) continue; // ข้ามปีที่ไม่มีข้อมูล

//     // กรองข้อมูลตามภูมิภาคและจังหวัด
//     let filteredFeatures = filterByRegion(geojson.features, region);
//     filteredFeatures = filterByProvince(filteredFeatures, province);

//     // รวมค่าข้อมูลแยกตามพื้นที่
//     filteredFeatures.forEach((feature) => {
//       const { name, region } = feature.properties;
//       const { temperature, dtr, pre, tmin, tmax } = feature.properties;
//       const geometry = feature.geometry;

//       // สร้าง entry สำหรับจังหวัดหากยังไม่มีใน groupedData
//       if (!groupedData[name]) {
//         groupedData[name] = {
//           region,
//           geometry,
//           temperature: 0,
//           dtr: 0,
//           pre: 0,
//           tmin: 0,
//           tmax: 0,
//           count: 0, // เก็บจำนวนข้อมูล
//         };
//       }

//       // เพิ่มค่าต่าง ๆ เฉพาะข้อมูลที่มีค่า valid
//       if (typeof temperature === 'number') groupedData[name].temperature += temperature;
//       if (typeof dtr === 'number') groupedData[name].dtr += dtr;
//       if (typeof pre === 'number') groupedData[name].pre += pre;
//       if (typeof tmin === 'number') groupedData[name].tmin += tmin;
//       if (typeof tmax === 'number') groupedData[name].tmax += tmax;

//       groupedData[name].count++; // เพิ่มตัวนับข้อมูล
//     });
//   }

//   // คำนวณค่าเฉลี่ยสำหรับแต่ละพื้นที่
//   const averagedGeoJSON = {
//     type: "FeatureCollection",
//     features: Object.keys(groupedData).map((area) => {
//       const data = groupedData[area];
//       const { temperature, dtr, pre, tmin, tmax, count } = data;

//       return {
//         type: "Feature",
//         geometry: data.geometry,
//         properties: {
//           name: area,
//           region: data.region,
//           temperature: count > 0 ? temperature / count : null,
//           dtr: count > 0 ? dtr / count : null,
//           pre: count > 0 ? pre / count : null,
//           tmin: count > 0 ? tmin / count : null,
//           tmax: count > 0 ? tmax / count : null,
//         },
//       };
//     }),
//   };

//   console.log("Averaged GeoJSON Data:", averagedGeoJSON); // แสดงผลทาง console
//   return averagedGeoJSON; // คืนค่า GeoJSON ที่มีค่าเฉลี่ย
// };





// import React from 'react';

// export const ColorBar = () => {
//     return (
//         <div className="color-bar-horizontal">
//             <div className="gradient-bar" />
//             <div className="temperature-labels">
//                 <span>21°C</span>
//                 <span>22°C</span>
//                 <span>23°C</span>
//                 <span>24°C</span>
//                 <span>25°C</span>
//                 <span>26°C</span>
//                 <span>27°C</span>
//                 <span>28°C</span>
//                 <span>29°C</span>
//                 <span>30°C</span>
//             </div>
//         </div>
//     );
// };


// export const getColor = (temp) => {
//     return temp > 30 ? '#a50026' :   // สีแดงเข้มสำหรับอุณหภูมิสูง
//            temp > 29 ? '#d73027' :
//            temp > 28 ? '#f46d43' :
//            temp > 27 ? '#fc8d59' :
//            temp > 26 ? '#fee08b' :
//            temp > 25 ? '#d9ef8b' :
//            temp > 24 ? '#91cf60' :
//            temp > 23 ? '#1cc3ff' :
//            temp > 22 ? '#4575b4' :   // สีฟ้าสำหรับอุณหภูมิใกล้ 20°C
//            temp > 21 ? '#313695' :
//            '#2c7bb6';                // สีฟ้าเข้มสำหรับอุณหภูมิต่ำ
// };



// export const style = (feature, selectedRegion) => {
//   if (selectedRegion === 'All' || feature.properties.region === selectedRegion) {
//     return {
//       fillColor: getColor(feature.properties.temperature),
//       weight: 0.5,
//       opacity: 1,
//       color: 'black',
//       dashArray: '3',
//       fillOpacity: 0.9,
//     };
//   } else {
//     return {
//       color: 'transparent',
//       weight: 0,
//       fillOpacity: 0,
//     };
//   }
// };


// export const onEachFeature = (feature, layer) => {
//   if (feature.properties) {
//     const { name, temperature, region } = feature.properties;

//     const popupContent = `
//       <b>Province Name:</b> ${name}<br />
//       <b>Region:</b> ${region}<br />
//       <b>Temperature:</b> ${temperature} °C<br />
//     `;
    
//     // ผูกข้อมูลใน popup กับ layer ของแต่ละ feature
//     layer.bindPopup(popupContent);
//   }
// };
