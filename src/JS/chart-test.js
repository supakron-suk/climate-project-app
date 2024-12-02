import React, { useState } from 'react'; // นำเข้า React และ useState เพื่อจัดการ state
import { Line } from 'react-chartjs-2'; // นำเข้า Line สำหรับสร้างกราฟเส้น
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// ลงทะเบียนส่วนประกอบ Chart.js ที่จำเป็น
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const App = () => {
  // ข้อมูลเริ่มต้นสำหรับกราฟ
  const initialData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // ป้ายชื่อแกน X (เดือน)
    datasets: [
      {
        label: 'Average Temperature (°C)', // ชื่อชุดข้อมูล
        data: [30, 27, 27, 30, 32, 33, 32, 31, 22, 27, 25, 24], // ค่าอุณหภูมิเฉลี่ยแต่ละเดือน
        borderColor: 'rgba(75,192,192,1)', // สีของเส้นกราฟ
        backgroundColor: 'rgba(75,192,192,0.2)', // สีพื้นหลังใต้กราฟ
        fill: true, // เปิดการเติมสีใต้กราฟ
        tension: 0.4, // ความโค้งของเส้นกราฟ
      },
    ],
  };

  const [chartData, setChartData] = useState(initialData); // สร้าง state สำหรับข้อมูลกราฟ

  // ฟังก์ชันสำหรับอัปเดตข้อมูลกราฟ
  const updateChartData = () => {
    const newData = chartData.datasets[0].data.map(() => Math.floor(Math.random() * 10 + 20)); // สุ่มข้อมูลใหม่
    setChartData({
      ...chartData, // เก็บข้อมูลเดิม
      datasets: [
        {
          ...chartData.datasets[0], // เก็บค่าชุดข้อมูลเดิม
          data: newData, // อัปเดตข้อมูลใหม่
        },
      ],
    });
  };

  return (
    <div>
      <h1>Simple Line Chart</h1> {/* หัวข้อกราฟ */}
    <div style={{ width: '80%', height: '400px', margin: '0 auto' }}> {/* ขนาดของกราฟ */}
      <Line
        data={chartData} // ข้อมูลกราฟ
        options={{
          responsive: true, // ให้กราฟปรับขนาดตามหน้าจอ
          plugins: {
            legend: {
              display: true, // แสดงคำอธิบายชุดข้อมูล
              position: 'top', // ตำแหน่งคำอธิบายอยู่ด้านบน
            },
          },
          scales: {
            x: {
              beginAtZero: true, // แกน X เริ่มต้นที่ 0
            },
            y: {
              beginAtZero: true, // แกน Y เริ่มต้นที่ 0
            },
          },
        }}
      />
      <button
        onClick={updateChartData} // เรียกใช้ฟังก์ชันเมื่อคลิก
        style={{ marginTop: '20px', padding: '10px 20px' }}
      >
        Update Data {/* ปุ่มสำหรับอัปเดตข้อมูล */}
      </button>
    </div>
  </div>
  );
};

export default App; // ส่งออกคอมโพเนนต์ App