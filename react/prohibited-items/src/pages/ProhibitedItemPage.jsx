import React, { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const categories = ["액체/겔", "화기류", "화학물질", "인화성 물질", "둔기", "날카로운 물체", "경계경보"];

const items = {
  "액체/겔": [
    { name: "물, 음료수", description: "100ml 이상의 액체는 기내 반입 불가." },
    { name: "젤류 제품", description: "예: 헤어 젤, 젤 타입 화장품." }
  ],
  "화기류": [
    { name: "권총", description: "모든 유형의 총기류 반입 금지." },
    { name: "소총", description: "장거리 화기 반입 금지." }
  ],
  "화학물질": [
    { name: "산화제", description: "위험한 화학 물질로 분류됨." },
    { name: "부식성 물질", description: "금속을 부식시킬 수 있는 물질." }
  ],
  "인화성 물질": [
    { name: "라이터 연료", description: "폭발 위험이 있음." },
    { name: "스프레이", description: "압축 가스 제품 반입 금지." }
  ],
  "둔기": [
    { name: "야구 배트", description: "타격용 물체로 사용될 수 있음." },
    { name: "골프 클럽", description: "기내 반입 금지." }
  ],
  "날카로운 물체": [
    { name: "칼", description: "날이 있는 모든 도구 반입 금지." },
    { name: "가위", description: "날 길이 제한 있음." }
  ],
  "경계경보": [
    { name: "폭발물", description: "위험 물질로 분류됨." },
    { name: "테러 도구", description: "안전 위협 가능성 있음." }
  ]
};

export default function ProhibitedItemsPage() {
  const [selectedCategory, setSelectedCategory] = useState("액체/겔");

  return (
    <div className="p-4">
      <nav className="bg-gray-800 text-white p-4">홈페이지 네비게이션 바</nav>

      <div className="flex gap-2 mt-4">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "font-bold" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {items[selectedCategory].map((item, index) => (
          <Card key={index}>
            <h3 className="text-xl font-semibold">{item.name}</h3>
            <p>{item.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
