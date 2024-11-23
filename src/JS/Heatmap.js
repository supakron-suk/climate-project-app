export const ColorBar = () => {
    return (
        <div className="color-bar-horizontal">
            <div className="gradient-bar" />
            <div className="temperature-labels">
                <span>21°C</span>
                <span>22°C</span>
                <span>23°C</span>
                <span>24°C</span>
                <span>25°C</span>
                <span>26°C</span>
                <span>27°C</span>
                <span>28°C</span>
                <span>29°C</span>
                <span>30°C</span>
            </div>
        </div>
    );
};


export const getColor = (temp) => {
    return temp > 30 ? '#a50026' :   // สีแดงเข้มสำหรับอุณหภูมิสูง
           temp > 29 ? '#d73027' :
           temp > 28 ? '#f46d43' :
           temp > 27 ? '#fc8d59' :
           temp > 26 ? '#fee08b' :
           temp > 25 ? '#d9ef8b' :
           temp > 24 ? '#91cf60' :
           temp > 23 ? '#1cc3ff' :
           temp > 22 ? '#4575b4' :   // สีฟ้าสำหรับอุณหภูมิใกล้ 20°C
           temp > 21 ? '#313695' :
           '#2c7bb6';                // สีฟ้าเข้มสำหรับอุณหภูมิต่ำ
};



export const style = (feature, selectedRegion) => {
  if (selectedRegion === 'All' || feature.properties.region === selectedRegion) {
    return {
      fillColor: getColor(feature.properties.temperature),
      weight: 0.5,
      opacity: 1,
      color: 'black',
      dashArray: '3',
      fillOpacity: 0.9,
    };
  } else {
    return {
      color: 'transparent',
      weight: 0,
      fillOpacity: 0,
    };
  }
};


export const onEachFeature = (feature, layer) => {
  if (feature.properties) {
    const { name, temperature, region } = feature.properties;

    const popupContent = `
      <b>Province Name:</b> ${name}<br />
      <b>Region:</b> ${region}<br />
      <b>Temperature:</b> ${temperature} °C<br />
    `;
    
    // ผูกข้อมูลใน popup กับ layer ของแต่ละ feature
    layer.bindPopup(popupContent);
  }
};
