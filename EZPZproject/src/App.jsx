import React from "react";
import { Routes, Route } from "react-router-dom";  // Router는 제거하고 Routes와 Route만 가져옵니다
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

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<EZPackingLayout />} />
          <Route path="/prohibited" element={<ProhibitedItems />} />
          <Route path="/board" element={<Notice />} />
          <Route path="/checklist" element={<CheckList />} />
          <Route path="/parking" element={<AirportParkingPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
