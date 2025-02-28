import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import EZPackingLayout from "./components/EZPackingLayout";
import CheckList from "./components/checklist/Main";
import "./App.css";
import "./components/notice/Notice.css";
import Notice from "./pages/Notice";
import ProhibitedItems from "./components/prohibited-items/ProhibitedItems";
import AirportDetectionPage from "./components/prohibited-items/AirportDetectionPage"
import AirportParkingPage from "./pages/AirportParkingPage";
import Faq from "./pages/Faq";
import SearchPage from "./components/search/SearchPage";
import 'swiper/css';  // 기본 스타일
import 'swiper/css/navigation';  // 네비게이션 스타일 (필요한 경우)
import 'swiper/css/pagination';  // 페이지네이션 스타일 (필요한 경우)
import EditProfile from "./components/EditProfile";
import RankingPage from "./components/ranking/RankingPage";
import ObjectDetection from "./pages/ObjectDetection";
import { HelmetProvider } from 'react-helmet-async';
import BoardPage from "./pages/BoardPage";
function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<EZPackingLayout />} />
            <Route path="/prohibited" element={<ProhibitedItems />} />
            <Route path="/board/*" element={<BoardPage/>} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/checklist" element={<CheckList />} />
            <Route path="/parking" element={<AirportParkingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/ObjectDetection" element={<ObjectDetection />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/airport-detections" element={<AirportDetectionPage />} />
            <Route path="/rankings" element={<RankingPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;