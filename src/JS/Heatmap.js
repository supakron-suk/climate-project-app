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
      fillOpacity: 0.9
    };
  };


