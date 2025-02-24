import React from "react";
import SearchSection from "./SearchSection";
import ProhibitedItemsSlider from "./prohibited-items/ProhibitedItemsSlider";
import ParkingSlider from "./parking/ParkingSlider";
import YoutubeVideo from "./YoutubeVideo";
import RecentPosts from "./post/RecentPost";

const EZPackingLayout = () => {
  return (
    <div className="ez-packing-layout">
      <SearchSection />
      <div className="main-content">
        <div className="content-box"><ProhibitedItemsSlider /></div>
        <div className="content-box"><YoutubeVideo/></div>
        <div className="content-box"><ParkingSlider/></div>
        <div className="content-box"><RecentPosts/></div>
      </div>
    </div>
  );
};

export default EZPackingLayout;