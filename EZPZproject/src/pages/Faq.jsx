import React, { useState } from "react";
import '../components/notice/Notice.css';

const Faq = () => {
  const [activeId, setActiveId] = useState(null);

  const faqList = [
    {
      id: 1,
      question: "항공권은 어떻게 예매하나요?",
      answer: "항공사 웹사이트, 모바일 앱, 여행사 등을 통해 예매할 수 있습니다."
    },
    {
      id: 2,
      question: "예매한 항공권을 변경하거나 취소할 수 있나요?",
      answer: "항공권 종류 및 규정에 따라 변경 또는 취소 가능 여부와 수수료가 달라집니다. 자세한 내용은 항공사 규정을 확인하거나 예매하신 고객센터에 문의하세요."
    },
    {
      id: 3,
      question: "온라인으로 예매한 항공권을 어떻게 확인하나요?",
      answer: "항공사 웹사이트 또는 앱에서 예약 번호와 예약자 정보를 입력하여 확인할 수 있습니다."
    },
    {
      id: 4,
      question: "예매한 항공권을 변경하거나 취소할 수 있나요?",
      answer: "항공권 종류 및 규정에 따라 변경 또는 취소 가능 여부와 수수료가 달라집니다. 자세한 내용은 항공사 규정을 확인하거나 예매하신 고객센터에 문의하세요."
    },
    {
      id: 5,
      question: "위탁 수하물 허용량은 어떻게 되나요?",
      answer: "항공사 및 좌석 등급에 따라 허용량이 다르므로, 항공사 웹사이트 또는 예약 확인서를 참고하세요."
    },
    {
      id: 6,
      question: "수하물 분실 시 어떻게 해야 하나요?",
      answer: "즉시 공항 수하물 서비스 센터에 신고하고, 항공사에 연락하여 도움을 받으세요"
    },
    {
      id: 7,
      question: "탑승 수속은 언제까지 해야 하나요?",
      answer: "국내선은 출발 1시간 전, 국제선은 출발 2~3시간 전까지 탑승 수속을 완료해야 합니다."
    },
    {
      id: 8,
      question: "온라인 탑승 수속(웹 체크인)은 어떻게 하나요?",
      answer: "항공사 웹사이트 또는 앱에서 예약 번호와 예약자 정보를 입력하여 좌석을 선택하고 탑승권을 발급받을 수 있습니다."
    },
    {
      id: 9,
      question: "기내식은 어떻게 제공되나요?",
      answer: "항공사 및 노선에 따라 기내식 제공 여부와 메뉴가 다릅니다. 특별 기내식이 필요한 경우 사전에 신청해야 합니다."
    },
    {
      id: 10,
      question: "항공편이 지연되거나 결항되면 어떻게 되나요?",
      answer: "항공사에서 대체 항공편을 제공하거나 환불 조치를 해줍니다."
    },
    {
      id: 11,
      question: "마일리지 적립 및 사용은 어떻게 하나요?",
      answer: "항공사 멤버십에 가입하고 항공편 이용 시 마일리지를 적립할 수 있으며, 적립된 마일리지는 항공권 구매, 좌석 업그레이드 등에 사용할 수 있습니다."
    }
  ];

  const toggleAnswer = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <main>
      <div className="notice-container">
        <div className="left-section">
          <div className="description-section2">
            <h1>FAQ</h1>
            <p className="checklist-alert">
              자주 하시는 질문
            </p>
          </div>
          <div className="items-list">
            {faqList.map((faq) => (
              <div key={faq.id} className="faq-item">
                <div className="faq-question" onClick={() => toggleAnswer(faq.id)}>
                  <span className="q-mark">Q</span>
                  <span className="question-text">{faq.question}</span>
                  <span className="arrow">{activeId === faq.id ? '▼' : '▶'}</span>
                </div>
                {activeId === faq.id && (
                  <div className="faq-answer">
                    <span className="a-mark">A</span>
                    <div className="answer-text">{faq.answer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Faq;
