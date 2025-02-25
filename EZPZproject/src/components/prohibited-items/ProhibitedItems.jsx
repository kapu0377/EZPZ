import { useEffect, useState } from "react";
import axios from "axios";
import "./ProhibitedItems.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// 아이콘 및 설명 설정
const CATEGORY_ICONS = {
  화학물질: "🧪",
  "고위험 비행편": "✈️",
  "액체/겔": "💧",
  "폭발/인화성": "💥",
  화기류: "🔫",
  날붙이: "🔪",
  둔기: "🔨",
};

const CATEGORY_DESCRIPTIONS = {
  날붙이:
    "칼, 송곳, 도끼, 드릴날, 가위, 면도칼,\n 작살 기내 반입이 제한됩니다.",
  둔기: "둔탁한 물건이나 도구는 기내 반입이 제한됩니다.",
  화기류: "모든 종류의 화기 및 무기류는 기내 반입이 절대 금지됩니다.",
  화학물질: "인체에 해롭거나 위험한 화학물질은 기내 반입이 제한됩니다.",
  "폭발/인화성": "폭발성 또는 인화성 물질은 기내 반입이 절대 금지됩니다.",
  "액체/겔": "100ml 이하의 용기에 담긴 액체만 기내 반입이 가능합니다.",
  "고위험 비행편":
    "항공보안 등급 경계경보(Orange) 단계 이상 시 추가 제한이 적용됩니다.",
};

const ALLOWED_ITEMS = {
  전자기기: {
    icon: "📱",
    description: "휴대폰, 노트북 등 개인 전자기기는 기내 반입이 가능합니다.",
    items: ["휴대폰", "노트북", "태블릿", "카메라", "보조배터리(160Wh 미만)"],
  },
  의료용품: {
    icon: "💊",
    description: "처방전이 있는 의약품과 의료기기는 기내 반입이 가능합니다.",
    items: ["처방약", "의료기기", "휠체어", "인슐린", "응급약품"],
  },
  개인용품: {
    icon: "👜",
    description: "필수 개인용품은 규정에 맞게 기내 반입이 가능합니다.",
    items: ["의류", "세면도구", "도서", "음식물(고체)", "유아용품"],
  },
};

// 카테고리와 gubun 매핑
const CATEGORY_TO_GUBUN = {
  날붙이: "끝이 뾰족한 무기및 날카로운 물체",
  둔기: "둔기",
  화기류: "화기류, 총기류,무기류",
  화학물질: "화학물질 및 유독성 물질",
  "폭발/인화성": "폭발물과 인화성 물질",
  "액체/겔": "액체/겔(gel)류 물질",
  "고위험 비행편":
    "국토해양부장관이 지정한 고위험이 예상되는 비행편 또는 항공보안 등급 경계경보(Orange) 단계이상",
};

// 카테고리 그룹
const CATEGORY_GROUPS = {
  신체상해류: ["날붙이", "둔기", "화기류"],
  기내허가류: ["전자기기", "의료용품", "개인용품"],
  인체유해류: ["화학물질", "폭발/인화성", "액체/겔"],
};

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ProhibitedItems() {
  const [itemsData, setItemsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [airportList, setAirportList] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState("");
  const [detectionData, setDetectionData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [isAirportModalOpen, setIsAirportModalOpen] = useState(false);
  const [selectedAllowedCategory, setSelectedAllowedCategory] = useState(null);
  const [isAllowedModalOpen, setIsAllowedModalOpen] = useState(false);

  // API 호출: 금지 물품 데이터, 공항 목록
  useEffect(() => {
    axios
      .get("http://localhost:8088/api/prohibit-items")
      .then((response) => {
        setItemsData(response.data);
      })
      .catch((error) => console.error("API 요청 오류:", error));

    axios
      .get("http://localhost:8088/api/airport-detections/distinct")
      .then((response) => {
        setAirportList(response.data);
        if (response.data.length > 0) {
          setSelectedAirport(response.data[0].airportName);
        }
      })
      .catch((error) => console.error("공항 목록 불러오기 오류:", error));
  }, []);

  // 선택된 공항에 따른 적발 데이터 및 차트 데이터 업데이트
  useEffect(() => {
    if (selectedAirport) {
      axios
        .get(
          `http://localhost:8088/api/airport-detections/name/${selectedAirport}`
        )
        .then((response) => {
          setDetectionData(response.data);

          // 카테고리 이름 단축 함수
          const shortenCategory = (category) => {
            const replacements = {
              "날카로운물체(칼 가위 등)": "날붙이",
              "인화성류(라이터 스프레이 폭죽 등)": "인화성",
            };
            return replacements[category] || category;
          };

          // 화기류 관련 카테고리 그룹
          const fireArmsCategories = [
            "권총 등",
            "총기구성품",
            "기타발사장치",
            "탄약류",
          ];

          // 데이터 그룹화 함수
          const groupCategoryData = (data) => {
            const groupedData = {};
            let totalSum = 0;

            data.forEach((item) => {
              let category = shortenCategory(item.category);
              if (fireArmsCategories.includes(item.category)) {
                category = "화기류";
              }
              groupedData[category] =
                (groupedData[category] || 0) + item.detectionCount;
              if (!["김해공항", "김포공항"].includes(selectedAirport)) {
                totalSum += item.detectionCount;
              }
            });

            if (!["김해공항", "김포공항"].includes(selectedAirport)) {
              groupedData["합계"] = totalSum;
            }
            return groupedData;
          };

          const groupedData = groupCategoryData(response.data);
          const labels = Object.keys(groupedData);
          const values = Object.values(groupedData);

          setChartData({
            labels,
            datasets: [
              {
                label: "적발 건수",
                data: values,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          });
        })
        .catch((error) => console.error("적발 현황 불러오기 오류:", error));
    }
  }, [selectedAirport]);

  // 카테고리 모달 오픈/닫기 함수
  const openModal = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openAllowedModal = (category) => {
    setSelectedAllowedCategory(category);
    setIsAllowedModalOpen(true);
  };

  const closeAllowedModal = () => {
    setIsAllowedModalOpen(false);
  };

  // 선택된 카테고리에 해당하는 금지 물품 필터링
  const filteredItems = itemsData.filter(
    (item) => item.gubun === selectedCategory
  );

  return (
    <div
      className="prohibited-items"
      style={{ maxWidth: "1200px", maxHeight: "120%", padding: "0 0px" }}
    >
      <div className="description-section2">
        <h1>항공기 반입 금지물품</h1>
        <p className="checklist-alert">항공 안전을 위한 기내 반입 가능/금지 물품 목록입니다.</p>
      </div>

      <div className="all-categories">
        {Object.entries(CATEGORY_GROUPS).map(([groupName, categories]) => (
          <div
            key={groupName}
            className={`category-column ${
              groupName === "신체상해류"
                ? "physical"
                : groupName === "인체유해류"
                ? "hazardous"
                : "allowed"
            }`}
          >
            <div className="category-title">{groupName}</div>
            {categories.map((category, index) => (
              <div
                key={index}
                className="card"
                onClick={() => {
                  if (groupName === "기내허가류") {
                    openAllowedModal(category);
                  } else {
                    openModal(CATEGORY_TO_GUBUN[category]);
                  }
                }}
              >
                <div className="card-header">
                  <span className="icon">
                    {groupName === "기내허가류"
                      ? ALLOWED_ITEMS[category].icon
                      : CATEGORY_ICONS[category]}
                  </span>
                </div>
                <div className="card-body">
                  <p>
                    <strong>{category}</strong>
                    {groupName === "기내허가류"
                      ? ALLOWED_ITEMS[category].description
                      : CATEGORY_DESCRIPTIONS[category]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 카테고리별 상세정보 모달 */}
      {isModalOpen && selectedCategory && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>
              ✖
            </button>
            <h2>{selectedCategory}</h2>
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>금지 물품</th>
                  <th>기내 반입 여부</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.carryBan}</td>
                      <td>{item.cabin === "Y" ? "허용" : "금지"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isAllowedModalOpen && selectedAllowedCategory && (
        <div className="modal-overlay" onClick={closeAllowedModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeAllowedModal}>
              ✖
            </button>
            <h2>{selectedAllowedCategory}</h2>
            <p>{ALLOWED_ITEMS[selectedAllowedCategory].description}</p>
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>아이템명</th>
                  <th>기내 반입 여부</th> {/* ✅ 기내 반입입 여부 컬럼 추가 */}
                </tr>
              </thead>
              <tbody>
                {ALLOWED_ITEMS[selectedAllowedCategory].items.map(
                  (item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item}</td>
                      <td>허가</td> {/* ✅ 허가 여부 O 표시 */}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* 공항별 적발 현황 모달 오픈 버튼 */}
      <button
        className="open-airport-modal-btn"
        onClick={() => setIsAirportModalOpen(true)}
      >
        공항 별 적발 현황 보기
      </button>

      {/* 공항별 적발 현황 모달 */}
      {isAirportModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAirportModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setIsAirportModalOpen(false)}
            >
              ✖
            </button>
            <h2>공항 별 적발 현황</h2>
            <div className="airport-select-box">
              <label>공항 선택: </label>
              <select
                value={selectedAirport}
                onChange={(e) => setSelectedAirport(e.target.value)}
              >
                {airportList.map((airport, index) => (
                  <option key={index} value={airport.airportName}>
                    {airport.airportName}
                  </option>
                ))}
              </select>
            </div>
            <div className="chart-container">
              {chartData ? (
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      title: {
                        display: true,
                        text: "공항 별 적발 현황",
                        font: { size: 20 },
                        padding: 20,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { display: true, color: "rgba(0, 0, 0, 0.1)" },
                        ticks: { font: { size: 14 } },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { font: { size: 14 } },
                      },
                    },
                  }}
                  style={{ height: "500px" }}
                />
              ) : (
                <p>데이터를 불러오는 중...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProhibitedItems;
