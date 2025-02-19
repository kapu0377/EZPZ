import { useEffect, useState } from "react";
import axios from "axios";
import "./ProhibitedItems.css";
import { Bar } from "react-chartjs-2"; // ✅ 막대 그래프 추가
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

const CATEGORY_NAMES = {
  "화학물질 및 유독성 물질": "화학물질",
  "국토해양부장관이 지정한 고위험이 예상되는 비행편 또는 항공보안 등급 경계경보(Orange) 단계이상":
    "고위험 비행편",
  "액체/겔(gel)류 물질": "액체/겔",
  "폭발물과 인화성 물질": "폭발/인화성",
  "화기류, 총기류,무기류": "화기류",
  "끝이 뾰족한 무기및 날카로운 물체": "날붙이",
};

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
  날붙이: "칼, 송곳, 도끼, 드릴날, 가위, 면도칼, 작살 기내 반입이 제한됩니다.",
  둔기: "무관한 물건이나 도구는 기내 반입이 제한됩니다.",
  화기류: "모든 종류의 화기 및 무기류는 기내 반입이 절대 금지됩니다.",
  화학물질: "인체에 해롭거나 위험한 화학물질은 기내 반입이 제한됩니다.",
  "폭발/인화성": "폭발성 또는 인화성 물질은 기내 반입이 절대 금지됩니다.",
  "액체/겔": "100ml 이하의 용기에 담긴 액체만 기내 반입이 가능합니다.",
  "고위험 비행편":
    "항공보안 등급 경계경보(Orange) 단계 이상 시 추가 제한이 적용됩니다.",
};

// 조건부 반입 가능 물품 정보 추가
const CONDITIONAL_ITEMS = {
  화학물질: ["의약품 (처방전 필요)", "화장품 (100ml 이하)", "개인용 위생용품"],
  "액체/겔": [
    "100ml 이하 용기",
    "1L 투명 지퍼백 내 보관",
    "유아용 음료/식품",
    "의약품 (처방전 필요)",
  ],
  날붙이: [
    "손톱깎이 (날길이 6cm 미만)",
    "면도기 (날 분리 가능)",
    "가위 (날길이 6cm 미만)",
  ],
  화기류: ["라이터 1개 (개인소지)", "성냥 1개 (개인소지)"],
  둔기: ["지팡이 (의료 목적)", "우산", "운동용품 (특별 승인 필요)"],
  "폭발/인화성": [
    "배터리 (160Wh 미만)",
    "드라이아이스 (2.5kg 미만)",
    "의료용 산소통 (사전 승인 필요)",
  ],
  "고위험 비행편": [
    "보안 위협이 높다고 평가되는 항공편",
    "사실상 조건부 허용이 없음",
  ],
};

// 기내 허가류 추가
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

// gubun과 카테고리 매핑을 위한 객체 추가
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

// 카테고리 그룹 정의
const CATEGORY_GROUPS = {
  신체상해류: ["날붙이", "둔기", "화기류"],
  기내허가류: ["전자기기", "의료용품", "개인용품"],
  인체유해류: ["화학물질", "폭발/인화성", "액체/겔"],
};

// ✅ Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ProhibitedItems() {
  const [selectedTab, setSelectedTab] = useState("prohibited-items");
  const [itemsData, setItemsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [airportList, setAirportList] = useState([]); // 공항 목록
  const [selectedAirport, setSelectedAirport] = useState(""); // 선택된 공항
  const [detectionData, setDetectionData] = useState([]); // 적발 데이터
  const [chartData, setChartData] = useState(null); // 그래프 데이터

  useEffect(() => {
    axios
      .get("http://localhost:8088/api/prohibit-items")
      .then((response) => {
        console.log("API 응답 데이터:", response.data);
        setItemsData(response.data);
      })
      .catch((error) => console.error("API 요청 오류:", error));
    // ✅ 공항 목록 가져오기 (중복 제거)
    axios
      .get("http://localhost:8088/api/airport-detections/distinct")
      .then((response) => {
        setAirportList(response.data);
        if (response.data.length > 0) {
          setSelectedAirport(response.data[0].airportName); // 첫 번째 공항 기본 선택
        }
      })
      .catch((error) => console.error("공항 목록 불러오기 오류:", error));
  }, []);

  useEffect(() => {
    if (selectedAirport) {
      // ✅ 선택된 공항의 적발 데이터 가져오기
      axios
        .get(
          `http://localhost:8088/api/airport-detections/name/${selectedAirport}`
        )
        .then((response) => {
          setDetectionData(response.data);

          // ✅ 그래프 데이터 형식 변환
          const labels = response.data.map((item) => item.category);
          const values = response.data.map((item) => item.detectionCount);

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

  const openModal = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // // 특정 공항을 선택하면, 해당 공항의 적발 내역을 가져옴
  // const openAirportModal = (airport) => {
  //   setSelectedAirport(airport);

  //   axios.get(`http://localhost:8088/api/airport-detections/name/${airport.airportName}`)
  //     .then(response => {
  //       setAirportDetections(response.data);
  //       setIsAirportModalOpen(true);
  //     })
  //     .catch(error => console.error("공항 적발 내역 불러오기 오류:", error));
  // };

  // const closeAirportModal = () => {
  //   setIsAirportModalOpen(false);
  // };

  // 데이터 필터링 부분 수정
  const filteredItems = itemsData.filter((item) => {
    return item.gubun === selectedCategory;
  });

  return (
    <div className="prohibited-items">
      <div className="description-section">
        <h1>항공기 반입 물품 안내</h1>
        <p>항공 안전을 위한 기내 반입 가능/금지 물품 목록입니다.</p>
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
                  if (groupName !== "기내허가류") {
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

      <h2>공항 별 적발 현황</h2>
      {/* ✅ 공항 선택 메뉴 */}
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
      {/* ✅ 막대 그래프 출력 */}
      <div className="chart-container">
      {chartData ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { 
                  display: false 
                },
                title: {
                  display: true,
                  text: '공항 별 적발 현황',
                  font: {
                    size: 20
                  },
                  padding: 20
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                  },
                  ticks: {
                    font: {
                      size: 14
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    font: {
                      size: 14
                    }
                  }
                }
              }
            }}
            style={{ height: '500px' }}
          />
        ) : (
          <p>데이터를 불러오는 중...</p>
        )}
      </div>
    </div>
  );
}

export default ProhibitedItems;
