import { useEffect, useState } from "react";
import axios from "axios";
import "./ProhibitedItems.css";

const CATEGORY_NAMES = {
  "화학물질 및 유독성 물질": "화학물질",
  "국토해양부장관이 지정한 고위험이 예상되는 비행편 또는 항공보안 등급 경계경보(Orange) 단계이상": "고위험 비행편",
  "액체/겔(gel)류 물질": "액체/겔",
  "폭발물과 인화성 물질": "폭발/인화성",
  "화기류, 총기류,무기류": "화기류",
  "끝이 뾰족한 무기및 날카로운 물체": "날붙이"
};

const CATEGORY_ICONS = {
  "화학물질": "🧪",
  "고위험 비행편": "✈️",
  "액체/겔": "💧",
  "폭발/인화성": "💥",
  "화기류": "🔫",
  "날붙이": "🔪",
  "둔기":"🔨"
};

const CATEGORY_DESCRIPTIONS = {
  "화학물질": "인체에 해롭거나 위험한 화학물질은 기내 반입이 제한됩니다.",
  "고위험 비행편": "안전상의 이유로 고위험 비행편에서는 추가 제한이 적용됩니다.",
  "둔기": "무겁고 둔탁한 손상을 입힐 수 있는 도구는 기내 반입이 제한됩니다.",
  "액체/겔": "액체 및 젤류는 일정 용량 이상 반입이 제한됩니다.",
  "폭발/인화성": "폭발성 또는 인화성 물질은 기내 반입이 금지됩니다.",
  "화기류": "모든 종류의 화기 및 무기류는 기내 반입이 금지됩니다.",
  "날붙이": "날카로운 물체나 끝이 뾰족한 도구는 기내 반입이 제한됩니다."
};


function ProhibitedItems() {
  console.log("dd")
  const [itemsData, setItemsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8088/api/prohibit-items")
      .then((response) => {
        console.log("dd", response)
        setItemsData(response.data);
      })
      .catch((error) => console.error("API 요청 오류:", error));
  }, []);

  const categories = [...new Set(itemsData.map(item => item.gubun))];

  const openModal = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="prohibited-items">
      <div className="description-section">
        <h1>기내 금지 물품 목록</h1>
        <p>
          항공 안전을 위해 기내 반입이 금지된 물품 목록입니다. 
          각 카테고리를 클릭하면 상세 정보를 확인할 수 있습니다.
        </p>
      </div>

      <div className="cards-container">
        {categories.map((category, index) => (
          <div
            key={index}
            className="card"
            onClick={() => openModal(category)}
          >
            <div className="card-header">
              <span className="icon">{CATEGORY_ICONS[CATEGORY_NAMES[category] || category]}</span>
              <h2>{CATEGORY_NAMES[category] || category}</h2>
            </div>
            <div className="card-body">
              <p>{CATEGORY_DESCRIPTIONS[CATEGORY_NAMES[category] || category]}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedCategory && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>✖</button>
            <h2>{CATEGORY_NAMES[selectedCategory] || selectedCategory}</h2>
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>금지 물품</th>
                  <th>기내 반입 여부</th>
                </tr>
              </thead>
              <tbody>
                {itemsData
                  .filter(item => item.gubun === selectedCategory)
                  .map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.carryBan}</td>
                      <td>{item.cabin === "Y" ? "허용" : "금지"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProhibitedItems;
