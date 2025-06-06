import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import EZPackingLayout from "./components/EZPackingLayout";
import "./App.css";
import "./components/notice/Notice.css";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { HelmetProvider } from 'react-helmet-async';
import TokenSecurityMonitor from "./components/auth/TokenSecurityMonitor";

const CheckList = React.lazy(() => import("./components/checklist/Main"));
const ProhibitedItems = React.lazy(() => import("./components/prohibited-items/ProhibitedItems"));
const AirportDetectionPage = React.lazy(() => import("./components/prohibited-items/AirportDetectionPage"));
const AirportParkingPage = React.lazy(() => import("./pages/AirportParkingPage"));
const Faq = React.lazy(() => import("./pages/Faq"));
const SearchPage = React.lazy(() => import("./components/search/SearchPage"));
const EditProfile = React.lazy(() => import("./components/EditProfile"));
const RankingPage = React.lazy(() => import("./components/ranking/RankingPage"));
const ObjectDetection = React.lazy(() => import("./pages/ObjectDetection"));
const BoardPage = React.lazy(() => import("./pages/BoardPage"));
const TokenManagementPage = React.lazy(() => import("./pages/TokenManagementPage"));

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">로딩 중...</span>
  </div>
);

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const isDebugMode = urlParams.get('debug') === 'token' || process.env.NODE_ENV === 'development';

  return (
    <HelmetProvider>
      <AuthProvider>
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
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
              <Route path="/admin/token-management" element={<TokenManagementPage />} />
            </Routes>
          </Suspense>
          <TokenSecurityMonitor isDevelopment={isDebugMode} />
        </Layout>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;