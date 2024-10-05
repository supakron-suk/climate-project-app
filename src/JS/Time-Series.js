// TimeSeriesPlot.js

import Plotly from 'plotly.js-dist-min';

// ฟังก์ชันสำหรับ plot กราฟ time series
export const plotTimeSeries = (timeSeriesData) => {
  if (timeSeriesData) {
    Plotly.newPlot('timeSeriesPlot', [{
      x: timeSeriesData.time,
      y: timeSeriesData.temperature,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Temperature over Time'
    }], {
      title: 'Temperature Time Series',
      xaxis: { title: 'Time' },
      yaxis: { title: 'Temperature (°C)' }
    });
  }
};
