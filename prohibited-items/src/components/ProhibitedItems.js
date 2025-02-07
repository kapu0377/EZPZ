"use client"

import { useState } from "react"
import "./ProhibitedItems.css"

const categories = [
  { id: "liquids", name: "액체/겔" },
  { id: "firearms", name: "화기류" },
  { id: "chemicals", name: "화학물질" },
  { id: "flammables", name: "인화성 물질" },
  { id: "blunt", name: "둔기" },
  { id: "sharp", name: "날카로운 물체" },
  { id: "alert", name: "경계경보" },
]

const itemsData = {
  liquids: {
    items: ["물", "음료수", "샴푸", "로션"],
    description: "100ml 이상의 액체는 기내 반입이 금지됩니다.",
  },
  firearms: {
    items: ["총기", "모의 총기", "장난감 총"],
    description: "모든 종류의 총기류는 기내 반입이 엄격히 금지됩니다.",
  },
  chemicals: {
    items: ["산성 물질", "알칼리성 물질", "독성 물질"],
    description: "위험한 화학 물질은 기내 반입이 금지됩니다.",
  },
  flammables: {
    items: ["라이터", "성냥", "가연성 스프레이"],
    description: "인화성 물질은 화재의 위험이 있어 기내 반입이 금지됩니다.",
  },
  blunt: {
    items: ["야구 방망이", "골프 클럽", "하키 스틱"],
    description: "무기로 사용될 수 있는 둔기는 기내 반입이 금지됩니다.",
  },
  sharp: {
    items: ["칼", "가위", "면도칼"],
    description: "날카로운 물체는 위험하여 기내 반입이 금지됩니다.",
  },
  alert: {
    items: ["폭발물", "방사성 물질", "생물학적 위험 물질"],
    description: "고위험 물질은 절대 기내에 반입할 수 없습니다.",
  },
}

function ProhibitedItems() {
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <div className="prohibited-items">
      <h1>기내 금지 물품 목록</h1>
      <div className="categories">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-button ${selectedCategory === category.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      {selectedCategory && (
        <div className="category-details">
          <h2>{categories.find((c) => c.id === selectedCategory).name}</h2>
          <p>{itemsData[selectedCategory].description}</p>
          <ul>
            {itemsData[selectedCategory].items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProhibitedItems

