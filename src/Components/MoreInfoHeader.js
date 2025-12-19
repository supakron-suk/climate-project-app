// src/Components/MoreInfoHeader.js
import { useNavigate } from "react-router-dom";

function MoreInfoHeader() {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
      const data = await response.json();
      console.log("API Response:", data);

      navigate("/more-info", { state: { apiData: data } });
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <h1 className="more-info-text" onClick={handleClick} style={{ cursor: "pointer" }}>
      More Info
    </h1>
  );
}

export default MoreInfoHeader;
