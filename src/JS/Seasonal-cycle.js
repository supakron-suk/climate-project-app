// useEffect(() => {
//   if (isApplied) {
//     if (selectedYearStart && selectedYearEnd) {
//       if (selectedProvince) {
//         // กรณีเลือกจังหวัด
//         const provinceTemperatures = [];
//         for (let year = parseInt(selectedYearStart); year <= parseInt(selectedYearEnd); year++) {
//           const yearData = dataByYear[year];
//           const yearlyTemperatures = getProvinceTemp(yearData, selectedProvince);
//           if (yearlyTemperatures) {
//             provinceTemperatures.push(...yearlyTemperatures);
//           }
//         }

//         if (provinceTemperatures.length > 0) {
//           setChartData({
//             ...dummyTimeSeriesData,
//             datasets: [
//               {
//                 ...dummyTimeSeriesData.datasets[0],
//                 data: provinceTemperatures, // ค่า temperature รวมทุกปีของจังหวัด
//               },
//             ],
//           });
//         }
//       } else if (selectedRegion) {
//         // กรณีเลือกภูมิภาค
//         const chartData = calculatemean(dataByYear, selectedYearStart, selectedYearEnd, selectedRegion);
//         if (chartData) {
//           // console.log("Chart Data:", chartData);
//           // const seasonalCycle = Seasonal_Cycle(chartData, parseInt(selectedYearStart), parseInt(selectedYearEnd));
//           // console.log("Seasonal Cycle:", seasonalCycle); 
//           setChartData(chartData);
//         }


//         // กรองข้อมูลตามภูมิภาค
//         const yearData = dataByYear[selectedYearStart]; // ใช้ข้อมูลปีเริ่มต้นในการกรอง
//         let filtered = filterByRegion(yearData, selectedRegion);

//         // อัปเดตข้อมูลที่กรองแล้ว
//         setFilteredData(filtered);

//         // อัปเดตรายชื่อจังหวัดที่สามารถเลือกได้
//         if (filtered.length > 0) {
//           setProvinces(filtered.map((feature) => feature.properties.name));
//         } else {
//           setProvinces([]); // ถ้าไม่มีข้อมูล ให้เคลียร์รายชื่อจังหวัด
//         }

//         // รีเซ็ตจังหวัดที่เลือก
//         setSelectedProvince('');
//       }
//     }

//     // Reset isApplied หลังจากทำงานเสร็จ
//     setIsApplied(false);
//   }
// }, [isApplied, selectedYearStart, selectedYearEnd, selectedProvince, selectedRegion, dataByYear]);