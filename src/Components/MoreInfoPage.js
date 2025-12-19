import { useNavigate } from "react-router-dom";

function MoreInfoHeader() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/more-info"); // 👉 กดแล้วไปหน้าใหม่ตรง ๆ เลย
  };

  return (
    <h1
      className="more-info-text"
      onClick={handleClick}
      style={{ cursor: "pointer", color: "blue" }}
    >
      More Info
    </h1>
  );
}

export default MoreInfoHeader;

