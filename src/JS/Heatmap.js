export const getColor = (temp) => {
    return temp > 35 ? '#a50026' :
           temp > 29 ? '#d73027' :
           temp > 28 ? '#f46d43' :
           temp > 27 ? '#fc8d59' :
           temp > 26 ? '#fee08b' :
           temp > 25 ? '#d9ef8b' :
           temp > 24 ? '#91cf60' :
           temp > 23 ? '#1cc3ff' :
           '#313695';
};


export const style = (feature) => {
    return {
      fillColor: getColor(feature.properties.temperature),
      weight: 1,
      opacity: 1,
      color: 'black',
      dashArray: '3',
      fillOpacity: 0.8
    };
  };

// ฟังก์ชันกรองข้อมูล GeoJSON เพื่อให้เหลือเฉพาะประเทศไทย
export const filterThailandFeatures = (geoJson) => {
    return {
      ...geoJson,
      features: geoJson.features.filter(feature => {
        return feature.properties && feature.properties.country === "Thailand"; // ปรับตามโครงสร้าง GeoJSON ของคุณ
      }),
    };
};

// ฟังก์ชันสไตล์ GeoJSON ที่จะทำให้พื้นที่นอกประเทศไทยจางลง
export const styleWithOpacity = (feature) => {
  if (feature.properties && feature.properties.country === "Thailand") {
    // สไตล์สำหรับประเทศไทย
    return {
      fillColor: getColor(feature.properties.temperature),
      weight: 1,
      opacity: 1,
      color: 'black',
      dashArray: '3',
      fillOpacity: 0.8, // ความชัดเจนสำหรับประเทศไทย
    };
  } else {
    // สไตล์สำหรับประเทศอื่น (จาง)
    return {
      fillColor: '#cccccc', // สีเทา
      weight: 1,
      opacity: 0.3, // ลดความชัดเจน
      color: 'black',
      dashArray: '3',
      fillOpacity: 0.2, // จางมาก
    };
  }
};
