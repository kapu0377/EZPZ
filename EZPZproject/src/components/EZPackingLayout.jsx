import React from "react";
import SearchSection from "./SearchSection";
import Footer from "./Footer";
import ParkingSlider from "./parking/ParkingSlider";

const EZPackingLayout = () => {
  return (
    <div className="ez-packing-layout">
      <SearchSection />
      <div className="main-content">
        <div className="content-box">금지물품</div>
        <div className="content-box">체크리스트</div>
        <div className="content-box"><ParkingSlider/></div>
        <div className="content-box">게시판</div>
      </div>  
    </div>
  );
};

export default EZPackingLayout;