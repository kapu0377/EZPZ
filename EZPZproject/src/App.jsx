import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./components/Login";
import Register from "./components/Register";
import EZPackingLayout from "./components/EZPackingLayout";
import Notice from "./pages/Notice"
import "./App.css";
import "./components/board/Notice.css";
import "./components/parking/AirportParking.css";
import ProhibitedItems from "./components/prohibited-items/ProhibitedItems";
import AirportParkingPage from "./pages/AirportParkingPage";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';  // 기본 스타일
import 'swiper/css/navigation';  // 네비게이션 스타일 (필요한 경우)
import 'swiper/css/pagination';  // 페이지네이션 스타일 (필요한 경우)
function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<EZPackingLayout />} />
            <Route path="/prohibited" element={<ProhibitedItems />} />
            <Route path="/board" element={<Notice />} />
            <Route path="/parking" element={<AirportParkingPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;