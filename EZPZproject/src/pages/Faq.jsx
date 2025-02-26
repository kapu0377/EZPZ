import React, { useState, useEffect } from "react";
import '../components/notice/Notice.css';

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  
  const faqList = [
    {
      id: 1,
      category: "회원관리",
      question: "비밀번호를 잊어버렸어요. 어떻게 찾을 수 있나요?",
      answer: "비밀번호 찾기는 다음과 같은 방법으로 가능합니다:\n\n1. 로그인 페이지에서 '비밀번호 찾기' 클릭\n2. 가입 시 등록한 이메일 주소 입력\n3. 이메일로 발송된 인증 링크를 통해 비밀번호 재설정"
    },
    {
      id: 2,
      category: "주문/결제",
      question: "주문 취소는 어떻게 하나요?",
      answer: "주문 취소는 '마이페이지 > 주문내역'에서 가능합니다. 단, 배송이 시작된 후에는 취소가 어려울 수 있습니다."
    },
    {
      id: 3,
      category: "배송",
      question: "배송 조회는 어디서 할 수 있나요?",
      answer: "배송 조회는 '마이페이지 > 주문내역'에서 운송장번호를 클릭하시면 확인 가능합니다."
    }
  ];

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="notice-container">
      <div className="notice-header">
        <h2>자주하시는 질문 (FAQ)</h2>
        <div className="search-box">
          <input type="text" placeholder="검색어를 입력하세요" />
          <button>검색</button>
        </div>
      </div>

      <div className="faq-category">
        <button className="category-btn active">전체</button>
        <button className="category-btn">회원관리</button>
        <button className="category-btn">주문/결제</button>
        <button className="category-btn">배송</button>
        <button className="category-btn">교환/반품</button>
      </div>

      <div className="faq-list">
        {faqList.map((faq, index) => (
          <div key={faq.id} className="faq-item">
            <div 
              className={`faq-question ${activeIndex === index ? 'active' : ''}`}
              onClick={() => handleToggle(index)}
            >
              <span className="q-mark">Q</span>
              <span className="question-text">{faq.question}</span>
              <span className="arrow">{activeIndex === index ? '▼' : '▶'}</span>
            </div>
            {activeIndex === index && (
              <div className="faq-answer">
                <span className="a-mark">A</span>
                <p className="answer-text">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
