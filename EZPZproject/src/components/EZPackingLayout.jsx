import React from "react";
import SearchSection from "./SearchSection";
import ProhibitedItemsSlider from "./prohibited-items/ProhibitedItemsSlider";

const EZPackingLayout = () => {
  return (
    <div className="ez-packing-layout">
      <SearchSection />
      <div className="main-content">
        <div className="content-box">
          <p>금지물품</p>
          <ProhibitedItemsSlider />
        </div>
        <div className="content-box">체크리스트</div>
        <div className="content-box">공항 별 주차현황</div>
        <div className="content-box">게시판</div>
      </div>
    </div>
  );
};

export default EZPackingLayout;