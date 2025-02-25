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
import AirportParkingPage from "./pages/AirportParkingPage";
import 'swiper/css';  // 기본 스타일
import 'swiper/css/navigation';  // 네비게이션 스타일 (필요한 경우)
import 'swiper/css/pagination';  // 페이지네이션 스타일 (필요한 경우)

import ObjectDetection from "./pages/ObjectDetection";
function App() {
  return (
    <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<EZPackingLayout />} />
            <Route path="/prohibited" element={<ProhibitedItems />} />
            <Route path="/board" element={<Notice />} />
            <Route path="/board/:no" element={<Notice />} />
            <Route path="/checklist" element={<CheckList />} />
            <Route path="/parking" element={<AirportParkingPage />} />
            <Route path="/ObjectDetection" element={<ObjectDetection />} />
          </Routes>
        </Layout>
    </AuthProvider>
  );
}

export default App;